# One Vertical Done Right Gap Analysis

Status: Active planning
Created: 2026-05-16
Scope: `/Users/fabiencampana/Documents/funding` with supporting evidence from `/Users/fabiencampana/Documents/roundtable`
End goal: Support Fabien's application as a frontend software developer

## Executive Summary

The strongest single vertical for this repo is a Deal Operations and Closing Readiness workspace for one concrete deal: `Northstar Energy`.

This is the right vertical because it is specific, visual, operational, and already supported by substantial domain and kit work. It lets a reviewer see frontend judgment across layout, information architecture, dense tables, status systems, responsive behavior, interaction design, type boundaries, and test discipline without requiring real backend infrastructure.

The main gap is not the domain idea. The main gap is that the actual `apps/web` product route is still a placeholder while the richer product work lives in packages and documents. To have one vertical done right, the app must stop presenting scaffolding and instead expose one production-shaped, fixture-backed, fully reviewable workflow.

The vertical should answer these reviewer questions in the first 2 minutes:

1. What deal is this?
2. Is it ready to close?
3. What is blocking closing?
4. Which investors need action?
5. Which documents are missing, rejected, expired, or ready?
6. How do commitment, signature, wire, KYC/KYB, fees, and investable amount reconcile?
7. Can this frontend developer build a coherent app from domain model to UI to tests?

The answer today is only partially yes. The domain and kit packages are strong enough to support the story. The app shell, route integration, route tests, DTO seam, and reviewer-facing workflow are not done.

## Recommended Vertical

Build one vertical:

**Northstar Energy Deal Operations Workspace**

Primary routes:

- `/deals/northstar-energy/about`
- `/deals/northstar-energy/commitments`
- `/deals/northstar-energy/documents`

Primary persona:

- Deal lead or internal operations user preparing a Roundtable-style SPV deal for closing.

Primary workflow:

- Inspect closing readiness.
- Resolve blockers.
- Review investor commitments.
- Check KYC/KYB, signatures, wires, and document evidence.
- Reconcile gross amount raised, fees, and net investable amount.

Primary frontend signal:

- Dense, realistic operational software with typed data boundaries, reusable components, responsive behavior, accessible interactions, and tests that verify the actual user story.

## Why This Vertical

This vertical is the best intersection of three things:

1. Roundtable product evidence: deal closing is operationally rich and specific.
2. Existing repo assets: domain and kit already model much of the workflow.
3. Portfolio value: frontend reviewers can inspect UI composition, design systems, state modeling, route integration, and testing in one compact area.

It avoids the common portfolio failure mode of building broad surface area with shallow workflows. One vertical done right should feel narrower, deeper, and more credible than a larger app with placeholder pages.

## Definition of Done

The vertical is done right when all of the following are true.

### Product

- The app presents a real deal workspace, not a rebuild notice or placeholder.
- The workflow is coherent from deal overview to commitments to documents.
- The user can identify the current deal stage, closing mode, readiness level, blockers, capital summary, and investor/document next actions.
- The language matches the Roundtable domain: deal lead, commitment, closing, KYC/KYB, signature, wire, data room, SPV, fees, investable amount.
- Any simulated behavior is honest and local. It should not imply real persistence, real banking, real compliance decisions, or real investor notifications.

### Frontend

- The route renders actual operational UI from `@repo/kit` components.
- The page uses app-owned adapters and DTOs instead of importing kit fixtures directly inside route components.
- Loading, empty, invalid deal, and error states are handled.
- The desktop layout has a persistent operational rail.
- The mobile layout preserves task order and does not make the rail the first thing a user must read.
- Keyboard navigation, focus order, table interactions, drawers, and filters are deliberate.

### Architecture

- Domain logic remains in `@repo/domain`.
- Render components remain in `@repo/kit`.
- App orchestration lives in `apps/web`.
- The app has a typed fixture-backed data boundary, preferably the existing planned tRPC slice.
- Money and status values cross app boundaries as serializable DTOs, not branded domain objects.
- The implementation does not introduce auth, database, payment, or external integrations unless the vertical has already been completed without them.

### Testing

- App E2E tests verify the real vertical, not the placeholder.
- Route tests cover `/about`, `/commitments`, and `/documents`.
- Domain and kit tests still pass.
- There is at least one responsive or screenshot-based verification path for the route.
- The README or planning docs give a reviewer a short command path to run and inspect the vertical.

## Current State Snapshot

### What Exists

The repo already has strong ingredients:

- `@repo/domain` models deal operations vocabulary and readiness concepts.
- `@repo/kit` contains render-focused operational UI components.
- `packages/kit/src/demo/deal-dashboard-demo.tsx` composes a rich dashboard with readiness, blockers, capital reconciliation, investor operations, activity, and documents.
- `packages/kit/src/commitment/commitment-inspector.tsx` shows investor-level status detail, blockers, documents, and activity.
- `packages/kit/src/fixtures/investor-operations-fixture.ts` contains realistic investor operations data.
- `packages/kit/src/fixtures/document-requirements-fixture.ts` contains document requirement states such as approved, rejected, missing, expired, uploaded, and under review.
- `docs/20-specs/trpc-core-readiness-slice-spec.md` already specifies a narrow tRPC readiness slice for `apps/web`.

### What Is Missing

The app still exposes the vertical as scaffolding:

- `apps/web/README.md` says `/deals/northstar-energy/about` is a temporary placeholder and that the rebuilt workspace, app adapter, tRPC, auth, db, and route handlers are not implemented.
- `apps/web/app/deals/[dealId]/deal-rebuild-placeholder.tsx` renders public copy that says the rebuild is in progress.
- `apps/web/tests/e2e/homepage.spec.ts` currently asserts that the placeholder appears.
- `apps/web/app/deals/[dealId]/layout.tsx` uses route-local fixture access for the rail rather than a vertical-level service boundary.

The repo therefore has a split-brain status:

- Planning docs describe a completed first vertical.
- The actual web app still renders a placeholder.
- Tests currently protect the placeholder instead of protecting the product behavior.

That mismatch is one of the highest priority gaps because reviewers will trust the running app more than the planning docs.

## Roundtable Evidence Map

The target vertical should be grounded in real Roundtable workflow evidence. These are the most relevant source signals from `/Users/fabiencampana/Documents/roundtable`.

| Product area | Evidence | Vertical implication |
| --- | --- | --- |
| Deal lifecycle | [Deal stages](</Users/fabiencampana/Documents/roundtable/06_content/docs-articles/What are the different deal stages.txt:16>) describes In Moderation, Draft, Open, Pre-closing, Closing, Invested, Completed, Exited, and Canceled. | The page should show deal stage and make clear whether the operator is preparing for closing, actively closing, or post-close. |
| Open deal operations | The Open stage includes sharing the deal, tracking and editing commitments, and uploading documents. | `/about` and `/commitments` should not only summarize. They should expose operational actions and next states. |
| Pre-closing | The Pre-closing stage finalizes KYC/KYB and legal documents. | Readiness must combine investor identity checks and document completeness. |
| Closing | Closing includes SPV creation, signing documents, and fund transfers. | Signature and wire statuses belong in the core vertical, not as secondary metadata. |
| Deal lead closing setup | [Closing process for deal leads](</Users/fabiencampana/Documents/roundtable/06_content/docs-articles/What is the process to close a deal on Roundtable if I'm a Deal lead.txt:15>) lists KYC/KYB, legal docs, investable amount, fees/carry, SPV legal form, and timing. | The readiness view should include these as explicit dimensions or blockers. |
| Standard versus ongoing close | [Ongoing fund collection vs standard closing](</Users/fabiencampana/Documents/roundtable/06_content/docs-articles/Ongoing fund collection VS Standard Closing.txt:16>) distinguishes standard and ongoing closing. | The fixture should state a closing mode. A later iteration can add mode switching, but V1 should not be ambiguous. |
| Rolling signatures and funds | [Collect signatures and funds on an ongoing basis](</Users/fabiencampana/Documents/roundtable/06_content/docs-articles/Collect signatures and funds on an ongoing basis.txt:17>) includes signature states and wire states. | The commitments table should show signature and wire progression with filters. |
| Data room | [Data Room - Share documents with your investors](</Users/fabiencampana/Documents/roundtable/06_content/docs-articles/Data Room - Share documents with your investors.txt:17>) describes protected folders, generated documents, investor documents, watermark/NDA/download controls, and activity logs. | `/documents` should feel like evidence management, not only a static checklist. |
| Currencies | [Raising in other currencies](</Users/fabiencampana/Documents/roundtable/06_content/docs-articles/Can I raise in other currencies than euro.txt:15>) describes default EUR, 40+ investor currencies, and sometimes USD/GBP raise currency. | V1 can remain EUR, but DTOs and labels should not hard-code assumptions that make multi-currency impossible. |
| SPV vehicles | [SPV types](</Users/fabiencampana/Documents/roundtable/06_content/docs-articles/What types of SPVs does Roundtable create.txt:15>) describes Luxembourg SCSp, French SC, and French SAS. | V1 should display vehicle type as contextual metadata, not implement legal rules. |
| Amount semantics | The Roundtable article about amount raised versus investable amount distinguishes gross amount raised from net investable amount. | Capital reconciliation must separate gross commitments, fees, SPV fee, carried interest where applicable, and net investable amount. |
| Deal sharing | [Deal sharing permissions](</Users/fabiencampana/Documents/roundtable/06_content/docs-articles/What different deal-sharing permissions can I set up.txt:15>) includes Disabled, Request access, and Anyone with the link. | The app rail can show access mode or pending access as later enrichment. |
| Progress widget | [Roundtable website snapshot 10](</Users/fabiencampana/Documents/roundtable/02_public_sources/roundtable-main-website/10.txt:105>) says the deal progression widget breaks capital into Investable Amount, Entry Fees, and SPV Fee. | The overview should not show a single vague amount. It should show operational capital breakdown. |
| Rolling closes and data rooms | [Roundtable website snapshot 11](</Users/fabiencampana/Documents/roundtable/02_public_sources/roundtable-main-website/11.txt:97>) describes rolling closings, feeder SPVs, capital calls, data rooms, weekly digests, search, and auth. | Only the deal closing workspace belongs in V1. Funds, capital calls, digests, and auth are later. |

## UX Reference Evidence

The Roundtable UX reference corpus strongly supports a dense operator workspace rather than a marketing page.

Key patterns:

- Persistent entity header with name, status, metadata, and primary actions.
- Right operational rail as a command center, not a decorative aside.
- Main work surface with tabs and high-density tables.
- Tables as workflow engines with filters, row actions, state badges, and bulk action potential.
- Drawers or side panels for investor and document inspection.
- Cross-state design for loading, empty, error, overdue, blocked, and completed states.

Relevant references:

- [UX reference architecture](</Users/fabiencampana/Documents/roundtable/04_ux_reference/UX_REFERENCE_ARCHITECTURE.md:163>)
- [Screenshot pattern synthesis](</Users/fabiencampana/Documents/roundtable/04_ux_reference/screenshot_teardowns/SCREENSHOT_PATTERN_SYNTHESIS.md:3>)

Implication:

The vertical should not become a card gallery. It should be a compact operating surface where cards summarize, tables drive work, and side panels preserve context.

## Product Scope Boundary

### Include in V1

- One concrete deal: `Northstar Energy`.
- One deal lead or internal operations perspective.
- Deal header with stage, vehicle, currency, closing mode, target, deadline, and status.
- Closing readiness summary.
- Blocker queue.
- Capital reconciliation.
- Investor commitments table.
- Investor detail inspector.
- KYC/KYB, signature, wire, commitment, and document statuses.
- Document requirements view.
- Data-room-inspired document grouping and evidence states.
- Activity snippets that explain why something is blocked or complete.
- Fixture-backed interactions for filtering, selecting rows, opening inspectors, and clearing local review items where safe.
- App-owned data adapter and typed DTO shape.
- Route-level tests proving the vertical renders.

### Exclude from V1

- Real auth.
- Real database persistence.
- Real tRPC client mutations that pretend to update production data.
- Payment rails, banking integrations, or actual wire instructions.
- Real KYC/KYB vendor integration.
- Investor-facing checkout.
- Community/fund management.
- Capital calls.
- Secondary market.
- Notifications, email digests, or background jobs.
- Full legal/tax rules for SCSp, SC, SAS, or other vehicles.
- Multi-deal search and global command center.

The exclusion list matters. The goal is not to simulate all of Roundtable. The goal is to build one credible slice deeply enough that the rest of the application feels plausible.

## Gap Analysis

### 1. Product Narrative Gap

Current state:

- The repo has several credible product concepts, but the app does not yet present one complete narrative.
- Documentation says a first vertical is complete, while the running route says the rebuild is in progress.
- The route copy talks about accepted baselines and scaffolding rather than the user's product problem.

Why it matters:

- A reviewer will judge the app by what loads in the browser.
- Placeholder copy weakens the signal that this is production-quality frontend work.
- The application goal is frontend software developer credibility, so the app must show judgment through an end-to-end user story.

Needed work:

- Choose Northstar Deal Operations as the single showcase vertical.
- Remove public-facing rebuild language from the main route.
- Make `/about` the mission-control entry point.
- Make `/commitments` and `/documents` subordinate but real workflow routes.
- Ensure every visible label belongs to the product world, not the build process.

Acceptance signal:

- A reviewer who opens `/deals/northstar-energy/about` sees a deal operator workspace, not an implementation status page.

### 2. Route Integration Gap

Current state:

- `apps/web/app/deals/[dealId]/deal-rebuild-placeholder.tsx` is the visible route content.
- `apps/web/tests/e2e/homepage.spec.ts` validates the placeholder.
- `apps/web/app/deals/[dealId]/layout.tsx` renders a shell and rail, but the child route is not the final vertical.
- The richer kit dashboard is not wired into the actual app route.

Why it matters:

- The work lives in packages but is not experienced as an application.
- The placeholder test suite prevents replacing the placeholder unless the tests are deliberately updated.
- Route integration is the difference between a component library demo and a usable product slice.

Needed work:

- Replace the placeholder route with a real `/about` page.
- Use `@repo/kit` dashboard components or compose a route-specific app view from kit primitives.
- Add real pages for `/commitments` and `/documents`.
- Keep `notFound` behavior for unknown deals.
- Keep section navigation, but ensure each tab changes the actual operational surface.
- Delete or retire placeholder-specific tests.

Acceptance signal:

- The e2e test title should no longer include "temporary workspace shell" or assert `[data-slot="deal-rebuild-placeholder"]`.

### 3. Data Ownership Gap

Current state:

- `@repo/kit` contains fixtures.
- The app route currently uses route-local data helpers.
- The kit README correctly says fixtures are not meant to be root exports and app routes should use app-owned adapters.
- There is no clearly implemented app service that owns the Northstar fixture as product data.

Why it matters:

- Route components that import fixtures directly blur package ownership.
- Kit fixtures are useful for demos, but the app should treat data as app-owned input.
- A frontend application review should show a clean boundary between domain data, presentation components, and route orchestration.

Needed work:

- Add an `apps/web` service or fixture adapter such as `apps/web/server/deals/northstar-deal-service.ts`.
- Import package fixtures only inside that adapter if needed.
- Normalize the data into app DTOs before passing to route components.
- Keep DTOs serializable and stable.
- Make the route consume one app-owned view model.

Acceptance signal:

- Route files do not import `packages/kit/src/fixtures/*` or deep kit fixture paths.

### 4. API Boundary Gap

Current state:

- `docs/20-specs/trpc-core-readiness-slice-spec.md` specifies a tRPC readiness slice.
- The spec is not reflected in the app route yet.
- There is no implemented `deal.getClosingReadiness` procedure in the running app.

Why it matters:

- For a frontend developer application, a typed data boundary is a valuable signal.
- The vertical does not need real persistence, but it should show how UI consumes app data without hard-coding everything in React components.
- tRPC can be server-called from the App Router while still remaining fixture-backed.

Needed work:

- Implement the narrow tRPC readiness boundary described in the existing spec.
- Add `deal.getClosingReadiness` with input `{ dealId: string }`.
- Return a serializable `DealClosingReadinessDTO`.
- Keep errors typed enough to distinguish not found, invalid fixture, and unsupported deal.
- Use the procedure from the `/about` route, directly or through a server caller.
- Do not add broad CRUD or fake mutations yet.

Acceptance signal:

- The `/about` route is backed by a typed app service/procedure, not local component constants.

### 5. DTO and Serialization Gap

Current state:

- Domain code uses branded concepts and richer internal structures.
- UI components need display-friendly values.
- Money and status values must cross app boundaries safely.

Why it matters:

- Passing domain objects directly through app boundaries creates hidden coupling.
- Money bugs are highly visible in finance-adjacent software.
- tRPC and App Router data need JSON-safe structures.

Needed work:

- Define explicit app DTOs for:
  - Deal summary.
  - Closing readiness.
  - Blockers.
  - Capital reconciliation.
  - Investor operation rows.
  - Document requirements.
  - Activity events.
- Serialize money as minor units and currency, for example `{ amountMinor: 12500000, currency: "EUR" }`.
- Serialize dates as ISO strings.
- Use string literal unions for stable UI tags.
- Map DTOs to kit props in a route adapter or view model builder.

Acceptance signal:

- No route code depends on branded domain internals to render labels or amounts.

### 6. Domain Coverage Gap

Current state:

- Existing domain work covers readiness, blockers, commitment statuses, document requirements, and capital summaries reasonably well.
- Some Roundtable-specific concepts are under-modeled or only implied:
  - Closing mode.
  - SPV vehicle type.
  - Share/access mode.
  - Pending access approvals.
  - Gross amount raised versus investable amount.
  - Entry fees, SPV fee, carried interest.
  - Currency policy.
  - Legal document generation versus investor-uploaded evidence.

Why it matters:

- A deal closing workspace becomes credible through precise domain vocabulary.
- The vertical does not need every rule, but the visible model should not collapse distinct concepts into generic status.

Needed work:

- Add minimal fixture fields for:
  - Deal stage.
  - Closing mode: standard or ongoing.
  - Vehicle: e.g. Luxembourg SCSp or French SAS as display metadata.
  - Currency: EUR for V1.
  - Access mode: disabled, request access, or anyone with the link.
  - Capital breakdown: gross commitments, entry fees, SPV fee, net investable amount.
  - Investor readiness dimensions: commitment, KYC/KYB, signature, wire, documents.
- Keep complex legal/tax logic out of V1.
- Prefer display metadata over fake automated decisions.

Acceptance signal:

- The vertical uses Roundtable terms precisely without pretending to automate legal or compliance judgments.

### 7. UX Layout Gap

Current state:

- The kit dashboard has a credible dense operational layout.
- The app shell exists, but the public route is placeholder content.
- The current `DealAppShell` rail placement may make mobile ordering awkward if the rail appears before the main task.
- The right rail currently risks feeling like cleanup/rebuild status rather than live command center.

Why it matters:

- The UX reference corpus emphasizes persistent entity headers, right rails, tabs, tables, and drawers.
- A frontend reviewer will inspect spacing, hierarchy, responsive behavior, and information density.
- Operational software should be scannable, not a marketing-like hero or card collage.

Needed work:

- Use a compact entity header:
  - Deal name.
  - Stage.
  - Vehicle.
  - Currency.
  - Closing mode.
  - Target close date.
  - Primary action.
- Make the right rail operational:
  - Readiness score.
  - Critical blockers.
  - Next deadline.
  - Capital reconciliation.
  - Recent activity.
  - Document exceptions.
- Put the main work surface first on mobile.
- Use tabs for About, Commitments, Documents.
- Use tables and inspectors where users need to compare rows.
- Avoid nesting cards inside cards.
- Avoid large hero copy and explanatory product text inside the app.

Acceptance signal:

- The first viewport reads as a working operations surface, not a product landing page or internal scaffold.

### 8. Commitments Workflow Gap

Current state:

- Kit contains rich investor operations fixtures and commitment inspector UI.
- The app route does not yet expose a real commitments workflow.
- Existing app tests do not validate row opening, filtering, or investor inspection.

Why it matters:

- Commitments are the most inspectable part of the vertical.
- This route can show the frontend skill most clearly: table density, filters, sorting, row states, side panel behavior, and status semantics.

Needed work:

- Build `/deals/northstar-energy/commitments` around the deal commitments table.
- Include columns for:
  - Investor.
  - Legal entity.
  - Commitment amount.
  - Net investable amount or fee impact if available.
  - KYC/KYB.
  - Signature.
  - Wire.
  - Documents.
  - Overall readiness.
  - Blocking reason or next action.
- Add filters for:
  - Blocked.
  - Missing KYC/KYB.
  - Signature pending.
  - Wire pending or flagged.
  - Document issue.
  - Ready.
- Open an inspector for a selected investor.
- Show blocker detail, required documents, activity, and recommended next action.
- Keep local UI state only, such as selected row, active filter, and dismissed helper panel.

Acceptance signal:

- A reviewer can identify the least-ready investor and understand exactly why they are blocking closing.

### 9. Documents and Data Room Gap

Current state:

- Kit has document requirement fixtures.
- Roundtable evidence shows data rooms, generated documents, protected folders, investor documents, activity logs, NDA/watermark/download controls.
- The app does not expose a document workflow route.

Why it matters:

- Documents are central to closing readiness.
- A document route can show workflow thinking without building real uploads or storage.
- It gives the app a second operational surface beyond the investor table.

Needed work:

- Build `/deals/northstar-energy/documents` as a document requirements and evidence view.
- Group documents into:
  - Generated deal documents.
  - Investor-provided documents.
  - Vehicle/SPV setup documents.
  - Compliance evidence.
  - Optional data room folders.
- Show states:
  - Missing.
  - Uploaded.
  - Under review.
  - Approved.
  - Rejected.
  - Expired.
- Show owner, due date, related investor if any, and blocking impact.
- Include data-room-inspired metadata:
  - Visibility.
  - Protected folder.
  - Investor access or internal only.
  - Last activity.
- Do not implement fake uploads as if they persist.

Acceptance signal:

- The documents route explains which evidence is blocking the close and which documents are only informational.

### 10. Readiness and Blocker Gap

Current state:

- The kit dashboard and domain model include readiness and blocker concepts.
- The app placeholder prevents users from experiencing them in route context.
- It is unclear whether readiness is computed from one authoritative service or composed separately in UI.

Why it matters:

- Closing readiness is the organizing concept for the vertical.
- If readiness is only decorative, the workflow loses coherence.

Needed work:

- Define readiness dimensions:
  - Investor identity readiness.
  - Signature readiness.
  - Wire readiness.
  - Document readiness.
  - Capital reconciliation readiness.
  - Vehicle/setup readiness.
- Define blocker severity:
  - Critical.
  - Warning.
  - Info.
- Define blocker source:
  - Investor.
  - Deal.
  - Document.
  - Capital.
  - Vehicle.
- Make the blocker queue route-neutral so it can appear in `/about`, rail, and inspectors.
- Ensure blockers link or point to the relevant route section.

Acceptance signal:

- The top blockers on `/about` match the rows and documents that appear in `/commitments` and `/documents`.

### 11. Capital and Economics Gap

Current state:

- Existing fixtures and dashboard reference capital summaries.
- Roundtable evidence distinguishes amount raised, investable amount, entry fees, SPV fee, and carry.
- The app does not yet show a reviewer-facing reconciliation route.

Why it matters:

- Finance-adjacent frontend work must be precise about amounts.
- Gross and net values should not be conflated.
- This is a high-value signal of product judgment.

Needed work:

- Show capital reconciliation on `/about` and/or rail:
  - Gross committed.
  - Signed amount.
  - Wired amount.
  - Entry fees.
  - SPV fee.
  - Net investable amount.
  - Remaining to target.
- Label values clearly.
- State whether amounts are fixture data.
- Keep V1 in EUR, but structure DTOs to support currency.
- Do not imply real-time bank reconciliation.

Acceptance signal:

- A reviewer can explain why "amount raised" and "investable amount" differ after looking at the page.

### 12. Compliance and Legal Context Gap

Current state:

- KYC/KYB and legal documents are represented.
- Vehicle type and legal setup are not prominent in the app.
- Legal/tax complexity is too large for V1 but cannot be ignored entirely.

Why it matters:

- Roundtable's closing workflow is inseparable from SPV setup, signatures, and compliance evidence.
- A credible frontend must expose legal context without overclaiming rule automation.

Needed work:

- Display vehicle metadata:
  - Vehicle type.
  - Jurisdiction.
  - Closing mode.
  - Setup status.
- Add blockers for:
  - Vehicle setup incomplete.
  - Legal docs not generated.
  - Signature package incomplete.
  - Investor KYC/KYB incomplete.
- Use careful copy:
  - "Needs review"
  - "Awaiting evidence"
  - "Ready for operator review"
  - Avoid "approved by compliance" unless fixture explicitly models approval.

Acceptance signal:

- Legal and compliance status appears as operational context, not as hidden assumptions or fake determinations.

### 13. Interaction Gap

Current state:

- Kit components support some interaction patterns.
- App routes are placeholder and do not exercise them.
- It is unclear which interactions are stateful, local-only, or future-backed.

Why it matters:

- Frontend applications are judged by behavior as much as layout.
- Local interactions are acceptable if they are honest and useful.

Needed work:

- Implement local interactions:
  - Filter commitments.
  - Search investor rows.
  - Select row.
  - Open and close inspector.
  - Switch route tabs.
  - Expand blocker details.
  - Filter documents by state.
- Use disabled or clearly non-persistent controls for actions that would require backend:
  - Send reminder.
  - Request document.
  - Mark wire received.
  - Approve KYC/KYB.
- Add tooltips or secondary labels only where needed.
- Ensure keyboard operation for filters, table rows, and inspectors.

Acceptance signal:

- The user can inspect and triage the deal without hitting dead controls or fake success toasts.

### 14. Internationalization and Content Gap

Current state:

- The app has French locale assets.
- Kit demo labels are hardcoded English in several places.
- The visible placeholder is implementation copy, not product copy.

Why it matters:

- i18n discipline is a frontend signal.
- Hardcoded demo labels are acceptable in kit demos but weaker in app routes.
- Content should strengthen the product narrative.

Needed work:

- Put app-visible labels in app message files where the existing app architecture expects them.
- Keep domain status labels centralized.
- Use product copy that is short and operational.
- Avoid internal implementation terms:
  - "rebuild"
  - "baseline"
  - "scaffold"
  - "adapter not wired"
- Decide whether the vertical is presented in English or French for the application review, then be consistent.

Acceptance signal:

- No public route copy describes internal build status.

### 15. Accessibility Gap

Current state:

- Current e2e tests check placeholder rendering and navigation.
- There is no route-level accessibility test for the completed workflow.
- Dense tables and drawers are high-risk for keyboard and screen reader issues.

Why it matters:

- Accessibility is a strong frontend developer signal.
- Tables, filters, status badges, and inspectors can degrade quickly if not tested.

Needed work:

- Ensure semantic headings per route.
- Add accessible names for filters, icon buttons, and status controls.
- Make inspector focus behavior explicit.
- Preserve visible focus styles.
- Ensure status badges are not color-only.
- Use table semantics or accessible grid patterns consistently.
- Add Playwright or testing-library checks for keyboard row opening and drawer close.

Acceptance signal:

- A keyboard user can filter commitments, open an investor, inspect blockers, and close the panel.

### 16. Responsive Gap

Current state:

- Kit dashboard includes responsive sections.
- App shell and rail behavior need verification in real routes.
- The rail may appear too early on mobile depending on DOM order.

Why it matters:

- The app is portfolio-facing. Mobile and narrow viewports will be inspected.
- Dense operational layouts need deliberate responsive behavior.

Needed work:

- Verify desktop at about 1440px.
- Verify tablet at about 768px.
- Verify mobile at about 390px.
- On mobile:
  - Header should remain compact.
  - Main readiness should appear before secondary rail content.
  - Tables should become cards or horizontally managed views without broken text.
  - Inspector should become a full-screen or bottom-sheet-like panel if needed.
- Avoid viewport-scaled font sizes.
- Ensure text does not overflow buttons, badges, cards, or table cells.

Acceptance signal:

- The route remains usable on mobile without reading implementation status first or scrolling through a misplaced rail.

### 17. Visual Design Gap

Current state:

- Kit components provide a credible visual language.
- The current app placeholder weakens the first impression.
- The Roundtable references favor dense, restrained, work-focused UI.

Why it matters:

- Frontend review is heavily visual.
- A single polished vertical is stronger than many unpolished routes.

Needed work:

- Use restrained color with meaningful semantic accents.
- Keep operational density high but readable.
- Avoid one-note palettes.
- Keep cards to actual repeated items or panels.
- Use tables for comparison-heavy data.
- Use icons for common actions where the existing stack supports them.
- Keep badge taxonomy consistent across routes.
- Ensure charts or progress bars explain actual values.

Acceptance signal:

- The UI looks like a serious B2B operations workspace, not a generic template.

### 18. Testing Gap

Current state:

- Domain and kit tests are strong enough to preserve package behavior.
- App tests currently protect placeholders.
- The documented app testing requirements are more ambitious than the implemented app tests.

Why it matters:

- For a frontend developer application, tests should demonstrate product confidence at the route level.
- Current placeholder tests would fail for the wrong reason once the vertical is implemented.

Needed work:

- Replace placeholder e2e assertions with product assertions.
- Add route tests:
  - `/deals/northstar-energy/about` renders deal header, readiness, blockers, capital reconciliation.
  - `/deals/northstar-energy/commitments` renders investor table and can open an inspector.
  - `/deals/northstar-energy/documents` renders document groups and exception states.
  - Unknown deal returns 404 or expected not-found behavior.
- Add interaction tests:
  - Filter commitments by blocked.
  - Search investor.
  - Open and close investor inspector.
  - Filter documents by issue state.
- Add boundary tests:
  - DTO serialization.
  - tRPC not-found handling.
  - Money minor-unit formatting.
- Add responsive or screenshot checks for at least desktop and mobile.

Acceptance signal:

- Tests fail if the route regresses back to placeholder content.

### 19. Documentation Gap

Current state:

- Planning docs and app reality disagree.
- `docs/20-specs/trpc-core-readiness-slice-spec.md` is useful, but not enough as the reviewer path.
- `docs/60-planning/current-priorities-and-rationale.md` claims completion that the app does not show.

Why it matters:

- Documentation drift is visible to a technical reviewer.
- A portfolio repo needs a clear "what to open, what to run, what to inspect" path.

Needed work:

- Update current priorities after implementation to reflect actual status.
- Keep this gap analysis as the scope anchor.
- Add a short reviewer path:
  - Install command.
  - Dev command.
  - Route URL.
  - Test command.
  - Key files to inspect.
- Link the vertical spec to the implemented route and tests.
- Remove or reword claims that say the vertical is complete before the app is actually wired.

Acceptance signal:

- A reviewer can run one command path and understand the intended vertical from README/docs without reading internal planning history.

### 20. Portfolio Positioning Gap

Current state:

- The repo has strong signs of senior frontend/product thinking in packages and docs.
- The route that a reviewer opens does not yet tell that story.

Why it matters:

- The stated end goal is to support an application as a frontend software developer.
- The vertical must demonstrate employable frontend strengths:
  - Product sense.
  - Design implementation.
  - State modeling.
  - TypeScript discipline.
  - Route architecture.
  - Testing.
  - Documentation.

Needed work:

- Make the completed vertical the first thing shown in the web app.
- Avoid overemphasizing backend plans.
- Show enough typed API boundary to prove architecture judgment.
- Keep the visible app product-first.
- Keep internal architecture visible through code quality and tests, not through UI copy.

Acceptance signal:

- The app can be discussed in an interview as one coherent case study: "I built a deal closing operations workspace with typed domain models, kit components, app DTOs, and route-level tests."

## Recommended Implementation Sequence

### Phase 0: Align Status

Purpose:

- Stop the repo from claiming done work that is not visible in the app.

Tasks:

- Treat this document as the new scope anchor.
- Leave `current-priorities-and-rationale.md` alone until implementation starts or update it at the same time as code.
- Do not broaden into additional verticals.

Done when:

- The team agrees that Northstar Deal Operations is the single V1 vertical.

### Phase 1: App Data Boundary

Purpose:

- Create the app-owned source of truth for the vertical.

Tasks:

- Add app DTO types for deal closing readiness.
- Add a fixture-backed Northstar service under `apps/web`.
- Map domain and kit fixture data into one route view model.
- Serialize money and dates safely.
- Add basic service tests.

Candidate files:

- `apps/web/server/deals/deal-readiness-service.ts`
- `apps/web/server/deals/deal-readiness-dto.ts`
- `apps/web/server/deals/northstar-fixture-adapter.ts`
- `apps/web/server/deals/deal-readiness-service.test.ts`

Done when:

- The app has one function that returns the complete Northstar vertical view model without route components importing kit fixture paths.

### Phase 2: tRPC Readiness Slice

Purpose:

- Implement the existing narrow spec as a typed frontend/backend seam.

Tasks:

- Add `deal.getClosingReadiness`.
- Validate `dealId`.
- Return serializable DTOs.
- Preserve `notFound` behavior for unknown deals.
- Add procedure tests.

Candidate files:

- `apps/web/server/trpc/root.ts`
- `apps/web/server/trpc/routers/deal.ts`
- `apps/web/server/trpc/context.ts`
- `apps/web/app/api/trpc/[trpc]/route.ts`

Done when:

- `/about` can read the vertical data through the same typed seam future routes can use.

### Phase 3: About Route Mission Control

Purpose:

- Replace the placeholder with the core operator workspace.

Tasks:

- Remove `deal-rebuild-placeholder` from the rendered route.
- Render deal header, readiness summary, blocker queue, capital reconciliation, investor summary, document exceptions, and activity.
- Make rail content operational.
- Keep mobile order usable.
- Update e2e tests to assert product behavior.

Candidate files:

- `apps/web/app/deals/[dealId]/about/page.tsx`
- `apps/web/app/deals/[dealId]/layout.tsx`
- `apps/web/app/deals/[dealId]/deal-operational-rail.tsx`
- `apps/web/tests/e2e/deal-about.spec.ts`

Done when:

- `/deals/northstar-energy/about` answers "is this deal ready to close and why?"

### Phase 4: Commitments Route

Purpose:

- Expose the investor operations workflow.

Tasks:

- Render investor commitments table.
- Add search and status filters.
- Add investor inspector.
- Connect blockers and documents to selected investor.
- Add keyboard and e2e interaction tests.

Candidate files:

- `apps/web/app/deals/[dealId]/commitments/page.tsx`
- `apps/web/app/deals/[dealId]/commitments/commitments-workspace.tsx`
- `apps/web/tests/e2e/deal-commitments.spec.ts`

Done when:

- A reviewer can find the riskiest investor and inspect the evidence without leaving the route.

### Phase 5: Documents Route

Purpose:

- Make document evidence and data-room readiness visible.

Tasks:

- Render document groups.
- Show missing, expired, rejected, uploaded, under-review, and approved states.
- Add filters by state and owner.
- Show whether a document blocks closing.
- Add document route tests.

Candidate files:

- `apps/web/app/deals/[dealId]/documents/page.tsx`
- `apps/web/app/deals/[dealId]/documents/documents-workspace.tsx`
- `apps/web/tests/e2e/deal-documents.spec.ts`

Done when:

- A reviewer can identify which documents block closing and which are informational.

### Phase 6: Hardening

Purpose:

- Turn the vertical from functional to review-ready.

Tasks:

- Run typecheck and package tests.
- Add browser verification screenshots.
- Check mobile layout.
- Check keyboard interactions.
- Update docs and reviewer path.
- Remove obsolete placeholder copy/tests.

Done when:

- The route, docs, and tests tell the same story.

## Test Matrix

| Layer | What to test | Why |
| --- | --- | --- |
| Domain | Existing readiness, blocker, status, and money behavior | Preserve product rules. |
| App service | Northstar DTO shape, not-found handling, money/date serialization | Protect app boundary. |
| tRPC | `deal.getClosingReadiness` success and not-found/error cases | Prove typed backend seam. |
| About route | Header, readiness, blockers, capital reconciliation, rail | Protect main vertical entry. |
| Commitments route | Table render, filters, search, inspector open/close | Protect core workflow. |
| Documents route | Group render, status filters, blocker states | Protect evidence workflow. |
| Accessibility | Keyboard route through filters, rows, inspector, close controls | Protect dense UI usability. |
| Responsive | Desktop and mobile route screenshots or assertions | Protect layout quality. |
| Docs | Reviewer path matches real commands and routes | Prevent drift. |

Minimum verification commands after implementation:

```bash
pnpm --filter @repo/domain test
pnpm --filter @repo/domain typecheck
pnpm --filter @repo/kit test
pnpm --filter @repo/kit typecheck
pnpm --filter @repo/web typecheck
pnpm --filter @repo/web test:e2e
```

If browser screenshot tooling is available, add a desktop and mobile capture of `/deals/northstar-energy/about`.

## Files Most Likely To Change

Expected app files:

- `apps/web/app/deals/[dealId]/about/page.tsx`
- `apps/web/app/deals/[dealId]/commitments/page.tsx`
- `apps/web/app/deals/[dealId]/documents/page.tsx`
- `apps/web/app/deals/[dealId]/layout.tsx`
- `apps/web/app/deals/[dealId]/deal-operational-rail.tsx`
- `apps/web/app/deals/[dealId]/deal-rebuild-placeholder.tsx`
- `apps/web/tests/e2e/homepage.spec.ts`
- `apps/web/tests/e2e/deal-about.spec.ts`
- `apps/web/tests/e2e/deal-commitments.spec.ts`
- `apps/web/tests/e2e/deal-documents.spec.ts`

Expected server/app boundary files:

- `apps/web/server/deals/*`
- `apps/web/server/trpc/*`
- `apps/web/app/api/trpc/[trpc]/route.ts`

Expected package files only if required:

- `packages/kit/src/demo/deal-dashboard-demo.tsx`
- `packages/kit/src/commitment/*`
- `packages/kit/src/document/*`
- `packages/kit/src/fixtures/*`

Expected docs:

- `docs/20-specs/trpc-core-readiness-slice-spec.md`
- `docs/30-testing/testing-app.md`
- `docs/60-planning/current-priorities-and-rationale.md`

The implementation should avoid changing package APIs unless the app route cannot consume the existing kit components cleanly.

## Detailed Acceptance Criteria

### Product Acceptance

- `/deals/northstar-energy/about` renders a real Northstar deal workspace.
- The route shows deal stage, vehicle, currency, closing mode, and target close date.
- The route shows readiness and the blockers that prevent closing.
- The route shows capital reconciliation with gross and net values.
- The right rail contains operational state, not rebuild status.
- `/commitments` lets a user inspect investor readiness.
- `/documents` lets a user inspect document readiness.
- No public route displays internal rebuild/scaffold/baseline copy.

### Architecture Acceptance

- App routes consume app-owned data services or tRPC procedures.
- DTOs are serializable.
- Money uses minor units plus currency across boundaries.
- Unknown `dealId` paths are handled intentionally.
- Package boundaries stay clean:
  - Domain owns rules.
  - Kit owns rendering.
  - App owns orchestration and route data.

### UI Acceptance

- Desktop layout is dense and scannable.
- Mobile layout keeps main workflow before secondary rail details.
- Status colors are paired with text.
- Tables remain usable with realistic names and amounts.
- Investor inspector can be opened and closed predictably.
- Document issue states are visually distinct and readable.

### Testing Acceptance

- App e2e tests no longer assert placeholder content.
- App e2e tests cover all three target routes.
- At least one interaction test opens an investor inspector.
- At least one document route test verifies issue states.
- Typecheck passes for `@repo/web`.
- Existing domain and kit tests still pass.

### Documentation Acceptance

- A reviewer can find the route URL and test command.
- Planning docs do not claim a completed vertical before the app implements it.
- The scope and exclusions are explicit.

## Risks

### Risk: Broadening the scope

The vertical can easily expand into funds, communities, auth, data rooms, investor onboarding, capital calls, and banking. That would weaken V1. The mitigation is to keep one deal, one operator, and three routes.

### Risk: Fake backend behavior

Fake mutations or fake persistence can make the app feel dishonest. The mitigation is to support local UI interactions only and disable or label actions that require real systems.

### Risk: Legal and compliance overclaiming

KYC/KYB, SPV type, signatures, and wires are sensitive concepts. The mitigation is to show operational readiness and evidence states, not legal conclusions.

### Risk: Component demo instead of app

Reusing kit demos directly could make the route feel like a pasted storybook. The mitigation is to add app-owned data, route-specific composition, and tests around the workflow.

### Risk: Documentation drift

The repo already has a status mismatch. The mitigation is to update docs only when the app behavior exists, and to make route tests protect the real vertical.

### Risk: Mobile degradation

Dense B2B layouts often break at mobile widths. The mitigation is to make mobile order explicit and verify the real route in a browser.

## Open Decisions

### Should tRPC be included in V1?

Recommendation: yes, but narrowly.

Reason:

- The existing spec already defines the right slice.
- A typed fixture-backed procedure is a strong frontend architecture signal.
- It avoids route-local fixture coupling without requiring a real backend.

Constraint:

- Do not add broad CRUD, mutations, auth, or persistence.

### Should `/about` alone count as the vertical?

Recommendation: no.

Reason:

- `/about` can be the mission-control entry, but commitments and documents are where the workflow becomes inspectable.
- The minimal credible vertical is three routes sharing one data model.

Constraint:

- Implement `/about` first. Do not polish secondary routes before the mission-control route is real.

### Should the app support multiple currencies now?

Recommendation: no, but design the DTOs for it.

Reason:

- The Roundtable evidence supports multi-currency complexity.
- V1 should stay EUR to preserve focus.
- Money DTOs should still carry currency to avoid future rewrites.

### Should legal vehicle rules be modeled now?

Recommendation: no, only display metadata and blockers.

Reason:

- Full SPV legal rules are outside a frontend portfolio vertical.
- Vehicle context matters, so it should be visible.

### Should the vertical include real data-room permissions?

Recommendation: no, only data-room-inspired document metadata.

Reason:

- Access control and file storage are backend-heavy.
- Protected folder, visibility, and status labels are enough for V1.

## Final Recommendation

Do not build another vertical yet.

Make Northstar Deal Operations unmistakably real in the app:

1. Add the app-owned data and typed readiness boundary.
2. Replace the placeholder `/about` route with a mission-control workspace.
3. Add commitments and documents routes that expose the two core workflows.
4. Update tests so they protect the actual vertical.
5. Align docs only after route behavior is true.

This would give the repo one complete product slice that demonstrates the strongest possible frontend signal: not just components, not just docs, and not just domain models, but a coherent operational application surface backed by type-safe structure and tested user workflows.
