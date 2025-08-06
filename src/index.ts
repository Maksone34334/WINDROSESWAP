#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { MonorailDataApi, MonorailQuoteApi } from "./api-clients.js";
import { ToolHandlers } from "./handlers.js";
import { TOOLS } from "./tools.js";

// API endpoints
const API_ENDPOINTS = {
    QUOTE_API: "https://testnet-pathfinder.monorail.xyz/v4",
    DATA_API: "https://testnet-api.monorail.xyz/v1",
};

// Create API instances
const dataApi = new MonorailDataApi(API_ENDPOINTS.DATA_API);
const quoteApi = new MonorailQuoteApi(API_ENDPOINTS.QUOTE_API, dataApi);

// Create tool handlers
const toolHandlers = new ToolHandlers(dataApi, quoteApi);

// Server setup
const server = new Server(
    {
        name: "monorail-api-server",
        version: "0.2.0",
    },
    {
        capabilities: {
            tools: {},
        },
    },
);

// Register tools with the server
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: TOOLS,
    };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        const { name, arguments: args } = request.params;
        return await toolHandlers.handleToolCall(name, args);
    } catch (error) {
        console.error("Tool call error:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            content: [{ type: "text", text: `Error: ${errorMessage}` }],
            isError: true,
        };
    }
});

// Start server
async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

runServer().catch((error) => {
    console.error("Fatal error running server:", error);
    process.exit(1);
});