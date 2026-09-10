import type { WorkflowState } from "./types.js";
export const TRANSITIONS:Record<WorkflowState,WorkflowState[]>={
 DRAFT:["VERIFICATION"], VERIFICATION:["READY_TO_CALCULATE"],
 READY_TO_CALCULATE:["CALCULATED","VERIFICATION"], CALCULATED:["ANALYST_REVIEW"],
 ANALYST_REVIEW:["READY_TO_PUBLISH","VERIFICATION"], READY_TO_PUBLISH:["PUBLISHED","ANALYST_REVIEW"],
 PUBLISHED:["SUPERSEDED"], SUPERSEDED:[]
};
export function canTransition(from:WorkflowState,to:WorkflowState){return TRANSITIONS[from].includes(to);}
