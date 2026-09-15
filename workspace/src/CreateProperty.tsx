import React,{useState} from "react";
import {api} from "./lib/api";

export function CreateProperty({onCreated,onCancel}:{onCreated:(id:string)=>void,onCancel:()=>void}){
 const [form,setForm]=useState({project:"",unit:"",propertyType:"CONDO",area:"",bedrooms:"",ownership:"",location:""});
 const [busy,setBusy]=useState(false),[error,setError]=useState("");
 const set=(key:string,value:string)=>setForm({...form,[key]:value});
 const submit=async(e:React.FormEvent)=>{
  e.preventDefault(); setError("");
  if(!form.project.trim()){setError("Project name is required.");return;}
  setBusy(true);
  try{
   const p=await api.createProperty({
    project:form.project.trim(),unit:form.unit.trim()||undefined,propertyType:form.propertyType,
    area:form.area?Number(form.area):undefined,bedrooms:form.bedrooms?Number(form.bedrooms):undefined,
    ownership:form.ownership.trim()||undefined,location:form.location.trim()||undefined,
    dataConfidence:0,criticalToVerify:true
   });
   onCreated(p.id);
  }catch(err:any){setError(err?.message??"Could not create property");setBusy(false);}
 };
 return <><div className="eyebrow">Portfolio intake</div><h1>Create property</h1>
  <div className="card" style={{maxWidth:820}}><p className="muted">Create the base asset record first. Price, financial assumptions and supporting documents belong in Evidence and Sources so provenance stays auditable.</p>
  <form onSubmit={submit}><div className="formgrid">
   <label>Project<input autoFocus placeholder="Project name" value={form.project} onChange={e=>set("project",e.target.value)}/></label>
   <label>Unit<input placeholder="Unit / villa / apartment" value={form.unit} onChange={e=>set("unit",e.target.value)}/></label>
   <label>Property type<select value={form.propertyType} onChange={e=>set("propertyType",e.target.value)}><option value="CONDO">Condo</option><option value="VILLA">Villa</option><option value="TOWNHOUSE">Townhouse</option><option value="OTHER">Other</option></select></label>
   <label>Area, m²<input type="number" min="0" step="0.01" value={form.area} onChange={e=>set("area",e.target.value)}/></label>
   <label>Bedrooms<input type="number" min="0" step="1" value={form.bedrooms} onChange={e=>set("bedrooms",e.target.value)}/></label>
   <label>Ownership<input placeholder="Freehold / Leasehold / to verify" value={form.ownership} onChange={e=>set("ownership",e.target.value)}/></label>
   <label>Location<input placeholder="Area / neighbourhood" value={form.location} onChange={e=>set("location",e.target.value)}/></label>
  </div>{error&&<p style={{color:"#9b2c2c"}}>{error}</p>}
  <div className="toolbar"><button className="primary" type="submit" disabled={busy}>{busy?"Creating…":"Create property"}</button><button className="secondary" type="button" onClick={onCancel}>Cancel</button></div></form></div></>;
}
