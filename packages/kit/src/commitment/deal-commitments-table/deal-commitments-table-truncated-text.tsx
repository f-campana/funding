import { cn, Tooltip, TooltipContent, TooltipTrigger } from '@repo/ui'

export const TruncatedText = ({
  children,
  className,
  fullText,
}: {
  readonly children: string
  readonly className?: string
  readonly fullText?: string | undefined
}) => {
  const tooltipText = fullText ?? children
  const shouldRevealOnFocus = fullText !== undefined

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            'block min-w-0 max-w-full truncate rounded-[2px]',
            shouldRevealOnFocus
              ? 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background'
              : null,
            className,
          )}
          data-full-text={tooltipText}
          data-keyboard-tooltip={shouldRevealOnFocus ? 'true' : 'false'}
          tabIndex={shouldRevealOnFocus ? 0 : undefined}
        >
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent>{tooltipText}</TooltipContent>
    </Tooltip>
  )
}
