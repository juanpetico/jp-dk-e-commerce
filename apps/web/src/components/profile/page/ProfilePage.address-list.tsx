import { Edit, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProfileAddressListProps } from './ProfilePage.types';

export default function ProfilePageAddressList({
    addresses,
    onAddAddress,
    onEditAddress,
    onDeleteAddress,
}: ProfileAddressListProps) {
    const sortedAddresses = [...addresses].sort((a, b) => (a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1));

    return (
        <div>
            <div className="flex items-center gap-6 mb-6">
                <h2 className="font-bold text-lg text-foreground">Direcciones</h2>
                <button
                    onClick={onAddAddress}
                    className="text-[var(--color-amber-900)] text-sm font-bold hover:text-[var(--color-amber-900)] transition-colors flex items-center gap-1.5 bg-[var(--color-amber-900)]/10 dark:bg-[var(--color-amber-900)]/20 px-3 py-1.5 rounded-full"
                >
                    <Plus className="w-4 h-4" />
                    Agregar
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedAddresses.length === 0 ? (
                    <div className="md:col-span-2 flex flex-col items-center justify-center py-12 bg-card text-card-foreground rounded-lg border border-gray-300 dark:border-border">
                        <div className="bg-muted p-4 rounded-full mb-4">
                            <span className="text-3xl">📍</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">No tienes direcciones guardadas</h3>
                        <p className="text-muted-foreground mb-6 text-center max-w-sm">
                            Agrega una direccion para agilizar tus compras futuras.
                        </p>
                        <Button
                            onClick={onAddAddress}
                            className="px-6 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded text-sm font-bold transition-colors"
                        >
                            Agregar direccion
                        </Button>
                    </div>
                ) : (
                    sortedAddresses.map((address, index) => (
                        <div
                            key={address.id}
                            className={`bg-card text-card-foreground rounded-lg border ${
                                address.isDefault
                                    ? 'border-[var(--color-amber-900)] ring-1 ring-[var(--color-amber-900)]'
                                    : 'border-gray-300 dark:border-border'
                            } p-6 shadow-sm relative group`}
                        >
                            <div className="absolute top-6 right-6 flex items-center gap-1">
                                <button
                                    onClick={() => onEditAddress(address)}
                                    className="text-muted-foreground hover:text-foreground transition-colors p-1.5"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={(event) => onDeleteAddress(address.id, event)}
                                    className="text-muted-foreground hover:text-[var(--color-amber-900)] transition-colors p-1.5 rounded-full hover:bg-[var(--color-amber-900)]/10 dark:hover:bg-[var(--color-amber-900)]/20"
                                    title="Eliminar direccion"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    {index === 0 && address.isDefault && (
                                        <span className="bg-[var(--color-amber-900)]/20 text-[var(--color-amber-900)] dark:bg-[var(--color-amber-900)]/30 dark:text-[var(--color-amber-900)] text-xs font-bold px-2 py-1 rounded">
                                            Predeterminada
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="text-sm text-foreground space-y-1 mb-4">
                                <p className="font-bold">{address.name}</p>
                                {address.company && <p className="text-primary font-semibold">{address.company}</p>}
                                {address.rut && <p>{address.rut}</p>}
                                <p>{address.street}</p>
                                <p>{address.comuna}, {address.region}</p>
                                <p>{address.country}</p>
                                <p>{address.phone}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
