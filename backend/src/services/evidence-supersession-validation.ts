export interface SupersededEvidence {
 id:string;
 property_id:string;
 field:string;
}

export function validateEvidenceSupersession(
 propertyId:string,
 field:string,
 supersedesId:string|undefined,
 superseded:SupersededEvidence|undefined
) {
 if(!supersedesId)return {valid:true as const};
 if(!superseded || superseded.id!==supersedesId)
  return {valid:false as const,error:"superseded_evidence_not_found"};
 if(superseded.property_id!==propertyId)
  return {valid:false as const,error:"superseded_evidence_property_mismatch"};
 if(superseded.field!==field)
  return {valid:false as const,error:"superseded_evidence_field_mismatch"};
 return {valid:true as const};
}
