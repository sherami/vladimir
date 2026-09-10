import React,{useEffect,useState} from "react";
import {createRoot} from "react-dom/client";
import {api} from "./lib/api";
import "./styles.css";
type View="dashboard"|"properties"|"verification"|"property";
const STATUSES=["VERIFIED_DOCUMENT","ACTUAL","MARKET_DATA","DEVELOPER_MODEL","PP_ESTIMATE","DEVELOPER_CLAIM","ASSUMPTION","TO_VERIFY"];
function Badge({children,kind=""}:{children:React.ReactNode,kind?:string}){return <span className={`badge ${kind}`}>{children}</span>}
function Shell({view,setView,children}:{view:View,setView:(v:View)=>void,children:React.ReactNode}){
 return <div className="app"><aside><div className="brand">PP <span className="gold">PrivatePhuket</span></div>
 <div className="muted" style={{marginTop:6,color:"#87908c"}}>Analyst Operations · v0.5</div><nav>
 {[["dashboard","Dashboard"],["properties","Properties"],["verification","Verification Queue"]].map(([v,l])=>
 <button key={v} className={`nav ${view===v?"active":""}`} onClick={()=>setView(v as View)}>{l}</button>)}</nav></aside><main>{children}</main></div>
}
function Dashboard({go}:{go:(v:View)=>void}){
 const [ps,setPs]=useState<any[]>([]),[vi,setVi]=useState<any[]>([]);
 useEffect(()=>{api.properties().then(setPs).catch(()=>{});api.verification().then(setVi).catch(()=>{})},[]);
 return <><div className="eyebrow">Operational control</div><h1>Dashboard</h1><div className="grid">
 <div className="card"><div className="muted">Properties</div><div className="metric">{ps.length}</div></div>
 <div className="card"><div className="muted">Open verification</div><div className="metric">{vi.length}</div></div>
 <div className="card"><div className="muted">Blockers</div><div className="metric">{vi.filter(x=>x.severity==="BLOCKER").length}</div></div>
 <div className="card"><div className="muted">Operating model</div><div style={{marginTop:12,fontWeight:700}}>EVIDENCE → REVIEW → PUBLISH</div></div></div>
 <div className="toolbar"><button className="primary" onClick={()=>go("properties")}>Work with properties</button><button className="secondary" onClick={()=>go("verification")}>Resolve blockers</button></div></>
}
function Properties({open}:{open:(id:string)=>void}){
 const [data,setData]=useState<any[]>([]);useEffect(()=>{api.properties().then(setData)},[]);
 return <><div className="eyebrow">Portfolio</div><h1>Properties</h1><table><thead><tr><th>Project</th><th>Unit</th><th>Workflow</th><th>Confidence</th><th></th></tr></thead>
 <tbody>{data.map(p=><tr key={p.id}><td><b>{p.project}</b></td><td>{p.unit??"—"}</td><td><Badge>{p.workflow}</Badge></td><td>{p.dataConfidence?`${p.dataConfidence.toFixed(0)}/100`:"—"}</td><td><button className="secondary" onClick={()=>open(p.id)}>Open</button></td></tr>)}</tbody></table></>
}
function Verification(){
 const [items,setItems]=useState<any[]>([]);
 const load=()=>api.verification().then(setItems); useEffect(()=>{load()},[]);
 const resolve=async(x:any)=>{const c=prompt("Resolution comment");if(!c)return;await api.resolveVerification(x.id,c);load();}
 return <><div className="eyebrow">Evidence control</div><h1>Verification Queue</h1><table><thead><tr><th>Severity</th><th>Field</th><th>Issue</th><th>State</th><th></th></tr></thead>
 <tbody>{items.map(x=><tr key={x.id}><td><Badge kind={x.severity==="BLOCKER"?"blocker":"warn"}>{x.severity}</Badge></td><td>{x.field??"—"}</td><td>{x.message}</td><td>{x.state}</td><td><button className="secondary" onClick={()=>resolve(x)}>Resolve</button></td></tr>)}</tbody></table></>
}
function PropertyView({id}:{id:string}){
 const [p,setP]=useState<any>(),[sources,setSources]=useState<any[]>([]),[evidence,setEvidence]=useState<any[]>([]),[runs,setRuns]=useState<any[]>([]),[preview,setPreview]=useState<any>();
 const [sourceForm,setSourceForm]=useState({documentType:"PRICE_LIST",title:"",issuer:"",status:"VERIFIED_DOCUMENT"});
 const [evForm,setEvForm]=useState({field:"purchasePrice",value:"",unit:"THB",status:"VERIFIED_DOCUMENT",sourceId:"",isCritical:true,analystComment:""});
 const load=async()=>{setP(await api.property(id));setSources(await api.sources(id));setEvidence(await api.evidence(id));setRuns(await api.calculations(id));}
 useEffect(()=>{load()},[id]);
 if(!p)return <div>Loading…</div>;
 const addSource=async()=>{await api.createSource(id,sourceForm);setSourceForm({...sourceForm,title:"",issuer:""});await load();}
 const addEvidence=async()=>{let value:any=evForm.value; if(value!==""&&!Number.isNaN(Number(value)))value=Number(value);
   await api.createEvidence(id,{...evForm,value,sourceId:evForm.sourceId||undefined});setEvForm({...evForm,value:"",analystComment:""});await load();}
 const calc=async()=>{await api.calculate(id);await load();}
 const review=async(run:any,status:"APPROVED"|"REJECTED")=>{await api.reviewRun(run.calculationRunId,status);await load();}
 const publish=async(run:any)=>{await api.publish(id,run.calculationRunId);setPreview(await api.publicView(id));}
 return <><div className="eyebrow">Property workspace</div><h1>{p.project} {p.unit&&`/ ${p.unit}`}</h1>
 <div className="grid"><div className="card"><div className="muted">Price</div><div className="value">{p.purchasePrice?.value?.toLocaleString?.()??"—"} THB</div><Badge>{p.purchasePrice?.status??"NO DATA"}</Badge></div>
 <div className="card"><div className="muted">Confidence</div><div className="value">{(p.dataConfidence??0).toFixed(0)}/100</div></div>
 <div className="card"><div className="muted">Critical TO VERIFY</div><div className="value">{p.criticalToVerify?"YES":"NO"}</div></div>
 <div className="card"><div className="muted">Runs</div><div className="value">{runs.length}</div></div></div>
 <div className="toolbar"><button className="secondary" onClick={()=>api.syncVerification(id)}>Sync verification</button><button className="primary" onClick={calc}>Run calculation</button></div>
 <div className="split"><div className="stack">
 <div className="card"><h2>Add Source</h2><div className="formgrid">
 <input placeholder="Title" value={sourceForm.title} onChange={e=>setSourceForm({...sourceForm,title:e.target.value})}/>
 <input placeholder="Issuer" value={sourceForm.issuer} onChange={e=>setSourceForm({...sourceForm,issuer:e.target.value})}/>
 <input placeholder="Document type" value={sourceForm.documentType} onChange={e=>setSourceForm({...sourceForm,documentType:e.target.value})}/>
 <select value={sourceForm.status} onChange={e=>setSourceForm({...sourceForm,status:e.target.value})}>{STATUSES.map(s=><option>{s}</option>)}</select></div>
 <button className="primary" onClick={addSource}>Save source</button></div>
 <div className="card"><h2>Add Evidence</h2><div className="formgrid">
 <input placeholder="Field" value={evForm.field} onChange={e=>setEvForm({...evForm,field:e.target.value})}/>
 <input placeholder="Value" value={evForm.value} onChange={e=>setEvForm({...evForm,value:e.target.value})}/>
 <input placeholder="Unit" value={evForm.unit} onChange={e=>setEvForm({...evForm,unit:e.target.value})}/>
 <select value={evForm.status} onChange={e=>setEvForm({...evForm,status:e.target.value})}>{STATUSES.map(s=><option>{s}</option>)}</select>
 <select value={evForm.sourceId} onChange={e=>setEvForm({...evForm,sourceId:e.target.value})}><option value="">No source</option>{sources.map(s=><option value={s.id}>{s.title??s.document_type}</option>)}</select>
 <input placeholder="Analyst comment" value={evForm.analystComment} onChange={e=>setEvForm({...evForm,analystComment:e.target.value})}/></div>
 <label><input type="checkbox" checked={evForm.isCritical} onChange={e=>setEvForm({...evForm,isCritical:e.target.checked})}/> Critical input</label>
 <div><button className="primary" onClick={addEvidence}>Save evidence</button></div></div>
 <div className="card"><h2>Evidence history</h2><table><thead><tr><th>Field</th><th>Value</th><th>Status</th><th>Source</th></tr></thead><tbody>{evidence.slice().reverse().slice(0,12).map(e=><tr key={e.id}><td>{e.field}</td><td>{typeof e.value==="object"?JSON.stringify(e.value):String(e.value)}</td><td><Badge>{e.status}</Badge></td><td>{e.source_id??"—"}</td></tr>)}</tbody></table></div>
 </div><div className="stack">
 <div className="card"><h2>Calculation History</h2>{runs.length===0?<div className="muted">No runs yet.</div>:runs.map((r:any)=><div className="run" key={r.calculationRunId}>
 <b>{r.productionReturnMetric??"CALCULATION"}</b> · {r.productionReturn==null?"—":`${(r.productionReturn*100).toFixed(2)}%`}<br/>
 <Badge kind={r.verdictStatus==="FINAL"?"ok":"warn"}>{r.verdictStatus}</Badge> <Badge>{r.reviewStatus??"PENDING"}</Badge>
 <div className="muted">{r.provisionalVerdict??r.finalVerdict??"No verdict"} · engine {r.engineVersion}</div>
 <div className="toolbar mini"><button className="secondary" onClick={()=>review(r,"APPROVED")}>Approve</button><button className="secondary" onClick={()=>review(r,"REJECTED")}>Reject</button>
 <button className="primary" disabled={r.verdictStatus!=="FINAL"||r.reviewStatus!=="APPROVED"} onClick={()=>publish(r)}>Publish</button></div></div>)}</div>
 <div className="card"><h2>Public Preview</h2>{!preview?<div className="muted">Publish an approved FINAL run to preview the public read-model.</div>:<>
 <div className="value">{preview.analytics.finalVerdict}</div><div className="muted">Score {preview.analytics.riskAdjustedScore?.toFixed?.(1)} · Confidence controlled by backend</div></>}</div>
 </div></div></>
}
function App(){const [view,setView]=useState<View>("dashboard"),[pid,setPid]=useState("");const open=(id:string)=>{setPid(id);setView("property")};
 return <Shell view={view} setView={setView}>{view==="dashboard"?<Dashboard go={setView}/>:view==="properties"?<Properties open={open}/>:view==="verification"?<Verification/>:<PropertyView id={pid}/>}</Shell>}
createRoot(document.getElementById("root")!).render(<App/>);
