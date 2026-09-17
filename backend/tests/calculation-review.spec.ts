import {describe,expect,test} from "vitest";
import {validateCalculationReview} from "../src/domain/calculation-review.js";

const property=(overrides:any={})=>({
 id:"p",project:"Project",workflow:"ANALYST_REVIEW",
 ...overrides
});
const run=(overrides:any={})=>({
 calculationRunId:"run-1",propertyId:"p",status:"CALCULATED",
 inputSnapshotHash:"current",verdictStatus:"FINAL",
 ...overrides
});
const context=(overrides:any={})=>({
 latestCalculationRunId:"run-1",currentInputSnapshotHash:"current",
 ...overrides
});

describe("calculation review policy",()=>{
 test("review is only allowed in ANALYST_REVIEW",()=>{
  expect(validateCalculationReview(
   property({workflow:"CALCULATED"}),run(),"APPROVED",undefined,context()
  )).toMatchObject({valid:false,error:"property_not_in_analyst_review"});
 });

 test("an older calculation run cannot be reviewed",()=>{
  expect(validateCalculationReview(
   property(),run(),"APPROVED",undefined,context({latestCalculationRunId:"run-2"})
  )).toMatchObject({valid:false,error:"calculation_run_not_latest"});
 });

 test("a stale calculation run cannot be reviewed",()=>{
  expect(validateCalculationReview(
   property(),run(),"APPROVED",undefined,context({currentInputSnapshotHash:"changed"})
  )).toMatchObject({valid:false,error:"calculation_run_stale"});
 });

 test("a provisional verdict cannot be approved",()=>{
  expect(validateCalculationReview(
   property(),run({verdictStatus:"PROVISIONAL"}),"APPROVED",undefined,context()
  )).toMatchObject({valid:false,error:"provisional_run_cannot_be_approved"});
 });

 test("a rejection requires an analyst explanation",()=>{
  expect(validateCalculationReview(
   property(),run({verdictStatus:"PROVISIONAL"}),"REJECTED","   ",context()
  )).toMatchObject({valid:false,error:"rejection_comment_required"});
 });

 test("allows approval of the latest current FINAL run",()=>{
  expect(validateCalculationReview(
   property(),run(),"APPROVED",undefined,context()
  )).toEqual({valid:true});
 });

 test("allows documented rejection of the latest current run",()=>{
  expect(validateCalculationReview(
   property(),run({verdictStatus:"PROVISIONAL"}),"REJECTED","Missing legal evidence",context()
  )).toEqual({valid:true});
 });
});
