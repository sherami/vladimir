type SourceInput={
 documentType?:unknown;
 status?:unknown;
 title?:unknown;
 issuer?:unknown;
 sourceDate?:unknown;
 uri?:unknown;
 metadata?:unknown;
};

const DATA_STATUSES=new Set([
 "VERIFIED_DOCUMENT","ACTUAL","MARKET_DATA","DEVELOPER_MODEL",
 "PP_ESTIMATE","DEVELOPER_CLAIM","ASSUMPTION","TO_VERIFY"
]);

function validIsoDate(value:string) {
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
 const parsed=new Date(`${value}T00:00:00.000Z`);
 return !Number.isNaN(parsed.getTime())&&parsed.toISOString().slice(0,10)===value;
}
function nonEmptyString(value:unknown,maxLength=500):value is string{
 return typeof value==="string" && value.trim().length>0 && value.length<=maxLength;
}
function optionalStringIsValid(value:unknown,maxLength=500){
 return value===undefined || nonEmptyString(value,maxLength);
}

export function validateSourceInput(input:SourceInput) {
 const fields:string[]=[];
 if(!nonEmptyString(input.documentType,100)) fields.push("documentType");
 if(!DATA_STATUSES.has(input.status)) fields.push("status");
 if(!optionalStringIsValid(input.title)) fields.push("title");
 if(!optionalStringIsValid(input.issuer,200)) fields.push("issuer");
 if(!optionalStringIsValid(input.uri,2000)) fields.push("uri");
 if(input.sourceDate!==undefined &&
    (typeof input.sourceDate!=="string" || !validIsoDate(input.sourceDate)))
  fields.push("sourceDate");
 if(input.metadata!==undefined &&
    (!input.metadata || typeof input.metadata!=="object" || Array.isArray(input.metadata)))
  fields.push("metadata");

 if(input.status==="VERIFIED_DOCUMENT"){
  if(!nonEmptyString(input.title)) fields.push("title");
  if(!nonEmptyString(input.issuer,200)) fields.push("issuer");
  if(typeof input.sourceDate!=="string" || !validIsoDate(input.sourceDate))
   fields.push("sourceDate");
  if(!nonEmptyString(input.uri,2000)) fields.push("uri");
 }

 const invalidFields=[...new Set(fields)];
 return {
  valid:invalidFields.length===0,
  error:invalidFields.length?"invalid_source_input":undefined,
  missingOrInvalidFields:invalidFields
 };
}
