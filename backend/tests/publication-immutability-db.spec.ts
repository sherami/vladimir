import {describe,expect,test} from "vitest";
import {v4 as uuid} from "uuid";
import {calculationRunRepo,propertyRepo,publicationRepo} from "../src/repositories/postgres.js";

describe("DB-backed publication immutability",()=>{
 test("a later recalculation does not silently move the public pointer",async()=>{
  const propertyId=uuid();
  const run1Id=uuid();
  const run2Id=uuid();
  await propertyRepo.save({id:propertyId,project:"Immutability Test",workflow:"CALCULATED"} as any);

  const run1:any={
   calculationRunId:run1Id,propertyId,engineVersion:"test",methodologyVersion:"1.0",
   inputSnapshotHash:"hash-1",status:"CALCULATED",verdictStatus:"FINAL",finalVerdict:"CONSIDER"
  };
  await calculationRunRepo.save(run1);
  const snapshot1={property:{id:propertyId},analytics:run1,frozenAt:"2026-09-11T00:00:00Z"};
  await publicationRepo.publish(propertyId,run1Id,"test@privatephuket",snapshot1);

  const publishedBefore=await publicationRepo.latest(propertyId);
  expect(publishedBefore.calculation_run_id).toBe(run1Id);
  expect(publishedBefore.snapshot.analytics.inputSnapshotHash).toBe("hash-1");

  const run2:any={
   calculationRunId:run2Id,propertyId,engineVersion:"test",methodologyVersion:"1.0",
   inputSnapshotHash:"hash-2",status:"CALCULATED",verdictStatus:"FINAL",finalVerdict:"BUY"
  };
  await calculationRunRepo.save(run2);

  const publishedAfterRecalc=await publicationRepo.latest(propertyId);
  expect(publishedAfterRecalc.calculation_run_id).toBe(run1Id);
  expect(publishedAfterRecalc.snapshot.analytics.inputSnapshotHash).toBe("hash-1");
  expect(publishedAfterRecalc.snapshot.analytics.finalVerdict).toBe("CONSIDER");
 });
});
