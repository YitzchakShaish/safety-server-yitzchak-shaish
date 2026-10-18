# Safety server upgrade planning baseline

Reviewed 2026-10-18. Implementation awaits approval of the cross-project plan in the client repository: `docs/safety-upgrade-plan.md`.

Branch: `codex/safety-upgrade-plan`, based on b5809aa (`fix/known-bugs`). Working tree was clean before review.

Preserve Express routes/controllers/services, TypeORM, SQLite and class-validator DTO conventions. Coordinate server and client commits for each feature.

## Verified baseline

`npm run build` fails on three existing errors:

- `src/controllers/eventReport.controller.ts:100`: route parameter is string|string[], but UUID validation expects string.
- `src/controllers/reportImages.controller.ts:10`: route parameter is string|string[], but service expects string.
- `src/routes/eventReport.router.ts:5`: unused checkRank import.

No product code or database was changed during review. The server was not started.

## Proposed work order

1. Repair compilation and verify the existing build.
2. Add authorized single-report retrieval for success-screen links and page refresh; preserve existing report response conventions.
3. Establish authenticated identity, then separate military rank, organizational position, unit and system role. Remove automatic promotion. Enforce role, ownership, unit scope and editable fields on the server, including image uploads and user endpoints. Group search OR predicates before applying visibility restrictions. Add transactional administration audit records and last-administrator protection.
4. Introduce explicit schema migrations and configurable database paths; verify compiled entity discovery. Seed only a dedicated demo database.
5. Add filtered overview aggregation and a shared dataset for reports/PDF, with consistent date boundaries and unit authorization.
6. Persist validated profile uploads and expose current-user retrieval.

Proposed role scope: regular users see their own reports and edit facts before treatment; safety officers handle their assigned unit; administrators manage all reports and users. This policy and password-based login remain proposals for user approval.

Acceptance checks include server build, direct API authorization tests, cross-user/unit denial, forged-field rejection, immediate role revocation, transaction rollback, date boundaries, repeatable demo seed and end-to-end coordination with the client. Use an isolated test database.

Commit planning separately. Use focused `codex/` implementation branches after approval, preserving existing fixes. Do not commit credentials, databases, upload artifacts or build output.
