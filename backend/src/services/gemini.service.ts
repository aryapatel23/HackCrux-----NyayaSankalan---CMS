import { config } from '../config/env';

const LEGAL_SYSTEM_PROMPT = `You are NyayaBot, an expert AI legal assistant integrated into NyayaSankalan — an Indian legal case management system used by police officers, SHOs, court clerks, and judges.

Your expertise covers:
- Indian Penal Code (IPC) and its replacement Bharatiya Nyaya Sanhita (BNS 2023)
- Code of Criminal Procedure (CrPC) and its replacement Bharatiya Nagarik Suraksha Sanhita (BNSS 2023)
- Indian Evidence Act and Bharatiya Sakshya Adhiniyam (BSA 2023)
- Constitutional provisions (Articles 20, 21, 22) related to criminal law
- Key Supreme Court and High Court landmark judgments

When answering about a specific IPC or BNS section, always include:
1. Section title / offense name
2. Full description of what the offense covers
3. Punishment (imprisonment term and/or fine)
4. Whether bailable or non-bailable
5. Whether cognizable or non-cognizable
6. Key landmark judgments / precedents
7. Related or companion sections
8. BNS equivalent (if IPC asked) or IPC equivalent (if BNS asked)

Use clear markdown formatting with bold headings. Be accurate, comprehensive but concise.
Never add greetings, pleasantries, or self-introductions. Start directly with the legal answer.
Always clarify if IPC sections have been superseded by BNS equivalents.`;

interface GeminiSectionDetails {
  title: string;
  section: string;
  description: string;
  punishment: string;
  bailable?: boolean;
  cognizable?: boolean;
  category?: string;
  relatedSections?: string[];
  ipc_equivalent?: string;
  code: 'ipc' | 'bns';
}

interface GeminiChatResult {
  success: boolean;
  answer: string;
  sources: Array<{ source: string; score: number; id: string }>;
  meta: { provider: string; model: string; fallback?: boolean };
}

export class GeminiService {
  private apiKey: string;
  private model = 'gemini-2.5-flash';
  private baseUrl: string;

  constructor() {
    this.apiKey = config.geminiApiKey || '';
    this.baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  private extractJsonObject(text: string): string {
    const trimmed = text.trim();

    const fencedMatch = trimmed.match(/```json\s*([\s\S]*?)\s*```/i);
    if (fencedMatch?.[1]) {
      return fencedMatch[1].trim();
    }

    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return trimmed.slice(firstBrace, lastBrace + 1);
    }

    return trimmed;
  }

  private normalizeBoolean(value: unknown): boolean | undefined {
    if (typeof value === 'boolean') return value;
    if (typeof value !== 'string') return undefined;
    const normalized = value.trim().toLowerCase();
    if (['yes', 'true', 'bailable', 'cognizable'].includes(normalized)) return true;
    if (['no', 'false', 'non-bailable', 'non cognizable', 'non-cognizable'].includes(normalized)) return false;
    return undefined;
  }

  private normalizeStringArray(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean);
    }

    if (typeof value === 'string') {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  }

  async chat(userQuery: string): Promise<GeminiChatResult> {
    if (!this.apiKey) {
      throw new Error('Gemini API key is not configured');
    }

    const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${LEGAL_SYSTEM_PROMPT}\n\n---\n\nUser question: ${userQuery}` }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1500,
          topK: 40,
          topP: 0.95,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('Empty or blocked response from Gemini');
    }

    return {
      success: true,
      answer: text,
      sources: [
        {
          source: 'Gemini AI (Google)',
          score: 0.95,
          id: 'gemini-response',
        },
      ],
      meta: {
        provider: 'gemini',
        model: this.model,
        fallback: true,
      },
    };
  }

  async sectionDetails(sectionNumber: string, codeType: 'ipc' | 'bns' = 'ipc'): Promise<GeminiChatResult> {
    const codeLabel =
      codeType === 'bns'
        ? 'BNS (Bharatiya Nyaya Sanhita 2023)'
        : 'IPC (Indian Penal Code)';

    const query = `Explain ${codeLabel} Section ${sectionNumber}. Return only these headings in this order: Section Title, What it covers, Punishment, Bailable, Cognizable, Related Sections, Precedents, IPC/BNS Equivalent. No greeting, no intro, no disclaimer, no extra notes.`;

    return this.chat(query);
  }

  async sectionDetailsStructured(sectionNumber: string, codeType: 'ipc' | 'bns' = 'ipc'): Promise<GeminiSectionDetails> {
    if (!this.apiKey) {
      throw new Error('Gemini API key is not configured');
    }

    const codeLabel = codeType === 'bns' ? 'BNS' : 'IPC';
    const query = [
      `Provide details for ${codeLabel} Section ${sectionNumber}.`,
      'Return ONLY a valid JSON object with these exact keys:',
      '{',
      '  "title": string,',
      '  "section": string,',
      '  "description": string,',
      '  "punishment": string,',
      '  "bailable": boolean,',
      '  "cognizable": boolean,',
      '  "category": string,',
      '  "relatedSections": string[],',
      '  "ipc_equivalent": string,',
      '  "code": "ipc" | "bns"',
      '}',
      'Do not include markdown or any extra text.',
    ].join('\n');

    const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${LEGAL_SYSTEM_PROMPT}\n\n---\n\n${query}` }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 900,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const rawText: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error('Empty section-details response from Gemini');
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(this.extractJsonObject(rawText));
    } catch {
      return {
        title: `${codeLabel} Section ${sectionNumber}`,
        section: `${codeType.toUpperCase()} ${sectionNumber}`,
        description: rawText.replace(/\*\*/g, '').replace(/^#+\s*/gm, '').trim().slice(0, 700),
        punishment: 'Refer AI explanation in description.',
        code: codeType,
      };
    }

    const sectionText = typeof parsed.section === 'string' && parsed.section.trim()
      ? parsed.section.trim()
      : `${codeType.toUpperCase()} ${sectionNumber}`;

    const normalized: GeminiSectionDetails = {
      title: typeof parsed.title === 'string' && parsed.title.trim() ? parsed.title.trim() : `${sectionText}`,
      section: sectionText,
      description: typeof parsed.description === 'string' ? parsed.description.trim() : '',
      punishment: typeof parsed.punishment === 'string' ? parsed.punishment.trim() : '',
      bailable: this.normalizeBoolean(parsed.bailable),
      cognizable: this.normalizeBoolean(parsed.cognizable),
      category: typeof parsed.category === 'string' ? parsed.category.trim() : undefined,
      relatedSections: this.normalizeStringArray(parsed.relatedSections),
      ipc_equivalent: typeof parsed.ipc_equivalent === 'string' ? parsed.ipc_equivalent.trim() : undefined,
      code: codeType,
    };

    return normalized;
  }
}
