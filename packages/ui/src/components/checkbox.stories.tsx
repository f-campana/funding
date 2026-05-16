import { StorySection, StoryStack } from '../stories/story-layout'
import { Checkbox } from './checkbox'
import { Field, FieldDescription, FieldLabel } from './field'

const meta = {
  component: Checkbox,
  title: 'UI/Checkbox',
}

export default meta

export const Default = {
  render: () => (
    <StorySection description="Checkboxes preserve accessible label association." title="Checkbox">
      <StoryStack className="max-w-md">
        <Field orientation="horizontal">
          <Checkbox id="checkbox-updates" />
          <div className="grid gap-1.5">
            <FieldLabel htmlFor="checkbox-updates">Enable updates</FieldLabel>
            <FieldDescription>Receive changes for selected records.</FieldDescription>
          </div>
        </Field>
        <Field data-disabled="true" orientation="horizontal">
          <Checkbox disabled id="checkbox-disabled" />
          <FieldLabel htmlFor="checkbox-disabled">Disabled option</FieldLabel>
        </Field>
      </StoryStack>
    </StorySection>
  ),
}

export const Checked = {
  render: () => (
    <StorySection title="Checked checkbox">
      <Field orientation="horizontal">
        <Checkbox defaultChecked id="checkbox-checked" />
        <FieldLabel htmlFor="checkbox-checked">Selected</FieldLabel>
      </Field>
    </StorySection>
  ),
}
