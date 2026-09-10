import {describe,expect,test} from "vitest";
import {calculateEvidenceConfidence} from "../src/services/confidence.js";

describe("canonical category confidence",()=>{
 test("missing categories remain zero in denominator",()=>{
  const records:any[]=[
   {field:"purchasePrice",status:"VERIFIED_DOCUMENT",value:1,createdAt:"2026-01-01"},
   {field:"ownershipType",status:"VERIFIED_DOCUMENT",value:"L",createdAt:"2026-01-01"},
   {field:"annualNoi",status:"DEVELOPER_MODEL",value:1,createdAt:"2026-01-01"}
  ];
  const c=calculateEvidenceConfidence(records);
  // 15%*100 + 15%*100 + 20%*70 = 44
  expect(c.score).toBeCloseTo(44,8);
 });
});
