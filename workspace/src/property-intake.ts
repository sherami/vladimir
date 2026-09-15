import {api} from "./lib/api";

function install(){
 const h1=[...document.querySelectorAll("h1")].find(x=>x.textContent?.trim()==="Properties");
 if(!h1||document.getElementById("pp-create-property"))return;
 const button=document.createElement("button");button.id="pp-create-property";button.className="primary";button.textContent="Create property";button.style.marginBottom="18px";
 h1.insertAdjacentElement("afterend",button);
 button.onclick=()=>showDialog();
}
function showDialog(){
 const wrap=document.createElement("div");wrap.className="pp-modal";wrap.innerHTML=`<div class="card pp-dialog"><div class="eyebrow">Portfolio intake</div><h2>Create property</h2><p class="muted">Create the asset record first. Financial facts and assumptions are added later as Evidence with provenance.</p><form id="pp-property-form"><div class="formgrid"><label>Project<input name="project" required autofocus></label><label>Unit<input name="unit"></label><label>Property type<select name="propertyType"><option value="CONDO">Condo</option><option value="VILLA">Villa</option><option value="TOWNHOUSE">Townhouse</option><option value="OTHER">Other</option></select></label><label>Area, m²<input name="area" type="number" min="0" step="0.01"></label><label>Bedrooms<input name="bedrooms" type="number" min="0" step="1"></label><label>Ownership<input name="ownership" placeholder="Freehold / Leasehold / to verify"></label><label>Location<input name="location" placeholder="Area / neighbourhood"></label></div><div id="pp-property-error"></div><div class="toolbar"><button class="primary" type="submit">Create property</button><button class="secondary" type="button" id="pp-property-cancel">Cancel</button></div></form></div>`;
 document.body.appendChild(wrap);
 const close=()=>wrap.remove();(wrap.querySelector("#pp-property-cancel") as HTMLButtonElement).onclick=close;
 wrap.addEventListener("click",e=>{if(e.target===wrap)close()});
 (wrap.querySelector("form") as HTMLFormElement).onsubmit=async e=>{e.preventDefault();const form=e.currentTarget as HTMLFormElement,fd=new FormData(form),submit=form.querySelector('button[type="submit"]') as HTMLButtonElement,err=form.querySelector("#pp-property-error") as HTMLDivElement;submit.disabled=true;err.textContent="";
  try{const project=String(fd.get("project")??"").trim();const area=String(fd.get("area")??""),bedrooms=String(fd.get("bedrooms")??"");await api.createProperty({project,unit:String(fd.get("unit")??"").trim()||undefined,propertyType:String(fd.get("propertyType")??"CONDO"),area:area?Number(area):undefined,bedrooms:bedrooms?Number(bedrooms):undefined,ownership:String(fd.get("ownership")??"").trim()||undefined,location:String(fd.get("location")??"").trim()||undefined,dataConfidence:0,criticalToVerify:true});close();location.reload();}
  catch(ex:any){err.textContent=ex?.message??"Could not create property";err.style.color="#9b2c2c";submit.disabled=false;}
 };
}
const observer=new MutationObserver(()=>install());observer.observe(document.body,{childList:true,subtree:true});install();
