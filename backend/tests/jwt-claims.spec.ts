import {beforeAll,describe,expect,test} from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import {app} from "../src/api/app.js";

const SECRET="jwt-claims-test-secret-123456";
const ISSUER="privatephuket-test";
const AUDIENCE="privatephuket-api";

beforeAll(()=>{
 process.env.JWT_SECRET=SECRET;
 process.env.JWT_ISSUER=ISSUER;
 process.env.JWT_AUDIENCE=AUDIENCE;
});

function signed(options:{issuer?:string;audience?:string}={}){
 return jwt.sign(
  {sub:"claims-test",email:"claims@privatephuket",role:"VIEWER"},
  SECRET,
  {expiresIn:"10m",issuer:options.issuer??ISSUER,audience:options.audience??AUDIENCE}
 );
}

describe("JWT issuer and audience",()=>{
 test("accepts matching issuer and audience",async()=>{
  const r=await request(app).get("/api/v1/properties").set("Authorization",`Bearer ${signed()}`);
  expect(r.status).toBe(200);
 });
 test("rejects wrong issuer",async()=>{
  const r=await request(app).get("/api/v1/properties").set("Authorization",`Bearer ${signed({issuer:"wrong-issuer"})}`);
  expect(r.status).toBe(401);
  expect(r.body.error).toBe("invalid_token");
 });
 test("rejects wrong audience",async()=>{
  const r=await request(app).get("/api/v1/properties").set("Authorization",`Bearer ${signed({audience:"wrong-audience"})}`);
  expect(r.status).toBe(401);
  expect(r.body.error).toBe("invalid_token");
 });
});
