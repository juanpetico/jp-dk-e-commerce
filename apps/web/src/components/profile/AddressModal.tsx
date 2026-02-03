'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Address } from '../../types';

interface AddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (address: Partial<Address>) => void;
    initialData?: Address | null;
}

export default function AddressModal({ isOpen, onClose, onSave, initialData }: AddressModalProps) {
    const [formData, setFormData] = useState({
        country: 'Chile',
        firstName: '',
        lastName: '',
        company: '',
        street: '',
        apartment: '',
        zipCode: '',
        city: '',
        region: 'Arica y Parinacota',
        phone: '',
        isDefault: false,
    });

    useEffect(() => {
        if (initialData) {
            // Split name into first and last for the form
            const [first, ...last] = initialData.name.split(' ');
            setFormData({
                country: initialData.country,
                firstName: first || '',
                lastName: last.join(' ') || '',
                company: '', // Not in type
                street: initialData.street,
                apartment: '', // Not in type (assumed part of street usually)
                zipCode: initialData.zipCode || '',
                city: initialData.city,
                region: initialData.region,
                phone: initialData.phone,
                isDefault: initialData.isDefault,
            });
        } else {
            setFormData({
                country: 'Chile',
                firstName: '',
                lastName: '',
                company: '',
                street: '',
                apartment: '',
                zipCode: '',
                city: '',
                region: 'Arica y Parinacota',
                phone: '',
                isDefault: false,
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const fullAddress: Partial<Address> = {
            country: formData.country,
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            street: `${formData.street} ${formData.apartment ? ', ' + formData.apartment : ''}`.trim(),
            city: formData.city,
            region: formData.region,
            zipCode: formData.zipCode,
            phone: formData.phone,
            isDefault: formData.isDefault,
        };
        onSave(fullAddress);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold font-display text-black dark:text-white">
                            {initialData ? 'Editar dirección' : 'Agregar dirección'}
                        </h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-black dark:hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Checkbox Default */}
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isDefault}
                                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-600"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Esta es mi dirección predeterminada.</span>
                        </label>

                        {/* Country */}
                        <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">País o región</label>
                            <select
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600"
                            >
                                <option value="Chile">Chile</option>
                            </select>
                        </div>

                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Nombre"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Apellido"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600"
                                required
                            />
                        </div>

                        {/* Company */}
                        <input
                            type="text"
                            placeholder="Empresa"
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600"
                        />

                        {/* Address */}
                        <input
                            type="text"
                            placeholder="Dirección"
                            value={formData.street}
                            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Apartamento, local, etc. (opcional)"
                            value={formData.apartment}
                            onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600"
                        />

                        {/* Zip & City */}
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Código postal"
                                value={formData.zipCode}
                                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600"
                            />
                            <input
                                type="text"
                                placeholder="Ciudad"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600"
                                required
                            />
                        </div>

                        {/* Region */}
                        <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Región</label>
                            <select
                                value={formData.region}
                                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600"
                            >
                                <option value="Arica y Parinacota">Arica y Parinacota</option>
                                <option value="Tarapacá">Tarapacá</option>
                                <option value="Antofagasta">Antofagasta</option>
                                <option value="Atacama">Atacama</option>
                                <option value="Coquimbo">Coquimbo</option>
                                <option value="Valparaíso">Valparaíso</option>
                                <option value="Metropolitana">Metropolitana</option>
                                <option value="O'Higgins">O'Higgins</option>
                                <option value="Maule">Maule</option>
                                <option value="Ñuble">Ñuble</option>
                                <option value="Biobío">Biobío</option>
                                <option value="Araucanía">Araucanía</option>
                                <option value="Los Ríos">Los Ríos</option>
                                <option value="Los Lagos">Los Lagos</option>
                                <option value="Aysén">Aysén</option>
                                <option value="Magallanes">Magallanes</option>
                            </select>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Teléfono</label>
                            <div className="relative flex">
                                <div className="flex items-center gap-2 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-lg px-3 bg-gray-50 dark:bg-gray-700">
                                    <span className="text-lg">🇨🇱</span>
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">+56</span>
                                </div>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-r-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600"
                                    placeholder="9 1234 5678"
                                    required
                                />
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
                            >
                                Guardar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
