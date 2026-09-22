import React,{FormEvent,useEffect,useRef,useState} from "react";
import {createRoot} from "react-dom/client";
import {calculatePublicScenario,comparePublishedProperties,getPublishedProperties,getPublishedProperty,PublicCalculatorInput} from "./lib/api";
import {c,language,languageHref,pageHref,preview} from "./lib/i18n";
import "./styles.css";
const fmt=(x:any)=>typeof x==="number"?new Intl.NumberFormat(language==="ru"?"ru-RU":"en-US",{maximumFractionDigits:0}).format(x):"—";
const serviceError=language==="ru"?"Сервис аналитики временно недоступен. Попробуйте ещё раз.":"The analytics service is temporarily unavailable. Please try again.";
const propertyError=language==="ru"?"Объект не опубликован или временно недоступен.":"The property is not published or is temporarily unavailable.";
const retryLabel=language==="ru"?"Повторить":"Try again";
const defaultDescription=language==="ru"?"Независимая аналитика недвижимости Пхукета: доходность, риски и сравнение объектов.":"Independent Phuket property analysis: returns, risks and comparisons.";
function usePageMeta(title:string,description=defaultDescription){
 useEffect(()=>{document.title=`${title} — PrivatePhuket`;document.querySelector('meta[name="description"]')?.setAttribute("content",description)},[title,description]);
}
function Badge({children}:{children:React.ReactNode}){return <span className="badge">{children}</span>}
function localizedLabel(value:string|undefined,labels:Record<string,string>){return value?labels[value]??value:c.noData;}
function publicVerdict(analytics:any){return analytics?.verdictStatus==="FINAL"?localizedLabel(analytics.finalVerdict,c.verdictLabels):c.provisionalVerdict;}
function incomeStatus(status:string|undefined){return localizedLabel(status,c.incomeStatuses);}
function RetryButton(){return <button className="retryButton" onClick={()=>location.reload()}>{retryLabel} <span>→</span></button>}
function Header(){const params=new URLSearchParams(location.search),calculator=params.has("calculator");return <><header><a className="logo" href={pageHref()} aria-label="PrivatePhuket">PP <span>PrivatePhuket</span></a><nav className="nav" aria-label={language==="ru"?"Основная навигация":"Primary navigation"}><a aria-current={!calculator&&!params.has("id")&&!params.has("compare")?"page":undefined} href={pageHref()}>{c.catalog}</a><a aria-current={calculator?"page":undefined} href={pageHref("calculator=1")}>{c.calculator}</a><span className="language" aria-label={language==="ru"?"Выбор языка":"Language selection"}><a aria-current={language==="ru"?"page":undefined} className={language==="ru"?"active":""} href={languageHref("ru")}>RU</a><i aria-hidden="true">/</i><a aria-current={language==="en"?"page":undefined} className={language==="en"?"active":""} href={languageHref("en")}>EN</a></span></nav></header>{preview&&<div className="previewBar"><b>{c.preview}</b><span>{c.previewNote}</span></div>}</>}
type CalculatorDraft=Record<keyof PublicCalculatorInput,string>;
const calculatorDefaults:CalculatorDraft={purchasePrice:"10000000",acquisitionCosts:"300000",initialCapex:"500000",annualNoi:"900000",entryMarketValue:"10000000",holdingYears:"5",exitGrowthRate:"4",sellingCostRate:"5",requiredReturn:"10"};
function parseCalculatorDraft(draft:CalculatorDraft):PublicCalculatorInput|null{
 if(Object.values(draft).some(value=>value.trim()===""))return null;
 const input={
  purchasePrice:Number(draft.purchasePrice),
  acquisitionCosts:Number(draft.acquisitionCosts),
  initialCapex:Number(draft.initialCapex),
  annualNoi:Number(draft.annualNoi),
  entryMarketValue:Number(draft.entryMarketValue),
  holdingYears:Number(draft.holdingYears),
  exitGrowthRate:Number(draft.exitGrowthRate)/100,
  sellingCostRate:Number(draft.sellingCostRate)/100,
  requiredReturn:Number(draft.requiredReturn)/100
 };
 return Object.values(input).every(Number.isFinite)?input:null;
}
const money=(value:number)=>new Intl.NumberFormat(language==="ru"?"ru-RU":"en-US",{style:"currency",currency:"THB",maximumFractionDigits:0}).format(value);
const percent=(value:number)=>new Intl.NumberFormat(language==="ru"?"ru-RU":"en-US",{style:"percent",minimumFractionDigits:2,maximumFractionDigits:2}).format(value);
function Calculator(){
 usePageMeta(language==="ru"?"Инвестиционный калькулятор":"Investment calculator",c.calculatorIntro);
 const [input,setInput]=useState(calculatorDefaults),[result,setResult]=useState<any>(),[err,setErr]=useState(""),[busy,setBusy]=useState(false);
 const requestVersion=useRef(0);
 const editInput=(key:keyof PublicCalculatorInput,value:string)=>{
  requestVersion.current+=1;
  setResult(undefined);
  setErr("");
  setBusy(false);
  setInput(current=>({...current,[key]:value}));
 };
 const numberField=(key:keyof PublicCalculatorInput)=>(event:React.ChangeEvent<HTMLInputElement>)=>editInput(key,event.target.value);
 const submit=async(event:FormEvent)=>{
  event.preventDefault();
  const submittedInput=parseCalculatorDraft(input);
  if(!submittedInput){setErr(c.calculationError);return;}
  const version=++requestVersion.current;
  setBusy(true);
  setResult(undefined);
  setErr("");
  try{
   const nextResult=await calculatePublicScenario(submittedInput);
   if(requestVersion.current===version)setResult(nextResult);
  }catch(e){
   if(requestVersion.current===version)setErr(language==="ru"?c.calculationError:e instanceof Error?e.message:c.calculationError);
  }finally{
   if(requestVersion.current===version)setBusy(false);
  }
 };
 const output=result?.outputs;
 return <><Header/><main><section className="calculatorHero"><div><div className="eyebrow">{c.independentModel}</div><h1 className="title">{c.testDeal}<br/>{c.beforeBuy}</h1><p className="sub">{c.calculatorIntro}</p></div><div className="scenarioLabel">{c.scenarioOnly}</div></section>
 <form className="calculatorLayout" onSubmit={submit}><section className="calculatorForm"><div className="formSection"><div className="formHeading"><span>01</span><div><h2>{c.acquisition}</h2><p>{c.acquisitionHint}</p></div></div><div className="fieldGrid">
 <label>{c.purchasePrice} <span>THB</span><input type="number" min="1000" step="1000" value={input.purchasePrice} onChange={numberField("purchasePrice")} required/></label>
 <label>{c.acquisitionCosts} <span>THB</span><input type="number" min="0" step="1000" value={input.acquisitionCosts} onChange={numberField("acquisitionCosts")} required/></label>
 <label>{c.initialCapex} <span>THB</span><input type="number" min="0" step="1000" value={input.initialCapex} onChange={numberField("initialCapex")} required/></label>
 <label>{c.entryMarketValue} <span>THB</span><input type="number" min="0" step="1000" value={input.entryMarketValue} onChange={numberField("entryMarketValue")} required/></label>
 </div></div><div className="formSection"><div className="formHeading"><span>02</span><div><h2>{c.operationsExit}</h2><p>{c.operationsHint}</p></div></div><div className="fieldGrid">
 <label>{c.annualNoi} <span>THB</span><input type="number" min="0" step="1000" value={input.annualNoi} onChange={numberField("annualNoi")} required/></label>
 <label>{c.holdingPeriod} <span>{c.years}</span><input type="number" min="1" max="30" step="1" value={input.holdingYears} onChange={numberField("holdingYears")} required/></label>
 <label>{c.exitGrowth} <span>%</span><input type="number" min="-99" max="100" step="0.1" value={input.exitGrowthRate} onChange={numberField("exitGrowthRate")} required/></label>
 <label>{c.sellingCosts} <span>%</span><input type="number" min="0" max="99" step="0.1" value={input.sellingCostRate} onChange={numberField("sellingCostRate")} required/></label>
 <label>{c.requiredReturn} <span>%</span><input type="number" min="-99" max="500" step="0.1" value={input.requiredReturn} onChange={numberField("requiredReturn")} required/></label>
 </div></div>{err&&<div className="formError" role="alert">{err}</div>}<button className="calculateButton" disabled={busy}>{busy?c.calculating:c.calculate}<span>→</span></button></section>
 <aside className={`calculatorResults ${output?"hasResults":""}`} aria-live="polite"><div className="resultTop"><div><small>PRIVATEPHUKET SCENARIO</small><h2>{output?percent(output.productionReturn):"—"}</h2><p>{c.projectIrr}</p></div><Badge>{output?c.scenarioOnly:c.ready}</Badge></div>{output?<><div className="resultRows"><div><span>{c.tac}</span><b>{money(output.tac)}</b></div><div><span>{c.netYield}</span><b>{percent(output.netYield)}</b></div><div><span>{c.totalRoi}</span><b>{percent(output.roi)}</b></div><div><span>{c.returnGap}</span><b className={output.requiredReturnGap>=0?"positive":"negative"}>{output.requiredReturnGap>=0?"+":""}{percent(output.requiredReturnGap)}</b></div><div><span>{c.exitValue}</span><b>{money(output.exitValue)}</b></div><div><span>{c.netExit}</span><b>{money(output.netExitProceeds)}</b></div></div><div className="cashFlow"><small>{c.cashFlows}</small><div>{output.periodicCashFlows.map((value:number,index:number)=><span key={index}><i>{index===0?c.entry:`Y${index}`}</i><b>{money(value)}</b></span>)}</div></div></>:<div className="resultEmpty"><span>↗</span><p>{c.emptyResult}</p></div>}<p className="resultDisclosure">{c.calculatorDisclosure}</p></aside></form>
 </main><footer>PrivatePhuket · {c.platform} · {c.analyticsDisclaimer}</footer></>;
}
function Catalog(){
 usePageMeta(language==="ru"?"Аналитика недвижимости Пхукета":"Phuket Property Intelligence",c.catalogIntro);
 const [items,setItems]=useState<any[]>(),[selected,setSelected]=useState<string[]>([]),[err,setErr]=useState("");
 useEffect(()=>{getPublishedProperties().then(setItems).catch(e=>setErr(e.message))},[]);
 const toggle=(id:string)=>setSelected(current=>current.includes(id)?current.filter(x=>x!==id):current.length<4?[...current,id]:current);
 if(err)return <><Header/><main><div className="eyebrow">PrivatePhuket</div><h1 className="title">{c.publishedOnly}</h1><p className="sub">{serviceError}</p><RetryButton/></main></>;
 if(!items)return <><Header/><main className="loadingState">{c.loading}</main></>;
 return <><Header/><main><section className="catalogHero"><div className="eyebrow">{c.intelligence}</div><h1 className="title">{c.chooseNumbers}<br/>{c.notPromises}</h1><p className="sub">{c.catalogIntro}</p></section>
 {items.length===0?<section className="empty"><div className="eyebrow">{c.publicationGate}</div><h2>{c.nothingPublished}</h2><p className="sub">{c.nothingPublishedHint}</p></section>:<>
 <div className="catalogToolbar"><span>{items.length} {preview?c.previewAnalysis:c.publishedAnalysis}</span><a className={`compareButton ${selected.length<2?"disabled":""}`} href={selected.length>=2?pageHref(`compare=${selected.join(",")}`):undefined}>{c.compare} {selected.length>0?`(${selected.length})`:""}</a></div>
 <section className="catalogGrid">{items.map(item=><article className="propertyCard" key={item.id}>{item.imageUrl&&<div className="propertyImage" style={{backgroundImage:`url(${item.imageUrl})`}}><span>{preview?c.illustrative:c.published}</span></div>}<div className="cardTop"><div><div className="eyebrow">{item.project}</div><h2>{item.unit??item.headline??c.publishedOnly}</h2></div><label className="select"><input type="checkbox" checked={selected.includes(item.id)} onChange={()=>toggle(item.id)} disabled={!selected.includes(item.id)&&selected.length>=4}/> {c.select}</label></div><p>{item.summary??c.detailIntro}</p><div className="cardMetrics"><span><small>{c.score}</small><b>{item.analytics.riskAdjustedScore?.toFixed?.(1)??"—"}</b></span><span><small>{c.netYield}</small><b>{item.analytics.netYield==null?"—":`${(item.analytics.netYield*100).toFixed(2)}%`}</b></span><span><small>{item.analytics.productionReturnMetric??c.return}</small><b>{item.analytics.productionReturn==null?"—":`${(item.analytics.productionReturn*100).toFixed(2)}%`}</b></span></div><div className="catalogVerdict">{c.verdict}: <b>{publicVerdict(item.analytics)}</b></div><a className="detailLink" href={pageHref(`id=${item.id}`)}>{c.openAnalysis}</a></article>)}</section></>}
 </main><footer>PrivatePhuket · {c.platform} · {c.analyticsDisclaimer}</footer></>;
}
function Comparison({ids}:{ids:string[]}){
 usePageMeta(language==="ru"?"Сравнение объектов":"Property comparison",c.compareIntro);
 const [items,setItems]=useState<any[]>(),[err,setErr]=useState("");
 useEffect(()=>{comparePublishedProperties(ids).then(x=>setItems(x.items)).catch(e=>setErr(e.message))},[ids.join(",")]);
 if(err)return <><Header/><main><h1 className="title">{c.comparisonUnavailable}</h1><p className="sub">{serviceError}</p><RetryButton/><a className="detailLink errorBack" href={pageHref()}>{c.back}</a></main></>;
 if(!items)return <><Header/><main className="loadingState">{c.loadingComparison}</main></>;
 const rows=[
  [c.tac,(x:any)=>`${fmt(x.analytics.tac)} THB`],
  [c.netYield,(x:any)=>x.analytics.netYield==null?"—":`${(x.analytics.netYield*100).toFixed(2)}%`],
  [c.return,(x:any)=>x.analytics.productionReturn==null?"—":`${(x.analytics.productionReturn*100).toFixed(2)}% ${x.analytics.productionReturnMetric??""}`],
  [c.investmentScore,(x:any)=>x.analytics.riskAdjustedScore?.toFixed?.(1)??"—"],
  [c.confidence,(x:any)=>x.analytics.dataConfidence==null?"—":`${Number(x.analytics.dataConfidence).toFixed(0)}/100`],
  [c.verdict,(x:any)=>publicVerdict(x.analytics)]
 ] as const;
 const columns={gridTemplateColumns:`180px repeat(${items.length}, minmax(150px, 1fr))`};
 return <><Header/><main><div className="eyebrow">{c.comparisonLayer}</div><h1 className="title">{c.compareTitle}</h1><p className="sub">{c.compareIntro}</p><div className="compareTable"><div className="compareRow compareHead" style={columns}><div>{c.metric}</div>{items.map(x=><div key={x.id}><a className="compareProperty" href={pageHref(`id=${x.id}`)}><b>{x.project}</b><small>{x.unit??""}</small></a></div>)}</div>{rows.map(([label,value])=><div className="compareRow" style={columns} key={label}><div>{label}</div>{items.map(x=><div key={x.id}>{value(x)}</div>)}</div>)}</div><a className="detailLink" href={pageHref()}>{c.back}</a></main><footer>PrivatePhuket · {c.platform}</footer></>;
}
function PropertyDetail({id}:{id:string}){
 const [data,setData]=useState<any>(),[err,setErr]=useState("");
 const snap=data?.snapshot; const a=snap?.analytics??data?.analytics; const n=snap?.narrative;
 usePageMeta(snap?.property?.project??(language==="ru"?"Аналитика объекта":"Property analysis"),n?.summary??c.detailIntro);
 useEffect(()=>{getPublishedProperty(id).then(setData).catch(e=>setErr(e.message))},[id]);
 if(err)return <><Header/><main><div className="eyebrow">PrivatePhuket</div><h1 className="title">{c.publishedOnly}</h1><p className="sub">{propertyError}</p><RetryButton/><a className="detailLink errorBack" href={pageHref()}>{c.back}</a></main></>;
 if(!data)return <><Header/><main className="loadingState">{c.loading}</main></>;
 return <><Header/><main>
 {data.lifecycle?.status==="SUPERSEDED"&&<aside className="supersededNotice" role="status"><div><strong>{c.supersededTitle}</strong><p>{c.supersededExplanation}</p></div>{data.lifecycle.supersededByPropertyId&&<a href={pageHref(`id=${encodeURIComponent(data.lifecycle.supersededByPropertyId)}`)}>{c.openSuccessor} →</a>}</aside>}
 {snap?.imageUrl&&<div className="detailImage" style={{backgroundImage:`url(${snap.imageUrl})`}}><span>{snap.property.project}<small>{snap.property.unit}</small></span></div>}
 <section className="hero"><div><div className="eyebrow">{c.propertyAnalysis}</div><h1 className="title">{n?.headline??c.decisionNotBrochure}</h1>
 <p className="sub">{n?.summary??c.detailIntro}</p></div>
 <div className="scorebox"><div className="muted" style={{color:"#b9c0bc"}}>PRIVATEPHUKET INVESTMENT SCORE</div><div className="score">{a.riskAdjustedScore?.toFixed?.(1)??"—"} <small>/ 100</small></div><span className="badge darkbadge">{publicVerdict(a)}</span></div></section>
 <div className="metrics detailMetrics"><div className="metric"><span className="muted">{c.purchasePrice.toUpperCase()}</span><b>{fmt(snap?.property?.purchasePrice?.value)} THB</b><Badge>{incomeStatus(snap?.property?.purchasePrice?.status)}</Badge></div>
 <div className="metric"><span className="muted">{c.tac.toUpperCase()}</span><b>{fmt(a.tac)} THB</b></div>
 <div className="metric"><span className="muted">{c.netYield.toUpperCase()}</span><b>{a.netYield==null?"—":`${(a.netYield*100).toFixed(2)}%`}</b><div className="incomeBasis">{c.annualNoi}: {snap?.property?.annualNoi?.value==null?"—":`${fmt(snap.property.annualNoi.value)} THB`}</div><Badge>{incomeStatus(snap?.property?.annualNoi?.status)}</Badge></div>
 <div className="metric"><span className="muted">{a.productionReturnMetric??c.return.toUpperCase()}</span><b>{a.productionReturn==null?"—":`${(a.productionReturn*100).toFixed(2)}%`}</b></div>
 <div className="metric"><span className="muted">{c.risk}</span><b>{localizedLabel(a.riskLabel,c.riskLabels)}</b></div>
 <div className="metric"><span className="muted">{c.confidence.toUpperCase()}</span><b>{a.dataConfidence==null?"—":`${Number(a.dataConfidence).toFixed(0)}/100`}</b></div></div>
 <section className="section"><div className="eyebrow">{c.decisionLayer}</div><h2>{c.numbersMeaning}</h2><div className="cols">
 <div className="panel"><h3>{c.whyConsider}</h3>{(n?.whyBuy??[]).map((x:string,i:number)=><p className="why" key={i}>— {x}</p>)}</div>
 <div className="panel risk"><h3>{c.whyNot}</h3>{(n?.whyNotBuy??[]).map((x:string,i:number)=><p className="why" key={i}>— {x}</p>)}</div></div></section>
 <section className="section"><div className="eyebrow">{c.evidenceScenarios}</div><h2>{c.factOrModel}</h2><div className="cols">
 <div className="panel"><h3>{c.sources}</h3>{(snap?.sourceDisclosures??[]).map((x:any,i:number)=><p className="why" key={i}><Badge>{incomeStatus(x.status)}</Badge> {x.label??x.text??String(x)}</p>)}</div>
 <div className="panel"><h3>{c.scenarioAssumptions}</h3>{(snap?.scenarioDisclosures??[]).map((x:any,i:number)=><p className="why" key={i}><b>{x.name??c.scenario}</b> — {x.text??String(x)}</p>)}</div>
 </div></section>
 <section className="section"><div className="eyebrow">{c.transparency}</div><h2>{c.provenance}</h2>
 <div className="disclosure">{c.runPrefix} <b>{a.calculationRunId}</b>. {c.engine} {a.engineVersion}; {c.methodology} {a.methodologyVersion}; {c.snapshot} {String(a.inputSnapshotHash).slice(0,16)}… {c.provenanceTail}</div></section>
 </main><footer>PrivatePhuket · {c.platform} · {c.analyticsDisclaimer}</footer></>
}
function App(){
 const params=new URLSearchParams(location.search);
 const id=params.get("id")??import.meta.env.VITE_DEMO_PROPERTY_ID;
 const compare=params.get("compare")?.split(",").filter(Boolean)??[];
 return params.has("calculator")?<Calculator/>:compare.length>=2?<Comparison ids={compare}/>:id?<PropertyDetail id={id}/>:<Catalog/>;
}
document.documentElement.lang=language;
createRoot(document.getElementById("root")!).render(<App/>);
