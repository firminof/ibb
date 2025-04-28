"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Interface genérica para trabalhar com qualquer tipo de dados
interface SearchableSelectProps<T> {
    placeholder?: string
    emptyMessage?: string
    items: T[]
    value?: string
    onChange?: (value: string) => void
    getItemValue: (item: T) => string
    getItemLabel: (item: T) => string
    className?: string
}

export function SearchableSelect<T>({
                                        placeholder = "Selecione um item...",
                                        emptyMessage = "Nenhum item encontrado.",
                                        items,
                                        value = "",
                                        onChange,
                                        getItemValue,
                                        getItemLabel,
                                        className,
                                    }: SearchableSelectProps<T>) {
    const [open, setOpen] = React.useState(false)
    const [selectedValue, setSelectedValue] = React.useState(value)
    const [searchQuery, setSearchQuery] = React.useState("")

    // Encontrar o item selecionado para exibir seu label
    const selectedItem = React.useMemo(() => {
        return items.find((item) => getItemValue(item) === selectedValue)
    }, [items, selectedValue, getItemValue])

    const selectedLabel = selectedItem ? getItemLabel(selectedItem) : ""

    // Função para lidar com a seleção de um item
    const handleSelect = React.useCallback(
        (itemLabel: string) => {
            // Encontrar o item pelo label
            const item = items.find((item) => getItemLabel(item).toLowerCase() === itemLabel.toLowerCase())

            if (item) {
                const newValue = getItemValue(item)
                setSelectedValue(newValue)
                setOpen(false)
                setSearchQuery("")

                if (onChange) {
                    onChange(newValue)
                }
            }
        },
        [items, onChange, getItemValue, getItemLabel],
    )

    // Atualizar o valor selecionado quando o prop value mudar
    React.useEffect(() => {
        if (value !== selectedValue) {
            setSelectedValue(value)
        }
    }, [value, selectedValue])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between cursor-pointer", className)}
                    onClick={() => setOpen(true)}
                >
                    <span className="truncate">{selectedLabel || placeholder}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Pesquisar por nome..."
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                        className="border-none focus:ring-0"
                    />
                    <CommandList>
                        <CommandEmpty>{emptyMessage}</CommandEmpty>
                        <CommandGroup className="max-h-60 overflow-y-auto">
                            {items
                                .filter(
                                    (item) => searchQuery === "" || getItemLabel(item).toLowerCase().includes(searchQuery.toLowerCase()),
                                )
                                .map((item) => {
                                    const itemValue = getItemValue(item)
                                    const itemLabel = getItemLabel(item)

                                    return (
                                        <CommandItem
                                            key={itemValue}
                                            value={itemLabel}
                                            onSelect={handleSelect}
                                            className="cursor-pointer aria-selected:bg-accent data-[selected=true]:bg-accent"
                                        >
                                            <Check
                                                className={cn("mr-2 h-4 w-4", selectedValue === itemValue ? "opacity-100" : "opacity-0")}
                                            />
                                            <span>{itemLabel}</span>
                                        </CommandItem>
                                    )
                                })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
