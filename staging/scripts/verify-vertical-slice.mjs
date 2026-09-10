const BASE=process.env.PP_API_URL??"http://localhost:3000/api/v1";
const TOKEN=process.env.PP_TOKEN, ID=process.env.PP_PROPERTY_ID;
if(!TOKEN||!ID) throw new Error("PP_TOKEN and PP_PROPERTY_ID required");
const headers={"Content-Type":"application/json",Authorization:`Bearer ${TOKEN}`};
async function call(path,method="GET",body){
 const r=await fetch(BASE+path,{method,headers,body:body?JSON.stringify(body):undefined});
 const text=await r.text(); let data; try{data=JSON.parse(text)}catch{data=text}
 return {status:r.status,data};
}
const validation=await call(`/properties/${ID}/validate`,"POST");
const calculation=await call(`/properties/${ID}/calculate`,"POST");
const verification=await call(`/verification?propertyId=${ID}&state=OPEN`);
console.log(JSON.stringify({validation,calculation,verification},null,2));
if(calculation.status===201){
 const tac=calculation.data.tac;
 if(Math.abs(tac-9294039.14)>1) throw new Error(`TAC regression: ${tac}`);
 const ny=calculation.data.netYield;
 if(Math.abs(ny-0.080669447)>1e-6) throw new Error(`Net Yield regression: ${ny}`);
 if(calculation.data.verdictStatus==="FINAL")
   throw new Error("Fixture unexpectedly became FINAL; evidence is intentionally not production-complete.");
}
