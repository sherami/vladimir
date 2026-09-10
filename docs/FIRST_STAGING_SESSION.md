# First Staging Session — operator script

### 1. Infrastructure
Confirm DB, API, Analyst Workspace and Public Web URLs are reachable.

### 2. Health
- GET `/api/v1/health` → 200
- GET `/api/v1/ready` → 200 and database=ok

### 3. Authentication
Create/obtain an ANALYST token and verify:
- ANALYST can create source/evidence and calculate.
- ANALYST cannot publish if publication policy requires EDITOR/ADMIN.
- VIEWER cannot mutate evidence.
- invalid token returns 401.

### 4. Layan Verde
Run seed and verifier.
Expected calibration:
- TAC = 9,294,039.14 THB ±1 THB
- Net Yield ≈ 8.0669447%
- annual owner income = DEVELOPER_MODEL
- PP estimates remain visibly classified
- incomplete evidence does not become production FINAL

### 5. Publication
Only use a run that satisfies all gates. Create analyst narrative, approve exact run, publish exact run, record publication ID.

### 6. Immutability
Create a later calculation. Public endpoint must still return the previously published snapshot until an explicit new publication.

### 7. Evidence archive
Save CI logs, migration log, calculation ID/hash, publication ID, audit extract and public-page capture.
