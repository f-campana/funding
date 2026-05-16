import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from '../test/axe'

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from './table'

const renderTable = () =>
  render(
    <Table>
      <TableCaption>Example records</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Alpha</TableCell>
          <TableCell>Ready</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>Total</TableCell>
          <TableCell>1</TableCell>
        </TableRow>
      </TableFooter>
    </Table>,
  )

describe('Table primitives', () => {
  it('preserves table semantics and stable slots', () => {
    const { container } = renderTable()

    expect(screen.getByRole('table', { name: 'Example records' })).toHaveAttribute(
      'data-slot',
      'table',
    )
    expect(screen.getByRole('columnheader', { name: 'Item' })).toHaveAttribute(
      'data-slot',
      'table-head',
    )
    expect(screen.getByRole('cell', { name: 'Alpha' })).toHaveAttribute('data-slot', 'table-cell')
    expect(container.querySelector('[data-slot="table-container"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="table-caption"]')).toHaveTextContent(
      'Example records',
    )
    expect(container.querySelector('[data-slot="table-footer"]')).toBeInTheDocument()
  })

  it('has no accessibility violations with headers, rows, and caption', async () => {
    const { container } = renderTable()

    expect((await axe(container)).violations).toHaveLength(0)
  })
})
