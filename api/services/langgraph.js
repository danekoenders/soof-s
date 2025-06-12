import { Client } from "@langchain/langgraph-sdk";

const langgraph = new Client({ 
  apiUrl: process.env.LANGGRAPH_DEPLOYMENT_URL,
  defaultHeaders: {
    "Authorization": `Bearer ${process.env.LANGGRAPH_ACCESS_KEY}`
  }
});

export {
  langgraph
}; 