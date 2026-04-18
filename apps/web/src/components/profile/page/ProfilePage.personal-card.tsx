import { Edit } from 'lucide-react';
import { ProfilePersonalCardProps } from './ProfilePage.types';

export default function ProfilePagePersonalCard({ name, email, phone, onEdit }: ProfilePersonalCardProps) {
    return (
        <div className="bg-card text-card-foreground rounded-lg border border-gray-300 dark:border-border p-6 mb-8 shadow-sm relative">
            <button
                onClick={onEdit}
                className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors p-1.5"
            >
                <Edit className="w-4 h-4" />
            </button>

            <div className="mb-6">
                <h2 className="font-bold text-lg text-foreground">{name}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <p className="text-muted-foreground text-sm mb-1">Correo electronico</p>
                    <p className="text-foreground">{email}</p>
                </div>
                <div>
                    <p className="text-muted-foreground text-sm mb-1">Numero de telefono</p>
                    <p className="text-foreground">{phone || '-'}</p>
                </div>
            </div>
        </div>
    );
}
