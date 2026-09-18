import express from "express";
import request from "supertest";
import {describe,expect,test} from "vitest";
import {createRateLimit,noStore,publicCache} from "../src/api/public-api-policy.js";

describe("public API policy",()=>{
 test("returns standard limit headers and blocks requests above the budget",async()=>{
  let now=1_000;
  const app=express();
  app.set("trust proxy",1);
  app.get("/read",createRateLimit({limit:2,windowMs:60_000,clock:()=>now}),(_,res)=>res.json({ok:true}));
  const first=await request(app).get("/read").set("X-Forwarded-For","203.0.113.10");
  const second=await request(app).get("/read").set("X-Forwarded-For","203.0.113.10");
  const blocked=await request(app).get("/read").set("X-Forwarded-For","203.0.113.10");
  expect(first.headers["ratelimit-limit"]).toBe("2");
  expect(second.headers["ratelimit-remaining"]).toBe("0");
  expect(blocked.status).toBe(429);
  expect(blocked.body.error).toBe("rate_limit_exceeded");
  expect(blocked.headers["retry-after"]).toBe("60");
  now+=60_000;
  expect((await request(app).get("/read").set("X-Forwarded-For","203.0.113.10")).status).toBe(200);
 });

 test("keeps independent budgets per client address",async()=>{
  const app=express(); app.set("trust proxy",1);
  app.get("/read",createRateLimit({limit:1,windowMs:60_000,clock:()=>1_000}),(_,res)=>res.sendStatus(204));
  expect((await request(app).get("/read").set("X-Forwarded-For","203.0.113.10")).status).toBe(204);
  expect((await request(app).get("/read").set("X-Forwarded-For","203.0.113.11")).status).toBe(204);
 });

 test("sets cache policy for reads and no-store for calculations",async()=>{
  const app=express();
  app.get("/cached",publicCache,(_,res)=>res.sendStatus(204));
  app.post("/private",noStore,(_,res)=>res.sendStatus(204));
  expect((await request(app).get("/cached")).headers["cache-control"]).toContain("s-maxage=300");
  expect((await request(app).post("/private")).headers["cache-control"]).toBe("no-store");
 });
});
