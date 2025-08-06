import axios from "axios";
import {
    ErrorResponse,
    TokenDetails,
    TokenBalance,
    TokenResult,
    TokenCategory,
    QuoteParams,
    SwapParams,
    SwapResult,
    TokenSearchOptions,
    TokenCategoryOptions
} from "./types.js";
import {
    MonorailApiError,
    TokenNotFoundError,
    QuoteError,
    SwapExecutionError,
    handleApiError
} from "./errors.js";

/**
 * Monorail Data API client
 */
export class MonorailDataApi {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    /**
     * Get a token by contract address
     * @param contractAddress The token contract address
     */
    async getToken(contractAddress: string): Promise<TokenDetails> {
        try {
            const response = await axios.get(`${this.baseUrl}/token/${contractAddress}`);
            return response.data;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    /**
     * Get a list of all available tokens
     * @param options Optional parameters for filtering and pagination
     */
    async getTokens(options?: TokenSearchOptions): Promise<TokenResult[]> {
        try {
            const response = await axios.get(`${this.baseUrl}/tokens`, {
                params: options
            });
            return response.data;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    /**
     * Get tokens by category
     * @param category Category of tokens to fetch
     * @param options Optional parameters for filtering and pagination
     */
    async getTokensByCategory(
        category: TokenCategory,
        options?: TokenCategoryOptions
    ): Promise<TokenResult[]> {
        try {
            const response = await axios.get(
                `${this.baseUrl}/tokens/category/${category}`,
                { params: options }
            );
            return response.data;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    /**
     * Get a count of all available tokens
     */
    async getTokenCount(): Promise<number> {
        try {
            const response = await axios.get(`${this.baseUrl}/tokens/count`);
            return response.data;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    /**
     * Get wallet balances for an address
     * @param address The wallet address to fetch balances for
     */
    async getWalletBalances(address: string): Promise<TokenBalance[]> {
        try {
            const response = await axios.get(
                `${this.baseUrl}/wallet/${address}/balances`
            );
            return response.data;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    /**
     * Handle API errors
     */
    private handleError(error: any): void {
        const apiError = handleApiError(error);
        console.error(`Data API Error: ${apiError.message}`);
        if (apiError.originalError) {
            console.error('Original error:', apiError.originalError);
        }
    }
}

/**
 * Monorail Quote API client
 */
export class MonorailQuoteApi {
    private baseUrl: string;
    private dataApi: MonorailDataApi;

    constructor(baseUrl: string, dataApi: MonorailDataApi) {
        this.baseUrl = baseUrl + "/quote";
        this.dataApi = dataApi;
    }

    /**
     * Resolves a token identifier (symbol or address) to its address
     * @param tokenIdentifier Token symbol or address
     */
    async resolveTokenAddress(tokenIdentifier: string): Promise<string> {
        // If it looks like an address already, return it
        if (tokenIdentifier.startsWith("0x") && tokenIdentifier.length >= 40) {
            return tokenIdentifier;
        }

        // Check if it's native token
        if (tokenIdentifier.toLowerCase() === "mon") {
            return "0x0000000000000000000000000000000000000000";
        }

        // Find the token by symbol
        try {
            // Get verified tokens first
            const verifiedTokens = await this.dataApi.getTokensByCategory("verified");

            // Look for a matching symbol (case insensitive)
            const token = verifiedTokens.find(t =>
                t.symbol.toLowerCase() === tokenIdentifier.toLowerCase()
            );

            if (token) {
                return token.address;
            }

            // If not found in verified tokens, search all tokens
            const tokenResults = await this.dataApi.getTokens({ find: tokenIdentifier });

            if (tokenResults.length > 0) {
                // Find exact match by symbol first
                const exactMatch = tokenResults.find(t =>
                    t.symbol.toLowerCase() === tokenIdentifier.toLowerCase()
                );

                if (exactMatch) {
                    return exactMatch.address;
                }

                // Otherwise return the first result
                return tokenResults[0].address;
            }
        } catch (error: any) {
            console.error(`Error resolving token: ${error.message}`);
        }

        throw new TokenNotFoundError(tokenIdentifier);
    }

    /**
     * Get a quote for a token swap
     * @param args Quote parameters
     */
    async getQuote(args: QuoteParams) {
        try {
            // Resolve token addresses from symbols if provided
            const fromAddress = await this.resolveTokenAddress(args.from);
            const toAddress = await this.resolveTokenAddress(args.to);

            // Build query params
            const params = new URLSearchParams();
            params.append("amount", args.amount.toString());
            params.append("from", fromAddress);
            params.append("to", toAddress);

            if (args.sender) params.append("sender", args.sender);
            if (args.slippage !== undefined) params.append("slippage", args.slippage.toString());
            if (args.deadline !== undefined) params.append("deadline", args.deadline.toString());
            if (args.max_hops !== undefined) params.append("max_hops", args.max_hops.toString());
            if (args.excluded) params.append("excluded", args.excluded);
            // Set the source to your Monorail Public ID
            params.append("source", "1300175433951702");

            // Make API request
            const response = await axios.get(`${this.baseUrl}?${params.toString()}`);

            if (response.status !== 200) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                const errorData = error.response.data as ErrorResponse;
                throw new QuoteError(errorData.message || error.message, error);
            } else {
                throw new QuoteError(error instanceof Error ? error.message : String(error), error);
            }
        }
    }

    /**
     * Execute a token swap
     * @param args Swap execution parameters
     */
    async executeSwap(args: SwapParams): Promise<SwapResult> {
        try {
            // First get a quote to ensure the swap is valid
            const quote = await this.getQuote(args);
            
            // Resolve token addresses from symbols if provided
            const fromAddress = await this.resolveTokenAddress(args.from);
            const toAddress = await this.resolveTokenAddress(args.to);

            // Build the swap execution endpoint
            const swapUrl = this.baseUrl.replace('/quote', '/swap');

            // Build query params for swap execution
            const params = new URLSearchParams();
            params.append("amount", args.amount.toString());
            params.append("from", fromAddress);
            params.append("to", toAddress);
            params.append("sender", args.sender);

            if (args.slippage !== undefined) params.append("slippage", args.slippage.toString());
            if (args.deadline !== undefined) params.append("deadline", args.deadline.toString());
            if (args.max_hops !== undefined) params.append("max_hops", args.max_hops.toString());
            if (args.excluded) params.append("excluded", args.excluded);
            // Set the source to your Monorail Public ID
            params.append("source", "1300175433951702");

            // Make swap execution request
            const response = await axios.post(`${swapUrl}?${params.toString()}`);

            if (response.status !== 200) {
                throw new Error(`Swap execution error: ${response.status} ${response.statusText}`);
            }

            return {
                quote: quote,
                transaction: response.data,
                success: true,
                message: "Swap executed successfully"
            };
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                const errorData = error.response.data as ErrorResponse;
                throw new SwapExecutionError(errorData.message || error.message, error);
            } else {
                throw new SwapExecutionError(error instanceof Error ? error.message : String(error), error);
            }
        }
    }
}