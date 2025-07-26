# Speak Proxy Server

## Overview

This is a Node.js Express-based proxy server that provides text-to-speech functionality by interfacing with Google Translate's TTS API. The server acts as a middleware layer, accepting text input from clients and returning audio responses from Google's TTS service. It's designed as a lightweight, stateless service with CORS support for cross-origin requests.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture
- **Framework**: Express.js (v5.1.0) - Modern Node.js web framework
- **Runtime**: Node.js server running on configurable host/port (default: 0.0.0.0:8000)
- **Architecture Pattern**: RESTful API with modular routing structure
- **No Database**: Stateless design with no persistent data storage
- **Proxy Pattern**: Server acts as a proxy between clients and Google Translate TTS API

### Key Design Decisions
- **Stateless Design**: No session management or data persistence, making it easily scalable
- **Proxy Architecture**: Abstracts Google TTS API complexity and provides consistent interface
- **Modular Structure**: Separated concerns with dedicated middleware, routes, and utilities
- **CORS-First**: Designed for cross-origin requests with permissive CORS policy

## Key Components

### Core Server (`server.js`)
- **Purpose**: Main application entry point and configuration
- **Responsibilities**: 
  - Express app setup and middleware configuration
  - Route registration and error handling
  - Server lifecycle management
  - Health check endpoint

### Routing System (`routes/speak.js`)
- **Purpose**: Handles TTS-specific API endpoints
- **Key Endpoint**: `GET /speak` - Proxies text-to-speech requests
- **Parameters**: 
  - `text` (required): Text to convert to speech
  - `lang` (optional): Language code (defaults to 'en')

### Input Validation (`utils/validation.js`)
- **Purpose**: Validates and sanitizes input parameters
- **Features**:
  - Text length and content validation
  - Language code verification against supported languages
  - Input sanitization for security

### Error Handling (`middleware/errorHandler.js`)
- **Purpose**: Centralized error handling and response formatting
- **Features**:
  - Consistent error response format
  - Environment-aware error details (more verbose in development)
  - CORS headers preservation in error responses
  - Specific handling for common error types (JSON parsing, payload size)

## Data Flow

1. **Request Reception**: Client sends GET request to `/speak` with query parameters
2. **Input Validation**: Server validates text content and language code
3. **Proxy Request**: Server constructs and sends request to Google Translate TTS API
4. **Response Streaming**: Audio response from Google API is streamed back to client
5. **Error Handling**: Any errors are caught and formatted consistently

## External Dependencies

### Core Dependencies
- **express**: Web framework for API routing and middleware
- **cors**: Cross-Origin Resource Sharing middleware
- **node-fetch**: HTTP client for making requests to Google TTS API

### External Service Integration
- **Google Translate TTS API**: Primary text-to-speech service
  - Endpoint: `https://translate.google.com/translate_tts`
  - No authentication required
  - Supports multiple languages
  - Returns audio/mpeg format

### Language Support
The service supports 40+ languages including major world languages (English, Spanish, French, German, Chinese, Japanese, etc.) with language codes validated against a predefined list.

## Deployment Strategy

### Vercel Configuration (Primary)
- **Serverless Functions**: Configured with `vercel.json` for automatic deployment
- **API Structure**: Main app exported via `/api/index.js` entry point
- **Function Timeout**: 30-second maximum duration for TTS requests
- **Auto-scaling**: Vercel handles scaling based on request volume
- **Environment**: Production-ready with sanitized error responses

### Local Development
- **Development**: Full error details and stack traces
- **Port/Host**: Configurable via environment variables (PORT, defaults to 5000)
- **Direct Execution**: `npm start` runs Express server traditionally

### Runtime Requirements
- **Node.js**: Version 18+ (specified in engines for Vercel)
- **Express**: Version 4.x for stability and Vercel compatibility
- **No Database**: Stateless design eliminates database setup complexity
- **Minimal Dependencies**: Only 3 core dependencies for lightweight deployment

### Scalability Considerations
- **Stateless Design**: Multiple serverless instances run without coordination
- **No Session Management**: Eliminates sticky session requirements
- **Simple Health Check**: `/health` endpoint for monitoring
- **CORS Configuration**: Ready for frontend integration from any domain

The application is optimized for Vercel's serverless platform while maintaining compatibility with traditional Node.js hosting environments.