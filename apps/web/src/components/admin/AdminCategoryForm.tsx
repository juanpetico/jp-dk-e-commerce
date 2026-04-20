import React, { useState } from 'react';
import { createCategory } from '../../services/categoryService';
import { Button } from '../ui/Button';
import { X } from 'lucide-react';
import { confirm } from '../../utils/confirm';
import { Input } from '../ui/input';


interface AdminCategoryFormProps {
    onClose: () => void;
    onSuccess: (category: any) => void;
}

const AdminCategoryForm: React.FC<AdminCategoryFormProps> = ({ onClose, onSuccess }) => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        const isConfirmed = await confirm(
            '¿Crear Categoría?',
            `¿Estás seguro de que deseas crear la categoría "${name}"?`
        );

        if (!isConfirmed) return;

        setLoading(true);
        setError('');

        try {
            const newCategory = await createCategory({ name });
            onSuccess(newCategory);
            onClose();
        } catch (err) {
            setError('Error al crear la categoría');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-background rounded-2xl w-full max-w-sm flex flex-col shadow-2xl border border-border">
                <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
                    <h2 className="text-lg font-bold font-display uppercase tracking-wider text-foreground">
                        Nueva Categoría
                    </h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-muted-foreground">Nombre de la Categoría</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-muted/50 border-transparent rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:bg-background transition-all"
                            placeholder="Ej: Accesorios"
                            autoFocus
                        />
                        {error && <p className="text-destructive text-xs">{error}</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="outline" onClick={onClose} type="button">Cancelar</Button>
                        <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
                            {loading ? 'Creando...' : 'Crear'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminCategoryForm;
