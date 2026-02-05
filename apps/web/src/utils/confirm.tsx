'use client';

import { toast } from 'sonner';
import ConfirmToast from '../components/ui/ConfirmToast';

export const confirm = (message: string, description?: string): Promise<boolean> => {
    return new Promise((resolve) => {
        const toastId = toast.custom(
            (t) => (
                <ConfirmToast
                    message={message}
                    description={description}
                    onConfirm={() => {
                        toast.dismiss(toastId);
                        resolve(true);
                    }}
                    onCancel={() => {
                        toast.dismiss(toastId);
                        resolve(false);
                    }}
                />
            ),
            {
                duration: Infinity,
                position: 'top-center',
                unstyled: true,
            }
        );
    });
};
