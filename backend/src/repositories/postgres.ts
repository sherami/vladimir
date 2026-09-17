import { pool } from "../db/pool.js";
import type { Property, SourceRecord, EvidenceRecord, VerificationItem } from "../domain/types.js";

export const propertyRepo={
 async get(id:string):Promise<Property|undefined>{
   const r=await pool.query("select payload from pp_properties where id=$1",[id]);
   return r.rowCount ? r.rows[0].payload : undefined;
 },
 async list():Promise<Property[]>{
   const r=await pool.query("select payload from pp_properties order by created_at desc");
   return r.rows.map(x=>x.payload);
 },
 async save(p:Property){
   await pool.query(`insert into pp_properties(id,payload) values($1,$2)
     on conflict(id) do update set payload=excluded.payload, updated_at=now()`,[p.id,p]);
   return p;
 }
};

export const sourceRepo={
 async create(s:SourceRecord){
   const r=await pool.query(`insert into pp_sources
     (id,property_id,document_type,issuer,source_date,status,title,uri,metadata)
     values($1,$2,$3,$4,$5,$6,$7,$8,$9)
     returning *`,
     [s.id,s.propertyId,s.documentType,s.issuer??null,s.sourceDate??null,s.status,s.title??null,s.uri??null,s.metadata??{}]);
   return r.rows[0];
 },
 async listByProperty(propertyId:string){
   const r=await pool.query(`select * from pp_sources where property_id=$1 order by received_at desc`,[propertyId]);
   return r.rows;
 },
 async get(id:string){
   const r=await pool.query(`select * from pp_sources where id=$1`,[id]);
   return r.rowCount?r.rows[0]:undefined;
 }
};

export const evidenceRepo={
 async get(id:string){
   const r=await pool.query(`select * from pp_evidence where id=$1`,[id]);
   return r.rowCount?r.rows[0]:undefined;
 },
 async create(e:EvidenceRecord){
   const r=await pool.query(`insert into pp_evidence
    (id,property_id,field,value,unit,status,source_id,as_of,analyst_comment,is_critical,created_by,supersedes_id)
    values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    returning *`,
    [e.id,e.propertyId,e.field,JSON.stringify(e.value??null),e.unit??null,e.status,e.sourceId??null,e.asOf??null,
     e.analystComment??null,!!e.isCritical,e.createdBy,e.supersedesId??null]);
   return r.rows[0];
 },
 async listByProperty(propertyId:string){
   const r=await pool.query(`select * from pp_evidence where property_id=$1 order by created_at asc`,[propertyId]);
   return r.rows;
 },
 async latestByField(propertyId:string){
   const r=await pool.query(`
     select distinct on(field) * from pp_evidence
     where property_id=$1
       and value is not null
       and value <> 'null'::jsonb
       and value <> '\"\"'::jsonb
     order by field, created_at desc, id desc`,[propertyId]);
   return r.rows;
 }
};

export const verificationRepo={
 async get(id:string){
   const r=await pool.query(`select * from pp_verification_items where id=$1`,[id]);
   return r.rowCount?r.rows[0]:undefined;
 },
 async upsertOpen(item:VerificationItem){
   const existing=await pool.query(`select * from pp_verification_items
      where property_id=$1 and code=$2 and coalesce(field,'')=coalesce($3,'') and state='OPEN'
      order by created_at desc limit 1`,[item.propertyId,item.code,item.field??null]);
   if(existing.rowCount) return existing.rows[0];
   const r=await pool.query(`insert into pp_verification_items
      (id,property_id,field,severity,code,message,state,source_id)
      values($1,$2,$3,$4,$5,$6,'OPEN',$7) returning *`,
      [item.id,item.propertyId,item.field??null,item.severity,item.code,item.message,item.sourceId??null]);
   return r.rows[0];
 },
 async list(filters:{propertyId?:string;state?:string}={}){
   const clauses:string[]=[]; const args:any[]=[];
   if(filters.propertyId){args.push(filters.propertyId);clauses.push(`property_id=$${args.length}`);}
   if(filters.state){args.push(filters.state);clauses.push(`state=$${args.length}`);}
   const where=clauses.length?`where ${clauses.join(" and ")}`:"";
   const r=await pool.query(`select * from pp_verification_items ${where}
      order by case severity when 'BLOCKER' then 1 when 'WARNING' then 2 else 3 end, created_at asc`,args);
   return r.rows;
 },
 async resolve(id:string,actor:string,comment:string,sourceId?:string){
   const r=await pool.query(`update pp_verification_items set
      state='RESOLVED',resolution_comment=$2,resolved_by=$3,resolved_at=now(),
      source_id=coalesce($4,source_id)
      where id=$1 and state='OPEN' returning *`,[id,comment,actor,sourceId??null]);
   return r.rowCount?r.rows[0]:undefined;
 }
};

export const calculationRunRepo={
 async save(run:any){
   await pool.query(`insert into pp_calculation_runs
    (id,property_id,engine_version,methodology_version,input_snapshot_hash,payload)
    values($1,$2,$3,$4,$5,$6)`,
    [run.calculationRunId,run.propertyId,run.engineVersion,run.methodologyVersion,run.inputSnapshotHash,run]);
   return run;
 },
 async get(id:string){
   const r=await pool.query("select payload || jsonb_build_object('reviewStatus',review_status,'reviewedBy',reviewed_by,'reviewedAt',reviewed_at,'reviewComment',review_comment) as payload from pp_calculation_runs where id=$1",[id]);
   return r.rowCount ? r.rows[0].payload : undefined;
 },
 async listByProperty(propertyId:string){
   const r=await pool.query(`select payload || jsonb_build_object(
      'reviewStatus',review_status,'reviewedBy',reviewed_by,'reviewedAt',reviewed_at,'reviewComment',review_comment
    ) as payload from pp_calculation_runs where property_id=$1 order by created_at desc`,[propertyId]);
   return r.rows.map(x=>x.payload);
 },
 async review(id:string,status:"APPROVED"|"REJECTED",actor:string,comment?:string){
   const r=await pool.query(`update pp_calculation_runs set review_status=$2,reviewed_by=$3,reviewed_at=now(),review_comment=$4
      where id=$1 returning payload || jsonb_build_object(
       'reviewStatus',review_status,'reviewedBy',reviewed_by,'reviewedAt',reviewed_at,'reviewComment',review_comment
      ) as payload`,[id,status,actor,comment??null]);
   return r.rowCount?r.rows[0].payload:undefined;
 }
};

export const publicationDraftRepo={
 async upsert(d:any){
   const r=await pool.query(`insert into pp_publication_drafts
    (property_id,calculation_run_id,headline,summary,why_buy,why_not_buy,best_for,not_suitable_for,source_disclosures,scenario_disclosures,created_by,updated_by)
    values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$11)
    on conflict(property_id,calculation_run_id) do update set
      headline=excluded.headline,summary=excluded.summary,why_buy=excluded.why_buy,why_not_buy=excluded.why_not_buy,
      best_for=excluded.best_for,not_suitable_for=excluded.not_suitable_for,
      source_disclosures=excluded.source_disclosures,scenario_disclosures=excluded.scenario_disclosures,
      updated_by=excluded.updated_by,updated_at=now()
    returning *`,
    [d.propertyId,d.calculationRunId,d.headline??null,d.summary??null,d.whyBuy??[],d.whyNotBuy??[],
     d.bestFor??[],d.notSuitableFor??[],d.sourceDisclosures??[],d.scenarioDisclosures??[],d.actor]);
   return r.rows[0];
 },
 async get(propertyId:string,runId:string){
   const r=await pool.query(`select * from pp_publication_drafts where property_id=$1 and calculation_run_id=$2`,[propertyId,runId]);
   return r.rowCount?r.rows[0]:undefined;
 }
};

export const publicationRepo={
 async publishAtomically(propertyId:string,runId:string,actor:string,snapshot:any){
   const client=await pool.connect();
   try{
    await client.query("begin");
    const locked=await client.query("select payload from pp_properties where id=$1 for update",[propertyId]);
    if(!locked.rowCount){await client.query("rollback");return {ok:false as const,error:"not_found"};}
    const before=locked.rows[0].payload as Property;
    if(before.workflow!=="READY_TO_PUBLISH"){
     await client.query("rollback");
     return {ok:false as const,error:"property_not_ready_to_publish",workflow:before.workflow};
    }
    const publication=(await client.query(`insert into pp_publications
      (property_id,calculation_run_id,published_by,snapshot)
      values($1,$2,$3,$4)
      returning id,property_id,calculation_run_id,published_at,published_by,snapshot`,
      [propertyId,runId,actor,snapshot])).rows[0];
    const published={...before,workflow:"PUBLISHED" as const};
    await client.query("update pp_properties set payload=$2,updated_at=now() where id=$1",[propertyId,published]);
    await client.query(`insert into pp_audit_log(actor,action,entity_type,entity_id,before_state,after_state)
      values($1,'PUBLISH','property',$2,null,$3),
            ($1,'WORKFLOW_TRANSITION','property',$2,$4,$5)`,
      [actor,propertyId,publication,before,published]);
    await client.query("commit");
    return {ok:true as const,publication,property:published};
   }catch(error){
    await client.query("rollback");
    throw error;
   }finally{client.release();}
 },
 async publish(propertyId:string,runId:string,actor:string,snapshot:any){
   const r=await pool.query(`insert into pp_publications(property_id,calculation_run_id,published_by,snapshot)
      values($1,$2,$3,$4) returning id,property_id,calculation_run_id,published_at,published_by,snapshot`,
      [propertyId,runId,actor,snapshot]);
   return r.rows[0];
 },
 async latest(propertyId:string){
   const r=await pool.query(`select * from pp_publications where property_id=$1
     order by published_at desc limit 1`,[propertyId]);
   return r.rowCount?r.rows[0]:undefined;
 }
};

export const auditRepo={
 async log(actor:string,action:string,entityType:string,entityId:string,beforeState:any,afterState:any){
   await pool.query(`insert into pp_audit_log(actor,action,entity_type,entity_id,before_state,after_state)
      values($1,$2,$3,$4,$5,$6)`,[actor,action,entityType,entityId,beforeState??null,afterState??null]);
 }
};
