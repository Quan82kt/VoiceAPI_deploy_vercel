/**
 * Input validation utilities for the speak proxy server
 */

// Supported language codes for Google Translate TTS
const SUPPORTED_LANGUAGES = {
    'af': 'Afrikaans',
    'ar': 'Arabic',
    'bg': 'Bulgarian',
    'bn': 'Bengali',
    'bs': 'Bosnian',
    'ca': 'Catalan',
    'cs': 'Czech',
    'da': 'Danish',
    'de': 'German',
    'el': 'Greek',
    'en': 'English',
    'es': 'Spanish',
    'et': 'Estonian',
    'fi': 'Finnish',
    'fr': 'French',
    'gu': 'Gujarati',
    'hi': 'Hindi',
    'hr': 'Croatian',
    'hu': 'Hungarian',
    'id': 'Indonesian',
    'is': 'Icelandic',
    'it': 'Italian',
    'iw': 'Hebrew',
    'ja': 'Japanese',
    'jw': 'Javanese',
    'km': 'Khmer',
    'kn': 'Kannada',
    'ko': 'Korean',
    'la': 'Latin',
    'lv': 'Latvian',
    'ml': 'Malayalam',
    'mr': 'Marathi',
    'ms': 'Malay',
    'my': 'Myanmar (Burmese)',
    'ne': 'Nepali',
    'nl': 'Dutch',
    'no': 'Norwegian',
    'pl': 'Polish',
    'pt': 'Portuguese',
    'ro': 'Romanian',
    'ru': 'Russian',
    'si': 'Sinhala',
    'sk': 'Slovak',
    'sq': 'Albanian',
    'sr': 'Serbian',
    'su': 'Sundanese',
    'sv': 'Swedish',
    'sw': 'Swahili',
    'ta': 'Tamil',
    'te': 'Telugu',
    'th': 'Thai',
    'tl': 'Filipino',
    'tr': 'Turkish',
    'uk': 'Ukrainian',
    'ur': 'Urdu',
    'vi': 'Vietnamese',
    'zh-cn': 'Chinese (Simplified)',
    'zh-tw': 'Chinese (Traditional)',
    'zh': 'Chinese'
};

/**
 * Validates the speak endpoint parameters
 * @param {string} text - Text to convert to speech
 * @param {string} lang - Language code
 * @returns {Object} Validation result with valid flag and message
 */
function validateSpeakParams(text, lang) {
    // Check if text is provided
    if (!text) {
        return {
            valid: false,
            message: 'Text parameter is required and cannot be empty'
        };
    }

    // Check text type
    if (typeof text !== 'string') {
        return {
            valid: false,
            message: 'Text parameter must be a string'
        };
    }

    // Check text length (Google TTS has limits)
    if (text.trim().length === 0) {
        return {
            valid: false,
            message: 'Text parameter cannot be empty or contain only whitespace'
        };
    }

    if (text.length > 200) {
        return {
            valid: false,
            message: 'Text parameter is too long. Maximum length is 200 characters'
        };
    }

    // Check for potentially harmful content
    if (containsHarmfulContent(text)) {
        return {
            valid: false,
            message: 'Text contains potentially harmful content'
        };
    }

    // Validate language code
    if (lang && typeof lang !== 'string') {
        return {
            valid: false,
            message: 'Language parameter must be a string'
        };
    }

    // Check if language code is supported
    const langCode = lang ? lang.toLowerCase() : 'en';
    if (!SUPPORTED_LANGUAGES[langCode]) {
        return {
            valid: false,
            message: `Unsupported language code: ${langCode}. Supported languages: ${Object.keys(SUPPORTED_LANGUAGES).join(', ')}`
        };
    }

    return {
        valid: true,
        message: 'Parameters are valid'
    };
}

/**
 * Checks if text contains potentially harmful content
 * @param {string} text - Text to check
 * @returns {boolean} True if harmful content is detected
 */
function containsHarmfulContent(text) {
    // Basic check for script tags and other potentially harmful content
    const harmfulPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /vbscript:/gi,
        /onload\s*=/gi,
        /onerror\s*=/gi,
        /onclick\s*=/gi
    ];

    return harmfulPatterns.some(pattern => pattern.test(text));
}

/**
 * Get list of supported languages
 * @returns {Object} Object with language codes as keys and language names as values
 */
function getSupportedLanguages() {
    return { ...SUPPORTED_LANGUAGES };
}

/**
 * Check if a language code is supported
 * @param {string} langCode - Language code to check
 * @returns {boolean} True if supported
 */
function isLanguageSupported(langCode) {
    return !!SUPPORTED_LANGUAGES[langCode.toLowerCase()];
}

module.exports = {
    validateSpeakParams,
    getSupportedLanguages,
    isLanguageSupported,
    SUPPORTED_LANGUAGES
};
