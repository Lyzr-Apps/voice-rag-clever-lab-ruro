'use client'

import React from 'react'
import { HiChatBubbleLeftRight, HiClock, HiBookOpen, HiMicrophone, HiLanguage } from 'react-icons/hi2'
import { cn } from '@/lib/utils'

type Screen = 'chat' | 'history' | 'knowledge'

export interface LanguageOption {
  code: string
  label: string
  nativeLabel: string
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: '\u0939\u093F\u0902\u0926\u0940' },
  { code: 'gu', label: 'Gujarati', nativeLabel: '\u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4\u0AC0' },
  { code: 'ta', label: 'Tamil', nativeLabel: '\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD' },
  { code: 'te', label: 'Telugu', nativeLabel: '\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41' },
  { code: 'bn', label: 'Bengali', nativeLabel: '\u09AC\u09BE\u0982\u09B2\u09BE' },
  { code: 'mr', label: 'Marathi', nativeLabel: '\u092E\u0930\u093E\u0920\u0940' },
  { code: 'kn', label: 'Kannada', nativeLabel: '\u0C95\u0CA8\u0CCD\u0CA8\u0CA1' },
  { code: 'ml', label: 'Malayalam', nativeLabel: '\u0D2E\u0D32\u0D2F\u0D3E\u0D33\u0D02' },
  { code: 'pa', label: 'Punjabi', nativeLabel: '\u0A2A\u0A70\u0A1C\u0A3E\u0A2C\u0A40' },
  { code: 'ur', label: 'Urdu', nativeLabel: '\u0627\u0631\u062F\u0648' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Espa\u00F1ol' },
  { code: 'fr', label: 'French', nativeLabel: 'Fran\u00E7ais' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch' },
  { code: 'pt', label: 'Portuguese', nativeLabel: 'Portugu\u00EAs' },
  { code: 'ar', label: 'Arabic', nativeLabel: '\u0627\u0644\u0639\u0631\u0628\u064A\u0629' },
  { code: 'zh', label: 'Chinese', nativeLabel: '\u4E2D\u6587' },
  { code: 'ja', label: 'Japanese', nativeLabel: '\u65E5\u672C\u8A9E' },
  { code: 'ko', label: 'Korean', nativeLabel: '\uD55C\uAD6D\uC5B4' },
]

interface SidebarProps {
  activeScreen: Screen
  onScreenChange: (screen: Screen) => void
  voiceStatus: string
  selectedLanguage: string
  onLanguageChange: (code: string) => void
}

const navItems: { id: Screen; label: string; icon: React.ElementType }[] = [
  { id: 'chat', label: 'Chat', icon: HiChatBubbleLeftRight },
  { id: 'history', label: 'History', icon: HiClock },
  { id: 'knowledge', label: 'Knowledge', icon: HiBookOpen },
]

export default function Sidebar({ activeScreen, onScreenChange, voiceStatus, selectedLanguage, onLanguageChange }: SidebarProps) {
  const currentLang = LANGUAGES.find((l) => l.code === selectedLanguage) || LANGUAGES[0]

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

      {/* Language Selector */}
      <div className="px-2 pt-4 pb-4 border-t border-border/50">
        <div className="flex items-center gap-2 mb-2">
          <HiLanguage className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground tracking-[-0.01em]">Response Language</span>
        </div>
        <select
          value={selectedLanguage}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="w-full text-sm rounded-xl border border-border/50 bg-card/75 backdrop-blur-[16px] px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors cursor-pointer appearance-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 10px center',
            paddingRight: '32px',
          }}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.nativeLabel} ({lang.label})
            </option>
          ))}
        </select>
        <p className="text-[10px] text-muted-foreground/60 mt-1.5 px-1">
          Agent responds in {currentLang.label}
        </p>
      </div>

      <div className="px-2 pt-4 border-t border-border/50">
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
