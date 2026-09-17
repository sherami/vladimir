import type { Property,WorkflowState } from "./types.js";

const RESET_TO_VERIFICATION=new Set<WorkflowState>([
 "READY_TO_CALCULATE","CALCULATED","ANALYST_REVIEW","READY_TO_PUBLISH"
]);

export function evaluateEvidenceMutation(property:Property) {
 if(property.workflow==="PUBLISHED" || property.workflow==="SUPERSEDED")
  return {
   allowed:false as const,
   error:"immutable_property_version",
   workflow:property.workflow,
   message:"Published and superseded property versions are immutable. Create a new analysis version for new evidence."
  };
 return {
  allowed:true as const,
  nextWorkflow:RESET_TO_VERIFICATION.has(property.workflow)
   ? "VERIFICATION" as const
   : property.workflow
 };
}
