import type {Request,Response} from "express";
import {pool} from "../db/pool.js";
export async function readiness(_:Request,res:Response){
 try{await pool.query("select 1");res.json({status:"ready",database:"ok"});}
 catch{res.status(503).json({status:"not_ready",database:"error"});}
}
