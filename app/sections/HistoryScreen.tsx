'use client'

import React, { useState, useMemo } from 'react'
import { HiClock, HiMagnifyingGlass, HiChatBubbleLeftRight, HiMicrophone, HiTrash } from 'react-icons/hi2'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

export interface ConversationRecord {
  id: string
  date: string
  preview: string
  messageCount: number
  hasVoice: boolean
  messages: {
    id: string
    role: 'user' | 'agent'
    text: string
    type: 'voice' | 'text'
    timestamp: string
    sources?: string[]
    confidence?: string
  }[]
}

interface HistoryScreenProps {
  conversations: ConversationRecord[]
  onDeleteConversation: (id: string) => void
}

export default function HistoryScreen({ conversations, onDeleteConversation }: HistoryScreenProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return conversations
    const q = searchQuery.toLowerCase()
    return conversations.filter(
      (c) =>
        c.preview.toLowerCase().includes(q) ||
        c.messages.some((m) => m.text.toLowerCase().includes(q))
    )
  }, [conversations, searchQuery])

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedId) ?? null,
    [conversations, selectedId]
  )

  return (
    <div className="flex h-full">
      {/* Conversation List */}
      <div className="w-[340px] border-r border-border/50 flex flex-col">
        <div className="p-4 pb-3">
          <h2 className="font-serif text-lg font-semibold tracking-[-0.01em] mb-3 text-foreground">
            Conversation History
          </h2>
          <div className="relative">
            <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl bg-card/75 backdrop-blur-[16px] border-white/[0.18] text-sm"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="px-3 pb-4 space-y-2">
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <HiClock className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {conversations.length === 0 ? 'No conversations yet' : 'No results found'}
                </p>
              </div>
            )}
            {filtered.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={cn(
                  'w-full text-left p-3 rounded-xl transition-all duration-200 border',
                  selectedId === conv.id
                    ? 'bg-primary/5 border-primary/20 shadow-sm'
                    : 'bg-card/50 border-white/[0.12] hover:bg-card/75 hover:border-white/[0.18]'
                )}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="text-xs text-muted-foreground font-mono">{conv.date}</span>
                  <div className="flex gap-1">
                    {conv.hasVoice && (
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4">
                        <HiMicrophone className="w-2.5 h-2.5 mr-0.5" />
                        Voice
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-foreground line-clamp-2 leading-[1.55] tracking-[-0.01em]">
                  {conv.preview}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4">
                    {conv.messageCount} msg{conv.messageCount !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Transcript Viewer */}
      <div className="flex-1 flex flex-col">
        {!selectedConversation ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <HiChatBubbleLeftRight className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Select a conversation to view</p>
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-base font-semibold text-foreground tracking-[-0.01em]">
                  {selectedConversation.date}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {selectedConversation.messageCount} messages
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
                onClick={() => {
                  onDeleteConversation(selectedConversation.id)
                  setSelectedId(null)
                }}
              >
                <HiTrash className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-3">
                {selectedConversation.messages.map((m) => (
                  <div key={m.id} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                    <div className={cn('max-w-[75%] rounded-2xl px-4 py-3 text-sm tracking-[-0.01em] leading-[1.55]', m.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-card/75 backdrop-blur-[16px] border border-white/[0.18] text-foreground rounded-bl-md')}>
                      <p className="whitespace-pre-wrap">{m.text}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] opacity-60">
                          {(() => { try { return new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } catch { return '' } })()}
                        </span>
                        {m.type === 'voice' && <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4">Voice</Badge>}
                        {m.confidence && m.role === 'agent' && (
                          <Badge variant="secondary" className={cn('text-[10px] py-0 px-1.5 h-4', m.confidence === 'high' ? 'bg-green-100 text-green-700' : m.confidence === 'low' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700')}>
                            {m.confidence}
                          </Badge>
                        )}
                      </div>
                      {Array.isArray(m.sources) && m.sources.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {m.sources.map((s, i) => (
                            <Badge key={i} variant="outline" className="text-[10px] py-0 px-1.5 h-4 font-normal">{s}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </div>
    </div>
  )
}
