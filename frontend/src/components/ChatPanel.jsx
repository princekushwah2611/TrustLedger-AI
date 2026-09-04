import React, { useState } from 'react';
import { Bot, Send, User } from 'lucide-react';

export default function ChatPanel() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am your AI Financial Controller. Ask me anything about your company transaction history, riskiest vendors, or policy flag trends.'
    }
  ]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!question.trim() || loading) return;

    const userQ = question.trim();
    setQuestion('');
    setMessages(prev => [...prev, { sender: 'user', text: userQ }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userQ })
      });

      const data = await res.json();
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: data.answer || 'Analysis complete.'
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: 'Error contacting AI Financial Controller engine.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm shadow-slate-200/50 flex flex-col h-[340px]">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-extrabold text-slate-900">Ask AI Controller</h3>
        </div>
        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
          Conversational Q&A
        </span>
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto my-3 space-y-3 pr-1 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'ai' && (
              <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg shrink-0 mt-0.5 border border-emerald-200">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}
            <div className={`p-3 rounded-xl max-w-[85%] leading-relaxed font-medium ${
              m.sender === 'user'
                ? 'bg-emerald-600 text-white rounded-br-none shadow-xs font-semibold'
                : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-none'
            }`}>
              {m.text}
            </div>
            {m.sender === 'user' && (
              <div className="p-1.5 bg-slate-200 text-slate-700 rounded-lg shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold animate-pulse">
            <Bot className="w-3.5 h-3.5 text-emerald-600" /> Analyzing company ledger...
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="relative mt-auto">
        <input
          type="text"
          placeholder="Ask e.g. 'Who is my riskiest vendor?'..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-4 pr-10 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-600 hover:text-emerald-700 disabled:opacity-30"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
