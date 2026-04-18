import { RegisterErrors } from './register.types';

export function validateEmailStep(email: string): RegisterErrors {
    const trimmedEmail = email.trim();
    const errors: RegisterErrors = {};

    if (!trimmedEmail) {
        errors.email = 'El correo electronico es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        errors.email = 'Formato de correo electronico invalido';
    }

    return errors;
}

export function validatePasswordStep(password: string, confirmPassword: string): RegisterErrors {
    const errors: RegisterErrors = {};

    if (password.length < 6) {
        errors.password = 'La contrasena debe tener al menos 6 caracteres';
    }
    if (password !== confirmPassword) {
        errors.confirmPassword = 'Las contrasenas no coinciden';
    }

    return errors;
}

const PHONE_PATTERN = /^\+?[0-9\s()-]+$/;

export function validateProfileStep(name: string, phone: string): RegisterErrors {
    const trimmedPhone = phone.trim();

    if (!name.trim()) {
        return { name: 'El nombre es obligatorio' };
    }

    if (trimmedPhone) {
        if (trimmedPhone.length < 8 || trimmedPhone.length > 30) {
            return { phone: 'Telefono invalido' };
        }

        if (!PHONE_PATTERN.test(trimmedPhone)) {
            return { phone: 'Formato de telefono invalido' };
        }
    }

    return {};
}
