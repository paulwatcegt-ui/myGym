import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanMemory } from '../coach/core/memory.js';
import { build } from '../coach/core/payload.js';
import { LIBRARY, librarySlice, equipmentAllows, isStretch } from '../coach/core/library.js';
import { runPipeline } from '../coach/core/pipeline.js';

test('explicit memory has a strict allowlist, bounds, deduplication and avoid precedence', () => {
  assert.deepEqual(cleanMemory(null), { memory: '', preferredExerciseIds: [], avoidedExerciseIds: [] });
  const p = cleanMemory({ memory: 'x'.repeat(2000), preferredExerciseIds: ['a','a','b',null], avoidedExerciseIds: ['a'], apiKey: 'NEVER' });
  assert.equal(p.memory.length, 1200);
  assert.deepEqual(p.preferredExerciseIds, ['b']);
  assert.deepEqual(p.avoidedExerciseIds, ['a']);
  assert(!JSON.stringify(p).includes('NEVER'));
  assert.equal(cleanMemory({ avoidedExerciseIds: Array.from({length:100},(_,i)=>String(i)) }).avoidedExerciseIds.length,20);
});

test('all task payloads share bounded explicit memory and do not mutate stored data', () => {
  const S = { lang:'zh', routines:[], workouts:[], coach:{profile:{ memory:'只在午休训练', preferredExerciseIds:['0001'], password:'NEVER' }} };
  const before = JSON.stringify(S);
  for (const kind of ['create','question','review','debrief']) {
    const p = build(S,{handle:'opaque',kind});
    assert.equal(p.coachProfile.memory,'只在午休训练');
    assert(!JSON.stringify(p).includes('NEVER'));
  }
  assert.equal(JSON.stringify(S),before);
  S.coach.profile = { ...S.coach.profile, ...cleanMemory() };
  assert.equal(build(S,{handle:'opaque',kind:'question'}).coachProfile.memory,'');
});

test('preferences affect selection deterministically while retaining body-part coverage and equipment', () => {
  const baseline = librarySlice({},['dumbbell']);
  const preferred = LIBRARY.find(e => e.eq === 'dumbbell' && !isStretch(e) && !baseline.some(x=>x.id===e.id));
  assert(preferred);
  const options = { preferences:{preferredExerciseIds:[preferred.id]} };
  const result = librarySlice({},['dumbbell'],options);
  assert(result.some(e=>e.id===preferred.id && e.preferred));
  assert(result.every(e=>equipmentAllows(['dumbbell'],e.id)));
  assert.deepEqual(result,librarySlice({},['dumbbell'],options));
  assert(result.length<=160);
  for (const bp of new Set(baseline.map(e=>e.bp))) assert(result.some(e=>e.bp===bp));
});

test('avoided and hidden exercises are excluded as candidates but pinned context remains flagged', () => {
  const row = librarySlice({},[])[0];
  const S = { exerciseOverrides:{[row.id]:{hidden:true}}, coach:{profile:{avoidedExerciseIds:[row.id],preferredExerciseIds:[row.id]}} };
  assert(!librarySlice(S,[]).some(e=>e.id===row.id));
  const kept = librarySlice(S,[],{keep:[row.id]}).find(e=>e.id===row.id);
  assert(kept.contextOnly); assert(kept.alreadyTrained); assert(!kept.preferred);
  const barbell = LIBRARY.find(e=>e.eq==='barbell');
  const pinned = librarySlice({},['dumbbell'],{keep:[barbell.id]}).find(e=>e.id===barbell.id);
  assert(pinned.contextOnly && pinned.equipmentUnavailable);
  assert(librarySlice({},['unknown-equipment']).every(e=>e.eq==='body weight'));
});

test('intake overrides, custom IDs and missing/invalid legacy fields remain supported', () => {
  const S={routines:[],workouts:[],customEx:[{id:'own',n:'自建',bp:'back'}],coach:{profile:{memory:'旧备注'}}};
  const p=build(S,{handle:'opaque',kind:'create',intake:{memory:'新备注',preferredExerciseIds:['own']}});
  assert.equal(p.coachProfile.memory,'新备注');
  assert(p.library.find(e=>e.id==='own').preferred);
  assert(!librarySlice(S,[],{preferences:{avoidedExerciseIds:['own']}}).some(e=>e.id==='own'));
  assert.equal(cleanMemory({memory:{secret:'NEVER'},preferredExerciseIds:'bad'}).memory,'');
});

test('shared pipeline refuses avoided exercise selection with at most one repair, including IDs outside candidates', async () => {
  for (const kind of ['create', 'review']) {
    let calls=0;
    const response = kind === 'create'
      ? {coach_contract:1,routines:[{ex:[{id:'avoid-me'}]}]}
      : {coach_contract:1,changes:[{type:'swap-exercise',after:{id:'avoid-me'}}]};
    const payload={coach_contract:1,task:kind,coachProfile:{avoidedExerciseIds:['avoid-me']},plan:{routines:[],week:{}},library:[]};
    const before=JSON.stringify(payload);
    const adapter={spawns:false,invoke:async()=>{calls++;return {code:0,text:JSON.stringify(response)}}};
    const result=await runPipeline({kind,payload,adapter});
    assert.equal(result.ok,false);assert.equal(calls,2);
    assert(result.errors.some(e=>e.includes('explicitly avoided')));
    assert.equal(JSON.stringify(payload),before);
  }
});

test('malformed plan structure is classified rather than throwing in preference checks', async () => {
  const adapter={spawns:false,invoke:async()=>({code:0,text:JSON.stringify({coach_contract:1,routines:{secret:'bad'}})})};
  const r=await runPipeline({kind:'create',payload:{plan:{routines:[],week:{}},coachProfile:{avoidedExerciseIds:[]},library:[]},adapter});
  assert.equal(r.ok,false);
});
