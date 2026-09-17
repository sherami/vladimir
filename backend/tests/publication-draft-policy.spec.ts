import {describe,expect,test} from "vitest";
import {validatePublicationDraftMutation} from "../src/domain/publication-draft.js";

const property=(overrides:any={})=>({
 id:"p",project:"Project",workflow:"ANALYST_REVIEW",
 ...overrides
});
const run=(overrides:any={})=>({
 calculationRunId:"run-1",propertyId:"p",status:"CALCULATED",
 inputSnapshotHash:"current",
 ...overrides
});

describe("publication draft mutation policy",()=>{
 test.each(["DRAFT","VERIFICATION","CALCULATED","PUBLISHED","SUPERSEDED"])(
  "blocks draft editing in %s",
  workflow=>{
   expect(validatePublicationDraftMutation(
    property({workflow}),run(),"run-1","current"
   )).toMatchObject({valid:false,error:"property_not_in_publication_editing"});
  }
 );

 test.each(["ANALYST_REVIEW","READY_TO_PUBLISH"])(
  "allows the current run to be edited in %s",
  workflow=>{
   expect(validatePublicationDraftMutation(
    property({workflow}),run(),"run-1","current"
   )).toEqual({valid:true});
  }
 );

 test("blocks a draft for an older calculation",()=>{
  expect(validatePublicationDraftMutation(
   property(),run(),"run-2","current"
  )).toMatchObject({valid:false,error:"calculation_run_not_latest"});
 });

 test("blocks a draft after calculation inputs change",()=>{
  expect(validatePublicationDraftMutation(
   property(),run(),"run-1","changed"
  )).toMatchObject({valid:false,error:"calculation_run_stale"});
 });

 test("blocks a calculation belonging to another property",()=>{
  expect(validatePublicationDraftMutation(
   property(),run({propertyId:"other"}),"run-1","current"
  )).toMatchObject({valid:false,error:"invalid_calculation_run"});
 });
});
