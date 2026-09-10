import React,{useEffect,useState} from "react";
import {createRoot} from "react-dom/client";
import {getPublishedProperty} from "./lib/api";
import "./styles.css";
const fmt=(x:any)=>typeof x==="number"?new Intl.NumberFormat("en-US",{maximumFractionDigits:0}).format(x):"—";
function App(){
 const id=new URLSearchParams(location.search).get("id")??import.meta.env.VITE_DEMO_PROPERTY_ID;
 const [data,setData]=useState<any>(),[err,setErr]=useState("");
 useEffect(()=>{if(id)getPublishedProperty(id).then(setData).catch(e=>setErr(e.message));else setErr("Property id is required")},[id]);
 if(err)return <><header><div className="logo">PP <span>PrivatePhuket</span></div></header><main><div className="eyebrow">Property Intelligence</div><h1 className="title">Published analysis only.</h1><p className="sub">{err}. The public website does not render analyst drafts or provisional runs.</p></main></>;
 if(!data)return <main>Loading published analysis…</main>;
 const snap=data.snapshot; const a=snap?.analytics??data.analytics; const n=snap?.narrative;
 return <><header><div className="logo">PP <span>PrivatePhuket</span></div><div className="nav">Property Intelligence · Phuket</div></header><main>
 <section className="hero"><div><div className="eyebrow">Independent property analysis</div><h1 className="title">{n?.headline??<>Investment decision,<br/>not a sales brochure.</>}</h1>
 <p className="sub">{n?.summary??"PrivatePhuket separates property facts, model assumptions and analyst opinion. The figures below come from the exact calculation run approved for publication."}</p></div>
 <div className="scorebox"><div className="muted" style={{color:"#b9c0bc"}}>PRIVATEPHUKET INVESTMENT SCORE</div><div className="score">{a.riskAdjustedScore?.toFixed?.(1)??"—"} <small>/ 100</small></div><span className="badge darkbadge">{a.finalVerdict??"FINAL"}</span></div></section>
 <div className="metrics"><div className="metric"><span className="muted">TOTAL ACQUISITION COST</span><b>{fmt(a.tac)} THB</b></div>
 <div className="metric"><span className="muted">NET YIELD</span><b>{a.netYield==null?"—":`${(a.netYield*100).toFixed(2)}%`}</b></div>
 <div className="metric"><span className="muted">RETURN METRIC</span><b>{a.productionReturnMetric??"—"}</b></div>
 <div className="metric"><span className="muted">METHODOLOGY</span><b>{a.methodologyVersion??"—"}</b></div></div>
 <section className="section"><div className="eyebrow">Decision layer</div><h2>What the numbers mean</h2><div className="cols">
 <div className="panel"><h3>Why consider</h3>{(n?.whyBuy??[]).map((x:string,i:number)=><p className="why" key={i}>— {x}</p>)}</div>
 <div className="panel risk"><h3>Why not buy</h3>{(n?.whyNotBuy??[]).map((x:string,i:number)=><p className="why" key={i}>— {x}</p>)}</div></div></section>
 <section className="section"><div className="eyebrow">Evidence & scenarios</div><h2>What is fact, and what is model</h2><div className="cols">
 <div className="panel"><h3>Source disclosures</h3>{(snap?.sourceDisclosures??[]).map((x:any,i:number)=><p className="why" key={i}><Badge>{x.status??"SOURCE"}</Badge> {x.label??x.text??String(x)}</p>)}</div>
 <div className="panel"><h3>Scenario assumptions</h3>{(snap?.scenarioDisclosures??[]).map((x:any,i:number)=><p className="why" key={i}><b>{x.name??"Scenario"}</b> — {x.text??String(x)}</p>)}</div>
 </div></section>
 <section className="section"><div className="eyebrow">Transparency</div><h2>Calculation provenance</h2>
 <div className="disclosure">This page is pinned to calculation run <b>{a.calculationRunId}</b>. Engine {a.engineVersion}; methodology {a.methodologyVersion}; input snapshot {String(a.inputSnapshotHash).slice(0,16)}… A later recalculation does not silently change this published analysis.</div></section>
 </main><footer>PrivatePhuket · Property Intelligence Platform · Analytics are decision support, not a guarantee of future returns.</footer></>
}
createRoot(document.getElementById("root")!).render(<App/>);
