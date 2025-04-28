import Fastify from "fastify";
import dotenv from "dotenv";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import { searchWeb } from "./services/searchWeb.js";
import OpenAI from "openai";
import { getGames } from "./services/getGames.js";
import { z } from "zod";
import {
  getConversationById,
  Conversation,
  addMessageToConversation,
  addConversation,
} from "./services/db.js";
import { v4 as uuidv4 } from "uuid";

// Load environment variables
dotenv.config();

// Create Fastify instance
const fastify = Fastify({
  logger: true,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SearchSchema = z.object({
  shouldSearch: z.boolean(),
});

// Register plugins
fastify.register(cors, {
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
});
fastify.register(cookie);

// Define a basic health check route
fastify.get("/", async (request, reply) => {
  return { status: "ok" };
});

// Add a simple chat endpoint
fastify.post("/chat", async (request, reply) => {
  const { message, conversationId } = request.body as {
    message: string;
    conversationId: string;
  };

  console.log({ message, conversationId });

  let conversation: Conversation;

  if (conversationId) {
    conversation = getConversationById(conversationId);
    // console.log("Conversation: ", conversation);
  } else {
    conversation = { id: uuidv4(), messages: [] };
    addConversation(conversation);
    addMessageToConversation(conversation.id, {
      role: "developer",
      content: `
        You are a game expert AI assistant. Your primary goal is to provide accurate and up-to-date game recommendations.
        You MUST always search for the latest information when:
        1. User asks about game recommendations
        2. User asks about game features or details
        3. User asks about game comparisons
        4. User asks about recent game releases or updates
        5. User asks about game availability or platforms
        6. Remeber the user's preferences and previous conversations.
        7. Remeber the previous suggestions and games.
        8. Year is 2025
        
        You MUST respond in the exact JSON format specified below. No additional text or explanations are allowed.
            
        Required JSON format:
        {
            "text": "Your answer here",
            "games": [
                {
                    "name": "Game Name"
                }
            ]
        }

        Remember:
        - The response MUST be valid JSON
        - Include ONLY the JSON object, no other text
        - The "text" field should contain your detailed answer with specific game features, comparisons, or recommendations
        - The "games" array should contain game objects with exact, correct game names
        - Always prioritize accuracy and recency of information`,
    });
  }

  addMessageToConversation(conversation.id, {
    role: "developer",
    content: `Analyze if this message is about games or gaming. Consider the following cases that ALWAYS require a search:
    1. Game recommendations or suggestions
    2. Questions about specific games or gaming features
    3. Comparisons between games
    4. Questions about recent games or updates
    5. Questions about game availability or platforms
    
    Return true if ANY of these cases apply, as we need the latest information.
    
    Format: { "shouldSearch": boolean }`,
  });

  let texts: string[] = [];

  addMessageToConversation(conversation.id, {
    role: "developer",
    content: `Generate a query to search the web for the following question and directly return the query don't include any other text: ${message}`,
  });

  const queryResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: conversation.messages,
  });

  console.log("Query: ", queryResponse.choices[0].message.content);
  addMessageToConversation(conversation.id, queryResponse.choices[0].message);

  if (!queryResponse.choices[0].message.content) {
    return reply.status(400).send({ error: "No query generated" });
  }

  texts = await searchWeb(queryResponse.choices[0].message.content);

  addMessageToConversation(conversation.id, {
    role: "developer",
    content: `Use the following sources to answer the question: ${texts.join(
      "\n"
    )}`,
  });

  addMessageToConversation(conversation.id, {
    role: "user",
    content: message,
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: conversation.messages,
  });

  if (!response.choices[0].message.content) {
    return reply.status(400).send({ error: "No response generated" });
  }

  addMessageToConversation(conversation.id, response.choices[0].message);

  const responseJson = JSON.parse(response.choices[0].message.content);

  const gameNames = responseJson.games.map((el: any) => el.name);

  console.log("Game Names: ", gameNames);

  const games = await getGames(gameNames);

  return {
    type: "chat",
    response: {
      text: responseJson.text,
      games: games,
    },
    conversation_id: conversation.id,
  };
});

// Start server
const start = async () => {
  try {
    await fastify.listen({
      port: 3001,
      host: "0.0.0.0", // Listen on all network interfaces, not just localhost
    });
    console.log("Server running on http://localhost:3001");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
