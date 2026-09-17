import {describe,expect,test} from "vitest";
import {evaluateEvidenceMutation,evaluatePropertyDataMutation} from "../src/domain/evidence-mutation.js";

const property=(workflow:any)=>({id:"p",project:"Project",workflow});

describe("evidence mutation workflow policy",()=>{
 test.each(["DRAFT","VERIFICATION"])(
  "keeps %s while evidence is still being assembled",
  workflow=>{
   expect(evaluateEvidenceMutation(property(workflow)))
    .toEqual({allowed:true,nextWorkflow:workflow});
  }
 );

 test.each([
  "READY_TO_CALCULATE","CALCULATED","ANALYST_REVIEW","READY_TO_PUBLISH"
 ])("resets %s to VERIFICATION",workflow=>{
  expect(evaluateEvidenceMutation(property(workflow)))
   .toEqual({allowed:true,nextWorkflow:"VERIFICATION"});
 });

 test.each(["DRAFT","VERIFICATION","READY_TO_PUBLISH"])(
  "allows source data changes for mutable %s versions",
  workflow=>{
   expect(evaluatePropertyDataMutation(property(workflow)))
    .toEqual({allowed:true});
  }
 );

 test.each(["PUBLISHED","SUPERSEDED"])(
  "blocks source data changes for immutable %s versions",
  workflow=>{
   expect(evaluatePropertyDataMutation(property(workflow)))
    .toMatchObject({allowed:false,error:"immutable_property_version",workflow});
  }
 );

 test.each(["PUBLISHED","SUPERSEDED"])(
  "blocks evidence changes for immutable %s versions",
  workflow=>{
   expect(evaluateEvidenceMutation(property(workflow)))
    .toMatchObject({allowed:false,error:"immutable_property_version",workflow});
  }
 );
});
