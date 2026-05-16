import { Request, Response } from 'express';
import { AccountModel } from '../models/Account.model';

export class AccountController {
    static async getAll(req: Request, res: Response) {
        const accounts = await AccountModel.getAll();
        res.json(accounts);
    }
    
    static async getById(req: Request, res: Response) {
        const id = parseInt(req.params.id);
        const account = await AccountModel.getById(id);
        
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }
        
        res.json(account);
    }
    
    static async update(req: Request, res: Response) {
        const id = parseInt(req.params.id);
        
        // Check if user is updating their own account or is admin
        if ((req as any).user.id !== id && (req as any).user.role !== 'Admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        
        const account = await AccountModel.update(id, req.body);
        
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }
        
        res.json(account);
    }
    
    static async delete(req: Request, res: Response) {
        const id = parseInt(req.params.id);
        
        // Prevent admin from deleting themselves
        if ((req as any).user.id === id) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }
        
        const success = await AccountModel.delete(id);
        
        if (!success) {
            return res.status(404).json({ message: 'Account not found' });
        }
        
        res.json({ message: 'Account deleted successfully' });
    }
}