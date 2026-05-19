import { describe, expect, it } from 'vitest'

import { euroCentsToMinorUnits } from '../money'
import {
  getKybOperationalStatusLabel,
  getKybOperationalStatusTone,
  getKycOperationalStatusLabel,
  getKycOperationalStatusTone,
  getSignatureOperationalStatusLabel,
  getSignatureOperationalStatusTone,
  getWireOperationalStatusLabel,
  getWireOperationalStatusTone,
  InvestorOperationsRecordSchema,
  KYC_OPERATIONAL_STATUSES,
  KybOperationalStatusSchema,
  KycOperationalStatusSchema,
  SIGNATURE_OPERATIONAL_STATUSES,
  SignatureOperationalStatusSchema,
  validateCommitmentOperationalSnapshot,
  WIRE_OPERATIONAL_STATUSES,
  WireOperationalStatusSchema,
} from './investor-operations'

const validRecord = {
  blockerIds: ['kyc-proof'],
  commitmentAmountCents: 250_000_00,
  commitmentStatus: 'wire_received',
  id: 'investor-1',
  investorEmail: 'camille@example.com',
  investorName: 'Camille Moreau',
  kycStatus: 'approved',
  lastActivityAt: '2026-05-10T09:30:00.000Z',
  signatureStatus: 'completed',
  wireStatus: 'received',
}

describe('investor operations schemas', () => {
  it('parses every operational status value', () => {
    for (const status of KYC_OPERATIONAL_STATUSES) {
      expect(KycOperationalStatusSchema.parse(status)).toBe(status)
      expect(KybOperationalStatusSchema.parse(status)).toBe(status)
    }

    for (const status of SIGNATURE_OPERATIONAL_STATUSES) {
      expect(SignatureOperationalStatusSchema.parse(status)).toBe(status)
    }

    for (const status of WIRE_OPERATIONAL_STATUSES) {
      expect(WireOperationalStatusSchema.parse(status)).toBe(status)
    }
  })

  it('brands JSON-safe commitment amount inputs', () => {
    const parsed = InvestorOperationsRecordSchema.safeParse(validRecord)

    expect(parsed.success).toBe(true)

    if (!parsed.success) {
      throw new Error('expected valid investor operations record')
    }

    expect(euroCentsToMinorUnits(parsed.data.commitmentAmountCents)).toBe(250_000_00n)
    expect(parsed.data.blockerIds).toEqual(['kyc-proof'])
  })

  it('rejects invalid statuses, empty text, invalid emails, and negative money', () => {
    expect(
      InvestorOperationsRecordSchema.safeParse({ ...validRecord, wireStatus: 'cleared' }).success,
    ).toBe(false)
    expect(
      InvestorOperationsRecordSchema.safeParse({ ...validRecord, investorName: ' ' }).success,
    ).toBe(false)
    expect(
      InvestorOperationsRecordSchema.safeParse({ ...validRecord, investorEmail: 'not-email' })
        .success,
    ).toBe(false)
    expect(
      InvestorOperationsRecordSchema.safeParse({ ...validRecord, commitmentAmountCents: -1 })
        .success,
    ).toBe(false)
  })
})

describe('commitment operational snapshot validation', () => {
  it('accepts coherent lifecycle, signature, and wire status axes', () => {
    expect(
      validateCommitmentOperationalSnapshot({
        commitmentStatus: 'wire_received',
        signatureStatus: 'completed',
        wireStatus: 'received',
      }).isOk(),
    ).toBe(true)
    expect(
      validateCommitmentOperationalSnapshot({
        commitmentStatus: 'signature_sent',
        signatureStatus: 'sent',
        wireStatus: 'not_requested',
      }).isOk(),
    ).toBe(true)
    expect(
      validateCommitmentOperationalSnapshot({
        commitmentStatus: 'wire_received',
        signatureStatus: 'completed',
        wireStatus: 'unmatched',
      }).isOk(),
    ).toBe(true)
  })

  it('rejects impossible lifecycle drift across signature and wire axes', () => {
    expect(
      validateCommitmentOperationalSnapshot({
        commitmentStatus: 'active',
        signatureStatus: 'not_sent',
        wireStatus: 'not_requested',
      }),
    ).toMatchObject({
      error: {
        _tag: 'SignatureLifecycleMismatch',
      },
    })
    expect(
      validateCommitmentOperationalSnapshot({
        commitmentStatus: 'wire_received',
        signatureStatus: 'completed',
        wireStatus: 'pending',
      }),
    ).toMatchObject({
      error: {
        _tag: 'WireLifecycleMismatch',
      },
    })
    expect(
      validateCommitmentOperationalSnapshot({
        commitmentStatus: 'active',
        signatureStatus: 'completed',
        wireStatus: 'matched',
      }),
    ).toMatchObject({
      error: {
        _tag: 'WireLifecycleMismatch',
      },
    })
  })
})

describe('investor operational status labels and tones', () => {
  it('maps KYC and KYB statuses exhaustively', () => {
    for (const status of KYC_OPERATIONAL_STATUSES) {
      expect(getKycOperationalStatusLabel(status)).not.toHaveLength(0)
      expect(getKybOperationalStatusLabel(status)).not.toHaveLength(0)
      expect(getKycOperationalStatusTone(status)).not.toHaveLength(0)
      expect(getKybOperationalStatusTone(status)).not.toHaveLength(0)
    }

    expect(getKycOperationalStatusTone('blocked')).toBe('danger')
    expect(getKycOperationalStatusTone('pending_review')).toBe('pending')
  })

  it('maps signature statuses exhaustively', () => {
    for (const status of SIGNATURE_OPERATIONAL_STATUSES) {
      expect(getSignatureOperationalStatusLabel(status)).not.toHaveLength(0)
      expect(getSignatureOperationalStatusTone(status)).not.toHaveLength(0)
    }

    expect(getSignatureOperationalStatusTone('part_signed')).toBe('attention')
    expect(getSignatureOperationalStatusTone('completed')).toBe('success')
  })

  it('maps wire statuses exhaustively', () => {
    for (const status of WIRE_OPERATIONAL_STATUSES) {
      expect(getWireOperationalStatusLabel(status)).not.toHaveLength(0)
      expect(getWireOperationalStatusTone(status)).not.toHaveLength(0)
    }

    expect(getWireOperationalStatusTone('unmatched')).toBe('danger')
    expect(getWireOperationalStatusTone('reconciled')).toBe('success')
  })
})
