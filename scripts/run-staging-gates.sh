#!/usr/bin/env sh
set -eu
echo "== Backend =="
cd backend
npm ci
npx tsx src/db/migrate.ts
npm run typecheck
npm test
cd ../workspace
echo "== Analyst Workspace =="
npm ci || npm install
npm run typecheck
npm run build
cd ../public-web
echo "== Public Web =="
npm ci || npm install
npm run typecheck
npm run build
echo "ALL LOCAL BUILD GATES PASSED"
