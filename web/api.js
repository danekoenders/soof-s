// Sets up the API client for interacting with your backend. 
// For your API reference, visit: https://docs.gadget.dev/api/soof-s-bridge
import { Client } from "@gadget-client/soof-s";

export const api = new Client({ environment: window.gadgetConfig.environment });
