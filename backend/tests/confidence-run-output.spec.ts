import {describe,expect,test} from "vitest";
import {calculateProperty} from "../src/services/calculate.js";

describe("calculation run confidence provenance",()=>{
 test("immutable run exposes score, category breakdown and critical flag",()=>{
  const p:any={
   id:"00000000-0000-0000-0000-000000000001",project:"Test",workflow:"READY_TO_CALCULATE",
   purchasePrice:{value:1_000_000,status:"VERIFIED_DOCUMENT"},
   ownershipType:{value:"LEASEHOLD",status:"VERIFIED_DOCUMENT"},
   annualNoi:{value:80_000,status:"DEVELOPER_MODEL"},
   holdingYears:5,exitGrowthRate:.04,sellingCostRate:.06,
   dataConfidence:76,
   dataConfidenceBreakdown:{byField:{purchasePrice:{status:"VERIFIED_DOCUMENT",confidence:100,critical:false,category:"purchaseEntryValue"}},byCategory:{purchaseEntryValue:{weight:.15,confidence:100,fields:["purchasePrice"]}}},
   criticalToVerify:false,
   scores:{rentalEconomics:80,value:80,capitalGrowth:80,liquidity:80,location:80,supply:80,developer:80,legal:80,riskScore:85}
  };
  const run:any=calculateProperty(p);
  expect(run.status).toBe("CALCULATED");
  expect(run.financialDataConfidence).toBe(76);
  expect(run.financialDataConfidenceBreakdown.byCategory.purchaseEntryValue.confidence).toBe(100);
  expect(run.criticalToVerify).toBe(false);
 });
});
