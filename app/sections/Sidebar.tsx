'use client'

import React from 'react'
import { HiChatBubbleLeftRight, HiClock, HiBookOpen, HiMicrophone } from 'react-icons/hi2'
import { cn } from '@/lib/utils'

type Screen = 'chat' | 'history' | 'knowledge'

interface SidebarProps {
  activeScreen: Screen
  onScreenChange: (screen: Screen) => void
  voiceStatus: string
}

const navItems: { id: Screen; label: string; icon: React.ElementType }[] = [
  { id: 'chat', label: 'Chat', icon: HiChatBubbleLeftRight },
  { id: 'history', label: 'History', icon: HiClock },
  { id: 'knowledge', label: 'Knowledge', icon: HiBookOpen },
]

export default function Sidebar({ activeScreen, onScreenChange, voiceStatus }: SidebarProps) {
  return (
    <aside className="w-[240px] min-h-screen flex flex-col bg-card/75 backdrop-blur-[16px] border-r border-white/[0.18] py-6 px-4">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <HiMicrophone className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-serif text-base font-semibold tracking-[-0.01em] leading-[1.55] text-foreground">
            RAG Voice
          </h1>
          <p className="text-[11px] text-muted-foreground font-sans tracking-[-0.01em]">
            Knowledge Agent
          </p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeScreen === item.id
          return (
            <button
              key={item.id}
              onClick={() => onScreenChange(item.id)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium tracking-[-0.01em] transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary shadow-sm'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              )}
            >
              <Icon className="w-[18px] h-[18px]" />
              <span>{item.label}</span>
              {item.id === 'chat' && voiceStatus !== 'idle' && (
                <span className="ml-auto w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              )}
            </button>
          )
        })}
      </nav>

      <div className="mt-auto px-2 pt-6 border-t border-border/50">
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-2 h-2 rounded-full',
            voiceStatus === 'idle' ? 'bg-muted-foreground/40' : 'bg-green-500 animate-pulse'
          )} />
          <span className="text-xs text-muted-foreground font-sans capitalize">
            {voiceStatus === 'idle' ? 'Ready' : voiceStatus}
          </span>
        </div>
      </div>
    </aside>
  )
}
