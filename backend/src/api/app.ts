import express from "express";
import { authenticate,allow } from "./auth.js";
import { httpBoundary } from "./http-boundary.js";
import { evaluateWorkflowTransition } from "../domain/workflow.js";
import { validateCalculationReview } from "../domain/calculation-review.js";
import { readiness } from "./readiness.js";
import { v4 as uuid } from "uuid";
import {
 propertyRepo, sourceRepo, evidenceRepo, verificationRepo,
 calculationRunRepo, publicationRepo, publicationDraftRepo, auditRepo
} from "../repositories/postgres.js";
import { validateForCalculation } from "../domain/validation.js";
import { calculateProperty,calculationInputSnapshotHash } from "../services/calculate.js";
import { applyEvidenceToProperty } from "../services/evidence.js";
import { buildVerificationItems,isVerificationBlockerStillActive } from "../services/verification.js";
import { validateNarrative,buildPublicationSnapshot } from "../services/publication.js";
import { validateSourceInput } from "../services/source-validation.js";
import { validateEvidenceSource } from "../services/evidence-source-validation.js";
import { prepareDraftProperty } from "../services/property-intake.js";

export const app=express();
app.use(httpBoundary);
app.use(express.json());

function actor(req:any){ return String(req.principal?.email ?? "system"); }
function routeParam(v:string|string[]|undefined){ return Array.isArray(v) ? (v[0]??"") : (v??""); }
function queryString(v:unknown){ return typeof v==="string" ? v : undefined; }

async function hydratedProperty(id:string){
 const base=await propertyRepo.get(id);
 if(!base) return undefined;
 const latest=await evidenceRepo.latestByField(id);
 return applyEvidenceToProperty(base,latest);
}

app.get("/api/v1/health",(_,res)=>res.json({status:"ok",version:"1.0.0-rc.5"}));
app.get("/api/v1/ready",readiness);

// Public read model is deliberately outside JWT middleware. It only returns a
// frozen explicitly-published snapshot and never falls back to analyst drafts.
app.get("/api/v1/properties/:id/public",async(req,res)=>{
 const pub=await publicationRepo.latest(routeParam(req.params.id)); if(!pub)return res.status(404).json({error:"not_published"});
 if(pub.snapshot)return res.json({publication:pub,snapshot:pub.snapshot});
 const run=await calculationRunRepo.get(pub.calculation_run_id);
 res.json({publication:pub,analytics:run});
});

app.use("/api/v1",authenticate);

app.get("/api/v1/properties",async(_,res)=>res.json(await propertyRepo.list()));
app.post("/api/v1/properties",allow("ADMIN","ANALYST"),async(req,res)=>{
 const intake=prepareDraftProperty(req.body,uuid());
 if(!intake.valid)return res.status(400).json({error:intake.error});
 const p=intake.property;
 await propertyRepo.save(p);
 await auditRepo.log(actor(req),"CREATE","property",p.id,null,p);
 res.status(201).json(p);
});
app.get("/api/v1/properties/:id",async(req,res)=>{
 const p=await hydratedProperty(routeParam(req.params.id));
 if(!p)return res.status(404).json({error:"not_found"});
 res.json(p);
});

app.post("/api/v1/properties/:id/workflow",allow("ADMIN","ANALYST"),async(req,res)=>{
 const id=routeParam(req.params.id);
 const base=await propertyRepo.get(id); if(!base)return res.status(404).json({error:"not_found"});
 const hydrated=await hydratedProperty(id); if(!hydrated)return res.status(404).json({error:"not_found"});
 const to=req.body.to;
 const calculationRunRequired=
  to==="CALCULATED" || to==="ANALYST_REVIEW" || to==="READY_TO_PUBLISH" || to==="PUBLISHED";
 const latestCalculationRun=calculationRunRequired
  ? (await calculationRunRepo.listByProperty(id))[0]
  : undefined;
 const publicationDraft=to==="READY_TO_PUBLISH" && latestCalculationRun?.calculationRunId
  ? await publicationDraftRepo.get(id,latestCalculationRun.calculationRunId)
  : undefined;
 const latestPublication=to==="PUBLISHED"
  ? await publicationRepo.latest(id)
  : undefined;
 const decision=evaluateWorkflowTransition(hydrated,to,{
  latestCalculationRun,
  currentInputSnapshotHash:calculationRunRequired
   ? calculationInputSnapshotHash(hydrated)
   : undefined,
  publicationNarrativeIssues:to==="READY_TO_PUBLISH"
   ? validateNarrative(publicationDraft)
   : undefined,
  latestPublication
 });
 if(!decision.allowed)return res.status(409).json(decision);
 const before={...base}; base.workflow=to; await propertyRepo.save(base);
 await auditRepo.log(actor(req),"WORKFLOW_TRANSITION","property",base.id,before,base);
 res.json(base);
});

app.post("/api/v1/properties/:id/sources",allow("ADMIN","ANALYST"),async(req,res)=>{
 const p=await propertyRepo.get(routeParam(req.params.id)); if(!p)return res.status(404).json({error:"not_found"});
 const sourceValidation=validateSourceInput(req.body);
 if(!sourceValidation.valid)return res.status(400).json({
   error:"verified_source_metadata_incomplete",
   fields:sourceValidation.missingOrInvalidFields,
   message:"VERIFIED_DOCUMENT requires title, issuer, a valid sourceDate, and a stable URI or file identifier."
 });
 const source=await sourceRepo.create({
   id:uuid(),propertyId:p.id,documentType:req.body.documentType,issuer:req.body.issuer,
   sourceDate:req.body.sourceDate,status:req.body.status,title:req.body.title,uri:req.body.uri,
   metadata:req.body.metadata??{}
 });
 await auditRepo.log(actor(req),"CREATE","source",source.id,null,source);
 res.status(201).json(source);
});
app.get("/api/v1/properties/:id/sources",async(req,res)=>res.json(await sourceRepo.listByProperty(routeParam(req.params.id))));

app.post("/api/v1/properties/:id/evidence",allow("ADMIN","ANALYST"),async(req,res)=>{
 const p=await propertyRepo.get(routeParam(req.params.id)); if(!p)return res.status(404).json({error:"not_found"});
 const linkedSource=req.body.sourceId?await sourceRepo.get(req.body.sourceId):undefined;
 const sourceValidation=validateEvidenceSource(p.id,req.body.status,req.body.sourceId,linkedSource);
 if(!sourceValidation.valid)return res.status(400).json({
   error:sourceValidation.error,
   message:"Verified evidence must link to a verified source owned by the same property."
 });
 const e=await evidenceRepo.create({
   id:uuid(),propertyId:p.id,field:req.body.field,value:req.body.value,unit:req.body.unit,
   status:req.body.status,sourceId:req.body.sourceId,asOf:req.body.asOf,
   analystComment:req.body.analystComment,isCritical:req.body.isCritical,
   createdBy:actor(req),supersedesId:req.body.supersedesId
 });
 await auditRepo.log(actor(req),"CREATE","evidence",e.id,null,e);
 res.status(201).json(e);
});
app.get("/api/v1/properties/:id/evidence",async(req,res)=>res.json(await evidenceRepo.listByProperty(routeParam(req.params.id))));

app.post("/api/v1/properties/:id/verification/sync",allow("ADMIN","ANALYST"),async(req,res)=>{
 const p=await hydratedProperty(routeParam(req.params.id)); if(!p)return res.status(404).json({error:"not_found"});
 const evidence=await evidenceRepo.latestByField(p.id);
 const items=buildVerificationItems(p,evidence);
 const saved=[]; for(const item of items) saved.push(await verificationRepo.upsertOpen(item));
 res.json({count:saved.length,items:saved});
});
app.get("/api/v1/verification",async(req,res)=>{
 res.json(await verificationRepo.list({propertyId:queryString(req.query.propertyId),state:queryString(req.query.state)}));
});
app.post("/api/v1/verification/:id/resolve",allow("ADMIN","ANALYST"),async(req,res)=>{
 const id=routeParam(req.params.id);
 const openItem=await verificationRepo.get(id);
 if(!openItem||openItem.state!=="OPEN")return res.status(404).json({error:"not_found_or_not_open"});
 if(openItem.severity==="BLOCKER"){
   const p=await hydratedProperty(openItem.property_id);
   if(!p)return res.status(404).json({error:"property_not_found"});
   const evidence=await evidenceRepo.latestByField(p.id);
   const active=isVerificationBlockerStillActive(openItem,buildVerificationItems(p,evidence));
   if(active)return res.status(409).json({
     error:"blocker_still_active",
     code:openItem.code,
     field:openItem.field,
     message:"Add or supersede the required source-backed evidence, then sync verification before resolving this blocker."
   });
 }
 const item=await verificationRepo.resolve(id,actor(req),req.body.comment,req.body.sourceId);
 if(!item)return res.status(404).json({error:"not_found_or_not_open"});
 await auditRepo.log(actor(req),"RESOLVE","verification",id,openItem,item);
 res.json(item);
});

app.post("/api/v1/properties/:id/validate",allow("ADMIN","ANALYST"),async(req,res)=>{
 const p=await hydratedProperty(routeParam(req.params.id)); if(!p)return res.status(404).json({error:"not_found"});
 res.json(validateForCalculation(p));
});
app.post("/api/v1/properties/:id/calculate",allow("ADMIN","ANALYST"),async(req,res)=>{
 const p=await hydratedProperty(routeParam(req.params.id)); if(!p)return res.status(404).json({error:"not_found"});
 const run=calculateProperty(p);
 if(run.status==="BLOCKED" || !("calculationRunId" in run)) return res.status(422).json(run);
 const calculationRunId=run.calculationRunId;
 if(typeof calculationRunId!=="string") return res.status(500).json({error:"invalid_calculation_run_id"});
 await calculationRunRepo.save(run);
 await auditRepo.log(actor(req),"CALCULATE","calculation_run",calculationRunId,null,run);
 res.status(201).json(run);
});

app.get("/api/v1/properties/:id/calculations",async(req,res)=>{
 const p=await propertyRepo.get(routeParam(req.params.id)); if(!p)return res.status(404).json({error:"not_found"});
 res.json(await calculationRunRepo.listByProperty(p.id));
});
app.post("/api/v1/calculations/:id/review",allow("ADMIN","ANALYST"),async(req,res)=>{
 const status=req.body.status;
 if(status!=="APPROVED"&&status!=="REJECTED")return res.status(400).json({error:"invalid_review_status"});
 const id=routeParam(req.params.id);
 const existingRun=await calculationRunRepo.get(id);
 if(!existingRun)return res.status(404).json({error:"not_found"});
 const property=await hydratedProperty(existingRun.propertyId);
 if(!property)return res.status(404).json({error:"property_not_found"});
 const latestRun=(await calculationRunRepo.listByProperty(property.id))[0];
 const reviewDecision=validateCalculationReview(
  property,existingRun,status,req.body.comment,{
   latestCalculationRunId:latestRun?.calculationRunId,
   currentInputSnapshotHash:calculationInputSnapshotHash(property)
  }
 );
 if(!reviewDecision.valid)return res.status(409).json(reviewDecision);
 const run=await calculationRunRepo.review(id,status,actor(req),req.body.comment);
 if(!run)return res.status(404).json({error:"not_found"});
 await auditRepo.log(actor(req),"REVIEW","calculation_run",id,existingRun,run);
 res.json(run);
});

app.put("/api/v1/properties/:id/publication-draft",allow("ADMIN","ANALYST","EDITOR"),async(req,res)=>{
 const p=await propertyRepo.get(routeParam(req.params.id)); if(!p)return res.status(404).json({error:"not_found"});
 const run=await calculationRunRepo.get(req.body.calculationRunId);
 if(!run||run.propertyId!==p.id)return res.status(400).json({error:"invalid_calculation_run"});
 const draft=await publicationDraftRepo.upsert({...req.body,propertyId:p.id,actor:actor(req)});
 await auditRepo.log(actor(req),"UPSERT_PUBLICATION_DRAFT","property",p.id,null,draft);
 res.json(draft);
});
app.get("/api/v1/properties/:id/publication-draft/:runId",async(req,res)=>{
 const d=await publicationDraftRepo.get(routeParam(req.params.id),routeParam(req.params.runId));
 if(!d)return res.status(404).json({error:"not_found"}); res.json(d);
});

app.post("/api/v1/properties/:id/publish",allow("ADMIN","EDITOR"),async(req,res)=>{
 const id=routeParam(req.params.id);
 const p=await propertyRepo.get(id); if(!p)return res.status(404).json({error:"not_found"});
 if(p.workflow!=="READY_TO_PUBLISH")
  return res.status(409).json({error:"property_not_ready_to_publish",workflow:p.workflow});
 const hydrated=await hydratedProperty(id); if(!hydrated)return res.status(404).json({error:"not_found"});
 const run=await calculationRunRepo.get(req.body.calculationRunId);
 if(!run||run.propertyId!==p.id)return res.status(400).json({error:"invalid_calculation_run"});
 const latestRun=(await calculationRunRepo.listByProperty(p.id))[0];
 if(!latestRun || latestRun.calculationRunId!==run.calculationRunId)
  return res.status(409).json({error:"calculation_run_not_latest"});
 if(run.inputSnapshotHash!==calculationInputSnapshotHash(hydrated))
  return res.status(409).json({error:"calculation_run_stale"});
 if(run.verdictStatus!=="FINAL")return res.status(409).json({error:"run_not_final"});
 if(run.reviewStatus!=="APPROVED")return res.status(409).json({error:"run_not_approved"});
 const draft=await publicationDraftRepo.get(p.id,run.calculationRunId);
 const narrativeIssues=validateNarrative(draft);
 if(narrativeIssues.length)return res.status(409).json({error:"publication_narrative_incomplete",issues:narrativeIssues});
 const snapshot=buildPublicationSnapshot(hydrated,run,draft);
 const before={...p};
 const pub=await publicationRepo.publish(p.id,run.calculationRunId,actor(req),snapshot);
 p.workflow="PUBLISHED";
 await propertyRepo.save(p);
 await auditRepo.log(actor(req),"PUBLISH","property",p.id,null,pub);
 await auditRepo.log(actor(req),"WORKFLOW_TRANSITION","property",p.id,before,p);
 res.status(201).json({publication:pub,property:p});
});
