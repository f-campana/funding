import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from '../test/axe'

import { Button } from './button'
import {
  Sheet,
  SheetClose,
  SheetCloseButton,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet'

const renderOpenSheet = (side?: 'top' | 'right' | 'bottom' | 'left') => {
  const contentProps = side === undefined ? {} : { side }

  return render(
    <Sheet open>
      <SheetContent {...contentProps}>
        <SheetHeader>
          <SheetTitle>Panel title</SheetTitle>
          <SheetDescription>Panel supporting description.</SheetDescription>
        </SheetHeader>
        <p>Panel content</p>
        <SheetCloseButton />
      </SheetContent>
    </Sheet>,
  )
}

describe('Sheet', () => {
  it('renders a trigger and opens content', async () => {
    const user = userEvent.setup()

    render(
      <Sheet>
        <SheetTrigger asChild>
          <Button>Open panel</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Panel title</SheetTitle>
            <SheetDescription>Panel supporting description.</SheetDescription>
          </SheetHeader>
          <p>Panel content</p>
        </SheetContent>
      </Sheet>,
    )

    await user.click(screen.getByRole('button', { name: 'Open panel' }))

    expect(screen.getByRole('dialog', { name: 'Panel title' })).toBeVisible()
    expect(screen.getByText('Panel content')).toBeVisible()
    expect(document.querySelector('[data-slot="sheet-overlay"]')).toBeInTheDocument()
  })

  it('uses title and description for dialog semantics', () => {
    renderOpenSheet()

    const dialog = screen.getByRole('dialog', { name: 'Panel title' })

    expect(dialog).toHaveAccessibleDescription('Panel supporting description.')
    expect(dialog).toHaveAttribute('data-side', 'right')
    expect(screen.getByText('Panel title')).toBeVisible()
    expect(screen.getByText('Panel supporting description.')).toBeVisible()
  })

  it('closes with SheetClose and Escape', async () => {
    const user = userEvent.setup()

    render(
      <Sheet>
        <SheetTrigger asChild>
          <Button>Open panel</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Closable panel</SheetTitle>
            <SheetDescription>Can be dismissed.</SheetDescription>
          </SheetHeader>
          <SheetFooter>
            <SheetClose asChild>
              <Button>Dismiss</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>,
    )

    await user.click(screen.getByRole('button', { name: 'Open panel' }))
    await user.click(screen.getByRole('button', { name: 'Dismiss' }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Closable panel' })).not.toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Open panel' }))
    await user.keyboard('{Escape}')

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Closable panel' })).not.toBeInTheDocument()
    })
  })

  it('renders a composed accessible close button', () => {
    renderOpenSheet()

    expect(screen.getByRole('button', { name: 'Close' })).toHaveClass(
      'focus-visible:ring-2',
      'focus-visible:ring-ring',
    )
  })

  it('calls onOpenChange in controlled mode', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    render(
      <Sheet onOpenChange={onOpenChange} open={false}>
        <SheetTrigger asChild>
          <Button>Open panel</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Controlled panel</SheetTitle>
            <SheetDescription>Controlled description.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    )

    await user.click(screen.getByRole('button', { name: 'Open panel' }))

    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it.each([
    ['top', ['top-0', 'left-0', 'right-0', 'w-full', 'border-b']],
    ['right', ['right-0', 'top-0', 'h-full', 'w-full', 'max-w-md', 'border-l']],
    ['bottom', ['bottom-0', 'left-0', 'right-0', 'w-full', 'border-t']],
    ['left', ['left-0', 'top-0', 'h-full', 'w-full', 'max-w-md', 'border-r']],
  ] as const)('applies %s side placement classes', (side, expectedClasses) => {
    renderOpenSheet(side)

    const dialog = screen.getByRole('dialog', { name: 'Panel title' })

    expect(dialog).toHaveAttribute('data-side', side)
    expect(dialog).toHaveClass(...expectedClasses)
  })

  it('has no accessibility violations in an open sheet', async () => {
    const { baseElement } = render(
      <Sheet open>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Accessible panel</SheetTitle>
            <SheetDescription>Useful supporting copy.</SheetDescription>
          </SheetHeader>
          <p>Accessible content.</p>
          <SheetCloseButton />
        </SheetContent>
      </Sheet>,
    )

    expect((await axe(baseElement)).violations).toHaveLength(0)
  })
})
