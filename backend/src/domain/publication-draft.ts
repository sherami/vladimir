import type { Property } from "./types.js";

export interface DraftCalculationRun {
 calculationRunId:string;
 propertyId:string;
 status:string;
 inputSnapshotHash:string;
}

export function validatePublicationDraftMutation(
 property:Property,
 run:DraftCalculationRun,
 latestCalculationRunId:string|undefined,
 currentInputSnapshotHash:string
) {
 if(property.workflow!=="ANALYST_REVIEW" &&
    property.workflow!=="READY_TO_PUBLISH")
  return {
   valid:false as const,
   error:"property_not_in_publication_editing",
   workflow:property.workflow
  };
 if(run.propertyId!==property.id || run.status!=="CALCULATED")
  return {valid:false as const,error:"invalid_calculation_run"};
 if(latestCalculationRunId!==run.calculationRunId)
  return {valid:false as const,error:"calculation_run_not_latest"};
 if(run.inputSnapshotHash!==currentInputSnapshotHash)
  return {valid:false as const,error:"calculation_run_stale"};
 return {valid:true as const};
}
