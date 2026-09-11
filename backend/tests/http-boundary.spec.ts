import {afterEach,beforeEach,describe,expect,test} from "vitest";
import request from "supertest";
import {app} from "../src/api/app.js";

const ORIGINAL_ENV={...process.env};

beforeEach(()=>{
 process.env.NODE_ENV="production";
 process.env.CORS_ORIGINS="https://workspace.privatephuket.test,https://privatephuket.test";
});

afterEach(()=>{
 process.env={...ORIGINAL_ENV};
});

describe("HTTP boundary",()=>{
 test("adds baseline security headers",async()=>{
  const r=await request(app).get("/api/v1/health");
  expect(r.status).toBe(200);
  expect(r.headers["x-content-type-options"]).toBe("nosniff");
  expect(r.headers["x-frame-options"]).toBe("DENY");
  expect(r.headers["referrer-policy"]).toBe("no-referrer");
  expect(r.headers["permissions-policy"]).toContain("camera=()");
 });

 test("allows configured CORS origin on public API",async()=>{
  const r=await request(app)
   .options("/api/v1/properties/00000000-0000-0000-0000-000000000000/public")
   .set("Origin","https://privatephuket.test")
   .set("Access-Control-Request-Method","GET");
  expect(r.status).toBe(204);
  expect(r.headers["access-control-allow-origin"]).toBe("https://privatephuket.test");
 });

 test("rejects unconfigured production CORS origin",async()=>{
  const r=await request(app)
   .options("/api/v1/properties")
   .set("Origin","https://evil.example")
   .set("Access-Control-Request-Method","GET");
  expect(r.status).toBe(403);
  expect(r.body.error).toBe("cors_origin_forbidden");
 });
});
