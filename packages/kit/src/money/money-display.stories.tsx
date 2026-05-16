import { euroCentsFromMinorUnits } from '@repo/domain'

import { StoryRow, StorySection, StoryStack } from '../stories/story-layout'
import { MoneyDisplay } from './money-display'

const meta = {
  component: MoneyDisplay,
  title: 'Kit/MoneyDisplay',
}

export default meta

const amount = euroCentsFromMinorUnits(1_234_567n)

export const Locales = {
  render: () => (
    <StoryStack>
      <StorySection
        description="Money stays exact while locale and currency display are presentation inputs."
        title="Locale formatting"
      >
        <StoryRow>
          <MoneyDisplay amount={amount} />
          <MoneyDisplay amount={amount} locale="en-US" />
          <MoneyDisplay amount={amount} currencyDisplay="code" />
        </StoryRow>
      </StorySection>
    </StoryStack>
  ),
}

export const Fallback = {
  render: () => (
    <MoneyDisplay
      amount={euroCentsFromMinorUnits(BigInt(Number.MAX_SAFE_INTEGER) + 1n)}
      fallback="Unavailable"
    />
  ),
}
