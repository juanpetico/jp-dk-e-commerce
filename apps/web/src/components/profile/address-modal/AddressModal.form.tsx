import { Map, MapPin, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { AddressModalFormProps } from './AddressModal.types';

export default function AddressModalForm({
    formData,
    errors,
    wantsInvoice,
    regions,
    availableComunas,
    initialData,
    onClose,
    onDelete,
    onSubmit,
    onToggleDefault,
    onCountryChange,
    onToggleInvoice,
    onCompanyChange,
    onFieldChange,
    onRegionChange,
}: AddressModalFormProps) {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="flex items-center gap-3">
                <Checkbox id="isDefault" checked={formData.isDefault} onCheckedChange={(checked) => onToggleDefault(Boolean(checked))} />
                <Label htmlFor="isDefault" className="text-sm cursor-pointer">
                    Esta es mi direccion predeterminada.
                </Label>
            </div>

            <div className="space-y-2">
                <Label htmlFor="country">Pais</Label>
                <Select value={formData.country} onValueChange={onCountryChange}>
                    <SelectTrigger id="country">
                        <SelectValue placeholder="Selecciona pais" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Chile">Chile</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-4 border border-gray-300 rounded-md p-4 bg-muted/20">
                <div className="flex items-center gap-2">
                    <Checkbox id="invoice" checked={wantsInvoice} onCheckedChange={(checked) => onToggleInvoice(Boolean(checked))} />
                    <Label htmlFor="invoice" className="cursor-pointer font-medium">
                        Necesitas factura? (Empresa)
                    </Label>
                </div>

                {wantsInvoice && (
                    <div className="space-y-2 animation-fade-in">
                        <Label htmlFor="company">Razon Social / Nombre Empresa</Label>
                        <Input
                            id="company"
                            type="text"
                            placeholder="Ej: Mi Empresa SpA"
                            value={formData.company}
                            onChange={(event) => onCompanyChange(event.target.value)}
                        />
                        <p className="text-[10px] text-muted-foreground">Ingresa el nombre de la empresa para la factura.</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="firstName" className={cn(errors.firstName && 'text-destructive')}>
                        Nombre
                    </Label>
                    <Input
                        id="firstName"
                        type="text"
                        placeholder="Nombre"
                        value={formData.firstName}
                        onChange={(event) => onFieldChange('firstName', event.target.value)}
                        className={cn(errors.firstName && 'border-destructive focus-visible:ring-destructive')}
                    />
                    {errors.firstName && <p className="text-[10px] text-destructive font-medium">{errors.firstName}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="lastName" className={cn(errors.lastName && 'text-destructive')}>
                        Apellido
                    </Label>
                    <Input
                        id="lastName"
                        type="text"
                        placeholder="Apellido"
                        value={formData.lastName}
                        onChange={(event) => onFieldChange('lastName', event.target.value)}
                        className={cn(errors.lastName && 'border-destructive focus-visible:ring-destructive')}
                    />
                    {errors.lastName && <p className="text-[10px] text-destructive font-medium">{errors.lastName}</p>}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="rut" className={cn(errors.rut && 'text-destructive')}>
                    RUT
                </Label>
                <Input
                    id="rut"
                    type="text"
                    placeholder="12.345.678-9"
                    value={formData.rut}
                    onChange={(event) => onFieldChange('rut', event.target.value)}
                    className={cn(errors.rut && 'border-destructive focus-visible:ring-destructive')}
                />
                {errors.rut && <p className="text-[10px] text-destructive font-medium">{errors.rut}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="street" className={cn(errors.street && 'text-destructive')}>
                    Direccion
                </Label>
                <Input
                    id="street"
                    type="text"
                    placeholder="Calle, numero, depto..."
                    value={formData.street}
                    onChange={(event) => onFieldChange('street', event.target.value)}
                    className={cn(errors.street && 'border-destructive focus-visible:ring-destructive')}
                />
                {errors.street && <p className="text-[10px] text-destructive font-medium">{errors.street}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="zipCode">Codigo Postal</Label>
                <Input
                    id="zipCode"
                    type="text"
                    placeholder="Opcional"
                    value={formData.zipCode}
                    onChange={(event) => onFieldChange('zipCode', event.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label className={cn(errors.region && 'text-destructive')}>Region</Label>
                <Combobox items={regions} value={formData.region} onValueChange={onRegionChange}>
                    <ComboboxInput
                        placeholder="Escribe tu region..."
                        showClear
                        icon={MapPin}
                        className={cn(errors.region && 'border-destructive focus-visible:ring-destructive')}
                    />
                    <ComboboxContent>
                        <ComboboxEmpty>No se encontro la region.</ComboboxEmpty>
                        <ComboboxList>
                            {(region) => (
                                <ComboboxItem key={region} value={region} icon={MapPin}>
                                    {region}
                                </ComboboxItem>
                            )}
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>
                {errors.region && <p className="text-[10px] text-destructive font-medium">{errors.region}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="comuna" className={cn(errors.comuna && 'text-destructive')}>
                    Comuna
                </Label>
                <Combobox
                    items={availableComunas}
                    value={formData.comuna}
                    onValueChange={(value) => onFieldChange('comuna', value)}
                    disabled={!formData.region || availableComunas.length === 0}
                >
                    <ComboboxInput
                        placeholder={formData.region ? 'Escribe tu comuna...' : 'Primero selecciona una region'}
                        showClear
                        icon={Map}
                        className={cn(errors.comuna && 'border-destructive focus-visible:ring-destructive')}
                    />
                    <ComboboxContent>
                        <ComboboxEmpty>No se encontraron comunas.</ComboboxEmpty>
                        <ComboboxList>
                            {(comuna) => (
                                <ComboboxItem key={comuna} value={comuna} icon={Map}>
                                    {comuna}
                                </ComboboxItem>
                            )}
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>
                {errors.comuna && <p className="text-[10px] text-destructive font-medium">{errors.comuna}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="phone" className={cn(errors.phone && 'text-destructive')}>
                    Telefono
                </Label>
                <div className="relative flex">
                    <div
                        className={cn(
                            'flex items-center gap-2 border border-r-0 border-input rounded-l-md px-3 bg-muted transition-colors',
                            errors.phone && 'border-destructive bg-destructive/5',
                        )}
                    >
                        <span className="text-lg">CL</span>
                        <span className={cn('text-sm font-medium text-muted-foreground', errors.phone && 'text-destructive/70')}>+56</span>
                    </div>
                    <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(event) => onFieldChange('phone', event.target.value)}
                        className={cn('rounded-l-none', errors.phone && 'border-destructive focus-visible:ring-destructive')}
                        placeholder="9 1234 5678"
                    />
                </div>
                {errors.phone && <p className="text-[10px] text-destructive font-medium">{errors.phone}</p>}
            </div>

            <div className="flex justify-between gap-3 pt-4 border-t border-gray-300 mt-6">
                <div>
                    {initialData && onDelete && (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onDelete}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                        </Button>
                    )}
                </div>
                <div className="flex gap-3">
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit">Guardar</Button>
                </div>
            </div>
        </form>
    );
}
