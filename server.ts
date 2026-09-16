import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

const CONFIG_PATH = path.join(process.cwd(), 'openrouter.config.json');

function getOpenRouterConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
      const data = JSON.parse(raw);
      return {
        apiKey: (data.apiKey || '').trim() || (process.env.OPENROUTER_API_KEY || '').trim(),
        model: (data.model || '').trim() || (process.env.OPENROUTER_MODEL || '').trim() || 'deepseek/deepseek-r1:free',
        siteUrl: data.siteUrl || 'http://localhost:3000',
        siteName: data.siteName || 'MAY OS',
      };
    }
  } catch (err) {
    console.error('Error reading openrouter.config.json:', err);
  }

  return {
    apiKey: (process.env.OPENROUTER_API_KEY || '').trim(),
    model: (process.env.OPENROUTER_MODEL || '').trim() || 'deepseek/deepseek-r1:free',
    siteUrl: 'http://localhost:3000',
    siteName: 'MAY OS',
  };
}

// Config Status Endpoint
app.get('/api/config', (req, res) => {
  const config = getOpenRouterConfig();
  res.json({
    hasOpenRouterKey: Boolean(config.apiKey),
    model: config.model,
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    provider: config.apiKey ? 'openrouter' : (process.env.GEMINI_API_KEY ? 'gemini' : 'synthetic'),
  });
});

// Save Config Endpoint
app.post('/api/config', (req, res) => {
  try {
    const { apiKey, model } = req.body;
    let currentConfig: Record<string, unknown> = {};
    if (fs.existsSync(CONFIG_PATH)) {
      try {
        currentConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
      } catch {
        currentConfig = {};
      }
    }

    const updated = {
      ...currentConfig,
      apiKey: apiKey !== undefined ? apiKey.trim() : currentConfig.apiKey || '',
      model: model !== undefined ? model.trim() : currentConfig.model || 'deepseek/deepseek-r1:free',
    };

    fs.writeFileSync(CONFIG_PATH, JSON.stringify(updated, null, 2), 'utf-8');
    res.json({ success: true, model: updated.model, hasKey: Boolean(updated.apiKey) });
  } catch (err) {
    console.error('Failed to update config:', err);
    res.status(500).json({ error: 'Failed to update config file' });
  }
});

// Chat Proxy Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, systemPrompt } = req.body;
    const config = getOpenRouterConfig();

    const formattedMessages = Array.isArray(messages) ? messages : [];

    // 1. If OpenRouter API Key is present in openrouter.config.json or environment
    if (config.apiKey) {
      const openRouterMessages = [
        {
          role: 'system',
          content:
            systemPrompt ||
            'You are May, an autonomous synthetic intelligence and operating system. You speak clearly, concisely, and support orchestration, engineering, and digital workflows.',
        },
        ...formattedMessages.map((m: { sender?: string; role?: string; text?: string; content?: string }) => ({
          role: m.sender === 'user' || m.role === 'user' ? 'user' : 'assistant',
          content: m.text || m.content || '',
        })),
      ];

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'HTTP-Referer': config.siteUrl || 'http://localhost:3000',
          'X-Title': config.siteName || 'MAY OS',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.model,
          messages: openRouterMessages,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter error response:', errorText);
        return res.status(response.status).json({
          error: `OpenRouter error (${response.status}): ${errorText}`,
          fallback: true,
        });
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || 'May received no response from the model.';
      return res.json({
        reply,
        model: config.model,
        provider: 'openrouter',
      });
    }

    // 2. Fallback to Gemini if GEMINI_API_KEY is available
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const lastUserMessage = [...formattedMessages]
          .reverse()
          .find((m) => m.sender === 'user' || m.role === 'user');

        const promptText = lastUserMessage?.text || lastUserMessage?.content || 'Hello';
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: promptText,
          config: {
            systemInstruction:
              systemPrompt ||
              'You are May, an autonomous synthetic intelligence and operating system. Keep your responses concise, intelligent, and composed.',
          },
        });

        const reply = response.text || 'System telemetry confirmed.';
        return res.json({
          reply,
          model: 'gemini-3.8-flash',
          provider: 'gemini',
        });
      } catch (geminiErr) {
        console.error('Gemini API call error:', geminiErr);
      }
    }

    // 3. Fallback response with notice about openrouter.config.json
    const lastMsg = [...formattedMessages]
      .reverse()
      .find((m) => m.sender === 'user' || m.role === 'user');
    const query = (lastMsg?.text || '').toLowerCase();

    let reply = `Understood: "${lastMsg?.text || 'instruction'}". Orchestration tasks dispatched across system telemetry.`;
    if (query.includes('who are you')) {
      reply = `I am May, an autonomous synthetic intelligence and operating system. You can connect live models by adding your OpenRouter API key and model to "openrouter.config.json".`;
    } else if (query.includes('openrouter') || query.includes('model') || query.includes('api key')) {
      reply = `To connect OpenRouter, open "openrouter.config.json" and set your "apiKey" and "model". Currently configured model: "${config.model}".`;
    }

    return res.json({
      reply,
      model: config.model,
      provider: 'synthetic',
      tip: 'Configure openrouter.config.json to use live OpenRouter models',
    });
  } catch (err: unknown) {
    console.error('Error in /api/chat handler:', err);
    const errorMessage = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ error: errorMessage });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MAY OS Server running on http://localhost:${PORT}`);
  });
}

startServer();
