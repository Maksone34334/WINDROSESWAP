import {
    GetTokenArgsSchema,
    GetTokensArgsSchema,
    GetTokensByCategoryArgsSchema,
    GetWalletBalancesArgsSchema,
    GetQuoteArgsSchema,
    ExecuteSwapArgsSchema
} from "./schemas.js";
import { MonorailDataApi, MonorailQuoteApi } from "./api-clients.js";
import { InputValidator } from "./validators.js";

export class ToolHandlers {
    constructor(
        private dataApi: MonorailDataApi,
        private quoteApi: MonorailQuoteApi
    ) {}

    async handleGetToken(args: any) {
        const parsed = GetTokenArgsSchema.safeParse(args);
        if (!parsed.success) {
            throw new Error(`Invalid arguments for get_token: ${parsed.error}`);
        }
        const result = await this.dataApi.getToken(parsed.data.contractAddress);
        return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
    }

    async handleGetTokens(args: any) {
        const parsed = GetTokensArgsSchema.safeParse(args);
        if (!parsed.success) {
            throw new Error(`Invalid arguments for get_tokens: ${parsed.error}`);
        }
        const result = await this.dataApi.getTokens(parsed.data);
        return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
    }

    async handleGetTokensByCategory(args: any) {
        const parsed = GetTokensByCategoryArgsSchema.safeParse(args);
        if (!parsed.success) {
            throw new Error(`Invalid arguments for get_tokens_by_category: ${parsed.error}`);
        }
        const result = await this.dataApi.getTokensByCategory(
            parsed.data.category,
            {
                address: parsed.data.address,
                offset: parsed.data.offset,
                limit: parsed.data.limit
            }
        );
        return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
    }

    async handleGetTokenCount() {
        const result = await this.dataApi.getTokenCount();
        return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
    }

    async handleGetWalletBalances(args: any) {
        const parsed = GetWalletBalancesArgsSchema.safeParse(args);
        if (!parsed.success) {
            throw new Error(`Invalid arguments for get_wallet_balances: ${parsed.error}`);
        }
        
        // Validate address format
        InputValidator.validateAddress(parsed.data.address, 'address');
        
        const result = await this.dataApi.getWalletBalances(parsed.data.address);
        return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
    }

    async handleGetQuote(args: any) {
        const parsed = GetQuoteArgsSchema.safeParse(args);
        if (!parsed.success) {
            throw new Error(`Invalid arguments for get_quote: ${parsed.error}`);
        }
        
        // Validate inputs
        InputValidator.validateAmount(parsed.data.amount);
        if (parsed.data.sender) {
            InputValidator.validateAddress(parsed.data.sender, 'sender');
        }
        InputValidator.validateSlippage(parsed.data.slippage);
        InputValidator.validateDeadline(parsed.data.deadline);
        InputValidator.validateMaxHops(parsed.data.max_hops);
        
        const result = await this.quoteApi.getQuote(parsed.data);
        return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
    }

    async handleExecuteSwap(args: any) {
        const parsed = ExecuteSwapArgsSchema.safeParse(args);
        if (!parsed.success) {
            throw new Error(`Invalid arguments for execute_swap: ${parsed.error}`);
        }
        
        // Validate inputs - stricter validation for actual swap execution
        InputValidator.validateAmount(parsed.data.amount);
        InputValidator.validateAddress(parsed.data.sender, 'sender');
        InputValidator.validateSlippage(parsed.data.slippage);
        InputValidator.validateDeadline(parsed.data.deadline);
        InputValidator.validateMaxHops(parsed.data.max_hops);
        
        const result = await this.quoteApi.executeSwap(parsed.data);
        return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
    }

    async handleToolCall(name: string, args: any) {
        switch (name) {
            case "get_token":
                return this.handleGetToken(args);
            case "get_tokens":
                return this.handleGetTokens(args);
            case "get_tokens_by_category":
                return this.handleGetTokensByCategory(args);
            case "get_token_count":
                return this.handleGetTokenCount();
            case "get_wallet_balances":
                return this.handleGetWalletBalances(args);
            case "get_quote":
                return this.handleGetQuote(args);
            case "execute_swap":
                return this.handleExecuteSwap(args);
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
}