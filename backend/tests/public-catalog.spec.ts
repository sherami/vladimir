import {describe,expect,test} from "vitest";
import {buildPublicComparison,toPublicCatalogItem} from "../src/services/public-catalog.js";

const publication=(id:string,score:number)=>({
 property_id:id,
 published_at:"2026-09-18T00:00:00.000Z",
 snapshot:{
  property:{id,project:`Project ${id}`,unit:"A-01"},
  analytics:{
   tac:10_000_000,netYield:.071,productionReturnMetric:"IRR",productionReturn:.104,
   riskAdjustedScore:score,finalVerdict:"BUY",dataConfidence:{score:83},
   inputSnapshot:{private:"must not leak"}
  },
  narrative:{headline:"Independent view",summary:"Published summary"},
  sourceDisclosures:[{uri:"s3://private/document.pdf"}]
 }
});

describe("public catalog",()=>{
 test("exposes only the allowlisted comparison fields",()=>{
  const item=toPublicCatalogItem(publication("p1",78));
  expect(item.analytics).toEqual({
   tac:10_000_000,netYield:.071,productionReturnMetric:"IRR",productionReturn:.104,
   riskAdjustedScore:78,finalVerdict:"BUY",dataConfidence:83
  });
  expect(item).not.toHaveProperty("snapshot");
  expect(JSON.stringify(item)).not.toContain("private");
  expect(JSON.stringify(item)).not.toContain("s3://");
 });

 test("preserves caller order for deterministic comparisons",()=>{
  expect(buildPublicComparison([publication("p2",70),publication("p1",80)]).map(x=>x.id))
   .toEqual(["p2","p1"]);
 });
});
