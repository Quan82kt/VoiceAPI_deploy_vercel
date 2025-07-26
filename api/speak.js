export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  const { text, lang = 'zh-CN' } = req.query;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Missing or invalid "text" parameter',
      code: 'INVALID_PARAMETERS',
    });
  }

  const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
    text
  )}&tl=${lang}&client=tw-ob&ttsspeed=1`;

  try {
    const response = await fetch(ttsUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': '*/*',
      },
    });

    if (!response.ok) {
      return res.status(502).json({
        error: 'Upstream Error',
        message: `Google TTS responded with ${response.status}`,
      });
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('audio')) {
      return res.status(502).json({
        error: 'Invalid Response',
        message: 'Expected audio response from Google TTS',
      });
    }

    const buffer = await response.arrayBuffer();

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Accept-Ranges', 'bytes');
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('TTS error:', err);
    res.status(500).json({
      error: 'Internal Error',
      message: 'Failed to proxy TTS',
    });
  }
}
