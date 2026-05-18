import { Button } from '@repo/ui/components/button'
import { ChartContainer } from '@repo/ui/components/chart'
import { Checkbox } from '@repo/ui/components/checkbox'
import { DropdownMenu } from '@repo/ui/components/dropdown-menu'
import { Sheet } from '@repo/ui/components/sheet'
import { Tooltip } from '@repo/ui/components/tooltip'
import { cn } from '@repo/ui/lib/utils'
import { describe, expect, it } from 'vitest'

describe('@repo/ui package exports', () => {
  it('supports shadcn-style component and utility subpath imports', () => {
    expect(Button).toBeTypeOf('function')
    expect(ChartContainer).toBeTypeOf('function')
    expect(Checkbox).toBeTypeOf('function')
    expect(DropdownMenu).toBeTypeOf('function')
    expect(Sheet).toBeTypeOf('function')
    expect(Tooltip).toBeTypeOf('function')
    expect(cn('px-2', false, 'px-4')).toBe('px-4')
  })
})
