import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"

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

interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onSelect: (value: string) => void
  onCreateNew?: (value: string) => Promise<void>
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  createNewText?: string
  className?: string
  disabled?: boolean
}

export function Combobox({
  options,
  value,
  onSelect,
  onCreateNew,
  placeholder = "Selecione uma opção...",
  searchPlaceholder = "Buscar...",
  emptyText = "Nenhuma opção encontrada.",
  createNewText = "Criar novo",
  className,
  disabled = false
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  const selectedOption = options.find((option) => option.value === value)

  const handleSelect = (optionValue: string) => {
    onSelect(optionValue === value ? "" : optionValue)
    setOpen(false)
    setSearchValue("")
  }

  const handleCreateNew = async () => {
    if (!onCreateNew || !searchValue.trim()) return
    
    try {
      await onCreateNew(searchValue.trim())
      setOpen(false)
      setSearchValue("")
    } catch (error) {
      console.error("Error creating new option:", error)
    }
  }

  // Determinar se deve mostrar opção de criar novo
  const showCreateOption = React.useMemo(() => {
    return onCreateNew && 
      searchValue.trim() && 
      !options.some(option => 
        option.label.toLowerCase() === searchValue.toLowerCase()
      )
  }, [onCreateNew, searchValue, options])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder={searchPlaceholder}
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options
                .filter((option) =>
                  option.label.toLowerCase().includes(searchValue.toLowerCase())
                )
                .map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleSelect(option.value)}
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
              {showCreateOption && (
                <CommandItem 
                  value={`create-new-${searchValue}`}
                  onSelect={handleCreateNew}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {createNewText}: "{searchValue}"
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 