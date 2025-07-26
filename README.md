# Speak Proxy Server

A lightweight Node.js proxy server that bypasses CORS for Google Translate Text-to-Speech API.

## Features

- 🎤 Text-to-Speech proxy for Google Translate API
- 🌐 CORS-enabled for cross-origin requests
- ✅ Input validation and sanitization
- 🚀 Ready for Vercel deployment
- 🔍 Health check endpoint
- 📝 Support for 40+ languages

## Quick Start

### Local Development

```bash
npm install
npm start
```

The server will start on `http://localhost:5000`

### API Endpoints

#### Health Check
```
GET /health
```

#### Text-to-Speech
```
GET /speak?text=hello&lang=en
```

**Parameters:**
- `text` (required): Text to convert to speech (max 200 characters)
- `lang` (optional): Language code (default: 'en')

**Supported Languages:**
`en`, `es`, `fr`, `de`, `it`, `pt`, `ru`, `ja`, `ko`, `zh`, `hi`, `ar`, and [many more](./utils/validation.js)

## Vercel Deployment

This app is pre-configured for Vercel deployment:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

The `vercel.json` configuration handles all the serverless setup.

## Example Usage

### JavaScript/Fetch
```javascript
const response = await fetch('https://your-app.vercel.app/speak?text=Hello%20World&lang=en');
const audioBlob = await response.blob();
const audio = new Audio(URL.createObjectURL(audioBlob));
audio.play();
```

### HTML Audio Element
```html
<audio controls>
    <source src="https://your-app.vercel.app/speak?text=Hello&lang=en" type="audio/mpeg">
</audio>
```

## Architecture

- **Express.js**: Web framework
- **CORS**: Cross-origin resource sharing
- **node-fetch**: HTTP client for Google TTS API
- **Serverless**: Optimized for Vercel Functions

## Error Handling

The API returns consistent JSON error responses:

```json
{
  "error": "Validation Error",
  "message": "Text parameter is required",
  "code": "INVALID_PARAMETERS"
}
```

## License

ISC