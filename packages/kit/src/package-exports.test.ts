import * as Kit from '@repo/kit'
import {
  DealCommitmentInspector,
  DealCommitmentInspectorHeader,
  DealCommitmentInspectorReadiness,
  DealCommitmentInspectorRoot,
} from '@repo/kit/deal-commitment-inspector'
import {
  DealCommitmentsTable,
  DealCommitmentsTableBody,
  DealCommitmentsTableColumnGroup,
  DealCommitmentsTableContent,
  DealCommitmentsTableDetail,
  DealCommitmentsTableExportButton,
  DealCommitmentsTableFilters,
  DealCommitmentsTableFooter,
  DealCommitmentsTableFooterControls,
  DealCommitmentsTableFooterRoot,
  DealCommitmentsTableGrid,
  DealCommitmentsTableGridRoot,
  DealCommitmentsTableHeader,
  DealCommitmentsTableModel,
  DealCommitmentsTableRoot,
  DealCommitmentsTableRowActionButton,
  DealCommitmentsTableSearch,
  DealCommitmentsTableToolbar,
  DealCommitmentsTableToolbarControls,
  DealCommitmentsTableToolbarRoot,
} from '@repo/kit/deal-commitments-table'
import {
  DealDocumentsEvidence,
  DealDocumentsEvidenceDocument,
  DealDocumentsEvidenceGroups,
  DealDocumentsEvidenceHeader,
  DealDocumentsEvidenceRoot,
  DealDocumentsEvidenceSummarySection,
} from '@repo/kit/deal-documents-evidence'
import {
  DealOperationalOverview,
  DealOperationalOverviewHeader,
  DealOperationalOverviewPrimaryGrid,
  DealOperationalOverviewReadiness,
  DealOperationalOverviewRoot,
} from '@repo/kit/deal-operational-overview'
import {
  DealProgressPanel,
  DealProgressPanelActions,
  DealProgressPanelCapital,
  DealProgressPanelHeader,
  DealProgressPanelRoot,
} from '@repo/kit/deal-progress-panel'
import { describe, expect, it } from 'vitest'

describe('@repo/kit package exports', () => {
  it('exports only the accepted baseline component set', () => {
    expect(Kit.DealCommitmentInspector).toBeTypeOf('function')
    expect(Kit.DealCommitmentsTable).toBeTypeOf('function')
    expect(Kit.DealDocumentsEvidence).toBeTypeOf('function')
    expect(Kit.DealOperationalOverview).toBeTypeOf('function')
    expect(Kit.DealProgressPanel).toBeTypeOf('function')
    expect(Object.keys(Kit).sort()).toEqual([
      'DealCommitmentInspector',
      'DealCommitmentsTable',
      'DealDocumentsEvidence',
      'DealOperationalOverview',
      'DealProgressPanel',
    ])
  })

  it('does not export the removed bootstrap placeholder', () => {
    expect('KitPlaceholder' in Kit).toBe(false)
  })

  it('does not export fixture data from the root', () => {
    expect('northstarDealFixture' in Kit).toBe(false)
    expect('northstarInvestorOperationsRecords' in Kit).toBe(false)
  })

  it('supports granular accepted surface subpath imports', () => {
    expect(DealCommitmentInspector).toBeTypeOf('function')
    expect(DealCommitmentInspectorRoot).toBeTypeOf('function')
    expect(DealCommitmentInspectorHeader).toBeTypeOf('function')
    expect(DealCommitmentInspectorReadiness).toBeTypeOf('function')
    expect(DealCommitmentsTable).toBeTypeOf('function')
    expect(DealCommitmentsTableRoot).toBeTypeOf('function')
    expect(DealCommitmentsTableContent).toBeTypeOf('function')
    expect(DealCommitmentsTableDetail).toBeTypeOf('function')
    expect(DealCommitmentsTableToolbar).toBeTypeOf('function')
    expect(DealCommitmentsTableToolbarRoot).toBeTypeOf('function')
    expect(DealCommitmentsTableToolbarControls).toBeTypeOf('function')
    expect(DealCommitmentsTableSearch).toBeTypeOf('function')
    expect(DealCommitmentsTableExportButton).toBeTypeOf('function')
    expect(DealCommitmentsTableFilters).toBeTypeOf('function')
    expect(DealCommitmentsTableGrid).toBeTypeOf('function')
    expect(DealCommitmentsTableGridRoot).toBeTypeOf('function')
    expect(DealCommitmentsTableColumnGroup).toBeTypeOf('function')
    expect(DealCommitmentsTableHeader).toBeTypeOf('function')
    expect(DealCommitmentsTableBody).toBeTypeOf('function')
    expect(DealCommitmentsTableModel).toBeTypeOf('function')
    expect(DealCommitmentsTableFooter).toBeTypeOf('function')
    expect(DealCommitmentsTableFooterRoot).toBeTypeOf('function')
    expect(DealCommitmentsTableFooterControls).toBeTypeOf('function')
    expect(DealCommitmentsTableRowActionButton).toBeTypeOf('function')
    expect(DealDocumentsEvidence).toBeTypeOf('function')
    expect(DealDocumentsEvidenceRoot).toBeTypeOf('function')
    expect(DealDocumentsEvidenceHeader).toBeTypeOf('function')
    expect(DealDocumentsEvidenceSummarySection).toBeTypeOf('function')
    expect(DealDocumentsEvidenceGroups).toBeTypeOf('function')
    expect(DealDocumentsEvidenceDocument).toBeTypeOf('function')
    expect(DealOperationalOverview).toBeTypeOf('function')
    expect(DealOperationalOverviewRoot).toBeTypeOf('function')
    expect(DealOperationalOverviewHeader).toBeTypeOf('function')
    expect(DealOperationalOverviewPrimaryGrid).toBeTypeOf('function')
    expect(DealOperationalOverviewReadiness).toBeTypeOf('function')
    expect(DealProgressPanel).toBeTypeOf('function')
    expect(DealProgressPanelRoot).toBeTypeOf('function')
    expect(DealProgressPanelHeader).toBeTypeOf('function')
    expect(DealProgressPanelCapital).toBeTypeOf('function')
    expect(DealProgressPanelActions).toBeTypeOf('function')
  })
})
