type SourceInput={
 status?:string;
 title?:string;
 issuer?:string;
 sourceDate?:string;
 uri?:string;
};

function validIsoDate(value:string) {
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
 const parsed=new Date(`${value}T00:00:00.000Z`);
 return !Number.isNaN(parsed.getTime())&&parsed.toISOString().slice(0,10)===value;
}

export function validateSourceInput(input:SourceInput) {
 const fields:string[]=[];
 if(!input.title?.trim()) fields.push("title");
 if(!input.issuer?.trim()) fields.push("issuer");
 if(!input.sourceDate?.trim()) fields.push("sourceDate");
 else if(!validIsoDate(input.sourceDate)) fields.push("sourceDate");
 if(!input.uri?.trim()) fields.push("uri");
 return {
  valid:input.status!=="VERIFIED_DOCUMENT"||fields.length===0,
  missingOrInvalidFields:input.status==="VERIFIED_DOCUMENT"?fields:[]
 };
}
