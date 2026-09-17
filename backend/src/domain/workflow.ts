import type { Property,WorkflowState } from "./types.js";
import { validateForCalculation } from "./validation.js";

export const TRANSITIONS:Record<WorkflowState,WorkflowState[]>={
 DRAFT:["VERIFICATION"], VERIFICATION:["READY_TO_CALCULATE"],
 READY_TO_CALCULATE:["CALCULATED","VERIFICATION"], CALCULATED:["ANALYST_REVIEW"],
 ANALYST_REVIEW:["READY_TO_PUBLISH","VERIFICATION"], READY_TO_PUBLISH:["PUBLISHED","ANALYST_REVIEW"],
 PUBLISHED:["SUPERSEDED"], SUPERSEDED:[]
};

export interface CalculationTransitionContext {
 latestCalculationRun?:{
  propertyId:string;
  status:string;
  inputSnapshotHash:string;
 };
 currentInputSnapshotHash?:string;
}

export function canTransition(from:WorkflowState,to:WorkflowState){
 return TRANSITIONS[from].includes(to);
}

export function evaluateWorkflowTransition(
 p:Property,
 to:WorkflowState,
 context:CalculationTransitionContext={}
) {
 if(!canTransition(p.workflow,to))
  return {allowed:false as const,error:"invalid_transition",from:p.workflow,to};
 if(to==="READY_TO_CALCULATE"){
  const validation=validateForCalculation(p);
  if(!validation.readyToCalculate)
   return {allowed:false as const,error:"validation_failed",validation};
 }
 if(to==="CALCULATED"){
  const run=context.latestCalculationRun;
  if(!run || run.propertyId!==p.id || run.status!=="CALCULATED")
   return {
    allowed:false as const,
    error:"calculation_run_required",
    message:"Run a successful calculation for this property before marking it CALCULATED."
   };
  if(!context.currentInputSnapshotHash || run.inputSnapshotHash!==context.currentInputSnapshotHash)
   return {
    allowed:false as const,
    error:"calculation_run_stale",
    calculationRunId:(run as {calculationRunId?:string}).calculationRunId,
    message:"Property inputs changed after the latest calculation. Recalculate before marking it CALCULATED."
   };
 }
 return {allowed:true as const};
}
