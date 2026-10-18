// CalSnap backend: serves the app and proxies photo analysis to Claude.
// Run: ANTHROPIC_API_KEY=sk-... node server.js   (no key = demo mode)
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-5-5';

const PROMPT = `You are a nutrition analyst. Look at the food photo and estimate nutrition for the whole portion shown.
Reply with ONLY a JSON object, no markdown, in this exact shape:
{"name": string, "calories": number, "protein_g": number, "carbs_g": number, "fat_g": number, "confidence": "low"|"medium"|"high", "tip": string}
"tip" is one short healthy suggestion. If the image has no food, use name "No food detected" and zeros.`;

const DEMO = {
  name: 'Chicken biryani (demo)',
  calories: 640, protein_g: 32, carbs_g: 78, fat_g: 20,
  confidence: 'low',
  tip: 'Demo mode: set ANTHROPIC_API_KEY for real analysis.',
};

async function analyze(b64) {
  if (!KEY) return DEMO;
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: b64 } },
          { type: 'text', text: PROMPT },
        ],
      }],
    }),
  });
  if (!res.ok) throw new Error('AI error ' + res.status);
  const data = await res.json();
  const text = (data.content || []).map(c => c.text || '').join('');
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('Bad AI response');
  return JSON.parse(m[0]);
}

function send(res, code, body, type = 'application/json') {
  res.writeHead(code, { 'content-type': type });
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
}

http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/analyze') {
    let size = 0;
    const chunks = [];
    req.on('data', c => {
      size += c.length;
      if (size > 8e6) { send(res, 413, { error: 'Image too large' }); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', async () => {
      try {
        const { image } = JSON.parse(Buffer.concat(chunks).toString());
        if (!image) return send(res, 400, { error: 'image required' });
        send(res, 200, await analyze(image));
      } catch (e) {
        send(res, 500, { error: e.message });
      }
    });
    return;
  }
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    return send(res, 200, fs.readFileSync(path.join(__dirname, 'index.html')), 'text/html; charset=utf-8');
  }
  if (req.method === 'GET' && req.url === '/manifest.json') {
    return send(res, 200, fs.readFileSync(path.join(__dirname, 'manifest.json')), 'application/json');
  }
  send(res, 404, { error: 'Not found' });
}).listen(PORT, () => console.log(`CalSnap running on http://localhost:${PORT}${KEY ? '' : ' (demo mode)'}`));
