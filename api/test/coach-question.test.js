import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { tempData, sampleState, writeState } from './helpers.mjs';
const DIR = tempData();
const { build } = await import('../coach/core/payload.js');
const { attemptOnce, runPipeline } = await import('../coach/core/pipeline.js');
const { EXERCISES } = await import('../coach/core/library-data.js');
const cfg = await import('../coach/config.js');
const jobs = await import('../coach/jobs.js');
const { adapterFor } = await import('../coach/adapters/index.js');
const { coachRoutes } = await import('../coach/routes.js');
const fake = value => ({ spawns: false, invoke: async () => ({ code: 0, text: JSON.stringify(value) }) });
const S = () => sampleState({ lang: 'zh', exerciseOverrides: { '0001': { n: '我的测试动作', hidden: false } } });
test('Chinese payload supplies Chinese/personal labels while preserving IDs, original names, and source state', () => {
  const state = S(), before = JSON.stringify(state);
  const p = build(state, { handle: 'anonymous', kind: 'question', note: '为什么三组？' });
  assert.equal(p.task, 'question'); assert.equal(p.meta.lang, 'zh');
  const own = p.library.find(e => e.id === '0001'); assert.equal(own.n, '我的测试动作'); assert.equal(own.originalName, EXERCISES.find(e => e.id === '0001').n);
  assert(p.library.some(e => /[\u3400-\u9fff]/.test(e.n)));
  assert.equal(p.plan.routines[0].ex[0].displayName, '我的测试动作');
  assert.equal(JSON.stringify(state), before);
  assert(!JSON.stringify(p).includes('apiKey'));
});
test('question replies have their own strict contract; plans, empty/huge text, arrays and missing contract are rejected', async () => {
  const p = build(S(), { handle: 'anonymous', kind: 'question', note: '解释这个动作' });
  const valid = await attemptOnce({ kind: 'question', payload: p, adapter: fake({ coach_contract: 1, answer: '先说明动作，再询问缺少的器械信息。' }) });
  assert.equal(valid.ok, true); assert.equal(typeof valid.answer, 'string'); assert.equal(valid.result, undefined);
  for (const answer of [{coach_contract:1,answer:'答复',changes:[]},{coach_contract:1,answer:''},{coach_contract:1,answer:'x'.repeat(3001)},{answer:'no contract'},[]]) {
    const r = await runPipeline({ kind:'question', payload:p, adapter:fake(answer) });
    assert.equal(r.ok,false); assert.equal(r.result,undefined);
  }
});
test('question payload includes a bounded unaccepted proposal and context without credential fields', () => {
  const p = build(S(), { handle:'anonymous', kind:'question', note:'为什么这样安排？', previous:{ routines:[{id:'p1',name:'提案',ex:[{id:'0001',sets:3,reps:8}]}], week:{1:'p1'}, token:'NEVER_SEND' } });
  assert.equal(p.proposedPlan.routines[0].name,'提案'); assert(!JSON.stringify(p).includes('NEVER_SEND'));
});
test('authenticated question route and real queue preserve pending proposal and enforce consent/cap', async () => {
  cfg.save({ enabled:true,provider:'compatible',auth:{},providerOptions:{compatible:{baseUrl:'https://unit.test'}},models:{compatible:'test'},caps:{perProfileDaily:1,instanceDaily:0} });
  const uid='question-user'; writeState(DIR,uid,S());
  const originalState = fs.readFileSync(path.join(DIR,'state-'+uid+'.json'),'utf8');
  const proposal={id:'keep-me',kind:'create',bundle:{routines:[],week:{}}};
  fs.mkdirSync(path.join(DIR,'coach'),{recursive:true});
  fs.writeFileSync(path.join(DIR,'coach',uid+'.json'),JSON.stringify({daily:null,current:null,pending:proposal,history:[]}));
  const adapter=adapterFor('compatible'), invoke=adapter.invoke;
  adapter.invoke=async()=>({code:0,text:JSON.stringify({coach_contract:1,answer:'三组来自当前计划；这次只解释，不修改。'})});
  let signedIn=true;
  const routes=coachRoutes({json:(res,status,body)=>Object.assign(res,{status,body}),readBody:async req=>req.body,readSession:()=>signedIn?{id:uid}:null,requireAdmin:()=>false});
  try {
    let res={};signedIn=false;await routes['POST /api/coach/question']({body:{note:'问'}},res);assert.equal(res.status,401);signedIn=true;
    res={};await routes['POST /api/coach/question']({body:{note:''}},res);assert.equal(res.status,400);
    res={};await routes['POST /api/coach/question']({body:{note:'为什么三组？',lang:'zh'}},res);assert.equal(res.status,202);
    for(let n=0;n<100&&jobs.status(uid).job;n++)await new Promise(r=>setTimeout(r,10));
    const done=jobs.status(uid);assert.equal(done.job,null);assert.equal(done.last.outcome,'answered');assert.match(done.last.answer,/三组/);assert.deepEqual(done.pending,proposal);
    assert.equal(fs.readFileSync(path.join(DIR,'state-'+uid+'.json'),'utf8'),originalState);
    assert.throws(()=>jobs.enqueue(uid,{kind:'question',note:'再问'}),e=>e.code==='cap');
    writeState(DIR,'no-consent',sampleState({coach:{}}));assert.throws(()=>jobs.enqueue('no-consent',{kind:'question',note:'问'}),e=>e.code==='consent');
  } finally { adapter.invoke=invoke; }
});

test('unaccepted review explanations are bounded and do not pass arbitrary proposal fields', () => {
  const p = build(S(), {handle:'anonymous',kind:'question',note:'为什么这样修改？',proposal:{kind:'review',summary:'减少一组',changes:[{type:'sets',why:'近期未完成目标',token:'NEVER_SEND'}],token:'NEVER_SEND'}});
  assert.deepEqual(p.proposedExplanation,{summary:'减少一组',reasons:[{type:'sets',why:'近期未完成目标'}]});
  assert(!JSON.stringify(p).includes('NEVER_SEND'));
});
