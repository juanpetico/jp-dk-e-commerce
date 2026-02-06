"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { es } from "date-fns/locale"

interface DatePickerWithRangeProps {
    className?: string
    date: DateRange | undefined
    setDate: (date: DateRange | undefined) => void
    showClear?: boolean
    defaultDate?: DateRange
}

export function DatePickerWithRange({
    className,
    date,
    setDate,
    showClear = true,
    defaultDate,
}: DatePickerWithRangeProps) {
    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        setDate(defaultDate);
    };

    const isModified = React.useMemo(() => {
        if (!defaultDate && !date) return false;
        if (!defaultDate && date) return true;
        if (defaultDate && !date) return true;

        return (
            defaultDate?.from?.getTime() !== date?.from?.getTime() ||
            defaultDate?.to?.getTime() !== date?.to?.getTime()
        );
    }, [date, defaultDate]);

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[300px] justify-start text-left font-normal relative pr-10",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "dd MMM y", { locale: es })} -{" "}
                                    {format(date.to, "dd MMM y", { locale: es })}
                                </>
                            ) : (
                                format(date.from, "dd MMM y", { locale: es })
                            )
                        ) : (
                            <span>Seleccionar fechas</span>
                        )}

                        {showClear && isModified && (
                            <div
                                role="button"
                                onClick={handleClear}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded-full text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <span className="sr-only">Limpiar</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </div>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                        locale={es}
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}
