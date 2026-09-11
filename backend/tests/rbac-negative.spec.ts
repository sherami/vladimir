import {beforeAll,describe,expect,test} from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import {app} from "../src/api/app.js";

const SECRET="rbac-test-secret-123456789";
const ISSUER="privatephuket-test";
const AUDIENCE="privatephuket-api";
function token(role:"ADMIN"|"ANALYST"|"ADVISOR"|"EDITOR"|"VIEWER"){
 return jwt.sign({sub:`${role.toLowerCase()}-test`,email:`${role.toLowerCase()}@privatephuket`,role},SECRET,{expiresIn:"10m",issuer:ISSUER,audience:AUDIENCE});
}
function auth(role:"ADMIN"|"ANALYST"|"ADVISOR"|"EDITOR"|"VIEWER"){
 return {Authorization:`Bearer ${token(role)}`};
}

beforeAll(()=>{
 process.env.JWT_SECRET=SECRET;
 process.env.JWT_ISSUER=ISSUER;
 process.env.JWT_AUDIENCE=AUDIENCE;
});

describe("RBAC negative paths",()=>{
 test("internal property list rejects missing JWT",async()=>{
  const r=await request(app).get("/api/v1/properties");
  expect(r.status).toBe(401);
 });

 test("public frozen read is not behind JWT middleware",async()=>{
  const r=await request(app).get("/api/v1/properties/00000000-0000-0000-0000-000000000000/public");
  expect(r.status).toBe(404);
  expect(r.body.error).toBe("not_published");
 });

 test("VIEWER cannot create properties",async()=>{
  const r=await request(app).post("/api/v1/properties").set(auth("VIEWER")).send({project:"Forbidden"});
  expect(r.status).toBe(403);
 });

 test("ADVISOR cannot validate or calculate",async()=>{
  const id="00000000-0000-0000-0000-000000000000";
  const validation=await request(app).post(`/api/v1/properties/${id}/validate`).set(auth("ADVISOR"));
  const calculation=await request(app).post(`/api/v1/properties/${id}/calculate`).set(auth("ADVISOR"));
  expect(validation.status).toBe(403);
  expect(calculation.status).toBe(403);
 });

 test("EDITOR cannot calculate but can reach publish handler",async()=>{
  const id="00000000-0000-0000-0000-000000000000";
  const calculation=await request(app).post(`/api/v1/properties/${id}/calculate`).set(auth("EDITOR"));
  const publish=await request(app).post(`/api/v1/properties/${id}/publish`).set(auth("EDITOR")).send({calculationRunId:id});
  expect(calculation.status).toBe(403);
  expect(publish.status).toBe(404);
 });

 test("ANALYST cannot publish",async()=>{
  const id="00000000-0000-0000-0000-000000000000";
  const r=await request(app).post(`/api/v1/properties/${id}/publish`).set(auth("ANALYST")).send({calculationRunId:id});
  expect(r.status).toBe(403);
 });
});
