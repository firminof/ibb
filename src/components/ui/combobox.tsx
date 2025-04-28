"use client"

import * as React from "react"
import {Check, ChevronsUpDown} from "lucide-react"

import {cn} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"

export interface ComboboxOption {
    value: string
    label: string
}

interface ComboboxProps {
    options: ComboboxOption[]
    value?: string
    onValueChange?: (value: string) => void
    placeholder?: string
    emptyMessage?: string
    searchPlaceholder?: string
    className?: string
    disabled?: boolean
}

export function Combobox({
                             options,
                             value,
                             onValueChange,
                             placeholder = "Selecione uma opção",
                             emptyMessage = "Nenhum item encontrado.",
                             searchPlaceholder = "Pesquisar...",
                             className,
                             disabled = false,
                         }: ComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState("")

    const selectedOption = React.useMemo(() => {
        return options.find((option) => option.value === value)
    }, [value, options])

    const optionsFiltered = options.filter((option) => option.label.toLowerCase().includes(search.toLowerCase()))

    React.useEffect(() => {
        console.log("Termo de pesquisa:", search)
        console.log(
            "Opções filtradas:",
            optionsFiltered,
        )
    }, [search, options, optionsFiltered])

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
                    {value && selectedOption ? selectedOption.label : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="start" side="bottom">
                <Command>
                    <CommandInput
                        placeholder={searchPlaceholder}
                        value={search}
                        onValueChange={setSearch}
                        className="border-none focus:ring-0"
                    />
                    <CommandList>
                        <CommandEmpty>{emptyMessage}</CommandEmpty>
                        <CommandGroup className="max-h-60 overflow-y-auto">
                            {optionsFiltered
                                .filter((option) => {
                                    if (!search.trim()) return true
                                    return option.label.toLowerCase().includes(search.toLowerCase())
                                })
                                .map((option) => (
                                    <CommandItem
                                        key={option.value}
                                        value={option.value}
                                        onSelect={(currentValue) => {
                                            onValueChange?.(currentValue)
                                            setOpen(false)
                                        }}
                                    >
                                        <Check
                                            className={cn("mr-2 h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")}/>
                                        {option.label}
                                    </CommandItem>
                                ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
