import express from 'express';
import cors from 'cors';
import { MonorailDataApi, MonorailQuoteApi } from './api-clients.js';
import { ToolHandlers } from './handlers.js';
import { InputValidator } from './validators.js';
import { 
    GetTokenArgsSchema,
    GetTokensArgsSchema,
    GetTokensByCategoryArgsSchema,
    GetWalletBalancesArgsSchema,
    GetQuoteArgsSchema,
    ExecuteSwapArgsSchema
} from './schemas.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API endpoints
const API_ENDPOINTS = {
    QUOTE_API: "https://testnet-pathfinder.monorail.xyz/v4",
    DATA_API: "https://testnet-api.monorail.xyz/v1",
};

// Monorail configuration
const MONORAIL_CONFIG = {
    PUBLIC_ID: "1300175433951702",
    AGGREGATION_PROXY: "0x525B929fCd6a64AfF834f4eeCc6E860486cED700"
};

// Create API instances
const dataApi = new MonorailDataApi(API_ENDPOINTS.DATA_API);
const quoteApi = new MonorailQuoteApi(API_ENDPOINTS.QUOTE_API, dataApi);
const toolHandlers = new ToolHandlers(dataApi, quoteApi);

// Error handling middleware
const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// GET /api/tokens - Get all tokens with optional filtering
app.get('/api/tokens', asyncHandler(async (req: any, res: any) => {
    try {
        const args = {
            find: req.query.find,
            offset: req.query.offset ? parseInt(req.query.offset) : undefined,
            limit: req.query.limit ? parseInt(req.query.limit) : undefined
        };

        const parsed = GetTokensArgsSchema.safeParse(args);
        if (!parsed.success) {
            return res.status(400).json({
                error: 'Invalid parameters',
                details: parsed.error.errors
            });
        }

        const result = await dataApi.getTokens(parsed.data);
        res.json({
            success: true,
            data: result,
            count: result.length
        });
    } catch (error: any) {
        res.status(500).json({
            error: 'Failed to fetch tokens',
            message: error.message
        });
    }
}));

// GET /api/tokens/category/:category - Get tokens by category
app.get('/api/tokens/category/:category', asyncHandler(async (req: any, res: any) => {
    try {
        const args = {
            category: req.params.category,
            address: req.query.address,
            offset: req.query.offset ? parseInt(req.query.offset) : 0,
            limit: req.query.limit ? parseInt(req.query.limit) : 500
        };

        const parsed = GetTokensByCategoryArgsSchema.safeParse(args);
        if (!parsed.success) {
            return res.status(400).json({
                error: 'Invalid parameters',
                details: parsed.error.errors
            });
        }

        const result = await dataApi.getTokensByCategory(
            parsed.data.category,
            {
                address: parsed.data.address,
                offset: parsed.data.offset,
                limit: parsed.data.limit
            }
        );

        res.json({
            success: true,
            data: result,
            category: req.params.category,
            count: result.length
        });
    } catch (error: any) {
        res.status(500).json({
            error: 'Failed to fetch tokens by category',
            message: error.message
        });
    }
}));

// GET /api/tokens/:address - Get token by contract address
app.get('/api/tokens/:address', asyncHandler(async (req: any, res: any) => {
    try {
        const args = { contractAddress: req.params.address };

        const parsed = GetTokenArgsSchema.safeParse(args);
        if (!parsed.success) {
            return res.status(400).json({
                error: 'Invalid contract address',
                details: parsed.error.errors
            });
        }

        InputValidator.validateAddress(parsed.data.contractAddress, 'contractAddress');

        const result = await dataApi.getToken(parsed.data.contractAddress);
        res.json({
            success: true,
            data: result
        });
    } catch (error: any) {
        res.status(500).json({
            error: 'Failed to fetch token',
            message: error.message
        });
    }
}));

// GET /api/tokens/count - Get total token count
app.get('/api/tokens/count', asyncHandler(async (req: any, res: any) => {
    try {
        const result = await dataApi.getTokenCount();
        res.json({
            success: true,
            data: { count: result },
            total_tokens: result
        });
    } catch (error: any) {
        res.status(500).json({
            error: 'Failed to fetch token count',
            message: error.message
        });
    }
}));

// GET /api/wallet/:address/balances - Get wallet balances
app.get('/api/wallet/:address/balances', asyncHandler(async (req: any, res: any) => {
    try {
        const args = { address: req.params.address };

        const parsed = GetWalletBalancesArgsSchema.safeParse(args);
        if (!parsed.success) {
            return res.status(400).json({
                error: 'Invalid wallet address',
                details: parsed.error.errors
            });
        }

        InputValidator.validateAddress(parsed.data.address, 'address');

        const result = await dataApi.getWalletBalances(parsed.data.address);
        res.json({
            success: true,
            data: result,
            wallet: req.params.address,
            balances_count: result.length
        });
    } catch (error: any) {
        res.status(500).json({
            error: 'Failed to fetch wallet balances',
            message: error.message
        });
    }
}));

// POST /api/quote - Get swap quote
app.post('/api/quote', asyncHandler(async (req: any, res: any) => {
    try {
        const parsed = GetQuoteArgsSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                error: 'Invalid quote parameters',
                details: parsed.error.errors
            });
        }

        // Validate inputs
        InputValidator.validateAmount(parsed.data.amount);
        if (parsed.data.sender) {
            InputValidator.validateAddress(parsed.data.sender, 'sender');
        }
        InputValidator.validateSlippage(parsed.data.slippage);
        InputValidator.validateDeadline(parsed.data.deadline);
        InputValidator.validateMaxHops(parsed.data.max_hops);

        const result = await quoteApi.getQuote(parsed.data);
        res.json({
            success: true,
            data: result,
            quote_for: {
                amount: parsed.data.amount,
                from: parsed.data.from,
                to: parsed.data.to
            }
        });
    } catch (error: any) {
        res.status(500).json({
            error: 'Failed to get quote',
            message: error.message
        });
    }
}));

// POST /api/swap - Execute swap
app.post('/api/swap', asyncHandler(async (req: any, res: any) => {
    try {
        const parsed = ExecuteSwapArgsSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                error: 'Invalid swap parameters',
                details: parsed.error.errors
            });
        }

        // Validate inputs - stricter validation for actual swap execution
        InputValidator.validateAmount(parsed.data.amount);
        InputValidator.validateAddress(parsed.data.sender, 'sender');
        InputValidator.validateSlippage(parsed.data.slippage);
        InputValidator.validateDeadline(parsed.data.deadline);
        InputValidator.validateMaxHops(parsed.data.max_hops);

        const result = await quoteApi.executeSwap(parsed.data);
        res.json({
            success: true,
            data: result,
            swap_executed: {
                amount: parsed.data.amount,
                from: parsed.data.from,
                to: parsed.data.to,
                sender: parsed.data.sender
            }
        });
    } catch (error: any) {
        res.status(500).json({
            error: 'Failed to execute swap',
            message: error.message
        });
    }
}));

// Global error handler
app.use((error: any, req: any, res: any, next: any) => {
    console.error('Global error handler:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: error.message
    });
});

// 404 handler
app.use((req: any, res: any) => {
    res.status(404).json({
        error: 'Endpoint not found',
        available_endpoints: {
            'GET /': 'API documentation',
            'GET /api/tokens': 'Get all tokens',
            'GET /api/tokens/category/:category': 'Get tokens by category',
            'GET /api/tokens/:address': 'Get token by address',
            'GET /api/tokens/count': 'Get token count',
            'GET /api/wallet/:address/balances': 'Get wallet balances',
            'POST /api/quote': 'Get swap quote',
            'POST /api/swap': 'Execute swap'
        }
    });
});

const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Monorail DEX API Server running on port ${PORT}`);
        console.log(`📖 API Documentation: http://localhost:${PORT}`);
        console.log(`🔗 Endpoints available at http://localhost:${PORT}/api/*`);
    });
}

export default app;