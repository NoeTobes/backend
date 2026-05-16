"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountController = void 0;
const Account_model_1 = require("../models/Account.model");
class AccountController {
    static async getAll(req, res) {
        const accounts = await Account_model_1.AccountModel.getAll();
        res.json(accounts);
    }
    static async getById(req, res) {
        const id = parseInt(req.params.id);
        const account = await Account_model_1.AccountModel.getById(id);
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }
        res.json(account);
    }
    static async update(req, res) {
        const id = parseInt(req.params.id);
        // Check if user is updating their own account or is admin
        if (req.user.id !== id && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        const account = await Account_model_1.AccountModel.update(id, req.body);
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }
        res.json(account);
    }
    static async delete(req, res) {
        const id = parseInt(req.params.id);
        // Prevent admin from deleting themselves
        if (req.user.id === id) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }
        const success = await Account_model_1.AccountModel.delete(id);
        if (!success) {
            return res.status(404).json({ message: 'Account not found' });
        }
        res.json({ message: 'Account deleted successfully' });
    }
}
exports.AccountController = AccountController;
