'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { HiMicrophone, HiStop, HiPaperAirplane, HiSignal } from 'react-icons/hi2'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { callAIAgent } from '@/lib/aiAgent'
import { cn } from '@/lib/utils'

const AGENT_ID = '69a27fd200b22915dd81e166'

export interface ChatMessage {
  id: string
  role: 'user' | 'agent'
  text: string
  type: 'voice' | 'text'
  timestamp: Date
  sources?: string[]
  confidence?: string
}

interface ChatScreenProps {
  messages: ChatMessage[]
  onAddMessage: (msg: ChatMessage) => void
  voiceStatus: string
  onVoiceStatusChange: (status: string) => void
  onSaveConversation: () => void
  selectedLanguage: string
  selectedLanguageLabel: string
}

function WaveformAnimation({ status }: { status: string }) {
  const barCount = 24
  const isActive = status === 'listening' || status === 'speaking' || status === 'processing'
  return (
    <div className="flex items-center justify-center gap-[3px] h-20">
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'w-[3px] rounded-full transition-all',
            status === 'speaking' ? 'bg-primary' : status === 'listening' ? 'bg-green-500' : status === 'processing' ? 'bg-amber-500' : 'bg-muted-foreground/20'
          )}
          style={{
            height: isActive ? `${12 + (i % 5) * 10 + (i % 3) * 6}px` : '8px',
            animation: isActive ? `waveform-bar ${0.4 + (i % 5) * 0.12}s ease-in-out infinite alternate` : 'none',
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
    </div>
  )
}

function StatusLabel({ status }: { status: string }) {
  const labels: Record<string, { text: string; color: string }> = {
    idle: { text: 'Ready to Chat', color: 'text-muted-foreground' },
    connecting: { text: 'Connecting...', color: 'text-amber-600' },
    listening: { text: 'Listening...', color: 'text-green-600' },
    processing: { text: 'Processing...', color: 'text-amber-600' },
    speaking: { text: 'Speaking...', color: 'text-primary' },
    error: { text: 'Connection Error', color: 'text-destructive' },
  }
  const info = labels[status] || labels.idle
  return <p className={cn('text-sm font-medium tracking-[-0.01em]', info.color)}>{info.text}</p>
}

export default function ChatScreen({ messages, onAddMessage, voiceStatus, onVoiceStatusChange, onSaveConversation, selectedLanguage, selectedLanguageLabel }: ChatScreenProps) {
  const [textInput, setTextInput] = useState('')
  const [sending, setSending] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const isMutedRef = useRef(false)
  const wsRef = useRef<WebSocket | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const nextPlayTimeRef = useRef(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const msgIdRef = useRef(0)

  const genId = () => {
    msgIdRef.current += 1
    return `msg-${Date.now()}-${msgIdRef.current}`
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const stopMicrophone = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect()
      processorRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  const startMicrophone = useCallback(async (sampleRate: number) => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const audioContext = new AudioContext({ sampleRate })
    const source = audioContext.createMediaStreamSource(stream)
    const processor = audioContext.createScriptProcessor(4096, 1, 1)

    const silentGain = audioContext.createGain()
    silentGain.gain.value = 0
    silentGain.connect(audioContext.destination)

    source.connect(processor)
    processor.connect(silentGain)

    processor.onaudioprocess = (e) => {
      if (isMutedRef.current) return
      const inputData = e.inputBuffer.getChannelData(0)
      const pcm16 = new Int16Array(inputData.length)
      for (let i = 0; i < inputData.length; i++) {
        pcm16[i] = Math.max(-32768, Math.min(32767, Math.floor(inputData[i] * 32768)))
      }
      const uint8 = new Uint8Array(pcm16.buffer)
      let binary = ''
      for (let j = 0; j < uint8.length; j++) {
        binary += String.fromCharCode(uint8[j])
      }
      const base64 = btoa(binary)
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'audio', audio: base64, sampleRate }))
      }
    }

    audioContextRef.current = audioContext
    streamRef.current = stream
    processorRef.current = processor
  }, [])

  const playAudioChunk = useCallback((base64Audio: string, sampleRate: number) => {
    const audioContext = audioContextRef.current || new AudioContext({ sampleRate })
    if (!audioContextRef.current) audioContextRef.current = audioContext

    const binaryString = atob(base64Audio)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    const pcm16 = new Int16Array(bytes.buffer)
    const float32 = new Float32Array(pcm16.length)
    for (let i = 0; i < pcm16.length; i++) {
      float32[i] = pcm16[i] / 32768
    }

    const audioBuffer = audioContext.createBuffer(1, float32.length, sampleRate)
    audioBuffer.getChannelData(0).set(float32)

    const sourceNode = audioContext.createBufferSource()
    sourceNode.buffer = audioBuffer
    sourceNode.connect(audioContext.destination)

    const now = audioContext.currentTime
    const startTime = Math.max(now, nextPlayTimeRef.current)
    sourceNode.start(startTime)
    nextPlayTimeRef.current = startTime + audioBuffer.duration
  }, [])

  const startVoiceSession = useCallback(async () => {
    try {
      onVoiceStatusChange('connecting')
      const res = await fetch('https://voice-sip.studio.lyzr.ai/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: AGENT_ID }),
      })
      const data = await res.json()
      const wsUrl = data.wsUrl
      const sampleRate = data.audioConfig?.sampleRate || 24000

      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        onVoiceStatusChange('listening')
        startMicrophone(sampleRate)
      }

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data)
        if (msg.type === 'audio') {
          playAudioChunk(msg.audio, sampleRate)
          onVoiceStatusChange('speaking')
        } else if (msg.type === 'transcript') {
          if (msg.role === 'assistant') {
            onAddMessage({ id: genId(), role: 'agent', text: msg.text, type: 'voice', timestamp: new Date() })
            onVoiceStatusChange('listening')
          } else if (msg.role === 'user') {
            onAddMessage({ id: genId(), role: 'user', text: msg.text, type: 'voice', timestamp: new Date() })
            onVoiceStatusChange('processing')
          }
        } else if (msg.type === 'thinking') {
          onVoiceStatusChange('processing')
        } else if (msg.type === 'error') {
          onVoiceStatusChange('error')
        }
      }

      ws.onclose = () => {
        onVoiceStatusChange('idle')
        stopMicrophone()
        onSaveConversation()
      }

      ws.onerror = () => {
        onVoiceStatusChange('error')
      }
    } catch (err) {
      console.error(err)
      onVoiceStatusChange('idle')
    }
  }, [onVoiceStatusChange, onAddMessage, startMicrophone, stopMicrophone, playAudioChunk, onSaveConversation])

  const stopVoiceSession = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    stopMicrophone()
    nextPlayTimeRef.current = 0
    onVoiceStatusChange('idle')
    onSaveConversation()
  }, [stopMicrophone, onVoiceStatusChange, onSaveConversation])

  const handleToggleMute = () => {
    setIsMuted((prev) => {
      isMutedRef.current = !prev
      return !prev
    })
  }

  const handleSendText = async () => {
    const msg = textInput.trim()
    if (!msg || sending) return
    setTextInput('')
    setSending(true)
    onAddMessage({ id: genId(), role: 'user', text: msg, type: 'text', timestamp: new Date() })

    try {
      // Prepend language instruction so the agent responds in the selected language
      const languagePrefix = selectedLanguage !== 'en' ? `[Respond in ${selectedLanguageLabel}] ` : ''
      const result = await callAIAgent(languagePrefix + msg, AGENT_ID)
      const answer = result?.response?.result?.answer || result?.response?.message || result?.response?.result?.text || 'No response received.'
      const sources = Array.isArray(result?.response?.result?.sources) ? result.response.result.sources : []
      const confidence = result?.response?.result?.confidence || 'medium'
      onAddMessage({ id: genId(), role: 'agent', text: answer, type: 'text', timestamp: new Date(), sources, confidence })
    } catch {
      onAddMessage({ id: genId(), role: 'agent', text: 'Failed to get a response. Please try again.', type: 'text', timestamp: new Date() })
    }
    setSending(false)
  }

  const isVoiceActive = voiceStatus !== 'idle' && voiceStatus !== 'error'

  return (
    <div className="flex flex-col h-full">
      {/* Voice Panel */}
      <Card className="bg-card/75 backdrop-blur-[16px] border border-white/[0.18] shadow-md mx-6 mt-6 mb-4">
        <CardContent className="py-6 flex flex-col items-center gap-4">
          <WaveformAnimation status={voiceStatus} />
          <StatusLabel status={voiceStatus} />
          <div className="flex items-center gap-3">
            {!isVoiceActive ? (
              <Button
                size="lg"
                className="rounded-full w-16 h-16 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-105"
                onClick={startVoiceSession}
              >
                <HiMicrophone className="w-7 h-7" />
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn('rounded-xl', isMuted && 'bg-destructive/10 text-destructive border-destructive/30')}
                  onClick={handleToggleMute}
                >
                  {isMuted ? 'Unmute' : 'Mute'}
                </Button>
                <Button
                  size="lg"
                  variant="destructive"
                  className="rounded-full w-14 h-14 shadow-lg shadow-destructive/25 transition-all duration-300 hover:scale-105"
                  onClick={stopVoiceSession}
                >
                  <HiStop className="w-6 h-6" />
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chat Transcript */}
      <div className="flex-1 min-h-0 mx-6 mb-4">
        <ScrollArea className="h-full">
          <div ref={scrollRef} className="space-y-4 pr-4 pb-2">
            {messages.length === 0 && (
              <div className="text-center py-16">
                <HiSignal className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Start a voice session or type a message below</p>
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div className={cn('max-w-[75%] rounded-2xl px-4 py-3 text-sm tracking-[-0.01em] leading-[1.55]', m.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-card/75 backdrop-blur-[16px] border border-white/[0.18] text-foreground rounded-bl-md')}>
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] opacity-60">{m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {m.type === 'voice' && <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4">Voice</Badge>}
                    {m.confidence && m.role === 'agent' && (
                      <Badge variant="secondary" className={cn('text-[10px] py-0 px-1.5 h-4', m.confidence === 'high' ? 'bg-green-100 text-green-700' : m.confidence === 'low' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700')}>
                        {m.confidence}
                      </Badge>
                    )}
                  </div>
                  {Array.isArray(m.sources) && m.sources.length > 0 && (
                    <Collapsible>
                      <CollapsibleTrigger className="text-[11px] text-primary/80 hover:text-primary mt-1 underline-offset-2 hover:underline">
                        {m.sources.length} source{m.sources.length > 1 ? 's' : ''}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-1.5 flex flex-wrap gap-1">
                        {m.sources.map((s, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] py-0 px-1.5 h-4 font-normal">{s}</Badge>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-card/75 backdrop-blur-[16px] border border-white/[0.18] rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Text Input Bar */}
      <div className="px-6 pb-6">
        <div className="flex items-center gap-2 bg-card/75 backdrop-blur-[16px] border border-white/[0.18] rounded-2xl px-4 py-2 shadow-sm">
          <Input
            placeholder={selectedLanguage !== 'en' ? `Type a message... (${selectedLanguageLabel})` : 'Type a message...'}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendText() } }}
            disabled={sending}
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm flex-1 placeholder:text-muted-foreground/50"
          />
          <Button
            size="sm"
            className="rounded-xl h-9 w-9 p-0 shrink-0"
            onClick={handleSendText}
            disabled={!textInput.trim() || sending}
          >
            <HiPaperAirplane className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
