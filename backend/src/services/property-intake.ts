const PROPERTY_TYPES=new Set(["CONDO","VILLA","TOWNHOUSE","OTHER"]);

export function prepareDraftProperty(input:any,id:string) {
 const project=typeof input?.project==="string"?input.project.trim():"";
 if(!project)return {valid:false as const,error:"project_required"};

 const propertyType=typeof input?.propertyType==="string"?input.propertyType:"OTHER";
 if(!PROPERTY_TYPES.has(propertyType))
  return {valid:false as const,error:"invalid_property_type"};

 const area=input?.area;
 if(area!=null&&(!Number.isFinite(area)||area<=0))
  return {valid:false as const,error:"invalid_area"};

 const bedrooms=input?.bedrooms;
 if(bedrooms!=null&&(!Number.isInteger(bedrooms)||bedrooms<0))
  return {valid:false as const,error:"invalid_bedrooms"};

 return {
  valid:true as const,
  property:{
   id,
   workflow:"DRAFT" as const,
   project,
   unit:typeof input?.unit==="string"&&input.unit.trim()?input.unit.trim():undefined,
   propertyType,
   area,
   bedrooms,
   ownership:typeof input?.ownership==="string"&&input.ownership.trim()?input.ownership.trim():undefined,
   location:typeof input?.location==="string"&&input.location.trim()?input.location.trim():undefined,
   dataConfidence:0,
   criticalToVerify:true
  }
 };
}
