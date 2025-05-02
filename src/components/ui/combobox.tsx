
"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface ComboboxOption {
  value: string
  label: string
  group?: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyPlaceholder?: string
  className?: string
  triggerClassName?: string
  inputId?: string;
  disabled?: boolean; // Add disabled prop
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search option...",
  emptyPlaceholder = "No option found.",
  className,
  triggerClassName,
  inputId,
  disabled = false, // Default disabled to false
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  // Store the input value separately to allow typing new entries
  const [inputValue, setInputValue] = React.useState(value || "");

  React.useEffect(() => {
    // Sync input value if the external value changes
    setInputValue(value || "");
  }, [value]);


  const groupedOptions = React.useMemo(() => {
    const groups: { [key: string]: ComboboxOption[] } = {}
    options.forEach((option) => {
      const groupKey = option.group || "__default__"
      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(option)
    })
    return groups
  }, [options])

  // Find the label for the currently selected value
  const selectedLabel = options.find((option) => option.value === value)?.label || value // Fallback to value if label not found

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className={triggerClassName}>
        <Button
          id={inputId}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-labelledby={inputId ? `${inputId}-label` : undefined}
          className={cn("w-full justify-between", !value && "text-muted-foreground", className)}
          disabled={disabled} // Apply disabled prop
        >
          {/* Display the selected label or placeholder */}
           <span className="truncate">
              {value ? selectedLabel : placeholder}
           </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command
           // Filter based on the input value for dynamic search/add
           filter={(itemValue, search) => {
              // itemValue is the `value` prop of CommandItem (which we set to option.label)
              // search is the current input in CommandInput
              if (itemValue.toLowerCase().includes(search.toLowerCase())) return 1;
              return 0;
            }}
          >
          <CommandInput
             placeholder={searchPlaceholder}
             aria-label={searchPlaceholder}
             value={inputValue}
             onValueChange={setInputValue} // Update internal input state
             disabled={disabled} // Apply disabled prop
           />
          <CommandList>
            <CommandEmpty>
              {emptyPlaceholder}
              {/* Optionally, add a button/indicator to explicitly add the typed value */}
               {inputValue && !options.some(opt => opt.label.toLowerCase() === inputValue.toLowerCase()) && (
                 <CommandItem
                   key={`add-${inputValue}`}
                   value={inputValue} // Use input value for matching
                   onSelect={() => {
                     onChange(inputValue); // Set the typed value
                     setOpen(false);
                   }}
                 >
                   Add "{inputValue}"
                 </CommandItem>
               )}
            </CommandEmpty>
            {Object.entries(groupedOptions).map(([groupKey, groupOptions]) => (
              <CommandGroup key={groupKey} heading={groupKey !== "__default__" ? groupKey : undefined}>
                {groupOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label} // Search/filter based on label
                    onSelect={() => {
                      const newValue = option.value === value ? "" : option.value;
                      onChange(newValue); // Use option.value when selecting from list
                      setInputValue(newValue ? option.label : ""); // Update input field display
                      setOpen(false);
                    }}
                    disabled={disabled} // Apply disabled prop
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
