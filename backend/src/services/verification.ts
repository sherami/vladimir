import { v4 as uuid } from "uuid";
import type { EvidenceRecord, Property, VerificationItem } from "../domain/types.js";
import { validateForCalculation } from "../domain/validation.js";

export function buildVerificationItems(p:Property,evidence:EvidenceRecord[]):VerificationItem[] {
  const result:VerificationItem[]=[];
  const validation=validateForCalculation(p);
  for(const i of validation.issues){
    result.push({id:uuid(),propertyId:p.id,field:i.field,severity:i.severity==="ERROR"?"BLOCKER":i.severity,code:i.code,message:i.message,state:"OPEN"});
  }
  for(const e of evidence){
    if(e.status==="TO_VERIFY"){
      result.push({
        id:uuid(),propertyId:p.id,field:e.field,severity:e.isCritical?"BLOCKER":"WARNING",
        code:"EVIDENCE_TO_VERIFY",message:`${e.field} requires source verification.`,state:"OPEN",sourceId:e.sourceId
      });
    }
  }
  return result;
}
