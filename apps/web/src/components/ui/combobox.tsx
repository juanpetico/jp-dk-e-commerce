"use client"

import * as React from "react"
import { Check, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverAnchor,
} from "@/components/ui/popover"

type ComboboxContextType = {
    value: string;
    onValueChange: (value: string) => void;
    open: boolean;
    setOpen: (open: boolean) => void;
    items: any[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    disabled?: boolean;
}

const ComboboxContext = React.createContext<ComboboxContextType | undefined>(undefined);

function useCombobox() {
    const context = React.useContext(ComboboxContext);
    if (!context) {
        throw new Error("Combobox components must be used within a <Combobox />");
    }
    return context;
}

export interface ComboboxProps {
    items: any[];
    value?: string;
    onValueChange?: (value: string) => void;
    defaultValue?: string;
    disabled?: boolean;
    children: React.ReactNode;
}

export function Combobox({ items, value: controlledValue, onValueChange, defaultValue, disabled, children }: ComboboxProps) {
    const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue || "");
    const [open, setOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");

    const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;

    const handleValueChange = React.useCallback((newValue: string) => {
        if (controlledValue === undefined) {
            setUncontrolledValue(newValue);
        }
        onValueChange?.(newValue);
        setOpen(false);
    }, [controlledValue, onValueChange]);

    // Update search term when value changes (e.g. from outside or on initial load)
    React.useEffect(() => {
        const item = items.find(i => (typeof i === 'string' ? i : i.value) === value);
        if (item) {
            setSearchTerm(typeof item === 'string' ? item : item.label);
        } else if (!value) {
            setSearchTerm("");
        }
    }, [value, items]);

    return (
        <ComboboxContext.Provider value={{
            value,
            onValueChange: handleValueChange,
            open,
            setOpen,
            items,
            searchTerm,
            setSearchTerm,
            disabled
        }}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverAnchor asChild>
                    <div className="w-full">
                        {children}
                    </div>
                </PopoverAnchor>
            </Popover>
        </ComboboxContext.Provider>
    );
}

export function ComboboxInput({ placeholder = "Escribe para buscar...", showClear = false, icon: Icon, className }: { placeholder?: string; showClear?: boolean; icon?: React.ElementType; className?: string }) {
    const { value, onValueChange, open, setOpen, searchTerm, setSearchTerm, disabled } = useCombobox();

    const handleInputClick = () => {
        if (!disabled) setOpen(true);
    };

    return (
        <div className={cn("relative flex items-center w-full", className)}>
            <div className="relative w-full">
                {Icon && (
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 shrink-0 opacity-50" />
                )}
                <Input
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        if (!open) setOpen(true);
                        // Clear the value if the input is manually changed and doesn't match
                        if (value) onValueChange("");
                    }}
                    onFocus={() => !disabled && setOpen(true)}
                    onClick={handleInputClick}
                    disabled={disabled}
                    className={cn(
                        "w-full pr-10",
                        Icon && "pl-10",
                        disabled && "opacity-50 cursor-not-allowed"
                    )}
                />
            </div>
            {showClear && searchTerm && !disabled && (
                <button
                    type="button"
                    className="absolute right-3 p-1 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        setSearchTerm("");
                        onValueChange("");
                    }}
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            )}
        </div>
    );
}

export function ComboboxContent({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <PopoverContent
            className={cn("w-[--radix-popover-trigger-width] p-0", className)}
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()} // Don't steal focus from input
        >
            <Command shouldFilter={false}> { /* We handle filtering in the list component */}
                {children}
            </Command>
        </PopoverContent>
    );
}

export function ComboboxEmpty({ children }: { children: React.ReactNode }) {
    const { items, searchTerm } = useCombobox();

    const filteredItemsExists = items.some(item => {
        const label = typeof item === 'string' ? item : item.label;
        return label.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (filteredItemsExists) return null;

    return <CommandEmpty className="py-6 text-center text-sm">{children}</CommandEmpty>;
}

export function ComboboxList({ children }: { children: (item: any) => React.ReactNode }) {
    const { items, searchTerm } = useCombobox();

    const filteredItems = items.filter(item => {
        const label = typeof item === 'string' ? item : item.label;
        return label.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (filteredItems.length === 0) return null;

    return (
        <CommandList>
            <CommandGroup>
                {filteredItems.map((item) => children(item))}
            </CommandGroup>
        </CommandList>
    );
}

export function ComboboxItem({ value, children, icon: Icon, className }: { value: string; children: React.ReactNode; icon?: React.ElementType; className?: string }) {
    const { value: selectedValue, onValueChange } = useCombobox();

    return (
        <CommandItem
            value={value}
            onSelect={() => {
                onValueChange(value === selectedValue ? "" : value);
            }}
            className={cn("flex items-center gap-2", className)}
        >
            <Check
                className={cn(
                    "h-4 w-4 shrink-0",
                    selectedValue === value ? "opacity-100" : "opacity-0"
                )}
            />
            {Icon && <Icon className="h-4 w-4 shrink-0 opacity-50" />}
            <span className="truncate">{children}</span>
        </CommandItem>
    );
}

export { CommandInput as ComboboxSearch } from "@/components/ui/command";
