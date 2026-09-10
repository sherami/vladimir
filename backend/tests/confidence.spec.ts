import {describe,expect,test} from "vitest";
import {calculateEvidenceConfidence} from "../src/services/confidence.js";

describe("evidence confidence",()=>{
 test("critical TO_VERIFY is detected independently from category weights",()=>{
   const records:any[]=[
    {field:"purchasePrice",value:1,status:"VERIFIED_DOCUMENT",createdAt:"2026-01-01"},
    {field:"ownershipType",value:"L",status:"TO_VERIFY",isCritical:true,createdAt:"2026-01-01"}
   ];
   const c=calculateEvidenceConfidence(records);
   expect(c.criticalToVerify).toBe(true);
   expect(c.score).toBeCloseTo(15,8);
 });
});
