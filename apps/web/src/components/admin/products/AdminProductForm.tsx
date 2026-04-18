'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { confirm } from '@/utils/confirm';
import { AdminProductImageUrlDialog } from './AdminProductImageUrlDialog';
import { AdminProductFormSections } from './AdminProductForm.sections';
import { AdminProductFormProps } from './AdminProductForm.types';
import { buildSubmissionData, validateProductForm } from './AdminProductForm.utils';
import { useAdminProductForm } from './useAdminProductForm';
import { useAdminProductImages } from './useAdminProductImages';

const AdminProductForm: React.FC<AdminProductFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const pathname = usePathname();
    const basePath = pathname?.startsWith('/superadmin') ? '/superadmin' : '/admin';

    const {
        categories,
        formData,
        setFormData,
        errors,
        setErrors,
        isEditing,
        setFormField,
        handleTextFieldChange,
        setIsSale,
        toggleSize,
        handleVariantStockChange,
        setCategoryById,
    } = useAdminProductForm({
        isOpen,
        initialData,
    });

    const {
        imageUrlModal,
        setImageUrlModal,
        openImageUrlModal,
        closeImageUrlModal,
        setImageUrlValue,
        saveImageUrl,
        removeImage,
    } = useAdminProductImages({
        images: formData.images,
        onImagesChange: (images) => setFormData((prev) => ({ ...prev, images })),
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { errors: newErrors, rawPrice, rawOriginalPrice, parsedVariants } = validateProductForm(formData, isEditing);

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error('Por favor revisa los campos marcados en rojo');
            return;
        }

        const isConfirmed = await confirm(
            isEditing ? '¿Guardar Cambios?' : '¿Crear Producto?',
            isEditing
                ? '¿Estás seguro de que deseas actualizar los datos de este producto?'
                : '¿Deseas crear este nuevo producto en el catálogo?'
        );

        if (!isConfirmed) return;

        const submissionData = buildSubmissionData(formData, rawPrice, rawOriginalPrice, parsedVariants);
        onSubmit(submissionData as any);
    };

    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                className="bg-background rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border-2 border-foreground/20"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-border flex items-center bg-muted/30 relative">
                    <button onClick={onClose} className="absolute left-6 text-muted-foreground hover:text-foreground transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                    <h2 className="text-xl font-bold font-display uppercase tracking-wider text-foreground w-full text-center">
                        {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
                    </h2>
                </div>

                <div className="overflow-y-auto p-6 flex-1">
                    <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
                        <AdminProductFormSections
                            formData={formData}
                            errors={errors}
                            categories={categories}
                            basePath={basePath}
                            isEditing={isEditing}
                            onTextChange={handleTextFieldChange}
                            onToggleSize={toggleSize}
                            onVariantStockChange={handleVariantStockChange}
                            onCategorySelect={setCategoryById}
                            onOpenImageModal={openImageUrlModal}
                            onRemoveImage={removeImage}
                            onFlagChange={(name, checked) => setFormField(name, checked)}
                            onSaleToggle={setIsSale}
                        />
                    </form>
                </div>

                <div className="p-6 border-t border-border bg-muted/30 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} type="button">Cancelar</Button>
                    <Button onClick={handleSubmit} className="bg-primary text-primary-foreground hover:bg-primary/90">
                        {isEditing ? 'Guardar Cambios' : 'Crear Producto'}
                    </Button>
                </div>
            </div>

            <AdminProductImageUrlDialog
                modal={imageUrlModal}
                onOpenChange={(open) => {
                    if (!open) {
                        setImageUrlModal((prev) => ({ ...prev, isOpen: false }));
                    }
                }}
                onUrlChange={setImageUrlValue}
                onSave={saveImageUrl}
                onCancel={closeImageUrlModal}
            />
        </div>,
        document.body
    );
};

export default AdminProductForm;
