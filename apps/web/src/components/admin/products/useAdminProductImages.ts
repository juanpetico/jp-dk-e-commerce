'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { ImageUrlModalState } from './AdminProductForm.types';

const INITIAL_IMAGE_MODAL: ImageUrlModalState = {
    isOpen: false,
    url: '',
    index: null,
};

interface UseAdminProductImagesParams {
    images: string[];
    onImagesChange: (images: string[]) => void;
}

export function useAdminProductImages({ images, onImagesChange }: UseAdminProductImagesParams) {
    const [imageUrlModal, setImageUrlModal] = useState<ImageUrlModalState>(INITIAL_IMAGE_MODAL);

    const openImageUrlModal = useCallback((index: number | null = null) => {
        setImageUrlModal({
            isOpen: true,
            url: index !== null ? images[index] || '' : '',
            index,
        });
    }, [images]);

    const closeImageUrlModal = useCallback(() => {
        setImageUrlModal(INITIAL_IMAGE_MODAL);
    }, []);

    const setImageUrlValue = useCallback((url: string) => {
        setImageUrlModal((prev) => ({ ...prev, url }));
    }, []);

    const saveImageUrl = useCallback(() => {
        if (!imageUrlModal.url.trim()) {
            toast.error('Ingresa una URL de imagen');
            return;
        }

        const newImages = [...images];
        if (imageUrlModal.index !== null) {
            newImages[imageUrlModal.index] = imageUrlModal.url.trim();
        } else {
            newImages.push(imageUrlModal.url.trim());
        }

        onImagesChange(newImages);
        closeImageUrlModal();
    }, [closeImageUrlModal, imageUrlModal.index, imageUrlModal.url, images, onImagesChange]);

    const removeImage = useCallback((index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        onImagesChange(newImages);
    }, [images, onImagesChange]);

    return {
        imageUrlModal,
        setImageUrlModal,
        openImageUrlModal,
        closeImageUrlModal,
        setImageUrlValue,
        saveImageUrl,
        removeImage,
    };
}
