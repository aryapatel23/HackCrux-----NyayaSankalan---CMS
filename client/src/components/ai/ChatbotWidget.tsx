import React, { useState, useRef, useEffect } from 'react';
import apiClient from '../../api/axios';
import { aiEnhancedApi } from '../../api/aiEnhanced.api';

interface Message {
  sender: 'user' | 'bot';
  text: string;
  sources?: Array<{ source: string; score: number; id?: string }>;
}

interface SectionDetails {
  title?: string;
  section?: string;
  number?: string;
  description?: string;
  punishment?: string;
  bailable?: boolean;
  cognizable?: boolean;
  category?: string;
  relatedSections?: string[];
  ipc_equivalent?: string;
  code?: 'ipc' | 'bns';
  answer?: string;
}

interface PrecedentItem {
  title?: string;
  case_name?: string;
  summary?: string;
}

const QUICK_QUESTIONS = [
  'Explain IPC 302',
  'Tell me about IPC 420',
  'What is BNS 103?',
  'Difference between IPC 302 and 304',
];

const hasDevanagari = (text: string) => /[\u0900-\u097F]/.test(text);

type SectionQuery = {
  codeType: 'ipc' | 'bns';
  section: string;
};

const detectSectionQuery = (query: string): SectionQuery | null => {
  const normalized = query.trim().toLowerCase();
  const directMatch = normalized.match(/\b(ipc|bns)\s*(?:section\s*)?(\d+[a-z]?)\b/i);

  if (directMatch) {
    return {
      codeType: directMatch[1].toLowerCase() as 'ipc' | 'bns',
      section: directMatch[2].toUpperCase(),
    };
  }

  const impliedLegalQuery = /\b(section|act|law|legal|ipc|bns|explain|meaning|punishment|bailable|cognizable|what is|tell me about)\b/i;
  const numericMatch = normalized.match(/\b(\d{1,4}[a-z]?)\b/i);

  if (numericMatch && impliedLegalQuery.test(normalized)) {
    return {
      codeType: normalized.includes('bns') ? 'bns' as const : 'ipc' as const,
      section: numericMatch[1].toUpperCase(),
    };
  }

  return null;
};

const formatFlag = (value?: boolean) => {
  if (value === undefined || value === null) return 'Not specified';
  return value ? 'Yes' : 'No';
};

const formatSectionAnswer = (
  details: SectionDetails,
  precedents: PrecedentItem[],
  codeType: 'ipc' | 'bns',
  section: string,
) => {
  const title = details.title || details.section || `${codeType.toUpperCase()} ${section}`;
  const lines = [
    `${title}`,
    '',
    `Section: ${details.section || `${codeType.toUpperCase()} ${section}`}`,
  ];

  if (details.description) {
    lines.push('', `What it covers: ${details.description}`);
  }

  if (details.punishment) {
    lines.push('', `Punishment: ${details.punishment}`);
  }

  lines.push(
    '',
    `Bailable: ${formatFlag(details.bailable)}`,
    `Cognizable: ${formatFlag(details.cognizable)}`,
  );

  if (details.category) {
    lines.push(`Category: ${details.category}`);
  }

  if (details.ipc_equivalent) {
    lines.push(`IPC Equivalent: ${details.ipc_equivalent}`);
  }

  if (details.relatedSections && details.relatedSections.length > 0) {
    lines.push('', `Related sections: ${details.relatedSections.join(', ')}`);
  }

  if (precedents.length > 0) {
    lines.push('', 'Relevant precedents:');
    precedents.slice(0, 3).forEach((item) => {
      lines.push(`- ${item.title || item.case_name || 'Case precedent'}`);
      if (item.summary) {
        lines.push(`  ${item.summary}`);
      }
    });
  }

  lines.push('', 'This is informational guidance for legal workflow support, not a final legal opinion.');
  return lines.join('\n');
};

const ChatbotWidget: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text:
        'Hello. I am your IPC/BNS Legal Co-Pilot. Ask me things like "Explain IPC 302", "What is BNS 103?", or any general legal workflow question.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [speechLang, setSpeechLang] = useState<'en-IN' | 'hi-IN'>('en-IN');
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState<number | null>(null);
  const [speechBusy, setSpeechBusy] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [translatedSpeechCache, setTranslatedSpeechCache] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const stopSpeech = () => {
    if (!speechSupported) return;
    window.speechSynthesis.cancel();
    setSpeakingMessageIndex(null);
  };

  const sanitizeForSpeech = (text: string) => {
    return text
      .replace(/\*\*/g, '')
      .replace(/`/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const refreshVoices = () => {
    if (!speechSupported) return;
    setAvailableVoices(window.speechSynthesis.getVoices());
  };

  const toHindiSpeechText = async (text: string) => {
    const normalized = sanitizeForSpeech(text);
    if (!normalized) return normalized;

    const cached = translatedSpeechCache[normalized];
    if (cached) return cached;

    try {
      setSpeechBusy(true);
      const promptPrimary = `Translate the following legal explanation to clear, natural Hindi for voice playback. Keep legal section numbers and case names unchanged. CRITICAL: return only Hindi in Devanagari script. Do not return English. No bullet symbols, no extra notes.\n\n${normalized}`;
      const resPrimary = await apiClient.post('/ai/chat', { q: promptPrimary, k: 1 });
      let translated = sanitizeForSpeech(
        resPrimary.data?.answer ||
        resPrimary.data?.data?.answer ||
        '',
      );

      // Retry once with a stricter instruction if model returns mostly English.
      if (!hasDevanagari(translated)) {
        const promptRetry = `केवल देवनागरी हिंदी में अनुवाद करें। अंग्रेजी का उपयोग न करें। कानूनी सेक्शन नंबर जैसे IPC 302 वैसे ही रखें। केवल अनुवादित पाठ दें:\n\n${normalized}`;
        const resRetry = await apiClient.post('/ai/chat', { q: promptRetry, k: 1 });
        translated = sanitizeForSpeech(
          resRetry.data?.answer ||
          resRetry.data?.data?.answer ||
          translated,
        );
      }

      if (!translated) {
        translated = normalized;
      }

      setTranslatedSpeechCache((prev) => ({
        ...prev,
        [normalized]: translated,
      }));

      return translated;
    } catch {
      // Fallback: speak original text if translation fails.
      return normalized;
    } finally {
      setSpeechBusy(false);
    }
  };

  const speakText = async (text: string, messageIndex: number) => {
    if (!speechSupported || !speechEnabled) return;

    if (speakingMessageIndex === messageIndex) {
      stopSpeech();
      return;
    }

    stopSpeech();

    const content = speechLang === 'hi-IN'
      ? await toHindiSpeechText(text)
      : sanitizeForSpeech(text);

    const utterance = new SpeechSynthesisUtterance(content);
    utterance.lang = speechLang;

    const availableVoices = window.speechSynthesis.getVoices();
    const exactVoice = availableVoices.find((v) => v.lang.toLowerCase() === speechLang.toLowerCase());
    const baseLang = speechLang.split('-')[0].toLowerCase();
    const baseVoice = availableVoices.find((v) => v.lang.toLowerCase().startsWith(baseLang));
    if (exactVoice) {
      utterance.voice = exactVoice;
    } else if (baseVoice) {
      utterance.voice = baseVoice;
    }

    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onstart = () => setSpeakingMessageIndex(messageIndex);
    utterance.onend = () => setSpeakingMessageIndex(null);
    utterance.onerror = () => setSpeakingMessageIndex(null);

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (speechSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [speechSupported]);

  useEffect(() => {
    if (!speechSupported) return;
    refreshVoices();
    window.speechSynthesis.onvoiceschanged = refreshVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [speechSupported]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { sender: 'user', text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const sectionQuery = detectSectionQuery(userMsg.text);

      if (sectionQuery) {
        const [detailsResult, precedentsResult] = await Promise.allSettled([
          aiEnhancedApi.sectionDetails(sectionQuery.section, sectionQuery.codeType),
          aiEnhancedApi.precedentsBySection(sectionQuery.section, 3),
        ]);

        const details = detailsResult.status === 'fulfilled'
          ? (detailsResult.value as SectionDetails | null)
          : null;
        const precedentsPayload = precedentsResult.status === 'fulfilled' ? precedentsResult.value : null;
        const precedents = Array.isArray(precedentsPayload?.precedents)
          ? (precedentsPayload.precedents as PrecedentItem[])
          : Array.isArray(precedentsPayload)
            ? (precedentsPayload as PrecedentItem[])
            : [];

        const hasStructuredSectionData = Boolean(
          details && (details.description || details.punishment || details.bailable !== undefined || details.cognizable !== undefined),
        );

        if (hasStructuredSectionData && details) {
          setMessages((msgs) => [
            ...msgs,
            {
              sender: 'bot',
              text: formatSectionAnswer(details, precedents, sectionQuery.codeType, sectionQuery.section),
              sources: [
                {
                  source: `${sectionQuery.codeType.toUpperCase()} section database`,
                  score: 1,
                  id: `${sectionQuery.codeType}-${sectionQuery.section}`,
                },
              ],
            },
          ]);
          return;
        }

        if (details?.answer) {
          setMessages((msgs) => [
            ...msgs,
            {
              sender: 'bot',
              text: details.answer,
              sources: [
                {
                  source: `${sectionQuery.codeType.toUpperCase()} AI legal assistant`,
                  score: 0.95,
                  id: `${sectionQuery.codeType}-${sectionQuery.section}-ai`,
                },
              ],
            },
          ]);
          return;
        }

        if (details && Object.keys(details).length > 0) {
          setMessages((msgs) => [
            ...msgs,
            {
              sender: 'bot',
              text: formatSectionAnswer(details, precedents, sectionQuery.codeType, sectionQuery.section),
              sources: [
                {
                  source: `${sectionQuery.codeType.toUpperCase()} section database`,
                  score: 1,
                  id: `${sectionQuery.codeType}-${sectionQuery.section}`,
                },
              ],
            },
          ]);
          return;
        }
      }

      const res = await apiClient.post('/ai/chat', { q: userMsg.text, k: 3 });
      const answer = res.data?.answer || res.data?.data?.answer || 'Sorry, I could not find an answer.';
      const sources = res.data?.sources || [];
      setMessages((msgs) => [...msgs, { sender: 'bot', text: answer, sources }]);
    } catch (e) {
      setMessages((msgs) => [
        ...msgs,
        {
          sender: 'bot',
          text: 'Sorry, I could not fetch the legal explanation right now. Please try again after the AI service is available.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    if (loading) return;
    setInput(question);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) sendMessage();
  };

  const hindiVoiceAvailable = availableVoices.some((v) => v.lang.toLowerCase().startsWith('hi'));

  return (
    <div className="fixed bottom-20 right-6 z-50 w-104 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col" style={{ height: 560 }}>
      <div className="flex items-start justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div>
          <span className="block font-semibold text-slate-900">IPC / BNS Legal Assistant</span>
          <span className="block text-xs text-slate-500 mt-0.5">Explain sections, punishment, bailability, and precedents</span>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-red-500 text-lg">×</button>
      </div>

      {speechSupported && (
        <div className="border-b border-slate-200 bg-white px-4 py-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSpeechEnabled((v) => !v)}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${speechEnabled ? 'border-green-200 bg-green-50 text-green-700' : 'border-slate-200 bg-white text-slate-600'}`}
              title={speechEnabled ? 'Speech enabled' : 'Speech disabled'}
            >
              {speechEnabled ? 'Voice On' : 'Voice Off'}
            </button>

            <div className="inline-flex rounded-full border border-slate-200 overflow-hidden text-xs">
              <button
                type="button"
                onClick={() => {
                  setSpeechLang('en-IN');
                  stopSpeech();
                }}
                className={`px-2.5 py-1 font-medium ${speechLang === 'en-IN' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700'}`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => {
                  setSpeechLang('hi-IN');
                  stopSpeech();
                }}
                className={`px-2.5 py-1 font-medium ${speechLang === 'hi-IN' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700'}`}
              >
                HI
              </button>
            </div>

            <button
              type="button"
              onClick={stopSpeech}
              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600"
              title="Stop speaking"
            >
              Stop
            </button>
          </div>
          {speechLang === 'hi-IN' && !hindiVoiceAvailable && (
            <p className="mt-2 text-[11px] text-amber-700">
              Hindi voice not found on this browser/OS. Translation will still be Hindi, but voice quality may vary.
            </p>
          )}
        </div>
      )}
      <div className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {QUICK_QUESTIONS.map((question) => (
            <button
              key={question}
              type="button"
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              onClick={() => handleQuickQuestion(question)}
            >
              {question}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto bg-slate-50 p-3 space-y-3">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm shadow-sm ${msg.sender === 'user' ? 'bg-blue-600 text-right text-white' : 'border border-slate-200 bg-white text-slate-800'}`}>
              <div className="whitespace-pre-wrap leading-6">{msg.text}</div>
              {msg.sender === 'bot' && speechSupported && (
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => speakText(msg.text, idx)}
                    className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                    disabled={speechBusy && speakingMessageIndex !== idx}
                  >
                    {speakingMessageIndex === idx
                      ? 'Stop Voice'
                      : speechBusy
                        ? 'Preparing Hindi...'
                        : 'Speak'}
                  </button>
                </div>
              )}
              {msg.sender === 'bot' && msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 border-t border-slate-100 pt-2 text-xs text-slate-500">
                  <div className="mb-1 font-medium text-slate-600">Sources</div>
                  <ul className="ml-4 list-disc space-y-1">
                    {msg.sources.map((s, i) => (
                      <li key={i}>{s.source} (score: {s.score.toFixed(2)})</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t border-slate-200 bg-white p-3 flex gap-2">
        <input
          className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          placeholder="Ask about IPC 302, BNS 103, punishment, bailability..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
        >
          {loading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default ChatbotWidget;
