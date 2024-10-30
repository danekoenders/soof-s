import { Client } from "@gadget-client/soof-app";

export const bridgeApi = new Client({
    environment: process.env.NODE_ENV,
    authenticationMode: { apiKey: process.env.SOOF_BRIDGE_API_KEY },
});