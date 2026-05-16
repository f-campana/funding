import { StorySection } from '../stories/story-layout'
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

const meta = {
  component: Table,
  title: 'UI/Table',
}

export default meta

export const Default = {
  render: () => (
    <StorySection
      className="w-[42rem]"
      description="Table primitives preserve native table semantics."
      title="Structured records"
    >
      <Table>
        <TableCaption>Example records</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Owner</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Alpha</TableCell>
            <TableCell>Ready</TableCell>
            <TableCell>Team</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Beta</TableCell>
            <TableCell>Draft</TableCell>
            <TableCell>Ops</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2}>Total</TableCell>
            <TableCell>2</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </StorySection>
  ),
}
