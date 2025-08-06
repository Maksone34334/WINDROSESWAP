// API response interfaces
export interface ErrorResponse {
    message: string;
}

export interface TokenDetails {
    address: string;
    categories: string[];
    decimals: number;
    name: string;
    symbol: string;
}

export interface TokenBalance {
    address: string;
    balance: string;
    categories: string[];
    decimals: number;
    id: string;
    name: string;
    symbol: string;
}

export interface TokenResult {
    address: string;
    balance: string;
    categories: string[];
    decimals: string; // Note: API returns this as string
    id: string;
    name: string;
    symbol: string;
    mon_per_token?: string;
    pconf?: string;
    usd_per_token?: string;
}

// Token categories as defined in the API
export type TokenCategory = 'wallet' | 'verified' | 'stable' | 'lst' | 'bridged' | 'meme';

// Quote interfaces
export interface QuoteParams {
    amount: string | number;
    from: string;
    to: string;
    sender?: string;
    slippage?: number;
    deadline?: number;
    max_hops?: number;
    excluded?: string;
    source?: string;
}

export interface SwapParams extends QuoteParams {
    sender: string; // Required for swap execution
}

export interface SwapResult {
    quote: any;
    transaction: any;
    success: boolean;
    message: string;
}

// API client options
export interface TokenSearchOptions {
    find?: string;
    offset?: string | number;
    limit?: string | number;
}

export interface TokenCategoryOptions {
    address?: string;
    offset?: number;
    limit?: number;
}