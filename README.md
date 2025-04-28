# Game Recommendation Backend

A TypeScript backend service that provides game recommendations and information using OpenAI's GPT-4o and web search capabilities. This service offers intelligent, up-to-date game recommendations and answers a wide range of game-related questions.

## Features

- **Intelligent Game Recommendations**: Get personalized game suggestions based on your preferences
- **Web Search Integration**: Fetches the latest information about games from the web
- **Smart Response Format**: Structured JSON responses with game details
- **Context-Aware Conversations**: Maintains conversation history for more relevant follow-ups
- **Error-Resilient Web Scraping**: Robust web search with retry mechanisms and error handling

## Prerequisites

1. OpenAI API key
2. A web search service running on port 8080 (or configure your own endpoint)
3. Node.js v18 or higher

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy `.env.example` to `.env` and add your API keys:
   ```
   cp .env.example .env
   ```
4. Edit `.env` with your OpenAI API key

## Development

Start the development server:

```
npm run dev
```

## Build and Run

Build the TypeScript project:

```
npm run build
```

Start the server:

```
npm start
```

## API Endpoints

- `POST /chat` - Send a message about games

  - Request body: `{ "message": "your message" }`
  - Returns:
    ```json
    {
      "type": "chat",
      "response": {
        "text": "Your answer about games",
        "games": [
          {
            "name": "Game Name",
            "description": "Game description",
            "platforms": ["PC", "PS5", "Xbox"],
            "image": "image_url",
            "score": 4.5
          }
        ]
      },
      "conversation_id": "example-id"
    }
    ```

- `GET /` - Health check endpoint
  - Returns: `{ "status": "ok" }`

## Technical Architecture

The system uses a multi-stage approach to provide accurate game recommendations:

1. **Query Analysis**: Determines if the user's message requires web search for up-to-date information
2. **Web Search**: If needed, performs a web search to gather the latest information about games
3. **Content Extraction**: Uses Mozilla's Readability to extract clean, readable content from web pages
4. **Response Generation**: Uses OpenAI's GPT-4o to generate a structured response with game recommendations
5. **Game Information Enrichment**: Enhances responses with detailed game information from the RAWG API

## Web Search Implementation

The system includes a robust web search functionality with the following features:

- **Retry Mechanism**: Automatically retries failed requests up to 3 times
- **Timeout Handling**: Sets reasonable timeouts to prevent hanging requests
- **Error Management**: Gracefully handles network errors, parsing errors, and invalid responses
- **Content Cleaning**: Uses Mozilla's Readability to extract meaningful content from web pages
- **User-Agent Management**: Uses proper browser-like user agents to avoid being blocked

## Environment Variables

- `OPENAI_API_KEY` - Your OpenAI API key
- `PORT` - Server port (default: 3001)
- `SEARCH_ENDPOINT` - Web search endpoint (default: http://127.0.0.1:8080/search)

## Conversation Examples

This system works with natural conversation flows and can handle follow-up questions:

### Example 1: Game Recommendations

1. User: "I want to play open world games with good story"
2. System: _returns list of story-rich open world games with details_
3. User: "Which of these has the best graphics?"
4. System: _analyzes previously recommended games and compares their graphics quality_

### Example 2: Specific Game Information

1. User: "Tell me about Elden Ring"
2. System: _searches the web for latest information about Elden Ring and provides details_
3. User: "What DLCs are available for it?"
4. System: _provides up-to-date information about Elden Ring DLCs_

## Future Improvements

- Database integration for persistent conversation history
- User authentication and personalized recommendations
- Game library management features
- Integration with game stores for purchase links and pricing information

**Note:** For production use, consider implementing proper authentication and rate limiting.
