import { StorySection, StoryStack } from '../stories/story-layout'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from './field'
import { Input } from './input'

const meta = {
  component: Field,
  title: 'UI/Field',
}

export default meta

export const Group = {
  render: () => (
    <StoryStack>
      <StorySection
        description="Fields own layout and state; controls own native form props."
        title="Field group"
      >
        <FieldGroup className="w-96">
          <Field>
            <FieldLabel htmlFor="field-email">Email</FieldLabel>
            <Input id="field-email" placeholder="name@example.com" />
            <FieldDescription>Use an address you can access.</FieldDescription>
          </Field>
          <Field data-invalid="true">
            <FieldLabel htmlFor="field-code">Code</FieldLabel>
            <Input aria-describedby="field-code-error" aria-invalid id="field-code" />
            <FieldError id="field-code-error">Enter a valid code.</FieldError>
          </Field>
        </FieldGroup>
      </StorySection>
    </StoryStack>
  ),
}

export const Fieldset = {
  render: () => (
    <FieldSet className="w-96">
      <FieldLegend>Preferences</FieldLegend>
      <Field orientation="horizontal">
        <input id="field-updates" type="checkbox" />
        <FieldContent>
          <FieldLabel htmlFor="field-updates">Updates</FieldLabel>
          <FieldDescription>Receive occasional updates.</FieldDescription>
        </FieldContent>
      </Field>
      <Field>
        <FieldTitle>Summary</FieldTitle>
        <FieldDescription>Use field titles for non-control descriptions.</FieldDescription>
      </Field>
    </FieldSet>
  ),
}
