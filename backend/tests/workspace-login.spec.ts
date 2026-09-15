import {afterEach,beforeEach,describe,expect,test} from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import {rootApp} from "../src/api/root.js";

const OLD={...process.env};
const SECRET="workspace-login-test-secret-123456";

beforeEach(()=>{
 process.env.JWT_SECRET=SECRET;
 process.env.JWT_ISSUER="privatephuket-test";
 process.env.JWT_AUDIENCE="privatephuket-api";
 process.env.WORKSPACE_AUTH_EMAIL="admin@privatephuket.test";
 process.env.WORKSPACE_AUTH_PASSWORD="very-strong-test-password";
});

afterEach(()=>{
 process.env={...OLD};
});

describe("workspace login",()=>{
 test("issues an ADMIN JWT for valid credentials",async()=>{
  const r=await request(rootApp).post("/api/v1/auth/login").send({email:"ADMIN@PRIVATEPHUKET.TEST",password:"very-strong-test-password"});
  expect(r.status).toBe(200);
  expect(r.body.tokenType).toBe("Bearer");
  expect(r.body.expiresInSeconds).toBe(28800);
  expect(r.body.user).toEqual({email:"admin@privatephuket.test",role:"ADMIN"});
  const claims=jwt.verify(r.body.token,SECRET,{issuer:"privatephuket-test",audience:"privatephuket-api"}) as any;
  expect(claims.email).toBe("admin@privatephuket.test");
  expect(claims.role).toBe("ADMIN");
  expect(claims.sub).toBe("workspace:admin@privatephuket.test");
 });

 test("rejects invalid credentials without revealing which field failed",async()=>{
  const r=await request(rootApp).post("/api/v1/auth/login").send({email:"admin@privatephuket.test",password:"wrong-password"});
  expect(r.status).toBe(401);
  expect(r.body).toEqual({error:"invalid_credentials"});
 });

 test("fails closed when workspace credentials are not configured",async()=>{
  delete process.env.WORKSPACE_AUTH_PASSWORD;
  const r=await request(rootApp).post("/api/v1/auth/login").send({email:"admin@privatephuket.test",password:"anything"});
  expect(r.status).toBe(503);
  expect(r.body).toEqual({error:"auth_not_configured"});
 });
});
