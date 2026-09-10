import { readdir,readFile } from "node:fs/promises";
import { join } from "node:path";
import { pool } from "./pool.js";
const dir=process.env.MIGRATIONS_DIR??"db/migrations";
await pool.query(`create table if not exists pp_schema_migrations(
 name text primary key, applied_at timestamptz not null default now())`);
const applied=new Set((await pool.query("select name from pp_schema_migrations")).rows.map(x=>x.name));
for(const name of (await readdir(dir)).filter(x=>x.endsWith(".sql")).sort()){
 if(applied.has(name)) continue;
 const sql=await readFile(join(dir,name),"utf8");
 const c=await pool.connect();
 try{await c.query("begin");await c.query(sql);await c.query("insert into pp_schema_migrations(name) values($1)",[name]);await c.query("commit");console.log("applied",name);}
 catch(e){await c.query("rollback");throw e;} finally{c.release();}
}
await pool.end();
