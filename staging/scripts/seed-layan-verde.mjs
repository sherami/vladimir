const BASE=process.env.PP_API_URL??"http://localhost:3000/api/v1";
const TOKEN=process.env.PP_TOKEN;
if(!TOKEN) throw new Error("PP_TOKEN is required");
const headers={"Content-Type":"application/json",Authorization:`Bearer ${TOKEN}`};
async function call(path,method="GET",body){
 const r=await fetch(BASE+path,{method,headers,body:body?JSON.stringify(body):undefined});
 if(!r.ok) throw new Error(`${method} ${path}: ${r.status} ${await r.text()}`);
 return r.json();
}
const {readFile}=await import("node:fs/promises");
const dir=new URL("../seed/",import.meta.url);
const property=JSON.parse(await readFile(new URL("layan_verde.property.json",dir),"utf8"));
const sources=JSON.parse(await readFile(new URL("layan_verde.sources.json",dir),"utf8"));
const evidence=JSON.parse(await readFile(new URL("layan_verde.evidence.json",dir),"utf8"));

const p=await call("/properties","POST",property);
const sourceIds={};
for(const s of sources){ const {key,...payload}=s; const saved=await call(`/properties/${p.id}/sources`,"POST",payload); sourceIds[key]=saved.id; }
for(const e of evidence){ const {sourceKey,...payload}=e; if(sourceKey) payload.sourceId=sourceIds[sourceKey]; await call(`/properties/${p.id}/evidence`,"POST",payload); }
await call(`/properties/${p.id}/verification/sync`,"POST");
console.log(JSON.stringify({propertyId:p.id,project:p.project,seeded:true},null,2));
