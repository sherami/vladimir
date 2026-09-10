import {existsSync,readFileSync} from "node:fs";
const required=[
 "backend/src/domain/xirr.ts","backend/src/api/auth.ts","backend/src/domain/workflow.ts",
 "backend/db/migrations/006_publication_narrative.sql","contracts/openapi-v0.6.yaml",
 "public-web/src/main.tsx","staging/STAGING_RUNBOOK.md"
];
const missing=required.filter(x=>!existsSync(x));
if(missing.length){console.error("Missing release artifacts:",missing);process.exit(1);}
const readme=readFileSync("README.md","utf8");
if(!readme.includes("Release Candidate")) process.exit(2);
console.log("Static release gate: PASS");
console.log("Still required externally: DB migrations, typecheck/tests/build, JWT/RBAC integration, backup/restore, staging vertical slice.");
