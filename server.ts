import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini SDK with User-Agent header as required
  const apiKey = process.env.GEMINI_API_KEY || '';
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Health check route
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      model: 'gemini-3.8-flash',
      timestamp: new Date().toISOString(),
    });
  });

  // Multi-turn Gemini Chat endpoint for CBSE Class 10 Tutor
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, subject = 'all', chapterTitle } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Valid messages array is required' });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({
          error: 'GEMINI_API_KEY is not configured on the server. Please configure it in AI Studio Secrets.',
        });
      }

      // Convert conversation history into contents format expected by Gemini API
      // Role mapping: 'user' -> 'user', 'assistant'/'model' -> 'model'
      const contents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.content || '' }],
      }));

      // System instruction tailored specifically to CBSE Class 10 curriculum
      const systemInstruction = `You are "Studyhub AI Tutor", an elite, patient, and highly encouraging educational mentor specialized exclusively for CBSE Class 10 students (NCERT syllabus).
Your core subject domains:
1. CBSE Class 10 Mathematics: Real Numbers, Polynomials, Linear Equations in Two Variables, Quadratic Equations, Arithmetic Progressions, Triangles, Coordinate Geometry, Trigonometry & Applications, Circles, Areas Related to Circles, Surface Areas & Volumes, Statistics, and Probability.
2. CBSE Class 10 Science: Chemical Reactions & Equations, Acids Bases & Salts, Metals & Non-metals, Carbon & its Compounds, Life Processes, Control & Coordination, How do Organisms Reproduce?, Heredity & Evolution, Light (Reflection & Refraction), Human Eye & Colorful World, Electricity, Magnetic Effects of Electric Current, and Our Environment.

Pedagogical Guidelines:
- Provide structured, step-by-step explanations. Always show the formula first, substitute values clearly, and conclude with the final answer boxed or bolded.
- Use clean Markdown with headers, bold terms, bullet lists, and clear equation layouts.
- Offer practical CBSE Board Exam tips (e.g. "Board Exam Tip: Remember to write units like cm² or m/s; marks are deducted if omitted!").
- Keep tone supportive, inspiring, and concise. Never overwhelm the student.
- If asked about non-educational topics or unrelated subjects, politely guide the student back to their Class 10 board preparation.
${subject && subject !== 'all' ? `Current student focus: CBSE Class 10 ${subject.toUpperCase()}.` : ''}
${chapterTitle ? `Current context/chapter: ${chapterTitle}.` : ''}`;

      // Try primary model gemini-3.8-flash first, with fallback to gemini-flash-latest or gemini-3.1-flash-lite if experiencing high demand
      const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
      let lastErr: any = null;
      let reply: string | undefined;
      let usedModel = 'gemini-3.8-flash';

      for (const modelCandidate of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model: modelCandidate,
            contents,
            config: {
              systemInstruction,
              temperature: 0.7,
            },
          });
          reply = response.text;
          usedModel = modelCandidate;
          if (reply) break;
        } catch (err: any) {
          lastErr = err;
          console.warn(`Model ${modelCandidate} failed:`, err?.message || err);
          // Small pause before trying next candidate
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      if (!reply) {
        if (lastErr) {
          let message = lastErr.message || 'The AI Tutor is temporarily busy. Please try again.';
          try {
            const parsed = JSON.parse(lastErr.message);
            if (parsed?.error?.message) {
              message = parsed.error.message;
            }
          } catch {}
          return res.status(503).json({ error: message });
        }
        reply = 'I could not generate a response. Please try again.';
      }

      return res.json({
        reply,
        model: usedModel,
      });
    } catch (err: any) {
      console.error('Gemini chat error in /api/chat:', err);
      let errorMessage = err?.message || 'Failed to communicate with Gemini API';
      try {
        const parsed = JSON.parse(err.message);
        if (parsed?.error?.message) {
          errorMessage = parsed.error.message;
        }
      } catch {}
      return res.status(500).json({ error: errorMessage });
    }
  });

  // Vite middleware in dev or static files in production
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Studyhub Server running on http://0.0.0.0:${PORT} (Gemini model: gemini-3.8-flash)`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting Studyhub server:', err);
  process.exit(1);
});
