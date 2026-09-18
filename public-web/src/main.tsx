import React,{FormEvent,useEffect,useState} from "react";
import {createRoot} from "react-dom/client";
import {calculatePublicScenario,comparePublishedProperties,getPublishedProperties,getPublishedProperty,PublicCalculatorInput} from "./lib/api";
import "./styles.css";
const fmt=(x:any)=>typeof x==="number"?new Intl.NumberFormat("en-US",{maximumFractionDigits:0}).format(x):"—";
function Badge({children}:{children:React.ReactNode}){return <span className="badge">{children}</span>}
function Header(){return <header><a className="logo" href="/">PP <span>PrivatePhuket</span></a><nav className="nav"><a href="/">Catalog</a><a href="/?calculator=1">Calculator</a></nav></header>}
const calculatorDefaults:PublicCalculatorInput={purchasePrice:10000000,acquisitionCosts:300000,initialCapex:500000,annualNoi:900000,entryMarketValue:10000000,holdingYears:5,exitGrowthRate:.04,sellingCostRate:.05,requiredReturn:.1};
const money=(value:number)=>new Intl.NumberFormat("en-US",{style:"currency",currency:"THB",maximumFractionDigits:0}).format(value);
const percent=(value:number)=>new Intl.NumberFormat("en-US",{style:"percent",minimumFractionDigits:2,maximumFractionDigits:2}).format(value);
function Calculator(){
 const [input,setInput]=useState(calculatorDefaults),[result,setResult]=useState<any>(),[err,setErr]=useState(""),[busy,setBusy]=useState(false);
 const numberField=(key:keyof PublicCalculatorInput)=>(event:React.ChangeEvent<HTMLInputElement>)=>setInput(current=>({...current,[key]:Number(event.target.value)}));
 const submit=async(event:FormEvent)=>{event.preventDefault();setBusy(true);setErr("");try{setResult(await calculatePublicScenario(input))}catch(e){setErr(e instanceof Error?e.message:"The scenario could not be calculated")}finally{setBusy(false)}};
 const output=result?.outputs;
 return <><Header/><main><section className="calculatorHero"><div><div className="eyebrow">Independent scenario modelling</div><h1 className="title">Test the deal<br/>before you buy.</h1><p className="sub">Adjust the acquisition, income and exit assumptions. The calculation runs on the same financial engine as published analysis, while remaining separate from every approved Investment Score and Verdict.</p></div><div className="scenarioLabel">SCENARIO<br/>ONLY</div></section>
 <form className="calculatorLayout" onSubmit={submit}><section className="calculatorForm"><div className="formSection"><div className="formHeading"><span>01</span><div><h2>Acquisition</h2><p>Capital required to enter the investment.</p></div></div><div className="fieldGrid">
 <label>Purchase price <span>THB</span><input type="number" min="1" step="1000" value={input.purchasePrice} onChange={numberField("purchasePrice")} required/></label>
 <label>Acquisition costs <span>THB</span><input type="number" min="0" step="1000" value={input.acquisitionCosts} onChange={numberField("acquisitionCosts")} required/></label>
 <label>Initial capex & furniture <span>THB</span><input type="number" min="0" step="1000" value={input.initialCapex} onChange={numberField("initialCapex")} required/></label>
 <label>Entry market value <span>THB</span><input type="number" min="0" step="1000" value={input.entryMarketValue} onChange={numberField("entryMarketValue")} required/></label>
 </div></div><div className="formSection"><div className="formHeading"><span>02</span><div><h2>Operations & exit</h2><p>Your annual income and resale scenario.</p></div></div><div className="fieldGrid">
 <label>Annual net operating income <span>THB</span><input type="number" min="0" step="1000" value={input.annualNoi} onChange={numberField("annualNoi")} required/></label>
 <label>Holding period <span>YEARS</span><input type="number" min="1" max="30" step="1" value={input.holdingYears} onChange={numberField("holdingYears")} required/></label>
 <label>Annual exit growth <span>%</span><input type="number" min="-99" max="100" step="0.1" value={input.exitGrowthRate*100} onChange={e=>setInput(current=>({...current,exitGrowthRate:Number(e.target.value)/100}))} required/></label>
 <label>Selling costs <span>%</span><input type="number" min="0" max="99" step="0.1" value={input.sellingCostRate*100} onChange={e=>setInput(current=>({...current,sellingCostRate:Number(e.target.value)/100}))} required/></label>
 <label>Required annual return <span>%</span><input type="number" min="-99" max="500" step="0.1" value={input.requiredReturn*100} onChange={e=>setInput(current=>({...current,requiredReturn:Number(e.target.value)/100}))} required/></label>
 </div></div>{err&&<div className="formError" role="alert">{err}</div>}<button className="calculateButton" disabled={busy}>{busy?"Calculating…":"Calculate scenario"}<span>→</span></button></section>
 <aside className={`calculatorResults ${output?"hasResults":""}`} aria-live="polite"><div className="resultTop"><div><small>PRIVATEPHUKET SCENARIO</small><h2>{output?percent(output.productionReturn):"—"}</h2><p>Project IRR</p></div><Badge>{result?.status??"READY"}</Badge></div>{output?<><div className="resultRows"><div><span>Total acquisition cost</span><b>{money(output.tac)}</b></div><div><span>Net yield</span><b>{percent(output.netYield)}</b></div><div><span>Total ROI</span><b>{percent(output.roi)}</b></div><div><span>Required return gap</span><b className={output.requiredReturnGap>=0?"positive":"negative"}>{output.requiredReturnGap>=0?"+":""}{percent(output.requiredReturnGap)}</b></div><div><span>Modelled exit value</span><b>{money(output.exitValue)}</b></div><div><span>Net exit proceeds</span><b>{money(output.netExitProceeds)}</b></div></div><div className="cashFlow"><small>PERIODIC CASH FLOWS</small><div>{output.periodicCashFlows.map((value:number,index:number)=><span key={index}><i>{index===0?"Entry":`Y${index}`}</i><b>{money(value)}</b></span>)}</div></div></>:<div className="resultEmpty"><span>↗</span><p>Enter your assumptions and calculate to see the investment scenario.</p></div>}<p className="resultDisclosure">{result?.disclosure??"Illustrative decision support only. No scenario changes a published calculation, Investment Score or Verdict."}</p></aside></form>
 </main><footer>PrivatePhuket · Property Intelligence Platform · Scenario outputs are not a guarantee of future returns.</footer></>;
}
function Catalog(){
 const [items,setItems]=useState<any[]>(),[selected,setSelected]=useState<string[]>([]),[err,setErr]=useState("");
 useEffect(()=>{getPublishedProperties().then(setItems).catch(e=>setErr(e.message))},[]);
 const toggle=(id:string)=>setSelected(current=>current.includes(id)?current.filter(x=>x!==id):current.length<4?[...current,id]:current);
 if(err)return <><Header/><main><div className="eyebrow">Property Intelligence</div><h1 className="title">Published analysis only.</h1><p className="sub">{err}</p></main></>;
 if(!items)return <main>Loading published analyses…</main>;
 return <><Header/><main><section className="catalogHero"><div className="eyebrow">Independent Phuket real estate analysis</div><h1 className="title">Choose with numbers,<br/>not promises.</h1><p className="sub">Every object below has passed evidence verification, calculation and analyst review. Drafts and provisional models never appear here.</p></section>
 {items.length===0?<section className="empty"><div className="eyebrow">Publication gate active</div><h2>No analysis has reached publication yet.</h2><p className="sub">Objects will appear only after primary documents, exact payment dates and a final approved calculation are complete.</p></section>:<>
 <div className="catalogToolbar"><span>{items.length} published {items.length===1?"analysis":"analyses"}</span><a className={`compareButton ${selected.length<2?"disabled":""}`} href={selected.length>=2?`/?compare=${selected.join(",")}`:undefined}>Compare {selected.length>0?`(${selected.length})`:""}</a></div>
 <section className="catalogGrid">{items.map(item=><article className="propertyCard" key={item.id}><div className="cardTop"><div><div className="eyebrow">{item.project}</div><h2>{item.unit??item.headline??"Published analysis"}</h2></div><label className="select"><input type="checkbox" checked={selected.includes(item.id)} onChange={()=>toggle(item.id)} disabled={!selected.includes(item.id)&&selected.length>=4}/> Compare</label></div><p>{item.summary??"Independent analysis based on a frozen, approved calculation."}</p><div className="cardMetrics"><span><small>Score</small><b>{item.analytics.riskAdjustedScore?.toFixed?.(1)??"—"}</b></span><span><small>Net yield</small><b>{item.analytics.netYield==null?"—":`${(item.analytics.netYield*100).toFixed(2)}%`}</b></span><span><small>{item.analytics.productionReturnMetric??"Return"}</small><b>{item.analytics.productionReturn==null?"—":`${(item.analytics.productionReturn*100).toFixed(2)}%`}</b></span></div><a className="detailLink" href={`/?id=${item.id}`}>Open full analysis →</a></article>)}</section></>}
 </main><footer>PrivatePhuket · Property Intelligence Platform · Analytics are decision support, not a guarantee of future returns.</footer></>;
}
function Comparison({ids}:{ids:string[]}){
 const [items,setItems]=useState<any[]>(),[err,setErr]=useState("");
 useEffect(()=>{comparePublishedProperties(ids).then(x=>setItems(x.items)).catch(e=>setErr(e.message))},[ids.join(",")]);
 if(err)return <><Header/><main><h1 className="title">Comparison unavailable.</h1><p className="sub">{err}</p><a className="detailLink" href="/">← Back to catalog</a></main></>;
 if(!items)return <main>Loading comparison…</main>;
 const rows=[
  ["Total acquisition cost",(x:any)=>`${fmt(x.analytics.tac)} THB`],
  ["Net yield",(x:any)=>x.analytics.netYield==null?"—":`${(x.analytics.netYield*100).toFixed(2)}%`],
  ["Return",(x:any)=>x.analytics.productionReturn==null?"—":`${(x.analytics.productionReturn*100).toFixed(2)}% ${x.analytics.productionReturnMetric??""}`],
  ["Investment Score",(x:any)=>x.analytics.riskAdjustedScore?.toFixed?.(1)??"—"],
  ["Data Confidence",(x:any)=>x.analytics.dataConfidence==null?"—":`${Number(x.analytics.dataConfidence).toFixed(0)}/100`],
  ["Verdict",(x:any)=>x.analytics.finalVerdict??"—"]
 ] as const;
 return <><Header/><main><div className="eyebrow">Side-by-side decision layer</div><h1 className="title">Compare published analysis.</h1><p className="sub">The same frozen methodology and approved outputs are shown for every object.</p><div className="compareTable"><div className="compareRow compareHead"><div>Metric</div>{items.map(x=><div key={x.id}><b>{x.project}</b><small>{x.unit??""}</small></div>)}</div>{rows.map(([label,value])=><div className="compareRow" key={label}><div>{label}</div>{items.map(x=><div key={x.id}>{value(x)}</div>)}</div>)}</div><a className="detailLink" href="/">← Back to catalog</a></main><footer>PrivatePhuket · Property Intelligence Platform</footer></>;
}
function PropertyDetail({id}:{id:string}){
 const [data,setData]=useState<any>(),[err,setErr]=useState("");
 useEffect(()=>{getPublishedProperty(id).then(setData).catch(e=>setErr(e.message))},[id]);
 if(err)return <><Header/><main><div className="eyebrow">Property Intelligence</div><h1 className="title">Published analysis only.</h1><p className="sub">{err}. The public website does not render analyst drafts or provisional runs.</p><a className="detailLink" href="/">← Back to catalog</a></main></>;
 if(!data)return <main>Loading published analysis…</main>;
 const snap=data.snapshot; const a=snap?.analytics??data.analytics; const n=snap?.narrative;
 return <><Header/><main>
 <section className="hero"><div><div className="eyebrow">Independent property analysis</div><h1 className="title">{n?.headline??<>Investment decision,<br/>not a sales brochure.</>}</h1>
 <p className="sub">{n?.summary??"PrivatePhuket separates property facts, model assumptions and analyst opinion. The figures below come from the exact calculation run approved for publication."}</p></div>
 <div className="scorebox"><div className="muted" style={{color:"#b9c0bc"}}>PRIVATEPHUKET INVESTMENT SCORE</div><div className="score">{a.riskAdjustedScore?.toFixed?.(1)??"—"} <small>/ 100</small></div><span className="badge darkbadge">{a.finalVerdict??"FINAL"}</span></div></section>
 <div className="metrics detailMetrics"><div className="metric"><span className="muted">PURCHASE PRICE</span><b>{fmt(snap?.property?.purchasePrice?.value)} THB</b><Badge>{snap?.property?.purchasePrice?.status??"NO DATA"}</Badge></div>
 <div className="metric"><span className="muted">TOTAL ACQUISITION COST</span><b>{fmt(a.tac)} THB</b></div>
 <div className="metric"><span className="muted">NET YIELD</span><b>{a.netYield==null?"—":`${(a.netYield*100).toFixed(2)}%`}</b></div>
 <div className="metric"><span className="muted">{a.productionReturnMetric??"RETURN"}</span><b>{a.productionReturn==null?"—":`${(a.productionReturn*100).toFixed(2)}%`}</b></div>
 <div className="metric"><span className="muted">RISK</span><b>{a.riskLabel??"—"}</b></div>
 <div className="metric"><span className="muted">DATA CONFIDENCE</span><b>{a.dataConfidence==null?"—":`${Number(a.dataConfidence).toFixed(0)}/100`}</b></div></div>
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
function App(){
 const params=new URLSearchParams(location.search);
 const id=params.get("id")??import.meta.env.VITE_DEMO_PROPERTY_ID;
 const compare=params.get("compare")?.split(",").filter(Boolean)??[];
 return params.has("calculator")?<Calculator/>:compare.length>=2?<Comparison ids={compare}/>:id?<PropertyDetail id={id}/>:<Catalog/>;
}
createRoot(document.getElementById("root")!).render(<App/>);
