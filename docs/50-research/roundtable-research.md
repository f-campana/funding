---
id: roundtable-research
name: Roundtable Research
category: product-research
domain: fintech / private-markets / SPVs / funds / investment clubs
geography: Europe
status: current
last-updated: 2026-05-08
---

# Roundtable Research

This document synthesizes the two downloaded Roundtable research files, the
Roundtable compliance playbook, and a current public-source review of
Roundtable's product surfaces. It is practical product context for this repo,
not legal advice and not a claim that this project is affiliated with
Roundtable.

## Core Thesis

Roundtable is best understood as a private-markets operating system for Europe,
not only an SPV formation tool.

The underlying product coordinates legal vehicles, investor onboarding,
document workflows, signatures, funds movement, reporting, governance, and
community/fund operations. The public front doors are persona-specific, but the
operating core is shared.

## Primary Personas

Roundtable publicly serves these customer groups:

| Persona | Main job |
|---|---|
| Founders | Invite angels, share pitch materials, collect commitments, and keep the cap table clean through one or more SPVs. |
| Deal leads / syndicate leads | Source opportunities, pool investors, configure carry/fees, and manage closing operations. |
| Investment clubs | Build communities, define admission criteria, share opportunities, run voting/governance, and scale recurring deal flow. |
| Fund managers | Launch and operate funds with LP onboarding, capital calls, reporting, administration, and regulatory support. |
| Investors | Discover deals, commit, complete KYC/KYB, sign, wire, track documents, and manage liquidity options. |
| Family offices / professional investors | Delegate operations, invest through entities, and use professional private-market structures. |
| Private banks / investment funds | Offer or administer private-market access through a regulated infrastructure layer. |

Repo implication: avoid making "founder SPV dashboard" the only durable
product frame. The architecture should support deals, clubs, funds, LPs,
investors, and professional delegation.

## Public Product Surfaces

### Founder Fundraising

The founder flow is the cleanest first product slice:

1. Create a deal page.
2. Invite investors.
3. Share pitch and deal materials.
4. Track viewed, committed, signed, and wired states.
5. Collect KYC/KYB and required investor data.
6. Generate and sign SPV documents.
7. Reconcile payments.
8. Close the SPV and invest into the company.

Expected product objects:

- deal
- target company
- deal lead
- investor invitation
- investor commitment
- KYC/KYB profile
- document pack
- signature package
- wire/payment record
- SPV vehicle
- closing file

### Investor Experience

The investor flow has a specific operational sequence:

1. Commit to the deal from the deal page.
2. Complete KYC or KYB.
3. Wait for approval and closing readiness.
4. Sign subscription/SPV documents.
5. Wire funds.
6. Receive final investment documentation.
7. Track the investment and later liquidity/exit options.

Important states:

- invited
- reviewing
- committed
- KYC/KYB pending
- approved
- signed
- wired
- documented
- exited or transferred

### Investment Clubs

Investment clubs add a community layer above deal execution:

- club profile
- branding and investment thesis
- public/private admission model
- member invitations and applications
- access/privacy settings
- in-app discussion tied to deals
- targeted emails or external channel links
- voting and governance
- deal history
- carried interest and entry fee configuration
- differentiated carry by investor

Repo implication: community membership should not be collapsed into investor
commitments. A member can exist before any deal commitment.

### Fund Managers

The fund-manager surface is broader than SPV operations. Roundtable publicly
describes fund workflows that include:

- fund design and investment thesis
- LP onboarding
- KYC/AML
- legal document generation
- e-signatures
- equalization fee calculation
- capital calls
- fund incorporation
- bank/depositary, central administration, transfer agency
- portfolio investments
- valuations and audit support
- distributions
- investor reports
- authority/regulatory reporting
- co-investment SPV management

Repo implication: keep `FundId` distinct from `SpvId`, and do not force fund
operations into the SPV lifecycle model.

### Investor Portfolio And Liquidity

Roundtable markets liquidity options for SPV co-investors. Public materials
describe two broad cases:

- an investor finds a buyer for their SPV shares, subject to process checks
- the SPV receives a purchase offer for the target shares and investors may exit
  proportionally

Expected control points:

- transfer request
- buyer KYC/KYB
- founder/target non-opposition or approval where required
- price and sale agreement outside or adjacent to platform scope
- proportional proceeds calculation
- tax and documentation outputs

## Vehicle Structures

Roundtable publicly states that it structures three SPV wrappers.

| Structure | Jurisdiction | Notes for product modeling |
|---|---|---|
| Luxembourg SCSp | Luxembourg | No legal personality, segregated assets, fiscally transparent under Luxembourg law, limited liability for investors, familiar for cross-border private-market structures. |
| French SC | France | Legal personality, fiscally translucid under French tax rules, potential foreign tax complexity, investor liability differs materially from SAS/SCSp. |
| French SAS | France | Legal personality, generally tax opaque, subject to corporate income tax, limited liability, some French tax benefits may be available depending on underlying investment. |

Practical domain type:

```ts
export type VehicleStructure =
  | 'luxembourg_scsp'
  | 'french_sc'
  | 'french_sas'
```

Do not encode tax conclusions in UI components. Vehicle-specific warnings and
eligibility rules belong in domain/application configuration and must be
reviewed as product/legal policy.

## Instruments And Assets

Roundtable operates across private-market assets, with public emphasis on:

- venture capital
- private equity
- real estate
- other alternative/private assets

The SPV or fund may invest through:

- equity instruments
- convertible instruments
- secondary share purchases
- fund interests
- other deal-specific private-market instruments

Practical domain type:

```ts
export type InvestmentInstrument =
  | 'equity'
  | 'convertible'
  | 'safe'
  | 'fund_interest'
  | 'secondary_share_purchase'
  | 'other_private_market_asset'
```

## Compliance And Control Families

The compliance playbook identifies the operating controls that matter for a
Roundtable-like SPV launch:

- AML/CFT controls
- sanctions screening
- politically exposed person screening
- adverse-media screening
- beneficial ownership checks
- source-of-funds/source-of-wealth review
- investor eligibility and qualification
- marketing/private-placement perimeter
- jurisdiction and wrapper selection
- service-provider ownership map
- disclosure pack versioning
- e-signature authority
- payment reconciliation
- closing memo and audit file
- post-close monitoring and transfer checks

Practical statuses:

```ts
export type ComplianceRiskRating = 'low' | 'standard' | 'enhanced'

export type ScreeningStatus =
  | 'not_started'
  | 'pending'
  | 'clear'
  | 'hit_unresolved'
  | 'rejected'

export type ApprovalStatus =
  | 'not_requested'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'escalated'
```

## Funds Flow

Roundtable's public flow separates investor commitment, signature, wire, SPV
registration, and final investment into the target.

Important product distinctions:

- committed amount is not the same as signed amount
- signed amount is not the same as received cash
- received cash is not fully reconciled until payer/subscriber checks pass
- SPV registration/incorporation is separate from wiring funds to the target
- final investor documentation arrives after completion

Practical payment statuses:

```ts
export type PaymentStatus =
  | 'not_requested'
  | 'instructions_released'
  | 'pending'
  | 'received'
  | 'matched'
  | 'exception_pending'
  | 'refunded'
```

## Accounting And Reporting

Roundtable's public help docs describe SPV annual accounts around:

- participating interests / participations
- deferred charges for prepaid administration fees
- cash at bank
- subscribed capital
- result for the financial year
- operating charges / management fees
- deal lead fees
- no VAT collection/payment by the SPV

Repo implication: accounting/reporting components should not reuse commitment
metrics as if they were accounting line items. Use separate data types for
fundraising state, cash movement, and financial statements.

## Current Repo Alignment

The repo already models or renders:

- exact EUR amounts through `EuroCents`
- branded deal, investor, commitment, SPV, fund, and document IDs
- investor amount step
- investor qualification step
- individual KYC and legal-entity KYB
- UBO collection
- review acknowledgements
- SPV lifecycle statuses
- commitment progress
- investor status rows
- ticket distribution
- investor status breakdown
- activity timeline
- deal terms
- a Next.js deal dashboard route

Important gaps:

- no vehicle structure model
- no instrument/asset model
- no compliance screening result model
- no risk rating or approval log
- no payment reconciliation model
- no disclosure pack version model
- no closing memo/audit file model
- no post-close transfer/liquidity model
- no fund lifecycle model
- no club/community model
- no accounting/reporting model

## Design Implications

Roundtable-like product surfaces should feel operational and high-trust:

- exact money rendering
- compact but legible records
- status and blockers always visible
- no decorative dashboards without operational decision value
- audit trails and history over ephemeral UI state
- clear distinction between commitment, signed documents, received funds, and
  reconciled funds
- mobile-capable investor flows, desktop-first operator dashboards

## Research Boundaries

This document is comprehensive enough for the current engineering case study.
It is not enough for a production regulated launch.

Still missing for production-grade accuracy:

- full legal entity/license map
- exact KYC/AML vendor behavior
- country-by-country marketing and private-placement analysis
- complete fund-law treatment
- real authenticated app inspection
- legal counsel review
- tax counsel review

Use this research to shape repo architecture and demo flows, not to make legal,
tax, or regulatory claims.
