import type { Property,WorkflowState } from "./types.js";
import { validateForCalculation } from "./validation.js";

export const TRANSITIONS:Record<WorkflowState,WorkflowState[]>={
 DRAFT:["VERIFICATION"], VERIFICATION:["READY_TO_CALCULATE"],
 READY_TO_CALCULATE:["CALCULATED","VERIFICATION"], CALCULATED:["ANALYST_REVIEW","VERIFICATION"],
 ANALYST_REVIEW:["READY_TO_PUBLISH","VERIFICATION"], READY_TO_PUBLISH:["PUBLISHED","ANALYST_REVIEW","VERIFICATION"],
 PUBLISHED:["SUPERSEDED"], SUPERSEDED:[]
};

export interface WorkflowTransitionContext {
 latestCalculationRun?:{
  calculationRunId?:string;
  propertyId:string;
  status:string;
  inputSnapshotHash:string;
  verdictStatus?:string;
  reviewStatus?:string;
 };
 currentInputSnapshotHash?:string;
 publicationNarrativeIssues?:string[];
 supersessionReason?:string;
 latestPublication?:{
  property_id:string;
  calculation_run_id:string;
 };
}

export function canTransition(from:WorkflowState,to:WorkflowState){
 return TRANSITIONS[from].includes(to);
}

export function evaluateCalculationRequest(p:Property) {
 if(p.workflow!=="READY_TO_CALCULATE")
  return {
   allowed:false as const,
   error:"property_not_ready_to_calculate",
   workflow:p.workflow,
   message:"Move the property through verification to READY_TO_CALCULATE before running calculations."
  };
 const validation=validateForCalculation(p);
 if(!validation.readyToCalculate)
  return {allowed:false as const,error:"validation_failed",validation};
 return {allowed:true as const};
}

export function evaluateWorkflowTransition(
 p:Property,
 to:WorkflowState,
 context:WorkflowTransitionContext={}
) {
 if(!canTransition(p.workflow,to))
  return {allowed:false as const,error:"invalid_transition",from:p.workflow,to};

 if(to==="SUPERSEDED" && !context.supersessionReason?.trim())
  return {
   allowed:false as const,
   error:"supersession_reason_required",
   message:"Explain why this published property version is being superseded."
  };

 if(to==="READY_TO_CALCULATE"){
  const validation=validateForCalculation(p);
  if(!validation.readyToCalculate)
   return {allowed:false as const,error:"validation_failed",validation};
 }

 if(to==="CALCULATED" || to==="ANALYST_REVIEW" || to==="READY_TO_PUBLISH" || to==="PUBLISHED"){
  const run=context.latestCalculationRun;
  if(!run || run.propertyId!==p.id || run.status!=="CALCULATED")
   return {
    allowed:false as const,
    error:"calculation_run_required",
    message:"Run a successful calculation for this property before advancing its workflow."
   };
  if(!context.currentInputSnapshotHash || run.inputSnapshotHash!==context.currentInputSnapshotHash)
   return {
    allowed:false as const,
    error:"calculation_run_stale",
    calculationRunId:run.calculationRunId,
    message:"Property inputs changed after the latest calculation. Recalculate before advancing its workflow."
   };

  if(to==="PUBLISHED"){
   const publication=context.latestPublication;
   if(!publication || publication.property_id!==p.id ||
      publication.calculation_run_id!==run.calculationRunId)
    return {
     allowed:false as const,
     error:"publication_required",
     calculationRunId:run.calculationRunId,
     message:"Create a publication from the current calculation before marking the property PUBLISHED."
    };
  }

  if(to==="READY_TO_PUBLISH"){
   if(run.verdictStatus!=="FINAL")
    return {
     allowed:false as const,
     error:"calculation_run_not_final",
     calculationRunId:run.calculationRunId,
     message:"Only a FINAL calculation run can become ready to publish."
    };
   if(run.reviewStatus!=="APPROVED")
    return {
     allowed:false as const,
     error:"calculation_run_not_approved",
     calculationRunId:run.calculationRunId,
     message:"Approve the current calculation run before marking the property ready to publish."
    };
   const issues=context.publicationNarrativeIssues;
   if(!issues || issues.length>0)
    return {
     allowed:false as const,
     error:"publication_narrative_incomplete",
     issues:issues??["publication narrative missing"],
     message:"Complete the publication narrative before marking the property ready to publish."
    };
  }
 }

 return {allowed:true as const};
}
