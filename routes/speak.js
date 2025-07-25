const express = require('express');
const fetch = require('node-fetch');
const { validateSpeakParams } = require('../utils/validation');

const router = express.Router();

// Google Translate TTS API endpoint
const GOOGLE_TTS_URL = 'https://translate.google.com/translate_tts';

/**
 * GET /speak
 * Proxies text-to-speech requests to Google Translate API
 * Query parameters:
 * - text: Text to convert to speech (required)
 * - lang: Language code (optional, defaults to 'en')
 */
router.get('/', async (req, res) => {
    try {
        const { text, lang = 'en' } = req.query;

        // Validate input parameters
        const validation = validateSpeakParams(text, lang);
        if (!validation.valid) {
            return res.status(400).json({
                error: 'Validation Error',
                message: validation.message,
                code: 'INVALID_PARAMETERS'
            });
        }

        // Construct Google TTS API URL
        const ttsParams = new URLSearchParams({
            ie: 'UTF-8',
            q: text,
            tl: lang,
            client: 'tw-ob',
            ttsspeed: '1'
        });

        const ttsUrl = `${GOOGLE_TTS_URL}?${ttsParams.toString()}`;

        console.log(`🔊 Processing TTS request: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}" (${lang})`);

        // Make request to Google TTS API
        const response = await fetch(ttsUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': '*/*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            },
            timeout: 10000 // 10 second timeout
        });

        // Check if the response is successful
        if (!response.ok) {
            console.error(`❌ Google TTS API error: ${response.status} ${response.statusText}`);
            
            if (response.status === 429) {
                return res.status(429).json({
                    error: 'Rate Limited',
                    message: 'Too many requests to Google TTS API. Please try again later.',
                    code: 'RATE_LIMITED'
                });
            }

            if (response.status === 403) {
                return res.status(503).json({
                    error: 'Service Unavailable',
                    message: 'Google TTS API access denied. Service may be temporarily unavailable.',
                    code: 'ACCESS_DENIED'
                });
            }

            return res.status(502).json({
                error: 'Upstream Error',
                message: 'Failed to fetch audio from Google TTS API',
                code: 'UPSTREAM_ERROR',
                details: `HTTP ${response.status}`
            });
        }

        // Check content type
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('audio')) {
            console.error(`❌ Unexpected content type: ${contentType}`);
            return res.status(502).json({
                error: 'Invalid Response',
                message: 'Google TTS API returned non-audio content',
                code: 'INVALID_RESPONSE_TYPE'
            });
        }

        // Set appropriate headers for audio response
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Disposition', 'inline');
        res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
        res.setHeader('Accept-Ranges', 'bytes');

        // Stream the audio data
        const audioBuffer = await response.buffer();
        
        console.log(`✅ TTS request successful: ${audioBuffer.length} bytes delivered`);
        
        res.send(audioBuffer);

    } catch (error) {
        console.error('❌ Error in /speak endpoint:', error);

        if (error.name === 'FetchError') {
            return res.status(502).json({
                error: 'Network Error',
                message: 'Failed to connect to Google TTS API',
                code: 'NETWORK_ERROR'
            });
        }

        if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
            return res.status(504).json({
                error: 'Timeout Error',
                message: 'Request to Google TTS API timed out',
                code: 'TIMEOUT_ERROR'
            });
        }

        // Generic server error
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while processing your request',
            code: 'INTERNAL_ERROR'
        });
    }
});

// OPTIONS handler for CORS preflight
router.options('/', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).end();
});

module.exports = router;
