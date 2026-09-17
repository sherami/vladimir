import type { Property } from "./types.js";

export type CalculationReviewStatus="APPROVED"|"REJECTED";

export interface ReviewableCalculationRun {
 calculationRunId:string;
 propertyId:string;
 status:string;
 inputSnapshotHash:string;
 verdictStatus?:string;
}

export interface CalculationReviewContext {
 latestCalculationRunId?:string;
 currentInputSnapshotHash?:string;
}

export function validateCalculationReview(
 property:Property,
 run:ReviewableCalculationRun,
 status:CalculationReviewStatus,
 comment:string|undefined,
 context:CalculationReviewContext
) {
 if(property.workflow!=="ANALYST_REVIEW")
  return {
   valid:false as const,
   error:"property_not_in_analyst_review",
   workflow:property.workflow
  };
 if(run.propertyId!==property.id || run.status!=="CALCULATED")
  return {valid:false as const,error:"invalid_calculation_run"};
 if(context.latestCalculationRunId!==run.calculationRunId)
  return {valid:false as const,error:"calculation_run_not_latest"};
 if(!context.currentInputSnapshotHash ||
    run.inputSnapshotHash!==context.currentInputSnapshotHash)
  return {valid:false as const,error:"calculation_run_stale"};
 if(status==="APPROVED" && run.verdictStatus!=="FINAL")
  return {valid:false as const,error:"provisional_run_cannot_be_approved"};
 if(status==="REJECTED" && !comment?.trim())
  return {valid:false as const,error:"rejection_comment_required"};
 return {valid:true as const};
}
