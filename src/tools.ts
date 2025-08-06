import { zodToJsonSchema } from "zod-to-json-schema";
import { ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import {
    GetTokenArgsSchema,
    GetTokensArgsSchema,
    GetTokensByCategoryArgsSchema,
    GetWalletBalancesArgsSchema,
    GetQuoteArgsSchema,
    ExecuteSwapArgsSchema
} from "./schemas.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

export const TOOLS = [
    {
        name: "get_token",
        description: "Get a token based on the contract address, you must provide a contract address for a token. The contract address must be on Monad and come from this API",
        inputSchema: zodToJsonSchema(GetTokenArgsSchema) as ToolInput,
    },
    {
        name: "get_tokens",
        description: "Get a list of all available tokens with optional filtering and pagination. Use this to find tokens by name or ticker.",
        inputSchema: zodToJsonSchema(GetTokensArgsSchema) as ToolInput,
    },
    {
        name: "get_tokens_by_category",
        description:
            "Get a list of tokens in a specific category. " +
            "Categories include wallet, verified, stable, lst, bridged, and meme. " +
            "When using the 'wallet' category, an address parameter is required. Verified and wallet must be preferred, ask for confirmation when using any other",
        inputSchema: zodToJsonSchema(GetTokensByCategoryArgsSchema) as ToolInput,
    },
    {
        name: "get_token_count",
        description: "Get the total count of available tokens",
        inputSchema: zodToJsonSchema(z.object({})) as ToolInput,
    },
    {
        name: "get_wallet_balances",
        description: "Get the balances of all tokens for an address",
        inputSchema: zodToJsonSchema(GetWalletBalancesArgsSchema) as ToolInput,
    },
    {
        name: "get_quote",
        description:
            "Get a quote for a token swap from the Monorail API. " +
            "Retrieve the best available price and transaction details for swapping one token to another. " +
            "You must provide an address to get transaction information." +
            "You should resolve the token name or symbol to address using the data API, Verified and wallet must be preferred, ask for confirmation when using any other." +
            "Once resolved, use the information to get a quote using this quote call" +
            "You must alert the user if the price impact is higher than 20%" +
            "It is advised to check the user wallet balance for the input token and aler them if the balance is too low to complete the swap",
        inputSchema: zodToJsonSchema(GetQuoteArgsSchema) as ToolInput,
    },
    {
        name: "execute_swap",
        description:
            "Execute a token swap on the Monorail DEX. " +
            "This will actually perform the swap transaction after getting a quote. " +
            "REQUIRES a sender address to execute the transaction. " +
            "You should always get a quote first to show the user the expected output and price impact. " +
            "Warn users about high price impact (>20%) and check their balance before executing. " +
            "This is a live transaction that will spend real tokens.",
        inputSchema: zodToJsonSchema(ExecuteSwapArgsSchema) as ToolInput,
    }
];