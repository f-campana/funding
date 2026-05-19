---
id: funding
name: Funding
tagline: The trusted platform & infrastructure for private markets
category: product-surface
domain: fintech / private-markets / B2B SaaS
geography: Europe (Paris · Toulouse · Luxembourg)
founded: 2022
stage: scaleup — seed-funded, Sifted 250 rank #14
stack: TypeScript · Next.js · tRPC · PostgreSQL · Prisma · BullMQ · Shadcn · Radix · Tailwind
design-system: Shadcn/Radix UI · Tailwind CSS with custom design tokens · Storybook
aesthetic: premium B2B fintech · trust · precision · "as beautiful as a consumer app"
references:
  product: Carta · AngelList · Odin · Folk
  design: Linear · Stripe · Notion
status: active
last-updated: 2026-04
---

# Funding

## Identity in One Sentence

Funding is the European financial infrastructure layer for private market investing — automating the legal, administrative, and compliance work that sits between a deal and its investors, across SPVs, syndicates, and VC funds.

## What the Product Actually Does

Funding removes the operational overhead of private market investing. A deal lead finds an opportunity. Instead of managing 40 individual investors with 40 bank transfers, 40 KYC checks, 40 cap table entries — they create one SPV. Funding handles formation, KYC/KYB, e-signatures, fund collection, wiring, and documentation. Founders get two lines on their cap table. Investors get a single structured vehicle. Everyone gets a dashboard.

The platform serves seven distinct customer segments from one codebase:
- **Founders** — raise via SPV, keep cap table clean
- **Investment Clubs / Syndicates** — deal leads pool investors into communities
- **Fund Managers** — launch full EuVECA-licensed VC funds (Fund-as-a-Service)
- **Investors** — discover and co-invest alongside notable angels
- **Family Offices** — co-invest via professional structures
- **Investment Funds** — digital administration and LP management
- **Private Banks** — white-label private market access (emerging direction)

## Product Surface Map

### `app.funding.example` — Core Platform (Engineering-owned)

**Deal flow surface**
- Deal creation form: instrument type, financial conditions, carried interest, entry fee config
- Deal page: pitch presentation, real-time commitment tracking (signed / reviewed / committed / dropped)
- KYC/KYB pipeline: automated, handles natural persons and legal entities across jurisdictions
- E-signature collection and document dispatch
- Automatic payment reconciliation
- SPV incorporation trigger and post-closing document delivery

**Community surface**
- Investment club creation and membership management
- Deal sharing and access control within communities
- In-app discussions: Q&A with founders, deal reminders, investor reports
- Targeted email to specific members from within the platform
- Carried interest and entry fee configuration per deal

**Fund surface (Fund-as-a-Service)**
- Fund launch workflow: legal doc drafting, Luxembourg SCSp formation
- LP onboarding with digital KYC/AML, commitment signing, equalization fee calculation
- Capital calls and distributions management
- Valuation and audit (up to 20 investments)
- Investor reporting pipeline

**Investor surface**
- Deal discovery and commitment flow
- Portfolio dashboard: valuations, multi-currency, document storage
- Secondary market: initiate and manage SPV interest transfers
- Investor profile: thesis, portfolio, what they look for in startups

**Cap Table Engine**
The core data primitive of the platform. Tracks fractional ownership across thousands of investors with cent-level precision. Supports point-in-time historical queries for audit. The hardest technical module — rounding errors must propagate correctly across all downstream calculations.

### `fatca.funding.example` — FATCA Generator (Product-team-owned MVP)

A standalone free tool built by the product team using Replit + AI coding tools in days — explicitly without engineering resources. Solves a high-friction compliance bottleneck: FATCA forms have up to 30 sections and 8 dense pages. The tool dynamically shows only relevant sections, enabling completion in ~2 minutes on any device, with instant PDF output.

**Design note:** this tool is functional but intentionally unpolished. It was shipped as an adoption filter before investing full dev resources. Its existence reflects a two-speed culture: core platform = high-craft engineering; peripheral tools = fast MVP by product.

### Free / Peripheral Tools

- **Investor Database** — curated list of European BAs by country and industry, hosted via Folk CRM
- **Fundraising Toolkit** — gated resource: BA lists, law firm lists, data room template
- **Funding Academy** — educational content on SPVs, SCSp, fundraising, liquidity, webinar replays
- **Pricing Calculator** — embedded on marketing site

---

## Visual Language

### Register

Premium B2B fintech. The aspirational reference is the "beautiful consumer app" — the team explicitly states that a financial tool should be as beautiful and intuitive as a consumer product. In practice this means:

- **Not** the dense grey utility-software aesthetic of legacy fintech (no Salesforce, no Bloomberg terminal)
- **Not** the playful pastel consumer aesthetic of neobanks (no Revolut/N26 register)
- **Closer to**: Linear's dark precision · Stripe's clarity and whitespace · Notion's quiet confidence

Trust and legibility are the primary drivers. This is a platform that holds real money and real legal documents. Every interface choice must reinforce professional credibility.

### Design System Architecture

- **Component library**: Shadcn/Radix UI — accessible, composable, headless primitives
- **Styling**: Tailwind CSS with custom design tokens — means the palette, typography, and spacing are systematized and overridable per-tenant
- **Documentation**: Storybook for component documentation and visual testing
- **Forms**: React Hook Form for complex multi-step investment flows
- **Data grids**: TanStack Table + TanStack Virtual for high-performance investor lists and cap table views
- **Data fetching**: tRPC + TanStack Query for new surfaces; Apollo only exists as legacy migration context where older GraphQL screens have not yet been moved.

The custom design tokens on top of Tailwind is a significant signal: the platform is being built for configurability, not a single fixed visual identity. This supports the white-label / private bank direction.

### Key UI Patterns to Understand

**Multi-step onboarding flows**
KYC/KYB, deal creation, and fund launch are multi-step, multi-entity flows. Simple step progression should stay local or form-library-owned; use XState only when a workflow has explicit events, guarded transitions, async effects, replay/reconciliation, or parallel states.

**Real-time status UIs**
Deal pages show live commitment tracking. Fund dashboards show portfolio valuations. These are not static — they update as investors commit, sign, and wire. Optimistic updates matter here.

**Dense financial data grids**
Cap table views, investor lists, fund LP tables — thousands of rows, fractional numbers, multi-currency. TanStack Virtual handles the rendering performance. Design must handle long entity names, small numbers with precision requirements, and action affordances per row without visual noise.

**Financial state machines made visible**
An SPV goes through: draft → open → closing → incorporated → wired → closed. A fund goes through: pre-marketing → marketing → first close → investing → exiting. These states must be legible in the UI — status chips, progress indicators, audit trails.

**Document surfaces**
Data room, subscription bulletins, investor reports. These are high-trust surfaces — legal documents that investors sign and rely on. The UI must convey reliability and formality while remaining easy to navigate.

**Regulatory / compliance UI**
Investor qualification flows differ by country. The system must display the right questions, the right disclaimers, the right gates — dynamically, based on jurisdiction. This is a frontend complexity problem as much as a backend one.

---

## The Configurable Platform Problem

This is the central architectural challenge for the frontend as of 2025–2026.

The goal: transform the platform into a **fully parameterizable engine** capable of supporting external funds with diverse structures — regardless of their origin. This means:

- Fee structures vary per fund manager
- Branding and visual identity vary per client (private banks especially)
- Workflow steps vary by asset class (VC vs PE vs real estate) and jurisdiction
- User roles and permissions vary by community structure

The design system's token architecture is load-bearing here. A fully tokenized design system (colours, spacing, typography, radii all in tokens) is what makes per-client theming possible without forking components. This is why Shadcn/Radix was chosen over a more opinionated library.

**Implication for frontend architecture**: components must be headless-first, configuration-driven, and avoid hardcoded business logic. The first frontend-leaning hire will set these foundations.

---

## Engineering Culture Signals (Relevant to Design Execution)

- **Strict TypeScript**: no `any`, Zod validation at all system boundaries — including frontend form validation and API response parsing
- **DDD with 20+ shared domain libraries**: the monorepo is organized by bounded context — each domain (deals, KYC, funds, communities, secondary) is a shared lib, not a tangle of cross-imports
- **Observability-first**: Datadog (browser + server) + Sentry from day one — frontend errors are tracked, performance is monitored
- **AI-assisted development**: Anthropic-powered pipelines for document analysis and data extraction; IDE assistants used in daily dev
- **Code review culture**: every PR gets a thoughtful review — design quality is a first-class concern, not an afterthought

---

## Traction Context (Stakes for UI Decisions)

- 25,000+ investors on platform
- 750+ deals facilitated across Europe
- 450+ investment communities
- €250M+ in fundraising in the past 12 months
- Sifted 250 rank #14 (highest percentage revenue growth in Europe)
- Funds on platform targeting first closings between €10M and €100M
- Notable angels: Roxanne Varza, Olivier Pailhes (Aircall co-founder), Pieter-Jan Bouten
- Notable deals: Proxima Fusion (Series A), Anchor (YC S22)

This is not a prototype. Design decisions land on flows used by real investors moving real money into real legal entities.

---

## Competitive References for Design Orientation

| Reference | What to borrow |
|---|---|
| **Linear** | Dark, precise, fast. State and transitions feel engineered, not designed. |
| **Stripe** | Whitespace, typographic clarity, trust signals in the details. |
| **Notion** | Quiet confidence. Nothing shouts. Dense information rendered lightly. |
| **Carta** | Cap table UI patterns — but aim significantly above their visual quality. |
| **AngelList** | Syndicate flow UX — but more polished, more European, less startup-raw. |
| **Folk** | CRM-adjacent list and profile patterns. Used by Funding themselves. |

---

## Instantiation Notes

When instantiating this Rune for a project or brief:

- Default to dark or neutral-dark palette unless brief specifies otherwise
- Typography should be clean sans-serif with strong hierarchy — numbers must be legible at small sizes
- State and status should always be visible — never leave the user uncertain about where they are in a flow
- Financial precision in UI copy: never round or approximate amounts in interfaces; echo the cent-level precision of the backend
- Trust signals matter: subtle borders, careful alignment, consistent spacing. Sloppiness reads as financial risk.
- The platform is used on desktop primarily (deal leads, fund managers) but investor flows should be mobile-capable (FATCA generator proof: investors complete forms on their phone)
- Multi-step flows: show progress, validate inline, never lose state on back navigation
- When building configurable surfaces: tokenize everything, hardcode nothing
