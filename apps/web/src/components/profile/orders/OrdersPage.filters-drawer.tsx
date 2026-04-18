import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { OrdersPageFiltersDrawerProps } from './OrdersPage.types';
import { translateOrderStatus } from './OrdersPage.utils';

const ORDER_STATUS_OPTIONS = ['all', 'PENDING', 'CONFIRMED', 'PROCESSING', 'PAID', 'DELIVERED', 'CANCELLED'];

export default function OrdersPageFiltersDrawer({
    showFilter,
    filterTab,
    sortBy,
    statusFilter,
    dateFilter,
    dateRange,
    onClose,
    onFilterTabChange,
    onSortByChange,
    onStatusFilterChange,
    onDateFilterChange,
    onDateRangeChange,
    onResetFilters,
}: OrdersPageFiltersDrawerProps) {
    return (
        <>
            {showFilter && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity"
                    onClick={onClose}
                />
            )}

            <div
                className={`fixed top-0 right-0 h-full w-96 bg-background shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out border-l border-gray-300 ${
                    showFilter ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="flex flex-col h-full">
                    <div className="flex border-b border-border">
                        <button
                            onClick={() => onFilterTabChange('sort')}
                            className={`flex-1 py-4 text-sm font-medium transition-colors border-b-2 ${
                                filterTab === 'sort'
                                    ? 'border-[var(--color-amber-900)] text-[var(--color-amber-900)]'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Ordenar
                        </button>
                        <button
                            onClick={() => onFilterTabChange('filter')}
                            className={`flex-1 py-4 text-sm font-medium transition-colors border-b-2 ${
                                filterTab === 'filter'
                                    ? 'border-[var(--color-amber-900)] text-[var(--color-amber-900)]'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Filtrar
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        {filterTab === 'sort' ? (
                            <div className="space-y-6">
                                <RadioGroup value={sortBy} onValueChange={onSortByChange}>
                                    <div className="flex items-center space-x-3">
                                        <RadioGroupItem value="date-desc" id="date-desc" />
                                        <Label htmlFor="date-desc" className="text-sm font-normal cursor-pointer">
                                            Del mas reciente al mas antiguo
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <RadioGroupItem value="date-asc" id="date-asc" />
                                        <Label htmlFor="date-asc" className="text-sm font-normal cursor-pointer">
                                            Del mas antiguo al mas reciente
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <RadioGroupItem value="total-desc" id="total-desc" />
                                        <Label htmlFor="total-desc" className="text-sm font-normal cursor-pointer">
                                            Total del pedido (de mayor a menor)
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <RadioGroupItem value="total-asc" id="total-asc" />
                                        <Label htmlFor="total-asc" className="text-sm font-normal cursor-pointer">
                                            Total del pedido (de menor a mayor)
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div>
                                    <h3 className="font-bold text-sm mb-4 text-foreground uppercase tracking-wider">Estado del pedido</h3>
                                    <RadioGroup
                                        value={statusFilter}
                                        onValueChange={onStatusFilterChange}
                                        className="space-y-3"
                                    >
                                        {ORDER_STATUS_OPTIONS.map((status) => (
                                            <div key={status} className="flex items-center space-x-3">
                                                <RadioGroupItem value={status} id={`status-${status}`} />
                                                <Label htmlFor={`status-${status}`} className="text-sm font-normal cursor-pointer">
                                                    {status === 'all' ? 'Todos los estados' : translateOrderStatus(status)}
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>

                                <div className="border-t border-border pt-6">
                                    <h3 className="font-bold text-sm mb-4 text-foreground uppercase tracking-wider">Fecha del pedido</h3>
                                    <RadioGroup value={dateFilter} onValueChange={onDateFilterChange} className="space-y-3">
                                        <div className="flex items-center space-x-3">
                                            <RadioGroupItem value="all" id="date-all" />
                                            <Label htmlFor="date-all" className="text-sm font-normal cursor-pointer">Todos</Label>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <RadioGroupItem value="today" id="date-today" />
                                            <Label htmlFor="date-today" className="text-sm font-normal cursor-pointer">Hoy</Label>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <RadioGroupItem value="7days" id="date-7days" />
                                            <Label htmlFor="date-7days" className="text-sm font-normal cursor-pointer">Ultimos siete dias</Label>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <RadioGroupItem value="30days" id="date-30days" />
                                            <Label htmlFor="date-30days" className="text-sm font-normal cursor-pointer">Ultimos 30 dias</Label>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <RadioGroupItem value="90days" id="date-90days" />
                                            <Label htmlFor="date-90days" className="text-sm font-normal cursor-pointer">Ultimos 90 dias</Label>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <RadioGroupItem value="12months" id="date-12months" />
                                            <Label htmlFor="date-12months" className="text-sm font-normal cursor-pointer">Ultimos 12 meses</Label>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <RadioGroupItem value="custom" id="date-custom" />
                                            <Label htmlFor="date-custom" className="text-sm font-normal cursor-pointer">Personalizado</Label>
                                        </div>
                                    </RadioGroup>

                                    {dateFilter === 'custom' && (
                                        <div className="mt-4 pl-7 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            'w-full justify-start text-left font-normal',
                                                            !dateRange?.from && 'text-muted-foreground'
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {dateRange?.from ? (
                                                            dateRange?.to ? (
                                                                <>
                                                                    {format(dateRange.from, 'dd/MM/yyyy')} - {format(dateRange.to, 'dd/MM/yyyy')}
                                                                </>
                                                            ) : (
                                                                format(dateRange.from, 'dd/MM/yyyy')
                                                            )
                                                        ) : (
                                                            <span>Seleccionar rango</span>
                                                        )}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        initialFocus
                                                        mode="range"
                                                        defaultMonth={dateRange?.from}
                                                        selected={dateRange}
                                                        onSelect={onDateRangeChange}
                                                        numberOfMonths={1}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-border p-6 flex justify-between items-center bg-card">
                        <button
                            onClick={onResetFilters}
                            className="text-[var(--color-amber-900)] text-sm font-medium hover:underline"
                        >
                            Limpiar todo
                        </button>
                        <button
                            onClick={onClose}
                            className="bg-[var(--color-amber-900)] text-white px-10 py-2.5 rounded font-bold text-sm hover:bg-[var(--color-amber-900)]/90 transition-colors shadow-md"
                        >
                            Aplicar
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
