import express from "express";
import request from "supertest";
import {describe,expect,test,vi} from "vitest";
import {apiErrorHandler,requestObservability} from "../src/api/observability.js";

describe("API observability",()=>{
 test("returns a validated client request id and emits one structured completion event",async()=>{
  let now=1_000;
  const entries:string[]=[];
  const app=express();
  app.use(requestObservability({clock:()=>now,log:entry=>entries.push(entry)}));
  app.get("/ok",(_req,res)=>{now=1_037;res.json({ok:true});});
  const r=await request(app).get("/ok").set("X-Request-Id","client-request-123");
  expect(r.headers["x-request-id"]).toBe("client-request-123");
  expect(entries).toHaveLength(1);
  expect(JSON.parse(entries[0])).toEqual({type:"http_request",traceId:"client-request-123",method:"GET",path:"/ok",status:200,durationMs:37});
 });

 test("replaces unsafe request ids instead of reflecting them into headers or logs",async()=>{
  const app=express();
  app.use(requestObservability({log:()=>undefined}));
  app.get("/ok",(_req,res)=>res.sendStatus(204));
  const r=await request(app).get("/ok").set("X-Request-Id","bad id with spaces");
  expect(r.headers["x-request-id"]).toMatch(/^[0-9a-f-]{36}$/);
 });

 test("returns a safe traceable 500 response without exposing the exception",async()=>{
  const errorLog=vi.spyOn(console,"error").mockImplementation(()=>undefined);
  const app=express();
  app.use(requestObservability({log:()=>undefined}));
  app.get("/fail",()=>{throw new Error("private contract contents");});
  app.use(apiErrorHandler);
  const r=await request(app).get("/fail");
  expect(r.status).toBe(500);
  expect(r.body).toEqual({error:"internal_error",traceId:r.headers["x-request-id"]});
  expect(JSON.stringify(r.body)).not.toContain("private contract contents");
  expect(errorLog).toHaveBeenCalledOnce();
  expect(errorLog.mock.calls[0][0]).not.toContain("private contract contents");
  errorLog.mockRestore();
 });
});
