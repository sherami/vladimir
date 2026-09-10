const BASE=process.env.PP_API_URL??"http://localhost:3000/api/v1";
const TOKEN=process.env.PP_TOKEN, ID=process.env.PP_PROPERTY_ID;
if(!TOKEN||!ID) throw new Error("PP_TOKEN and PP_PROPERTY_ID required");
const headers={Authorization:`Bearer ${TOKEN}`};
const r=await fetch(`${BASE}/properties/${ID}`,{headers}); if(!r.ok) throw new Error(await r.text());
const p=await r.json();
const card={
 title:`${p.project} · ${p.unit??""}`.trim(),
 priceTHB:p.purchasePrice?.value??null,
 priceStatus:p.purchasePrice?.status??"NO_DATA",
 dataConfidence:p.dataConfidence??0,
 criticalToVerify:!!p.criticalToVerify,
 disclosure:"STAGING ANALYST PREVIEW — not a published client recommendation."
};
console.log(JSON.stringify(card,null,2));
