import { body } from "express-validator";

export const forgotPasswordValidation = [
    body("email")
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage("Correo electrónico inválido"),
];

export const resetPasswordValidation = [
    body("token").notEmpty().isLength({ min: 64, max: 64 }).withMessage("Token inválido"),
    body("password")
        .isLength({ min: 8, max: 128 })
        .withMessage("La contraseña debe tener entre 8 y 128 caracteres"),
];

export const registerValidation = [
    body("email")
        .trim()
        .notEmpty().withMessage("El correo electrónico es obligatorio")
        .isEmail().withMessage("Formato de correo electrónico inválido")
        .isLength({ max: 254 }).withMessage("Correo demasiado largo"),
    body("password")
        .isLength({ min: 8, max: 128 })
        .withMessage("La contraseña debe tener entre 8 y 128 caracteres"),
    body("name").optional().trim().isLength({ min: 1, max: 100 }).withMessage("Nombre inválido"),
    body("phone")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 8, max: 30 }).withMessage("Telefono invalido")
        .matches(/^\+?[0-9\s()-]+$/).withMessage("Formato de telefono invalido"),
];

export const checkEmailValidation = [
    body("email")
        .trim()
        .notEmpty().withMessage("El correo electrónico es obligatorio")
        .isEmail().withMessage("Formato de correo electrónico inválido")
        .isLength({ max: 254 }).withMessage("Correo demasiado largo"),
];

export const loginValidation = [
    body("email").trim().isEmail().normalizeEmail().withMessage("Correo electrónico inválido"),
    body("password").notEmpty().isLength({ max: 128 }).withMessage("La contraseña es obligatoria"),
];

export const updateProfileValidation = [
    body("email").optional().trim().isEmail().withMessage("Correo inválido").isLength({ max: 254 }),
    body("password").optional().isLength({ min: 8, max: 128 }).withMessage("La contraseña debe tener entre 8 y 128 caracteres"),
    body("name").optional().trim().isLength({ min: 1, max: 100 }),
    body("phone").optional().trim().isLength({ max: 30 }),
];

export const addressValidation = [
    body("street").trim().notEmpty().isLength({ max: 200 }).withMessage("Calle requerida"),
    body("city").trim().notEmpty().isLength({ max: 100 }).withMessage("Ciudad requerida"),
    body("region").optional().trim().isLength({ max: 100 }),
    body("zipCode").optional().trim().isLength({ max: 20 }),
    body("country").optional().trim().isLength({ max: 100 }),
    body("isDefault").optional().isBoolean(),
];
