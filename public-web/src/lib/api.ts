import {demoCatalog,demoProperty} from "./demo";

const BASE=import.meta.env.VITE_PUBLIC_API_URL??"http://localhost:3000/api/v1";
const preview=()=>new URLSearchParams(location.search).has("preview");
export async function getPublishedProperty(id:string){
 if(preview()){
  const property=demoProperty(id); if(!property)throw new Error("Preview property was not found");
  return property;
 }
 const r=await fetch(`${BASE}/properties/${id}/public`);
 if(!r.ok) throw new Error(r.status===404?"Property is not published":await r.text());
 return r.json();
}
export async function getPublishedProperties(){
 if(preview())return demoCatalog;
 const r=await fetch(`${BASE}/public/properties`);
 if(!r.ok) throw new Error("Published catalog is temporarily unavailable");
 return r.json();
}
export async function comparePublishedProperties(ids:string[]){
 if(preview()){
  const items=ids.map(id=>demoCatalog.find(x=>x.id===id));
  if(items.some(x=>!x))throw new Error("One or more preview properties were not found");
  return {items};
 }
 const r=await fetch(`${BASE}/public/compare?ids=${encodeURIComponent(ids.join(","))}`);
 if(!r.ok) throw new Error(r.status===404?"One or more properties are no longer published":"Comparison is temporarily unavailable");
 return r.json();
}

export type PublicCalculatorInput={
 purchasePrice:number;
 acquisitionCosts:number;
 initialCapex:number;
 annualNoi:number;
 entryMarketValue:number;
 holdingYears:number;
 exitGrowthRate:number;
 sellingCostRate:number;
 requiredReturn:number;
};

export async function calculatePublicScenario(input:PublicCalculatorInput){
 const r=await fetch(`${BASE}/public/calculator`,{
  method:"POST",
  headers:{"content-type":"application/json"},
  body:JSON.stringify(input)
 });
 if(!r.ok){
  const body=await r.json().catch(()=>null);
  throw new Error(body?.issues?.join(". ")??"The scenario could not be calculated");
 }
 return r.json();
}
