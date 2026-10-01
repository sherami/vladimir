import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {describe,expect,test} from "vitest";
import {applyEvidenceToProperty} from "../src/services/evidence.js";
import {calculateProperty} from "../src/services/calculate.js";
import type {EvidenceRecord,Property} from "../src/domain/types.js";

const seedDir=fileURLToPath(new URL("../../staging/seed/",import.meta.url));
const propertySeed=JSON.parse(readFileSync(`${seedDir}layan_verde_b3_301.property.json`,"utf8"));
const evidenceSeed=JSON.parse(readFileSync(`${seedDir}layan_verde_b3_301.evidence.json`,"utf8"));

function evidenceRecords():EvidenceRecord[]{
 return evidenceSeed.map((e:any,index:number)=>({
   ...e,id:`e-${index}`,propertyId:"b3-301",createdBy:"test"
 }));
}

describe("Layan Verde B3-301 production candidate",()=>{
 test("documented acquisition figures reconcile",()=>{
   const value=(field:string)=>evidenceSeed.find((e:any)=>e.field===field).value;
   expect(value("purchasePrice")+value("acquisitionCosts")+value("initialCapex")).toBe(10_166_968);
   const options=value("paymentOptions");
   expect(options.fullPayment.reduce((a:number,b:number)=>a+b,0)).toBe(10_009_033);
   expect(options.fiftyPercent.reduce((a:number,b:number)=>a+b,0)).toBe(10_009_033);
   expect(options.thirtyFivePercent.reduce((a:number,b:number)=>a+b,0)).toBe(10_009_033);
 });

 test("rental split is 40 percent management and 60 percent owner",()=>{
   const split=evidenceSeed.find((e:any)=>e.field==="rentalPoolSplit");
   expect(split.value).toEqual({managementCompany:.4,owner:.6,basis:"profit"});
   expect(split.status).toBe("TO_VERIFY");
 });

 test("approximate payment dates fail closed and cannot produce a final verdict",()=>{
   const base:Property={id:"b3-301",project:propertySeed.project,unit:propertySeed.unit,workflow:"VERIFICATION"};
   const hydrated=applyEvidenceToProperty(base,evidenceRecords());
   const run=calculateProperty(hydrated);
   expect(hydrated.isOffPlan).toBe(true);
   expect(hydrated.datedCashFlows?.every(x=>x.dateStatus==="TO_VERIFY")).toBe(true);
   expect(run.status).toBe("BLOCKED");
   if(run.status!=="BLOCKED") throw new Error("candidate unexpectedly calculated");
   expect(run.validation.issues.some(x=>x.code==="NON_EXACT_PAYMENT_DATES")).toBe(true);
 });
});
