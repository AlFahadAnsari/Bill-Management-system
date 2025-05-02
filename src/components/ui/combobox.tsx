
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
  allowCustomValue?: boolean; // Allow typing custom values
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
  disabled = false,
  allowCustomValue = false, // Default to false
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  // Store the input value separately to allow typing new entries if allowCustomValue is true
  const [inputValue, setInputValue] = React.useState("");

  // Find the label for the currently selected value to display in the trigger
  const selectedOption = options.find((option) => option.value === value);
  const displayLabel = selectedOption?.label || (allowCustomValue && value ? value : placeholder); // Show value if custom/not found

  React.useEffect(() => {
    // Sync input value with external value when popover opens or value changes externally
     if (value) {
       setInputValue(selectedOption?.label || (allowCustomValue ? value : ""));
     } else {
       setInputValue("");
     }
  }, [value, selectedOption, allowCustomValue, open]);


  const groupedOptions = React.useMemo(() => {
    const groups: { [key: string]: ComboboxOption[] } = {}
    options.forEach((option) => {
      const groupKey = option.group || "__default__"
      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(option)
    })
    // Sort groups if needed, e.g., Object.keys(groups).sort()...
    return groups
  }, [options])


  // Handle selection from the list or adding a custom value
  const handleSelect = (currentValue: string) => {
    // currentValue here is the `value` prop from CommandItem (option.value or inputValue)
    onChange(currentValue);
    setOpen(false);
    // Update input display to the selected label or the custom value
    const selectedOpt = options.find(opt => opt.value === currentValue);
    setInputValue(selectedOpt?.label || (allowCustomValue ? currentValue : ""));
  };


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
           <span className="truncate">
              {displayLabel}
           </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command
           // Filter based on the *label* for better user experience
           filter={(itemValue, search) => {
              // itemValue is the `value` prop of CommandItem (option.label)
              // search is the current input in CommandInput
              const label = options.find(opt => opt.value === itemValue)?.label || itemValue;
              if (label.toLowerCase().includes(search.toLowerCase())) return 1;
              return 0;
            }}
          >
          <CommandInput
             placeholder={searchPlaceholder}
             aria-label={searchPlaceholder}
             value={inputValue}
             onValueChange={(search) => {
                setInputValue(search);
                // If allowing custom values, immediately update the external state
                // This might be too aggressive depending on use case, adjust if needed
                if (allowCustomValue) {
                  onChange(search);
                }
              }}
             disabled={disabled} // Apply disabled prop
           />
          <CommandList>
            <CommandEmpty>
              {emptyPlaceholder}
              {/* Show option to add custom value if allowed and input is not empty and doesn't match existing option */}
               {allowCustomValue && inputValue && !options.some(opt => opt.label.toLowerCase() === inputValue.toLowerCase() || opt.value.toLowerCase() === inputValue.toLowerCase()) && (
                 <CommandItem
                   key={`add-${inputValue}`}
                   value={inputValue} // Use input value for the 'add' item's value
                   onSelect={() => handleSelect(inputValue)}
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
                    value={option.value} // Use option.value for selection logic
                    onSelect={() => handleSelect(option.value)}
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

    