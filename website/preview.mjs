import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'dist');
const port=Number(process.env.PORT||4173);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.xml':'application/xml; charset=utf-8','.json':'application/json; charset=utf-8','.txt':'text/plain; charset=utf-8','.md':'text/plain; charset=utf-8'};
const security={'X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; img-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",'X-Frame-Options':'DENY','Referrer-Policy':'strict-origin-when-cross-origin','Permissions-Policy':'camera=(), microphone=(), geolocation=()'};
http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost');
    const file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
    if(!file.startsWith(root+path.sep)){res.writeHead(403,security);return res.end('Forbidden')}
    const data=await readFile(file);
    const cache=/^\/(assets|img)\//.test(url.pathname)?'public, max-age=31536000, immutable':/^\/(legal\/|icon-)/.test(url.pathname)?'public, max-age=86400':'public, max-age=0, must-revalidate';
    res.writeHead(200,{...security,'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':cache});
    res.end(req.method==='HEAD'?undefined:data);
  }catch{
    try{const html=await readFile(path.join(root,'404.html'));res.writeHead(404,{...security,'Content-Type':types['.html'],'Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:html)}catch{res.writeHead(404,security);res.end('Not found')}
  }
}).listen(port,'127.0.0.1',()=>console.log(`myGym: http://127.0.0.1:${port}`));
