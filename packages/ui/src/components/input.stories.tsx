import { StoryGrid, StorySection } from '../stories/story-layout'
import { Field, FieldDescription, FieldError, FieldLabel } from './field'
import { Input } from './input'

const meta = {
  component: Input,
  title: 'UI/Input',
}

export default meta

export const Default = {
  render: () => (
    <StorySection description="Inputs rely on Field for labels and descriptions." title="Default">
      <Field className="w-80">
        <FieldLabel htmlFor="story-input">Name</FieldLabel>
        <Input id="story-input" placeholder="Enter text" />
        <FieldDescription>Use a short label.</FieldDescription>
      </Field>
    </StorySection>
  ),
}

export const Invalid = {
  render: () => (
    <Field className="w-80" data-invalid="true">
      <FieldLabel htmlFor="story-input-invalid">Name</FieldLabel>
      <Input aria-describedby="story-input-error" aria-invalid id="story-input-invalid" />
      <FieldError id="story-input-error">Enter a value.</FieldError>
    </Field>
  ),
}

export const Disabled = {
  render: () => (
    <StoryGrid className="w-80">
      <Input disabled placeholder="Disabled" />
      <Input placeholder="Enabled" />
    </StoryGrid>
  ),
}
