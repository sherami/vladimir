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

if(validation.status!==200) throw new Error(`Validation endpoint failed: ${validation.status}`);
if(!validation.data?.readyToCalculate) throw new Error(`Fixture did not reach READY_TO_CALCULATE: ${JSON.stringify(validation.data)}`);
if(calculation.status!==201) throw new Error(`Calculation failed: ${calculation.status} ${JSON.stringify(calculation.data)}`);

const tac=calculation.data.tac;
if(Math.abs(tac-9294039.14)>1) throw new Error(`TAC regression: ${tac}`);
const ny=calculation.data.netYield;
if(Math.abs(ny-0.080669447)>1e-6) throw new Error(`Net Yield regression: ${ny}`);
if(calculation.data.productionReturnMetric!=="IRR") throw new Error(`Expected IRR production metric, got ${calculation.data.productionReturnMetric}`);
if(typeof calculation.data.productionReturn!=="number") throw new Error("Production IRR is missing");
if(calculation.data.verdictStatus!=="PROVISIONAL") throw new Error(`Fixture must remain PROVISIONAL, got ${calculation.data.verdictStatus}`);
if(calculation.data.finalVerdict!=null) throw new Error("Provisional staging fixture must not expose a final verdict");

const scenarioCodes=(calculation.data.scenarios??[]).map(x=>x.code);
if(JSON.stringify(scenarioCodes)!==JSON.stringify(["BASE","DOWNSIDE","SEVERE"]))
  throw new Error(`Scenario regression: ${JSON.stringify(scenarioCodes)}`);
if(!(calculation.data.scenarios[0].irr>calculation.data.scenarios[1].irr && calculation.data.scenarios[1].irr>calculation.data.scenarios[2].irr))
  throw new Error("Scenario IRR ordering regression");
if(!(calculation.data.financialDataConfidence<75))
  throw new Error(`Fixture unexpectedly cleared production confidence gate: ${calculation.data.financialDataConfidence}`);
if(verification.status!==200) throw new Error(`Verification queue failed: ${verification.status}`);

console.log(JSON.stringify({
  verticalSlice:"PASS",
  propertyId:ID,
  tac,
  netYield:ny,
  productionReturnMetric:calculation.data.productionReturnMetric,
  productionReturn:calculation.data.productionReturn,
  confidence:calculation.data.financialDataConfidence,
  verdictStatus:calculation.data.verdictStatus,
  scenarios:scenarioCodes
},null,2));
