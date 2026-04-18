import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface AdminSearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    containerClassName?: string;
    inputClassName?: string;
}

export default function AdminSearchInput({
    value,
    onChange,
    placeholder,
    containerClassName,
    inputClassName,
}: AdminSearchInputProps) {
    return (
        <div className={cn('relative w-full md:w-[340px]', containerClassName)}>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className={cn('pl-10 pr-9', inputClassName)}
            />

            {value.length > 0 && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onChange('')}
                    aria-label="Limpiar búsqueda"
                    className="absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2 rounded-sm p-0 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                    <X className="h-3.5 w-3.5" />
                </Button>
            )}
        </div>
    );
}
