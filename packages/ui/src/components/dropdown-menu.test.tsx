import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from '../test/axe'

import { Button } from './button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu'

describe('DropdownMenu', () => {
  it('opens a menu and invokes item handlers', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>Open menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={onSelect}>Export</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )

    await user.click(screen.getByRole('button', { name: 'Open menu' }))
    await user.click(screen.getByRole('menuitem', { name: 'Export' }))

    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('supports checkbox menu items', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()

    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>Filters</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked={false} onCheckedChange={onCheckedChange}>
            Needs attention
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )

    await user.click(screen.getByRole('button', { name: 'Filters' }))
    await user.click(screen.getByRole('menuitemcheckbox', { name: 'Needs attention' }))

    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('uses pointer affordance for enabled triggers and menu items', () => {
    const onDisabledSelect = vi.fn()

    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Export</DropdownMenuItem>
          <DropdownMenuItem disabled onSelect={onDisabledSelect}>
            Disabled export
          </DropdownMenuItem>
          <DropdownMenuCheckboxItem checked={false}>Needs attention</DropdownMenuCheckboxItem>
          <DropdownMenuRadioGroup value="8">
            <DropdownMenuRadioItem value="8">8 rows</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    )

    expect(screen.getByText('Open menu').closest('button')).toHaveClass('cursor-pointer')
    expect(screen.getByRole('menuitem', { name: 'Export' })).toHaveClass('cursor-pointer')
    expect(screen.getByRole('menuitem', { name: 'Disabled export' })).toHaveClass(
      'data-[disabled]:cursor-not-allowed',
    )
    expect(screen.getByRole('menuitemcheckbox', { name: 'Needs attention' })).toHaveClass(
      'cursor-pointer',
    )
    expect(screen.getByRole('menuitemradio', { name: '8 rows' })).toHaveClass('cursor-pointer')

    fireEvent.click(screen.getByRole('menuitem', { name: 'Disabled export' }))
    expect(onDisabledSelect).not.toHaveBeenCalled()
  })

  it('has no accessibility violations in an open menu', async () => {
    const { container } = render(
      <DropdownMenu open>
        <DropdownMenuTrigger asChild>
          <Button>Filters</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked={true}>Complete</DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )

    expect((await axe(container)).violations).toHaveLength(0)
  })
})
