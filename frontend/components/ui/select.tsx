'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

type SelectContextType = {
  value?: string
  onValueChange?: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextType | undefined>(undefined)

function useSelect() {
  const context = React.useContext(SelectContext)
  if (!context) {
    throw new Error('useSelect must be used within a Select component')
  }
  return context
}

const Select = ({
  value,
  onValueChange,
  children,
}: {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}) => {
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative" ref={containerRef}>
        {children}
      </div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }
>(({ className, children, ...props }, ref) => {
  const { open, setOpen } = useSelect()
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => setOpen(!open)}
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform duration-200", open && "rotate-180")} />
    </button>
  )
})
SelectTrigger.displayName = 'SelectTrigger'

const SelectValue = ({ placeholder, children }: { placeholder?: string, children?: React.ReactNode }) => {
  const { value } = useSelect()
  return <span className={cn("text-sm", !value && "text-muted-foreground")}>{children || value || placeholder}</span>
}

const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { open } = useSelect()
    if (!open) return null

    return (
      <div
        ref={ref}
        className={cn(
          'absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in zoom-in-95 duration-100',
          className
        )}
        {...props}
      >
        <div className="p-1">{children}</div>
      </div>
    )
  }
)
SelectContent.displayName = 'SelectContent'

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, children, ...props }, ref) => {
  const { onValueChange, setOpen } = useSelect()

  const handleSelect = () => {
    onValueChange?.(props.value)
    setOpen(false)
  }

  return (
    <div
      ref={ref}
      onClick={handleSelect}
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
SelectItem.displayName = 'SelectItem'

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
