const BASE=import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1";
const TOKEN=()=>localStorage.getItem("pp_token")??"";
async function request(path:string,init?:RequestInit){
 const r=await fetch(BASE+path,{...init,headers:{"Content-Type":"application/json",Authorization:`Bearer ${TOKEN()}`,...(init?.headers??{})}});
 if(!r.ok) throw new Error(`${r.status} ${await r.text()}`);
 return r.json();
}
export const api={
 setToken:(token:string)=>localStorage.setItem("pp_token",token),
 properties:()=>request("/properties"),
 property:(id:string)=>request(`/properties/${id}`),
 sources:(id:string)=>request(`/properties/${id}/sources`),
 evidence:(id:string)=>request(`/properties/${id}/evidence`),
 verification:(state="OPEN")=>request(`/verification?state=${state}`),
 syncVerification:(id:string)=>request(`/properties/${id}/verification/sync`,{method:"POST"}),
 validate:(id:string)=>request(`/properties/${id}/validate`,{method:"POST"}),
 calculate:(id:string)=>request(`/properties/${id}/calculate`,{method:"POST"}),
 createSource:(id:string,body:any)=>request(`/properties/${id}/sources`,{method:"POST",body:JSON.stringify(body)}),
 createEvidence:(id:string,body:any)=>request(`/properties/${id}/evidence`,{method:"POST",body:JSON.stringify(body)}),
 calculations:(id:string)=>request(`/properties/${id}/calculations`),
 reviewRun:(runId:string,status:"APPROVED"|"REJECTED",comment="")=>request(`/calculations/${runId}/review`,{method:"POST",body:JSON.stringify({status,comment})}),
 resolveVerification:(id:string,comment:string,sourceId?:string)=>request(`/verification/${id}/resolve`,{method:"POST",body:JSON.stringify({comment,sourceId})}),
 publish:(id:string,runId:string)=>request(`/properties/${id}/publish`,{method:"POST",body:JSON.stringify({calculationRunId:runId})}),
 publicView:(id:string)=>request(`/properties/${id}/public`)
};
