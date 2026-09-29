import React, { useState, useRef, useEffect } from 'react'
import {
  Sparkles,
  Send,
  X,
  ChevronUp,
  ChevronDown,
  Activity,
  AlertTriangle,
  Layers3,
  Waves,
  Camera,
  Bot,
  User,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  CheckCircle2,
  Cpu,
  Zap,
  Terminal,
  MessageSquare,
  Maximize2,
  Minimize2
} from 'lucide-react'
import { processAIQuery, askOpenAIAssistant, AIMessage, getProjectAISummary, getDetectedAnomalies } from '../utils/aiIntelligence'

type AIAssistantBarProps = {
  navigate: (view: any) => void
  currentView?: string
}

// Massive Mascot Robot Avatar Component (GIS Cyber Urangutans AI)
function MascotRobotAvatar({
  isThinking = false,
  size = 'md'
}: {
  isThinking?: boolean
  size?: 'sm' | 'md' | 'lg' | 'massive'
}) {
  return (
    <div className={`mascot-robot-avatar size-${size} ${isThinking ? 'thinking' : ''}`}>
      <div className="mascot-avatar-inner">
        <img
          src="/logo.png"
          alt="GIS Cyber Urangutans AI Logo"
          className="mascot-avatar-img"
        />
        {isThinking && <div className="mascot-hologram-scan"></div>}
      </div>
      <span className="mascot-online-dot"></span>
    </div>
  )
}

export function AIAssistantBar({ navigate, currentView }: AIAssistantBarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [panelSize, setPanelSize] = useState<'standard' | 'expanded' | 'compact'>('standard')
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `Hello! I am **Jal-Bot**, your watershed assistant powered by OpenAI & geospatial intelligence.

I can help you analyze watersheds, review water harvesting assets, track NDVI/NDWI trends, evaluate risk alerts, and forecast 2027–2028 projections.

How can I help you today?`,
      quickActions: [
        { label: '🚨 Check Critical Anomalies', action: () => handleSendPrompt('Which areas need critical attention?') },
        { label: '📈 2027-2028 ML Forecast', action: () => handleSendPrompt('Show me the 2027–2028 predictive forecast') },
        { label: '🌱 Vegetation Recovery', action: () => handleSendPrompt('How has vegetation cover changed since 2024?') },
        { label: '💡 Structural Recommendations', action: () => handleSendPrompt('What are the top recommended interventions?') }
      ]
    }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const chatScrollRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const summary = getProjectAISummary()
  const anomalies = getDetectedAnomalies()

  useEffect(() => {
    if (isOpen && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [messages, isOpen, isTyping, panelSize])

  const handleSendPrompt = async (text: string) => {
    if (!text.trim()) return

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMsg: AIMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: now
    }

    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setQuery('')
    if (!isOpen) setIsOpen(true)
    setIsTyping(true)

    try {
      const response = await askOpenAIAssistant(text, nextMessages, navigate)
      setMessages(prev => [...prev, response])
    } catch (err) {
      const fallbackResponse = processAIQuery(text, navigate)
      setMessages(prev => [...prev, fallbackResponse])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {

    if (e.key === 'Enter') {
      e.preventDefault()
      handleSendPrompt(query)
    }
  }

  const toggleSize = () => {
    setPanelSize(prev => prev === 'standard' ? 'expanded' : prev === 'expanded' ? 'compact' : 'standard')
  }

  return (
    <aside className={`ai-assistant-container ${isOpen ? 'expanded' : 'collapsed'}`} aria-label="Jal-Bot Assistant">
      {/* 1. MINIMAL WHITE FLOATING ROBOT ICON TRIGGER (CLICK TO OPEN) */}
      {!isOpen && (
        <div className="robot-fab-wrapper">
          <button
            type="button"
            className="robot-fab-btn"
            onClick={() => setIsOpen(true)}
            aria-label="Open Jal-Bot Assistant"
          >
            <div className="robot-fab-avatar massive-mascot-fab">
              <MascotRobotAvatar isThinking={false} size="lg" />
              <span className="robot-fab-pulse"></span>
            </div>
            <div className="robot-fab-label">
              <div className="fab-title">
                <strong>Jal-Bot AI</strong>
                <span className="fab-dot"></span>
              </div>
              <small>Urangutans AI</small>
            </div>
          </button>
        </div>
      )}

      {/* 2. MINIMAL WHITE EXPANDED DRAWER WITH SIZE ADJUSTMENT */}
      {isOpen && (
        <div className={`white-ai-drawer size-${panelSize}`}>
          {/* Header */}
          <header className="white-drawer-head">
            <div className="white-head-title">
              <MascotRobotAvatar isThinking={isTyping} size="md" />
              <div>
                <div className="white-title-row">
                  <h3>Jal-Bot Assistant</h3>
                  <span className="white-badge-green">
                    <span className="dot"></span> Active
                  </span>
                </div>
                <small className="white-subtitle">GIS Cyber Urangutans · Geospatial Intelligence</small>
              </div>
            </div>
            <div className="white-head-actions">
              {/* Size Adjuster Button */}
              <button
                type="button"
                className={`white-action-icon-btn ${panelSize === 'expanded' ? 'active' : ''}`}
                title={`Adjust size (Current: ${panelSize.toUpperCase()})`}
                onClick={toggleSize}
              >
                {panelSize === 'expanded' ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
              {/* Reset History Button */}
              <button
                type="button"
                className="white-action-icon-btn"
                title="Reset conversation"
                onClick={() => setMessages([messages[0]])}
              >
                <RefreshCw size={14} />
              </button>
              {/* Minimize / Close Button */}
              <button
                type="button"
                className="white-action-icon-btn close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Minimize Assistant"
              >
                <ChevronDown size={16} />
              </button>
            </div>
          </header>

          {/* Quick Metrics Strip */}
          <div className="white-metrics-strip">
            <div className="white-metric-item">
              <TrendingUp size={13} style={{ color: '#16a34a' }} />
              <span>Veg Gain: <b>+{summary.avgVegGain}%</b></span>
            </div>
            <div className="white-metric-item">
              <Waves size={13} style={{ color: '#0284c7' }} />
              <span>Water Area: <b>+{summary.waterExpansionKm2} km²</b></span>
            </div>
            <div className="white-metric-item alert">
              <AlertTriangle size={13} style={{ color: '#dc2626' }} />
              <span>Anomalies: <b>{summary.criticalAnomalies}</b></span>
            </div>
          </div>

          {/* Chat Transcript */}
          <div className="white-chat-body" ref={chatScrollRef}>
            {messages.map((msg) => (
              <div key={msg.id} className={`white-chat-bubble ${msg.sender}`}>
                <div className="white-msg-header">
                  {msg.sender === 'assistant' ? (
                    <span className="white-sender-tag bot">
                      <MascotRobotAvatar isThinking={false} size="sm" /> Jal-Bot
                    </span>
                  ) : (
                    <span className="white-sender-tag user">
                      <User size={13} /> You
                    </span>
                  )}
                  <small className="white-msg-time">{msg.timestamp}</small>
                </div>

                <div className="white-msg-text">
                  {msg.text.split('\n').map((line, idx) => (
                    <p key={idx} dangerouslySetInnerHTML={{
                      __html: line
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    }} />
                  ))}
                </div>

                {/* RAG Knowledge Base Sources Badge */}
                {msg.sources && msg.sources.length > 0 && (
                  <div style={{ marginTop: '6px', fontSize: '11px', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600 }}>📚 Sources:</span>
                    {msg.sources.map((s, idx) => (
                      <span key={idx} style={{ background: 'rgba(2,132,199,0.08)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(2,132,199,0.2)' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {/* Structured Data Card */}
                {msg.dataCard && (
                  <div className="white-data-card">
                    <h4>{msg.dataCard.title}</h4>
                    <div className="white-data-grid">
                      {msg.dataCard.stats.map((st, i) => (
                        <div key={i} className="white-stat-box">
                          <span>{st.label}</span>
                          <strong className={st.tone || ''}>{st.value}</strong>
                        </div>
                      ))}
                    </div>
                    {msg.dataCard.notes && (
                      <small className="white-card-notes">
                        💡 {msg.dataCard.notes}
                      </small>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                {msg.quickActions && msg.quickActions.length > 0 && (
                  <div className="white-action-buttons">
                    {msg.quickActions.map((qa, index) => (
                      <button
                        key={index}
                        type="button"
                        className="white-action-chip"
                        onClick={() => {
                          qa.action()
                        }}
                      >
                        {qa.label} <ArrowRight size={12} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="white-chat-bubble assistant typing">
                <MascotRobotAvatar isThinking={true} size="sm" />
                <div className="white-typing-indicator">
                  <span className="white-typing-dot"></span>
                  <span className="white-typing-dot" style={{ animationDelay: '0.2s' }}></span>
                  <span className="white-typing-dot" style={{ animationDelay: '0.4s' }}></span>
                  <span className="white-typing-text">Jal-Bot is thinking…</span>
                </div>
              </div>
            )}
          </div>

          {/* Minimal Suggestions Bar */}
          <div className="white-suggestions-bar">
            <span>Suggestions:</span>
            <button type="button" onClick={() => handleSendPrompt('Show 2027-2028 ML predictive trajectory')}>
              📈 2027-28 Forecast
            </button>
            <button type="button" onClick={() => handleSendPrompt('Which areas need critical attention?')}>
              🚨 Anomalies
            </button>
            <button type="button" onClick={() => handleSendPrompt('How many geotagged images are uploaded?')}>
              📸 Image Status
            </button>
            <button type="button" onClick={() => handleSendPrompt('What are the recommended interventions?')}>
              💡 Prescriptions
            </button>
          </div>

          {/* Minimal Input Bar */}
          <div className="white-input-bar">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Jal-Bot a question about watersheds or trends…"
              aria-label="Ask Jal-Bot"
            />
            <button
              type="button"
              className="white-send-btn"
              disabled={!query.trim()}
              onClick={() => handleSendPrompt(query)}
              aria-label="Send message"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
