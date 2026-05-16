import { StorySection } from '../stories/story-layout'
import { Field, FieldDescription, FieldError, FieldLabel } from './field'
import { Textarea } from './textarea'

const meta = {
  component: Textarea,
  title: 'UI/Textarea',
}

export default meta

export const Default = {
  render: () => (
    <StorySection description="Textarea keeps the same Field contract as Input." title="Default">
      <Field className="w-96">
        <FieldLabel htmlFor="story-textarea">Notes</FieldLabel>
        <Textarea id="story-textarea" placeholder="Add notes" />
        <FieldDescription>Keep this concise.</FieldDescription>
      </Field>
    </StorySection>
  ),
}

export const Invalid = {
  render: () => (
    <Field className="w-96" data-invalid="true">
      <FieldLabel htmlFor="story-textarea-invalid">Notes</FieldLabel>
      <Textarea aria-describedby="story-textarea-error" aria-invalid id="story-textarea-invalid" />
      <FieldError id="story-textarea-error">Add a note.</FieldError>
    </Field>
  ),
}
