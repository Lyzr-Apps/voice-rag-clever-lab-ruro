'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

import Sidebar from './sections/Sidebar'
import ChatScreen, { type ChatMessage } from './sections/ChatScreen'
import HistoryScreen, { type ConversationRecord } from './sections/HistoryScreen'
import KnowledgeScreen from './sections/KnowledgeScreen'

// --- Theme ---
const THEME_VARS = {
  '--background': '210 20% 97%',
  '--foreground': '222 47% 11%',
  '--card': '0 0% 100%',
  '--card-foreground': '222 47% 11%',
  '--primary': '221 83% 53%',
  '--primary-foreground': '210 40% 98%',
  '--secondary': '210 40% 96%',
  '--secondary-foreground': '222 47% 11%',
  '--muted': '210 40% 96%',
  '--muted-foreground': '215 16% 47%',
  '--accent': '210 40% 96%',
  '--accent-foreground': '222 47% 11%',
  '--destructive': '0 84% 60%',
  '--destructive-foreground': '210 40% 98%',
  '--border': '214 32% 91%',
  '--ring': '221 83% 53%',
  '--radius': '0.875rem',
} as React.CSSProperties

// --- ErrorBoundary ---
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4 text-sm">{this.state.error}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: '' })}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// --- Sample data ---
const SAMPLE_MESSAGES: ChatMessage[] = [
  {
    id: 'sample-1',
    role: 'user',
    text: 'What are the key features of the product?',
    type: 'text',
    timestamp: new Date(2026, 1, 28, 10, 30, 0),
  },
  {
    id: 'sample-2',
    role: 'agent',
    text: 'Based on the documentation, the key features include:\n\n1. **Real-time voice interaction** - Engage with the knowledge base through natural voice conversations\n2. **Document indexing** - Upload PDFs, DOCX, and TXT files for automatic indexing\n3. **Web crawling** - Add website content directly to the knowledge base\n4. **Source citations** - Every answer references the source documents used\n5. **Confidence scoring** - Responses include high, medium, or low confidence indicators',
    type: 'text',
    timestamp: new Date(2026, 1, 28, 10, 30, 15),
    sources: ['product-guide.pdf', 'features-overview.docx'],
    confidence: 'high',
  },
  {
    id: 'sample-3',
    role: 'user',
    text: 'How do I set up the integration?',
    type: 'voice',
    timestamp: new Date(2026, 1, 28, 10, 32, 0),
  },
  {
    id: 'sample-4',
    role: 'agent',
    text: 'To set up the integration, follow these steps:\n\n1. Navigate to the Settings panel and select "Integrations"\n2. Choose the platform you want to connect\n3. Enter your API credentials in the provided fields\n4. Click "Test Connection" to verify\n5. Once verified, enable the integration toggle\n\nThe system will automatically sync data every 15 minutes after activation.',
    type: 'voice',
    timestamp: new Date(2026, 1, 28, 10, 32, 20),
    sources: ['setup-guide.pdf'],
    confidence: 'high',
  },
  {
    id: 'sample-5',
    role: 'user',
    text: 'What is the pricing model?',
    type: 'text',
    timestamp: new Date(2026, 1, 28, 10, 35, 0),
  },
  {
    id: 'sample-6',
    role: 'agent',
    text: 'The pricing model is structured around usage tiers. I found relevant information in the pricing documentation, but some details may have been updated recently. I recommend checking the latest pricing page for the most current figures.',
    type: 'text',
    timestamp: new Date(2026, 1, 28, 10, 35, 12),
    sources: ['pricing-2024.pdf'],
    confidence: 'medium',
  },
]

const SAMPLE_CONVERSATIONS: ConversationRecord[] = [
  {
    id: 'conv-sample-1',
    date: 'Feb 28, 2026 - 10:30 AM',
    preview: 'Asked about product features and integration setup',
    messageCount: 6,
    hasVoice: true,
    messages: SAMPLE_MESSAGES.map((m) => ({
      ...m,
      timestamp: m.timestamp.toISOString(),
    })),
  },
  {
    id: 'conv-sample-2',
    date: 'Feb 27, 2026 - 3:15 PM',
    preview: 'Discussed troubleshooting common errors in the system',
    messageCount: 4,
    hasVoice: false,
    messages: [
      { id: 'c2-1', role: 'user' as const, text: 'I am getting an error when uploading large files', type: 'text' as const, timestamp: new Date(2026, 1, 27, 15, 15, 0).toISOString() },
      { id: 'c2-2', role: 'agent' as const, text: 'Large file uploads are limited to 50MB per file. If your file exceeds this limit, consider splitting it into smaller parts or compressing it before upload. The system supports PDF, DOCX, and TXT formats.', type: 'text' as const, timestamp: new Date(2026, 1, 27, 15, 15, 20).toISOString(), sources: ['troubleshooting.pdf'], confidence: 'high' },
      { id: 'c2-3', role: 'user' as const, text: 'What formats are supported?', type: 'text' as const, timestamp: new Date(2026, 1, 27, 15, 16, 0).toISOString() },
      { id: 'c2-4', role: 'agent' as const, text: 'The knowledge base supports three document formats:\n\n- **PDF** (.pdf) - Most common format\n- **DOCX** (.docx) - Microsoft Word documents\n- **TXT** (.txt) - Plain text files\n\nAll uploaded documents are automatically parsed and indexed for search.', type: 'text' as const, timestamp: new Date(2026, 1, 27, 15, 16, 15).toISOString(), sources: ['file-formats.txt'], confidence: 'high' },
    ],
  },
]

// --- Helpers ---
const STORAGE_KEY = 'rag_voice_agent_history'

function loadConversations(): ConversationRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return []
}

function saveConversations(convos: ConversationRecord[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(convos))
  } catch { /* ignore */ }
}

// --- Page ---
export default function Page() {
  const [activeScreen, setActiveScreen] = useState<'chat' | 'history' | 'knowledge'>('chat')
  const [voiceStatus, setVoiceStatus] = useState('idle')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [conversations, setConversations] = useState<ConversationRecord[]>([])
  const [sampleMode, setSampleMode] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setConversations(loadConversations())
  }, [])

  const handleAddMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg])
  }, [])

  const handleSaveConversation = useCallback(() => {
    setMessages((currentMessages) => {
      if (currentMessages.length === 0) return currentMessages
      const now = new Date()
      const record: ConversationRecord = {
        id: `conv-${Date.now()}`,
        date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }),
        preview: currentMessages[0]?.text?.slice(0, 120) || 'Voice conversation',
        messageCount: currentMessages.length,
        hasVoice: currentMessages.some((m) => m.type === 'voice'),
        messages: currentMessages.map((m) => ({
          ...m,
          timestamp: m.timestamp.toISOString(),
        })),
      }
      setConversations((prev) => {
        const updated = [record, ...prev]
        saveConversations(updated)
        return updated
      })
      return []
    })
  }, [])

  const handleDeleteConversation = useCallback((id: string) => {
    setConversations((prev) => {
      const updated = prev.filter((c) => c.id !== id)
      saveConversations(updated)
      return updated
    })
  }, [])

  const displayMessages = sampleMode && messages.length === 0 ? SAMPLE_MESSAGES : messages
  const displayConversations = sampleMode && conversations.length === 0 ? SAMPLE_CONVERSATIONS : conversations

  if (!mounted) {
    return (
      <div style={THEME_VARS} className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-sm">Loading...</div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div
        style={{
          ...THEME_VARS,
          background: 'linear-gradient(135deg, hsl(210 20% 97%) 0%, hsl(220 25% 95%) 35%, hsl(200 20% 96%) 70%, hsl(230 15% 97%) 100%)',
        } as React.CSSProperties}
        className="min-h-screen flex font-sans text-foreground"
      >
        <Sidebar
          activeScreen={activeScreen}
          onScreenChange={setActiveScreen}
          voiceStatus={voiceStatus}
        />

        <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <header className="flex items-center justify-between px-6 py-4 border-b border-border/30">
            <div>
              <h2 className="font-serif text-lg font-semibold tracking-[-0.01em] text-foreground">
                {activeScreen === 'chat' && 'Voice Chat'}
                {activeScreen === 'history' && 'History'}
                {activeScreen === 'knowledge' && 'Knowledge Base'}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 mr-2">
                <div className={cn('w-2 h-2 rounded-full', voiceStatus !== 'idle' ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground/30')} />
                <span className="text-xs text-muted-foreground">RAG Voice Agent</span>
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4">gpt-4.1</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="sample-toggle" className="text-xs text-muted-foreground cursor-pointer">Sample Data</Label>
                <Switch id="sample-toggle" checked={sampleMode} onCheckedChange={setSampleMode} />
              </div>
            </div>
          </header>

          <div className="flex-1 min-h-0">
            {activeScreen === 'chat' && (
              <ChatScreen
                messages={displayMessages}
                onAddMessage={handleAddMessage}
                voiceStatus={voiceStatus}
                onVoiceStatusChange={setVoiceStatus}
                onSaveConversation={handleSaveConversation}
              />
            )}
            {activeScreen === 'history' && (
              <HistoryScreen
                conversations={displayConversations}
                onDeleteConversation={handleDeleteConversation}
              />
            )}
            {activeScreen === 'knowledge' && (
              <KnowledgeScreen />
            )}
          </div>

          <footer className="px-6 py-3 border-t border-border/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-[10px] py-0.5 px-2 font-normal">Agent: 69a27fd200b22915dd81e166</Badge>
              <Badge variant="secondary" className="text-[10px] py-0.5 px-2 font-normal">KB: 69a27fc2f572c99c0ffbe5bd</Badge>
            </div>
            <p className="text-[10px] text-muted-foreground">Voice + Text + Knowledge Base</p>
          </footer>
        </main>
      </div>
    </ErrorBoundary>
  )
}
