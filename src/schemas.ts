import { z } from "zod";

// Schema definitions for tool arguments
export const GetTokenArgsSchema = z.object({
    contractAddress: z.string().describe("Token contract address"),
});

export const GetTokensArgsSchema = z.object({
    find: z.string().optional().describe("The partial name or ticker of the token to find"),
    offset: z.union([z.string(), z.number()]).optional().describe("The offset to start the list from"),
    limit: z.union([z.string(), z.number()]).optional().describe("The maximum amount of tokens to return"),
});

export const GetTokensByCategoryArgsSchema = z.object({
    category: z.enum([
        "wallet", "verified", "stable", "lst", "bridged", "meme"
    ]).describe("Category of tokens to fetch, verified and wallet must be preferred, ask for confirmation when using any other"),
    address: z.string().optional().describe("Monad address to include token balances for (required for wallet category)"),
    offset: z.number().optional().default(0).describe("Pagination offset"),
    limit: z.number().optional().default(500).describe("Maximum number of results to return"),
});

export const GetWalletBalancesArgsSchema = z.object({
    address: z.string().describe("The address to fetch balances for"),
});

// Quote schema
export const GetQuoteArgsSchema = z.object({
    amount: z.union([z.string(), z.number()]).describe("Human readable amount to swap"),
    from: z.string().describe("Token address to swap from, use the data API verified category to get the address from the name or symbol"),
    to: z.string().describe("Token address to swap to, use the data API verified category to get the address from the name symbol"),
    sender: z.string().optional().describe("Address of the wallet that will execute the transaction"),
    slippage: z.number().optional().describe("Slippage tolerance in basis points (default: 50)"),
    deadline: z.number().optional().describe("Deadline in seconds (default: 60)"),
    max_hops: z.number().optional().describe("Maximum number of hops (1-5, default: 3)"),
    excluded: z.string().optional().describe("Comma separated list of protocols to exclude"),
    source: z.string().optional().describe("Source of the request (for fee sharing)"),
});

// Swap execution schema
export const ExecuteSwapArgsSchema = z.object({
    amount: z.union([z.string(), z.number()]).describe("Human readable amount to swap"),
    from: z.string().describe("Token address to swap from"),
    to: z.string().describe("Token address to swap to"),
    sender: z.string().describe("Address of the wallet that will execute the transaction (required for swap execution)"),
    slippage: z.number().optional().describe("Slippage tolerance in basis points (default: 50)"),
    deadline: z.number().optional().describe("Deadline in seconds (default: 60)"),
    max_hops: z.number().optional().describe("Maximum number of hops (1-5, default: 3)"),
    excluded: z.string().optional().describe("Comma separated list of protocols to exclude"),
    source: z.string().optional().describe("Source of the request (for fee sharing)"),
});