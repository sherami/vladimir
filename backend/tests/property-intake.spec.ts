import {describe,expect,test} from "vitest";
import {prepareDraftProperty} from "../src/services/property-intake.js";

describe("property intake policy",()=>{
 test("server owns id, workflow and governance defaults",()=>{
  const result=prepareDraftProperty({
   id:"attacker-id",
   workflow:"PUBLISHED",
   project:"  Layan Verde  ",
   propertyType:"CONDO",
   dataConfidence:100,
   criticalToVerify:false
  },"server-id");
  expect(result.valid).toBe(true);
  if(!result.valid)return;
  expect(result.property.id).toBe("server-id");
  expect(result.property.workflow).toBe("DRAFT");
  expect(result.property.project).toBe("Layan Verde");
  expect(result.property.dataConfidence).toBe(0);
  expect(result.property.criticalToVerify).toBe(true);
 });

 test("financial and verdict fields cannot be mass-assigned at intake",()=>{
  const result=prepareDraftProperty({
   project:"P",propertyType:"VILLA",
   purchasePrice:{value:1,status:"VERIFIED_DOCUMENT"},
   datedCashFlows:[{date:"2026-01-01",amount:-1}],
   finalVerdict:"BUY"
  },"id");
  expect(result.valid).toBe(true);
  if(!result.valid)return;
  expect(result.property).not.toHaveProperty("purchasePrice");
  expect(result.property).not.toHaveProperty("datedCashFlows");
  expect(result.property).not.toHaveProperty("finalVerdict");
 });

 test.each([undefined,"","   "])("requires a project name",project=>{
  expect(prepareDraftProperty({project},"id")).toEqual({valid:false,error:"project_required"});
 });

 test("rejects invalid physical fields",()=>{
  expect(prepareDraftProperty({project:"P",propertyType:"CASTLE"},"id"))
   .toEqual({valid:false,error:"invalid_property_type"});
  expect(prepareDraftProperty({project:"P",propertyType:"CONDO",area:0},"id"))
   .toEqual({valid:false,error:"invalid_area"});
  expect(prepareDraftProperty({project:"P",propertyType:"CONDO",bedrooms:1.5},"id"))
   .toEqual({valid:false,error:"invalid_bedrooms"});
 });
});
