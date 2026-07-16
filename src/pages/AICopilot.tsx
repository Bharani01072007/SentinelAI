import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Copy, RefreshCw, AlertTriangle, TrendingUp, Shield, Clock } from 'lucide-react'
import { aiEngine } from '@/services/aiEngine'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  cards?: { type: string; title: string; content: string; color: string }[]
  thinking?: boolean
}

const suggestedQuestions = [
  'Why was Robert Vasquez blocked?',
  'What is the current risk for Alexandra Chen?',
  'Show me all critical incidents this week',
  'Explain the mass download behaviour pattern',
]

const aiResponses: Record<string, { text: string; cards: { type: string; title: string; content: string; color: string }[] }> = {
  default: {
    text: `Based on my analysis of the security events and behaviour patterns, I've detected significant anomalies across **3 high-risk accounts** in the past 24 hours.\n\nThe primary threat vector appears to be **insider threat activity combined with credential misuse**. Here's my assessment:`,
    cards: [
      { type: 'risk', title: '⚡ Critical Risk Factor', content: 'Mass data exfiltration detected — 2.3GB exported via VPN tunnel in under 6 minutes. This is 340% above baseline.', color: '#EF4444' },
      { type: 'recommendation', title: '🛡️ Recommended Action', content: 'Immediately suspend account, preserve forensic evidence, notify Legal & HR, initiate incident response protocol IR-07.', color: '#7C3AED' },
      { type: 'comparison', title: '📊 Historical Comparison', content: 'Similar patterns matched 3 previous confirmed data breach cases in our training data. Confidence: 87.3%', color: '#06B6D4' },
    ],
  },
  blocked: {
    text: `**Robert Vasquez** was automatically blocked by SentinelAI at **03:39 AM** after his risk score reached **93/100** — exceeding the Critical threshold of 80.\n\nHere's a complete breakdown of what triggered the block:`,
    cards: [
      { type: 'evidence', title: '🌍 Geographic Anomaly', content: 'Login from Mexico City — 4,200km from registered work location (New York). Device not in MDM registry.', color: '#EF4444' },
      { type: 'evidence', title: '📥 Data Exfiltration Signal', content: '2.3GB download in 6 minutes at 03:14 AM. Files: financial-reports/Q4-2025 and client-PII-database.', color: '#F59E0B' },
      { type: 'recommendation', title: '🔬 Investigation Steps', content: '1. Forensic copy of downloaded files\n2. Interview employee with Legal present\n3. Review all access in past 90 days\n4. Notify CISO and Board', color: '#7C3AED' },
    ],
  },
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          className="w-1.5 h-1.5 rounded-full bg-purple-400"
        />
      ))}
    </div>
  )
}

function SecurityCard({ card }: { card: { type: string; title: string; content: string; color: string } }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-3 mt-2"
      style={{ background: `${card.color}08`, border: `1px solid ${card.color}25` }}
    >
      <div className="text-xs font-semibold mb-1" style={{ color: card.color }}>{card.title}</div>
      <p className="text-xs text-[#94A3B8] leading-relaxed whitespace-pre-line">{card.content}</p>
    </motion.div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isAI = message.role === 'assistant'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isAI ? '' : 'flex-row-reverse'}`}
    >
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
        isAI
          ? 'bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-purple-500/30'
          : 'bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border border-blue-500/30'
      }`}>
        {isAI ? <Bot size={14} className="text-purple-400" /> : <User size={14} className="text-blue-400" />}
      </div>

      {/* Content */}
      <div className={`max-w-[80%] space-y-1 ${isAI ? '' : 'items-end flex flex-col'}`}>
        <div className="text-[10px] text-[#4B5563] flex items-center gap-2">
          {isAI ? 'SentinelGPT' : 'You'}
          <Clock size={8} />
          {message.timestamp.toLocaleTimeString()}
        </div>

        {message.thinking ? (
          <div className="glass-card rounded-2xl rounded-tl-sm px-4">
            <TypingIndicator />
          </div>
        ) : (
          <div className={`rounded-2xl px-4 py-3 text-xs leading-relaxed ${
            isAI
              ? 'glass-card rounded-tl-sm text-[#F9FAFB]'
              : 'rounded-tr-sm text-white'
          }`} style={!isAI ? { background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', border: '1px solid rgba(37,99,235,0.3)' } : {}}>
            {message.content.split('\n').map((line, i) => {
              const parts = line.split(/\*\*(.*?)\*\*/g)
              return (
                <p key={i} className={i > 0 ? 'mt-1' : ''}>
                  {parts.map((part, j) =>
                    j % 2 === 1 ? <strong key={j} className="font-semibold text-cyan-400">{part}</strong> : part
                  )}
                </p>
              )
            })}
          </div>
        )}

        {/* Security Cards */}
        {message.cards && message.cards.map((card, i) => (
          <SecurityCard key={i} card={card} />
        ))}
      </div>
    </motion.div>
  )
}

export default function AICopilot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: `Hello! I'm **SentinelGPT**, your AI security analyst. I can help you investigate threats, explain risk scores, analyze employee behaviour, and recommend actions.\n\nWhat would you like to investigate today?`,
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text?: string) => {
    const userText = text ?? input
    if (!userText.trim()) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsThinking(true)

    // Add thinking indicator
    const thinkingMsg: Message = {
      id: 'thinking',
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      thinking: true,
    }
    setMessages((prev) => [...prev, thinkingMsg])
    
    try {
      const response = await aiEngine.askCopilot(userText)
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        cards: response.cards,
      }
      setMessages((prev) => prev.filter((m) => m.id !== 'thinking').concat(aiMsg))
    } catch (error) {
      console.error('Copilot request failed:', error)
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I encountered an error communicating with the SentinelGPT backend. Please ensure the backend is running and that your Gemini API key is configured correctly in `.env`.',
        timestamp: new Date(),
      }
      setMessages((prev) => prev.filter((m) => m.id !== 'thinking').concat(errorMsg))
    } finally {
      setIsThinking(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">AI Copilot</h1>
        <p className="text-sm text-[#94A3B8] mt-0.5">Powered by SentinelGPT v4 · Explainable AI Security</p>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Chat */}
        <div className="flex-1 flex flex-col glass-card overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-3">
              <p className="text-[10px] text-[#4B5563] mb-2">SUGGESTED QUESTIONS</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="px-3 py-1.5 rounded-lg text-xs text-[#94A3B8] hover:text-white transition-colors"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !isThinking && sendMessage()}
                  placeholder="Ask anything about threats, employees, or incidents..."
                  className="input-field pr-10 w-full"
                  disabled={isThinking}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => sendMessage()}
                disabled={!input.trim() || isThinking}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)', boxShadow: '0 0 15px rgba(124,58,237,0.3)' }}
              >
                <Send size={14} className="text-white" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="hidden xl:flex flex-col w-60 space-y-4">
          <div className="glass-card p-4">
            <h3 className="text-xs font-semibold text-white mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: 'Investigate INC-001', icon: AlertTriangle, color: '#EF4444' },
                { label: 'Analyze risk trend', icon: TrendingUp, color: '#06B6D4' },
                { label: 'Review top threats', icon: Shield, color: '#7C3AED' },
              ].map(({ label, icon: Icon, color }) => (
                <button
                  key={label}
                  onClick={() => sendMessage(label)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#94A3B8] hover:text-white transition-colors hover:bg-white/5 text-left"
                >
                  <Icon size={12} style={{ color }} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card p-4">
            <h3 className="text-xs font-semibold text-white mb-3">AI Confidence</h3>
            <div className="text-2xl font-black text-purple-400 mb-1">87.3%</div>
            <div className="w-full bg-white/5 rounded-full h-1.5">
              <div className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500" style={{ width: '87.3%' }} />
            </div>
            <p className="text-[10px] text-[#4B5563] mt-2">Model: SentinelGPT v4</p>
            <p className="text-[10px] text-[#4B5563]">Training: 2.4M incidents</p>
          </div>
        </div>
      </div>
    </div>
  )
}
