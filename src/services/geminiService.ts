export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface SendMessageOptions {
  messages: Array<{ role: 'user' | 'model'; content: string }>;
  subject?: 'math' | 'science' | 'all';
  chapterTitle?: string;
}

export interface ChatResponse {
  reply: string;
  model: string;
}

export const QUICK_PROMPTS = [
  {
    label: 'Derive Quadratic Formula',
    prompt: 'Can you show me the step-by-step derivation of the Quadratic Formula (-b ± √(b² - 4ac)) / 2a from ax² + bx + c = 0?',
    subject: 'math',
  },
  {
    label: 'Ohm’s Law & Numerical',
    prompt: 'Explain Ohm’s Law with its formula (V = IR), unit definitions, and solve a typical CBSE Class 10 circuit numerical.',
    subject: 'science',
  },
  {
    label: 'Balancing Chemical Equations',
    prompt: 'Explain the step-by-step method to balance chemical equations with 2 examples frequently asked in CBSE Class 10 board exams.',
    subject: 'science',
  },
  {
    label: 'Trigonometry Identities',
    prompt: 'Summarize the 3 fundamental Trigonometric Identities of Class 10 and show an example of proving an identity.',
    subject: 'math',
  },
  {
    label: 'Concave vs Convex Mirror',
    prompt: 'What is the difference between concave and convex mirrors in terms of focus, image nature, and sign convention (mirror formula)?',
    subject: 'science',
  },
  {
    label: 'Mendel’s Dihybrid Cross',
    prompt: 'Explain Mendel’s Dihybrid Cross with the 9:3:3:1 phenotypic ratio and Punnett square explanation.',
    subject: 'science',
  },
  {
    label: 'Arithmetic Progression (A.P.)',
    prompt: 'Explain how to find the nth term (an = a + (n-1)d) and sum of n terms (Sn = n/2 [2a + (n-1)d]) with an example.',
    subject: 'math',
  },
  {
    label: 'CBSE 10 Exam Strategies',
    prompt: 'What are the top 5 presentation tips to score 95%+ in CBSE Class 10 Math and Science board exams?',
    subject: 'all',
  },
];

export async function sendChatMessage(options: SendMessageOptions): Promise<ChatResponse> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: options.messages,
      subject: options.subject || 'all',
      chapterTitle: options.chapterTitle,
    }),
  });

  if (!response.ok) {
    let errorDetail = 'Failed to get response from AI Tutor';
    try {
      const errorJson = await response.json();
      if (errorJson && errorJson.error) {
        errorDetail = errorJson.error;
      }
    } catch {
      errorDetail = `Server returned status ${response.status} (${response.statusText})`;
    }
    throw new Error(errorDetail);
  }

  const data = await response.json();
  return {
    reply: data.reply || 'No response generated.',
    model: data.model || 'gemini-3.8-flash',
  };
}
