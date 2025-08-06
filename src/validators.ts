import { ValidationError } from "./errors.js";

export class InputValidator {
    /**
     * Validate Ethereum address format
     */
    static validateAddress(address: string, fieldName: string = 'address'): void {
        if (!address) {
            throw new ValidationError(`${fieldName} is required`, fieldName);
        }
        
        if (!address.startsWith('0x')) {
            throw new ValidationError(`${fieldName} must start with 0x`, fieldName);
        }
        
        if (address.length !== 42) {
            throw new ValidationError(`${fieldName} must be 42 characters long`, fieldName);
        }
        
        if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
            throw new ValidationError(`${fieldName} contains invalid characters`, fieldName);
        }
    }

    /**
     * Validate swap amount
     */
    static validateAmount(amount: string | number, fieldName: string = 'amount'): void {
        if (amount === undefined || amount === null || amount === '') {
            throw new ValidationError(`${fieldName} is required`, fieldName);
        }

        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        
        if (isNaN(numAmount)) {
            throw new ValidationError(`${fieldName} must be a valid number`, fieldName);
        }
        
        if (numAmount <= 0) {
            throw new ValidationError(`${fieldName} must be greater than 0`, fieldName);
        }
    }

    /**
     * Validate slippage (in basis points)
     */
    static validateSlippage(slippage?: number): void {
        if (slippage !== undefined) {
            if (slippage < 0 || slippage > 10000) {
                throw new ValidationError('Slippage must be between 0 and 10000 basis points (0-100%)', 'slippage');
            }
        }
    }

    /**
     * Validate deadline
     */
    static validateDeadline(deadline?: number): void {
        if (deadline !== undefined) {
            if (deadline <= 0) {
                throw new ValidationError('Deadline must be greater than 0', 'deadline');
            }
            
            if (deadline > 3600) { // 1 hour max
                throw new ValidationError('Deadline cannot exceed 1 hour (3600 seconds)', 'deadline');
            }
        }
    }

    /**
     * Validate max hops
     */
    static validateMaxHops(maxHops?: number): void {
        if (maxHops !== undefined) {
            if (maxHops < 1 || maxHops > 5) {
                throw new ValidationError('Max hops must be between 1 and 5', 'max_hops');
            }
        }
    }

    /**
     * Validate pagination parameters
     */
    static validatePagination(offset?: number, limit?: number): void {
        if (offset !== undefined && offset < 0) {
            throw new ValidationError('Offset must be non-negative', 'offset');
        }
        
        if (limit !== undefined) {
            if (limit <= 0) {
                throw new ValidationError('Limit must be greater than 0', 'limit');
            }
            
            if (limit > 1000) {
                throw new ValidationError('Limit cannot exceed 1000', 'limit');
            }
        }
    }
}