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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  return (
    <div className="fixed bottom-20 right-6 z-50 w-[24rem] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col" style={{ height: 520 }}>
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div>
          <span className="block font-semibold text-slate-900">IPC / BNS Legal Assistant</span>
          <span className="text-xs text-slate-500">Explain sections, punishment, bailability, and precedents</span>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-red-500 text-lg">×</button>
      </div>
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
