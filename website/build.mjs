import { mkdir, readFile, writeFile, copyFile, cp, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root=path.dirname(fileURLToPath(import.meta.url));
const out=path.resolve(root,'dist');
// Delete only the verified generated output inside this website directory.
if(path.dirname(out)!==root||path.basename(out)!=='dist') throw new Error('Unsafe output path');
await rm(out,{recursive:true,force:true});
await mkdir(path.join(out,'assets'),{recursive:true});
await mkdir(path.join(out,'img'),{recursive:true});
const replacements=[];
for(const name of ['base.css','mygym.css','mygym.js','entry.js']){
  const content=await readFile(path.join(root,name));
  const hash=createHash('sha256').update(content).digest('hex').slice(0,12);
  const parsed=path.parse(name);
  const target=`assets/${parsed.name}.${hash}${parsed.ext}`;
  await writeFile(path.join(out,target),content);
  replacements.push([new RegExp(`${name.replace('.', '\\.')}\\?v=\\d+`,'g'),'/'+target]);
}
for(const name of ['index.html','404.html']){
  let html=await readFile(path.join(root,name),'utf8');
  for(const [pattern,target] of replacements)html=html.replace(pattern,target);
  await writeFile(path.join(out,name),html);
}
for(const name of ['icon-96.png','icon-180.png','icon-192.png','assets-notice.md','_headers','robots.txt','sitemap.xml'])await copyFile(path.join(root,name),path.join(out,name));
const images=JSON.parse(await readFile(path.join(root,'image-assets.json'),'utf8'));
for(const file of [...Object.values(images.screens).flatMap(x=>Object.values(x)),images.cover]){
  if(!/^img\/[a-z0-9-]+\.[a-f0-9]+\.(webp|jpg)$/.test(file))throw new Error('Unexpected image path');
  await copyFile(path.join(root,file),path.join(out,file));
}
await cp(path.join(root,'legal'),path.join(out,'legal'),{recursive:true});
console.log('myGym static site: '+out);
