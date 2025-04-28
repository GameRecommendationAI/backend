
```markdown
# Game Recommendation Backend

This is the backend service for the **GenAI Game Recommendation System**, built using TypeScript, Node.js (Fastify), and OpenAI's GPT-4o.  
It provides intelligent, up-to-date game recommendations by combining **live web search**, **external database enrichment**, and **dynamic AI generation**.

---

## Features

- **Intelligent Game Recommendations**: Get personalized and real-time game suggestions based on user preferences
- **Retrieval Augmented Generation (RAG)**: Combines live search results and external structured data to improve response quality
- **Web Search Integration**: Fetches the latest information about games from the web using a private search engine (SearXNG)
- **Knowledge Enrichment via RAWG.io**: Fetches real-time game metadata like ratings, genres, platforms, store availability, and sale status
- **Smart Response Format**: Returns structured JSON responses optimized for frontend display
- **Context-Aware Conversations**: Maintains conversation history for better follow-up handling
- **Error-Resilient Web Scraping**: Implements robust retry mechanisms and timeout handling for web data retrieval

---

## Prerequisites

- OpenAI API key
- RAWG.io API key (for external game database enrichment)
- A web search service running on port 8080 (default is SearXNG)
- Node.js v18 or higher

---

## Setup

1. Clone the repository:
   ```bash
   git clone your-repo-url
   cd backend-directory
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
4. Fill `.env` with your keys:
   - `OPENAI_API_KEY`
   - `RAWG_API_KEY`
   - `SEARCH_ENDPOINT` (default: `http://127.0.0.1:8080/search`)

---

## Development

Start the development server:
```bash
npm run dev
```

---

## Build and Run

Build the TypeScript project:
```bash
npm run build
```

Start the server:
```bash
npm start
```

---

## API Endpoints

- `POST /chat` — Send a user query about games
  - Request body:
    ```json
    {
      "message": "your message"
    }
    ```
  - Returns a structured JSON like:
    ```json
    {
      "type": "chat",
      "response": {
        "text": "AI-generated answer",
        "games": [
          {
            "name": "Game Name",
            "description": "Brief description",
            "platforms": ["PC", "PlayStation 5"],
            "image": "image_url",
            "score": 4.5,
            "sale_status": "On Sale" // (if applicable)
          }
        ]
      },
      "conversation_id": "example-id"
    }
    ```

- `GET /` — Health check
  - Returns:
    ```json
    { "status": "ok" }
    ```

---

## Technical Architecture

The backend uses a **multi-stage Retrieval Augmented Generation (RAG)** process:

1. **Query Analysis**: Understands user intent and decides if live search is needed
2. **Live Web Retrieval**: Performs web search using SearXNG for real-time results
3. **Content Extraction**: Cleans extracted text using Mozilla's Readability
4. **Context Enrichment**: Fetches structured game metadata from RAWG.io (including store and sale info)
5. **AI Response Generation**: GPT-4o generates a structured, enriched JSON response for frontend consumption

---

## Web Search Implementation

- **Retry Mechanism**: Retries failed requests automatically
- **Timeout Handling**: Prevents hanging requests with proper timeout settings
- **Error Management**: Graceful fallback for network or parsing failures
- **Content Cleaning**: Uses Mozilla's Readability to extract meaningful article text
- **User-Agent Spoofing**: Proper headers to mimic browser behavior

---

## Environment Variables

- `OPENAI_API_KEY` — Your OpenAI API Key
- `RAWG_API_KEY` — RAWG.io API Key for game enrichment
- `PORT` — Server port (default: 3001)
- `SEARCH_ENDPOINT` — Web search service endpoint (default: `http://127.0.0.1:8080/search`)

---

## Conversation Flow Examples

### Example 1: Game Recommendations

- **User**: "I want to play open world games with good story"
- **System**: Returns a curated list of story-rich open world games, including store availability and sale status

- **User**: "Which of these games are on sale?"
- **System**: Filters previous recommendations based on current sale status

### Example 2: Specific Game Information

- **User**: "Tell me about Elden Ring"
- **System**: Fetches latest web search + RAWG data and provides updated details including DLCs, release updates, and availability.

---

## Future Improvements

- **Vectorized Semantic Retrieval**: Future integration with OpenAI Embeddings and vector databases for faster, smarter retrieval
- **Persistent Database Integration**: Save conversation history and user sessions
- **Authentication and Personalization**: Recommend games based on user profiles
- **Dynamic Pricing and Store Comparisons**: Compare multiple stores live for best deals
- **Full Kubernetes Cloud Deployment**: For scalable infrastructure

---

## Conclusion

This backend enables a real-time, intelligent game recommendation system by combining Retrieval Augmented Generation (RAG) techniques, live web search, external structured databases, and GPT-4o generation — all while optimizing for cost, flexibility, and accuracy.

---
```

---
