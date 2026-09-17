import type { Property,WorkflowState } from "./types.js";
import { validateForCalculation } from "./validation.js";

export const TRANSITIONS:Record<WorkflowState,WorkflowState[]>={
 DRAFT:["VERIFICATION"], VERIFICATION:["READY_TO_CALCULATE"],
 READY_TO_CALCULATE:["CALCULATED","VERIFICATION"], CALCULATED:["ANALYST_REVIEW"],
 ANALYST_REVIEW:["READY_TO_PUBLISH","VERIFICATION"], READY_TO_PUBLISH:["PUBLISHED","ANALYST_REVIEW"],
 PUBLISHED:["SUPERSEDED"], SUPERSEDED:[]
};

export function canTransition(from:WorkflowState,to:WorkflowState){
 return TRANSITIONS[from].includes(to);
}

export function evaluateWorkflowTransition(p:Property,to:WorkflowState) {
 if(!canTransition(p.workflow,to))
  return {allowed:false as const,error:"invalid_transition",from:p.workflow,to};
 if(to==="READY_TO_CALCULATE"){
  const validation=validateForCalculation(p);
  if(!validation.readyToCalculate)
   return {allowed:false as const,error:"validation_failed",validation};
 }
 return {allowed:true as const};
}
