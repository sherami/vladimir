import {describe,expect,test} from "vitest";
import {v4 as uuid} from "uuid";
import {evidenceRepo,propertyRepo} from "../src/repositories/postgres.js";

describe("evidence JSONB persistence",()=>{
 test("persists string, number and object values as valid JSONB",async()=>{
  const propertyId=uuid();
  await propertyRepo.save({id:propertyId,project:"Evidence JSONB",workflow:"VERIFICATION"} as any);
  const cases=[
   {field:"ownershipType",value:"LEASEHOLD"},
   {field:"purchasePrice",value:8_591_740},
   {field:"paymentSchedule",value:[{date:"2026-01-15",amount:-100,dateStatus:"EXACT_DATE"}]}
  ];
  for(const x of cases){
   await evidenceRepo.create({
    id:uuid(),propertyId,field:x.field,value:x.value,status:"PP_ESTIMATE",
    createdBy:"test@privatephuket"
   } as any);
  }
  const rows=await evidenceRepo.listByProperty(propertyId);
  const byField=Object.fromEntries(rows.map((r:any)=>[r.field,r.value]));
  expect(byField.ownershipType).toBe("LEASEHOLD");
  expect(byField.purchasePrice).toBe(8_591_740);
  expect(byField.paymentSchedule).toEqual([{date:"2026-01-15",amount:-100,dateStatus:"EXACT_DATE"}]);
 });
});
