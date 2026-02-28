'use client'

import React, { useState, useMemo } from 'react'
import { HiChatBubbleLeftRight, HiClock, HiBookOpen, HiMicrophone, HiLanguage, HiMagnifyingGlass } from 'react-icons/hi2'
import { cn } from '@/lib/utils'

type Screen = 'chat' | 'history' | 'knowledge'

export interface LanguageOption {
  code: string
  label: string
  nativeLabel: string
  region: 'indian' | 'european' | 'asian' | 'other'
}

export const LANGUAGES: LanguageOption[] = [
  // Global
  { code: 'en', label: 'English', nativeLabel: 'English', region: 'other' },
  // Indian Languages
  { code: 'hi', label: 'Hindi', nativeLabel: '\u0939\u093F\u0902\u0926\u0940', region: 'indian' },
  { code: 'gu', label: 'Gujarati', nativeLabel: '\u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4\u0AC0', region: 'indian' },
  { code: 'ta', label: 'Tamil', nativeLabel: '\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD', region: 'indian' },
  { code: 'te', label: 'Telugu', nativeLabel: '\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41', region: 'indian' },
  { code: 'bn', label: 'Bengali', nativeLabel: '\u09AC\u09BE\u0982\u09B2\u09BE', region: 'indian' },
  { code: 'mr', label: 'Marathi', nativeLabel: '\u092E\u0930\u093E\u0920\u0940', region: 'indian' },
  { code: 'kn', label: 'Kannada', nativeLabel: '\u0C95\u0CA8\u0CCD\u0CA8\u0CA1', region: 'indian' },
  { code: 'ml', label: 'Malayalam', nativeLabel: '\u0D2E\u0D32\u0D2F\u0D3E\u0D33\u0D02', region: 'indian' },
  { code: 'pa', label: 'Punjabi', nativeLabel: '\u0A2A\u0A70\u0A1C\u0A3E\u0A2C\u0A40', region: 'indian' },
  { code: 'ur', label: 'Urdu', nativeLabel: '\u0627\u0631\u062F\u0648', region: 'indian' },
  // European Languages
  { code: 'es', label: 'Spanish', nativeLabel: 'Espa\u00F1ol', region: 'european' },
  { code: 'fr', label: 'French', nativeLabel: 'Fran\u00E7ais', region: 'european' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch', region: 'european' },
  { code: 'pt', label: 'Portuguese', nativeLabel: 'Portugu\u00EAs', region: 'european' },
  // Asian & Middle Eastern
  { code: 'ar', label: 'Arabic', nativeLabel: '\u0627\u0644\u0639\u0631\u0628\u064A\u0629', region: 'asian' },
  { code: 'zh', label: 'Chinese', nativeLabel: '\u4E2D\u6587', region: 'asian' },
  { code: 'ja', label: 'Japanese', nativeLabel: '\u65E5\u672C\u8A9E', region: 'asian' },
  { code: 'ko', label: 'Korean', nativeLabel: '\uD55C\uAD6D\uC5B4', region: 'asian' },
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

const REGION_LABELS: Record<string, string> = {
  other: 'Global',
  indian: 'Indian Languages',
  european: 'European',
  asian: 'Asian & Middle Eastern',
}

export default function Sidebar({ activeScreen, onScreenChange, voiceStatus, selectedLanguage, onLanguageChange }: SidebarProps) {
  const currentLang = LANGUAGES.find((l) => l.code === selectedLanguage) || LANGUAGES[0]
  const [langSearch, setLangSearch] = useState('')
  const [langDropdownOpen, setLangDropdownOpen] = useState(false)

  const filteredLanguages = useMemo(() => {
    if (!langSearch.trim()) return LANGUAGES
    const q = langSearch.toLowerCase()
    return LANGUAGES.filter(
      (l) => l.label.toLowerCase().includes(q) || l.nativeLabel.toLowerCase().includes(q) || l.code.includes(q)
    )
  }, [langSearch])

  const groupedLanguages = useMemo(() => {
    const groups: Record<string, LanguageOption[]> = {}
    for (const lang of filteredLanguages) {
      if (!groups[lang.region]) groups[lang.region] = []
      groups[lang.region].push(lang)
    }
    return groups
  }, [filteredLanguages])

  return (
    <aside className="w-[260px] min-h-screen flex flex-col bg-card/75 backdrop-blur-[16px] border-r border-white/[0.18] py-6 px-4">
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <HiMicrophone className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-serif text-base font-semibold tracking-[-0.01em] leading-[1.55] text-foreground">
            RAG Voice
          </h1>
          <p className="text-[11px] text-muted-foreground font-sans tracking-[-0.01em]">
            Multilingual Knowledge Agent
          </p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 mb-6">
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

      {/* Language Selector - Enhanced */}
      <div className="flex-1 flex flex-col">
        <div className="px-1 pb-3 border-t border-border/50 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <HiLanguage className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-foreground tracking-[-0.01em]">Response Language</span>
          </div>

          {/* Current Language Display */}
          <button
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all duration-200 text-left',
              langDropdownOpen
                ? 'border-primary/30 bg-primary/5 shadow-sm'
                : 'border-border/50 bg-card/75 hover:border-primary/20'
            )}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base leading-none">{currentLang.nativeLabel}</span>
              <span className="text-xs text-muted-foreground">({currentLang.label})</span>
            </div>
            <svg
              className={cn('w-4 h-4 text-muted-foreground transition-transform', langDropdownOpen && 'rotate-180')}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {/* Language Dropdown */}
          {langDropdownOpen && (
            <div className="mt-2 bg-card/95 backdrop-blur-[16px] border border-white/[0.18] rounded-xl shadow-lg overflow-hidden">
              {/* Search */}
              <div className="p-2 border-b border-border/30">
                <div className="relative">
                  <HiMagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search languages..."
                    value={langSearch}
                    onChange={(e) => setLangSearch(e.target.value)}
                    className="w-full text-xs rounded-lg border border-border/30 bg-background/50 pl-8 pr-3 py-1.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/20"
                    autoFocus
                  />
                </div>
              </div>

              {/* Language List */}
              <div className="max-h-[280px] overflow-y-auto py-1">
                {Object.entries(groupedLanguages).map(([region, langs]) => (
                  <div key={region}>
                    <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                      {REGION_LABELS[region] || region}
                    </div>
                    {langs.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          onLanguageChange(lang.code)
                          setLangDropdownOpen(false)
                          setLangSearch('')
                        }}
                        className={cn(
                          'w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors text-sm',
                          selectedLanguage === lang.code
                            ? 'bg-primary/10 text-primary'
                            : 'text-foreground hover:bg-muted/50'
                        )}
                      >
                        <span className="text-sm leading-none min-w-[24px]">{lang.nativeLabel}</span>
                        <span className="text-xs text-muted-foreground">{lang.label}</span>
                        {selectedLanguage === lang.code && (
                          <svg className="w-3.5 h-3.5 ml-auto text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                ))}
                {filteredLanguages.length === 0 && (
                  <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                    No languages found
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedLanguage !== 'en' && (
            <div className="mt-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-[11px] text-primary/80 leading-[1.5]">
                Agent will respond in {currentLang.label} ({currentLang.nativeLabel}). Voice mode auto-detects language.
              </p>
            </div>
          )}
        </div>
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
