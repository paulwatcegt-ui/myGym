import { mkdir, copyFile, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root=path.dirname(fileURLToPath(import.meta.url));
const out=path.join(root,'dist');
await mkdir(out,{recursive:true});
for(const name of ['index.html','styles.css','mygym.css','mygym.js','icon-96.png','assets-notice.md','_headers','robots.txt']) await copyFile(path.join(root,name),path.join(out,name));
for(const name of ['img','legal']) await cp(path.join(root,name),path.join(out,name),{recursive:true});
console.log('myGym static site: '+out);
