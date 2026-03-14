import { config } from '../config/env';
import { getLegalReference, getPrecedentsForSection, getSectionsList } from '../modules/ai/legal-reference.data';
import { GeminiService } from './gemini.service';

export class AIEnhancedService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.aiPocUrl || 'http://localhost:8001';
  }

  private normalizeSectionDetailsFromAnswer(answer: string, sectionNumber: string, codeType: 'ipc' | 'bns') {
    const compact = answer
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/\*\*/g, '')
      .replace(/^#+\s*/gm, '')
      .replace(/\r/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const lines = compact.split('\n').map((line) => line.trim()).filter(Boolean);
    const defaultSection = `${codeType.toUpperCase()} ${sectionNumber}`;
    const title = lines[0] || defaultSection;

    const punishmentMatch = compact.match(/(?:Punishment|Imprisonment)\s*[:\-]?\s*([\s\S]*?)(?:\n\s*(?:\d+\.\s*(?:Whether\s+Bailable|Whether\s+Cognizable|Key\s+Landmark|Related|IPC Equivalent|BNS Equivalent)|Bailable|Cognizable|Related|IPC Equivalent|BNS Equivalent|Key Landmark|$))/i);
    const relatedMatch = compact.match(/Related(?:\s+or\s+Companion)?\s+Sections?\s*[:\-]?\s*([\s\S]*?)(?:\n\s*(?:IPC Equivalent|BNS Equivalent|$))/i);
    const equivalentMatch = compact.match(/(?:IPC Equivalent|BNS Equivalent)\s*[:\-]?\s*([^\n]+)/i);
    const descriptionMatch = compact.match(/(?:Full Description|Description|What it covers)\s*[:\-]?\s*([\s\S]*?)(?:\n\s*(?:Punishment|Imprisonment|Bailable|Cognizable|Key Landmark|Related|IPC Equivalent|BNS Equivalent|$))/i);
    const bailableMatch = compact.match(/(?:Whether\s+Bailable\s+or\s+Non-Bailable|Bailable)\s*[:\-]?\s*([^\n]+)/i);
    const cognizableMatch = compact.match(/(?:Whether\s+Cognizable\s+or\s+Non-Cognizable|Cognizable)\s*[:\-]?\s*([^\n]+)/i);

    const bailableSource = bailableMatch?.[1] || compact;
    const bailable = /non[-\s]?bailable/i.test(bailableSource)
      ? false
      : /\bbailable\b/i.test(bailableSource)
        ? true
        : undefined;

    const cognizableSource = cognizableMatch?.[1] || compact;
    const cognizable = /non[-\s]?cognizable/i.test(cognizableSource)
      ? false
      : /\bcognizable\b/i.test(cognizableSource)
        ? true
        : undefined;

    const descriptionSource = (descriptionMatch?.[1] || lines.slice(1).join(' '));
    const cleanedDescription = descriptionSource
      .replace(/^of the Offense\s*/i, '')
      .replace(/^[:\-\s]+/, '')
      .trim();
    const description = cleanedDescription.length > 600
      ? `${cleanedDescription.slice(0, 600).trim()}...`
      : cleanedDescription;

    const punishment = (punishmentMatch?.[1] || 'See detailed legal text from AI source.')
      .replace(/\n\s*\d+\..*$/s, '')
      .trim();

    const relatedSections = relatedMatch?.[1]
      ? relatedMatch[1]
        .split(/[\n,]/)
        .map((item) => item.replace(/^[\-\d\.)\s]+/, '').trim())
        .filter(Boolean)
        .slice(0, 8)
      : [];

    return {
      title,
      section: defaultSection,
      description,
      punishment,
      bailable,
      cognizable,
      relatedSections,
      ipc_equivalent: equivalentMatch?.[1]?.trim(),
      code: codeType,
    };
  }

  private unavailableSectionDetails(sectionNumber: string, codeType: 'ipc' | 'bns') {
    return {
      title: `${codeType.toUpperCase()} Section ${sectionNumber}`,
      section: `${codeType.toUpperCase()} ${sectionNumber}`,
      description:
        'Detailed AI lookup is temporarily unavailable right now. The section was detected correctly. Please retry after a short time, or run the AI PoC service for complete precedent-level details.',
      punishment: 'Not available in offline fallback for this section.',
      bailable: undefined,
      cognizable: undefined,
      relatedSections: [],
      code: codeType,
    };
  }

  async extractLegalEntities(text: string): Promise<any> {
    const form = new URLSearchParams();
    form.append('text', text);
    const res = await fetch(`${this.baseUrl}/api/ai/legal-ner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });
    if (!res.ok) throw new Error(`AI service error: ${res.status}`);
    return res.json();
  }

  async suggestSections(caseDescription: string, topK = 5, codeType = 'both'): Promise<any> {
    const form = new URLSearchParams();
    form.append('case_description', caseDescription);
    form.append('top_k', String(topK));
    form.append('code_type', codeType);
    const res = await fetch(`${this.baseUrl}/api/ai/suggest-sections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });
    if (!res.ok) throw new Error(`AI service error: ${res.status}`);
    return res.json();
  }

  async findPrecedents(query: string, topK = 5, section?: string): Promise<any> {
    const form = new URLSearchParams();
    form.append('query', query);
    form.append('top_k', String(topK));
    if (section) form.append('section', section);
    const res = await fetch(`${this.baseUrl}/api/ai/find-precedents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });
    if (!res.ok) throw new Error(`AI service error: ${res.status}`);
    return res.json();
  }

  async suggestKeywords(text: string, maxItems = 8): Promise<any> {
    const form = new URLSearchParams();
    form.append('text', text);
    form.append('max_items', String(maxItems));
    const res = await fetch(`${this.baseUrl}/api/ai/suggest-keywords`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });
    if (!res.ok) throw new Error(`AI service error: ${res.status}`);
    return res.json();
  }

  async generateDocument(documentType: string, caseData: any): Promise<any> {
    const form = new URLSearchParams();
    form.append('document_type', documentType);
    form.append('case_data', JSON.stringify(caseData));
    const res = await fetch(`${this.baseUrl}/api/ai/generate-document`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });
    if (!res.ok) throw new Error(`AI service error: ${res.status}`);
    return res.json();
  }

  async multilingualOCR(file: Express.Multer.File, language?: string, autoDetect = true): Promise<any> {
    const blob = new Blob([file.buffer], { type: file.mimetype });
    const form = new FormData();
    form.append('file', blob, file.originalname);
    if (language) form.append('language', language);
    form.append('auto_detect', String(autoDetect));
    const res = await fetch(`${this.baseUrl}/api/ai/multilingual-ocr`, {
      method: 'POST',
      body: form,
    });
    if (!res.ok) throw new Error(`AI service error: ${res.status}`);
    return res.json();
  }

  async advancedSearch(query: string, topK = 5, useReranking = false): Promise<any> {
    const form = new URLSearchParams();
    form.append('query', query);
    form.append('top_k', String(topK));
    form.append('use_reranking', String(useReranking));
    const res = await fetch(`${this.baseUrl}/api/ai/advanced-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });
    if (!res.ok) throw new Error(`AI service error: ${res.status}`);
    return res.json();
  }

  async stats(): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/ai/stats`);
    if (!res.ok) throw new Error(`AI service error: ${res.status}`);
    return res.json();
  }

  async templates(): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/ai/templates`);
    if (!res.ok) throw new Error(`AI service error: ${res.status}`);
    return res.json();
  }

  async sectionDetails(sectionNumber: string, codeType = 'ipc'): Promise<any> {
    // Primary path: direct Gemini section extraction
    const gemini = new GeminiService();
    if (gemini.isAvailable()) {
      try {
        const geminiResult = await gemini.sectionDetails(sectionNumber, codeType as 'ipc' | 'bns');
        return {
          answer: geminiResult.answer,
          code: codeType,
        };
      } catch (geminiError) {
        console.error('[GeminiService] sectionDetails error:', geminiError);
      }
    }

    // Fallback path: AI PoC service
    try {
      const res = await fetch(`${this.baseUrl}/api/ai/section-details/${encodeURIComponent(sectionNumber)}?code_type=${encodeURIComponent(codeType)}`);
      if (!res.ok) throw new Error(`AI service error: ${res.status}`);
      return res.json();
    } catch {
      // Fallback path: local static reference
      const fallback = getLegalReference(sectionNumber, codeType === 'bns' ? 'bns' : 'ipc');
      if (fallback) {
        return fallback;
      }

      // Final fallback
      return this.unavailableSectionDetails(sectionNumber, codeType as 'ipc' | 'bns');
    }
  }

  async precedentsBySection(section: string, topK = 10): Promise<any> {
    try {
      const res = await fetch(`${this.baseUrl}/api/ai/precedents/section/${encodeURIComponent(section)}?top_k=${encodeURIComponent(String(topK))}`);
      if (!res.ok) throw new Error(`AI service error: ${res.status}`);
      return res.json();
    } catch {
      return {
        precedents: getPrecedentsForSection(section, 'ipc').slice(0, topK),
      };
    }
  }

  async getSectionsList(codeType = 'both'): Promise<any> {
    try {
      const res = await fetch(`${this.baseUrl}/api/ai/sections-list?code_type=${encodeURIComponent(codeType)}`);
      if (!res.ok) throw new Error(`AI service error: ${res.status}`);
      return res.json();
    } catch {
      return {
        sections: getSectionsList(codeType as 'ipc' | 'bns' | 'both'),
      };
    }
  }
}
