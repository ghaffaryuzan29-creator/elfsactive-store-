import { next } from '@vercel/functions';
// Team access code gate. Runs before every request, including /uploads/*.xlsx.
const enc=new TextEncoder();
const b64=(buf)=>btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
async function sign(v,secret){const k=await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return b64(await crypto.subtle.sign('HMAC',k,enc.encode(v)))}
function same(a,b){if(a.length!==b.length)return false;let d=0;for(let i=0;i<a.length;i++)d|=a.charCodeAt(i)^b.charCodeAt(i);return d===0}
async function valid(req,secret){const m=(req.headers.get('cookie')||'').match(/(?:^|; )gb_session=([^;]+)/);if(!m)return false;const[exp,sig]=m[1].split('.');if(!exp||!sig||Number(exp)<Date.now())return false;return same(sig,await sign(exp,secret))}
const go=(to,h={})=>new Response(null,{status:303,headers:{location:to,...h}});
export default async function middleware(req){
 const url=new URL(req.url),code=process.env.ACCESS_CODE,secret=process.env.SESSION_SECRET;
 if(!code||!secret)return new Response('Set ACCESS_CODE and SESSION_SECRET in the Vercel Environment Variables, then redeploy.',{status:500});
 const p=url.pathname,ok=await valid(req,secret);
 if(p==='/api/logout')return go('/login',{'set-cookie':'gb_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax'});
 if(p==='/api/login'&&req.method==='POST'){const f=await req.formData(),sent=String(f.get('code')||'');
  if(same(sent,code)){const exp=String(Date.now()+7*864e5);return go('/',{'set-cookie':'gb_session='+exp+'.'+await sign(exp,secret)+'; Path=/; Max-Age=604800; HttpOnly; Secure; SameSite=Lax'})}
  await new Promise(r=>setTimeout(r,800));return go('/login?e=1')}
 if(p==='/manifest.webmanifest'||p==='/sw.js'||p.startsWith('/icons/'))return next();
 if(p==='/login'||p==='/login.html')return ok?go('/'):next();
 if(!ok)return go('/login');
 return next()}
