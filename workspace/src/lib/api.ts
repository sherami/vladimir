const BASE=import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1";
const TOKEN_KEY="pp_token";
const TOKEN=()=>localStorage.getItem(TOKEN_KEY)??"";
async function request(path:string,init?:RequestInit){
 const r=await fetch(BASE+path,{...init,headers:{"Content-Type":"application/json",Authorization:`Bearer ${TOKEN()}`,...(init?.headers??{})}});
 if(r.status===401){
  localStorage.removeItem(TOKEN_KEY);
  location.reload();
  throw new Error("401 session_expired");
 }
 if(!r.ok) throw new Error(`${r.status} ${await r.text()}`);
 return r.json();
}
function calculationBlockerMessage(error:unknown){
 const message=error instanceof Error?error.message:String(error);
 const body=message.replace(/^\d+\s+/,"");
 try{
  const parsed=JSON.parse(body);
  const issues=parsed?.validation?.issues;
  if(Array.isArray(issues)&&issues.length){
   const blockers=issues.filter((x:any)=>x?.severity==="BLOCKER"||x?.severity==="ERROR");
   const selected=blockers.length?blockers:issues;
   return `Calculation blocked\n\n${selected.map((x:any)=>`• ${x.message??x.code??"Validation issue"}`).join("\n")}`;
  }
 }catch{}
 return `Calculation could not be completed.\n\n${message}`;
}
function mutationErrorMessage(label:string,error:unknown){
 const message=error instanceof Error?error.message:String(error);
 const body=message.replace(/^\d+\s+/,"");
 try{
  const parsed=JSON.parse(body);
  const detail=parsed?.message??parsed?.error??parsed?.code;
  if(detail)return `${label} could not be saved.\n\n${detail}`;
 }catch{}
 return `${label} could not be saved.\n\n${message}`;
}
async function calculate(id:string){
 try{return await request(`/properties/${id}/calculate`,{method:"POST"});}
 catch(error){
  window.alert(calculationBlockerMessage(error));
  return null;
 }
}
async function createSource(id:string,body:any){
 try{return await request(`/properties/${id}/sources`,{method:"POST",body:JSON.stringify(body)});}
 catch(error){window.alert(mutationErrorMessage("Source",error));throw error;}
}
async function createEvidence(id:string,body:any){
 try{return await request(`/properties/${id}/evidence`,{method:"POST",body:JSON.stringify(body)});}
 catch(error){window.alert(mutationErrorMessage("Evidence",error));throw error;}
}
export const api={
 setToken:(token:string)=>localStorage.setItem(TOKEN_KEY,token),
 properties:()=>request("/properties"),
 createProperty:(body:any)=>request("/properties",{method:"POST",body:JSON.stringify(body)}),
 property:(id:string)=>request(`/properties/${id}`),
 sources:(id:string)=>request(`/properties/${id}/sources`),
 evidence:(id:string)=>request(`/properties/${id}/evidence`),
 verification:(state="OPEN")=>request(`/verification?state=${state}`),
 syncVerification:(id:string)=>request(`/properties/${id}/verification/sync`,{method:"POST"}),
 validate:(id:string)=>request(`/properties/${id}/validate`,{method:"POST"}),
 calculate,
 createSource,
 createEvidence,
 calculations:(id:string)=>request(`/properties/${id}/calculations`),
 reviewRun:(runId:string,status:"APPROVED"|"REJECTED",comment="")=>request(`/calculations/${runId}/review`,{method:"POST",body:JSON.stringify({status,comment})}),
 resolveVerification:(id:string,comment:string,sourceId?:string)=>request(`/verification/${id}/resolve`,{method:"POST",body:JSON.stringify({comment,sourceId})}),
 publish:(id:string,runId:string)=>request(`/properties/${id}/publish`,{method:"POST",body:JSON.stringify({calculationRunId:runId})}),
 publicView:(id:string)=>request(`/properties/${id}/public`)
};
