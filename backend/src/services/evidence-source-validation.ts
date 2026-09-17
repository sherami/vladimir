type LinkedSource={
 property_id?:string;
 propertyId?:string;
 status?:string;
};

export function validateEvidenceSource(
 propertyId:string,
 evidenceStatus:string|undefined,
 sourceId:string|undefined,
 source:LinkedSource|undefined
) {
 if(evidenceStatus==="VERIFIED_DOCUMENT"&&!sourceId)
  return {valid:false,error:"verified_evidence_source_required"};
 if(sourceId&&!source)
  return {valid:false,error:"source_not_found"};
 if(source){
  const sourcePropertyId=source.property_id??source.propertyId;
  if(sourcePropertyId!==propertyId)
   return {valid:false,error:"source_property_mismatch"};
  if(evidenceStatus==="VERIFIED_DOCUMENT"&&source.status!=="VERIFIED_DOCUMENT")
   return {valid:false,error:"verified_evidence_requires_verified_source"};
 }
 return {valid:true};
}
