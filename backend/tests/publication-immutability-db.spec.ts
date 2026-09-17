import {describe,expect,test} from "vitest";
import {v4 as uuid} from "uuid";
import {pool} from "../src/db/pool.js";
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
 test("publishes workflow, snapshot and audit atomically and rejects a retry",async()=>{
  const propertyId=uuid();
  const runId=uuid();
  await propertyRepo.save({id:propertyId,project:"Atomic Publish Test",workflow:"READY_TO_PUBLISH"} as any);
  await calculationRunRepo.save({
   calculationRunId:runId,propertyId,engineVersion:"test",methodologyVersion:"1.0",
   inputSnapshotHash:"atomic-hash",status:"CALCULATED",verdictStatus:"FINAL"
  });
  const first=await publicationRepo.publishAtomically(
   propertyId,runId,"publisher@privatephuket",{frozen:true}
  );
  expect(first).toMatchObject({ok:true,property:{workflow:"PUBLISHED"}});
  expect((await propertyRepo.get(propertyId))?.workflow).toBe("PUBLISHED");

  const retry=await publicationRepo.publishAtomically(
   propertyId,runId,"publisher@privatephuket",{frozen:true}
  );
  expect(retry).toMatchObject({
   ok:false,error:"property_not_ready_to_publish",workflow:"PUBLISHED"
  });

  const publications=await pool.query(
   "select count(*)::int as count from pp_publications where property_id=$1",[propertyId]
  );
  expect(publications.rows[0].count).toBe(1);
  const audits=await pool.query(
   "select action from pp_audit_log where entity_type='property' and entity_id=$1 order by id",[propertyId]
  );
  expect(audits.rows.map(row=>row.action)).toEqual(["PUBLISH","WORKFLOW_TRANSITION"]);
 });
});
