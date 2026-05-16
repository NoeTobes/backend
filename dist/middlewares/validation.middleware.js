"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAccountValidation = exports.loginValidation = exports.registerValidation = void 0;
const express_validator_1 = require("express-validator");
exports.registerValidation = [
    (0, express_validator_1.body)('title').isIn(['Mr', 'Mrs', 'Miss', 'Ms', 'Dr']),
    (0, express_validator_1.body)('firstName').notEmpty().trim().isLength({ min: 2, max: 50 }),
    (0, express_validator_1.body)('lastName').notEmpty().trim().isLength({ min: 2, max: 50 }),
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').isLength({ min: 6 }),
    (0, express_validator_1.body)('acceptTerms').isBoolean().custom(value => value === true)
];
exports.loginValidation = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').notEmpty()
];
exports.updateAccountValidation = [
    (0, express_validator_1.body)('title').optional().isIn(['Mr', 'Mrs', 'Miss', 'Ms', 'Dr']),
    (0, express_validator_1.body)('firstName').optional().trim().isLength({ min: 2, max: 50 }),
    (0, express_validator_1.body)('lastName').optional().trim().isLength({ min: 2, max: 50 }),
    (0, express_validator_1.body)('email').optional().isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').optional().isLength({ min: 6 })
];
