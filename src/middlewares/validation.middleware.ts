import { body } from 'express-validator';

export const registerValidation = [
    body('title').isIn(['Mr', 'Mrs', 'Miss', 'Ms', 'Dr']),
    body('firstName').notEmpty().trim().isLength({ min: 2, max: 50 }),
    body('lastName').notEmpty().trim().isLength({ min: 2, max: 50 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('acceptTerms').isBoolean().custom(value => value === true)
];

export const loginValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
];

export const updateAccountValidation = [
    body('title').optional().isIn(['Mr', 'Mrs', 'Miss', 'Ms', 'Dr']),
    body('firstName').optional().trim().isLength({ min: 2, max: 50 }),
    body('lastName').optional().trim().isLength({ min: 2, max: 50 }),
    body('email').optional().isEmail().normalizeEmail(),
    body('password').optional().isLength({ min: 6 })
];