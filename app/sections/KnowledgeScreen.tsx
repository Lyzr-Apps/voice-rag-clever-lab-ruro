'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { HiArrowUpTray, HiDocument, HiTrash, HiGlobeAlt, HiArrowPath } from 'react-icons/hi2'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import {
  getDocuments,
  uploadAndTrainDocument,
  deleteDocuments,
  crawlWebsite,
  type RAGDocument,
} from '@/lib/ragKnowledgeBase'
import { cn } from '@/lib/utils'

const RAG_ID = '69a27fc2f572c99c0ffbe5bd'

export default function KnowledgeScreen() {
  const [documents, setDocuments] = useState<RAGDocument[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [crawling, setCrawling] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [crawlUrl, setCrawlUrl] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchDocs = useCallback(async () => {
    setLoading(true)
    setErrorMsg('')
    const result = await getDocuments(RAG_ID)
    if (result.success && Array.isArray(result.documents)) {
      setDocuments(result.documents)
    } else {
      setErrorMsg(result.error || 'Failed to load documents')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchDocs()
  }, [fetchDocs])

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    setStatusMsg('')
    setErrorMsg('')

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setStatusMsg(`Uploading ${file.name}...`)
      const result = await uploadAndTrainDocument(RAG_ID, file)
      if (!result.success) {
        setErrorMsg(`Failed to upload ${file.name}: ${result.error || 'Unknown error'}`)
      }
    }

    setStatusMsg('Upload complete')
    setUploading(false)
    await fetchDocs()
    setTimeout(() => setStatusMsg(''), 3000)
  }

  const handleDelete = async (fileName: string) => {
    setErrorMsg('')
    setStatusMsg(`Deleting ${fileName}...`)
    const result = await deleteDocuments(RAG_ID, [fileName])
    if (result.success) {
      setDocuments((prev) => prev.filter((d) => d.fileName !== fileName))
      setStatusMsg('Deleted successfully')
    } else {
      setErrorMsg(result.error || 'Failed to delete')
    }
    setTimeout(() => setStatusMsg(''), 3000)
  }

  const handleCrawl = async () => {
    const url = crawlUrl.trim()
    if (!url) return
    setCrawling(true)
    setErrorMsg('')
    setStatusMsg(`Crawling ${url}...`)
    const result = await crawlWebsite(RAG_ID, url)
    if (result.success) {
      setStatusMsg('Website crawled successfully')
      setCrawlUrl('')
      await fetchDocs()
    } else {
      setErrorMsg(result.error || 'Failed to crawl website')
    }
    setCrawling(false)
    setTimeout(() => setStatusMsg(''), 3000)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileUpload(e.dataTransfer.files)
  }

  const fileTypeIcon = (fileType: string) => {
    return <HiDocument className="w-5 h-5" />
  }

  const statusColor = (status?: string) => {
    if (status === 'active') return 'bg-green-100 text-green-700'
    if (status === 'processing') return 'bg-amber-100 text-amber-700'
    if (status === 'failed') return 'bg-red-100 text-red-700'
    return 'bg-muted text-muted-foreground'
  }

  return (
    <div className="p-6 h-full overflow-y-auto">
      <h2 className="font-serif text-lg font-semibold tracking-[-0.01em] mb-6 text-foreground">
        Knowledge Base
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Upload Dropzone */}
        <Card className="bg-card/75 backdrop-blur-[16px] border border-white/[0.18] shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium tracking-[-0.01em] flex items-center gap-2">
              <HiArrowUpTray className="w-4 h-4 text-primary" />
              Upload Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
                dragOver ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/40 hover:bg-muted/30'
              )}
            >
              <HiArrowUpTray className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-1">
                Drop files here or click to browse
              </p>
              <p className="text-xs text-muted-foreground/60">
                PDF, DOCX, TXT supported
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
            </div>
            {uploading && (
              <div className="mt-3">
                <Progress value={50} className="h-1.5" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Website Crawler */}
        <Card className="bg-card/75 backdrop-blur-[16px] border border-white/[0.18] shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium tracking-[-0.01em] flex items-center gap-2">
              <HiGlobeAlt className="w-4 h-4 text-primary" />
              Crawl Website
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3 leading-[1.55]">
              Add website content to the knowledge base by providing a URL. The crawler will extract and index the content.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com/docs"
                value={crawlUrl}
                onChange={(e) => setCrawlUrl(e.target.value)}
                className="rounded-xl bg-background/50 text-sm flex-1"
                disabled={crawling}
              />
              <Button
                size="sm"
                className="rounded-xl shrink-0"
                onClick={handleCrawl}
                disabled={!crawlUrl.trim() || crawling}
              >
                {crawling ? (
                  <HiArrowPath className="w-4 h-4 animate-spin" />
                ) : (
                  'Crawl'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Messages */}
      {statusMsg && (
        <div className="mb-4 px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/10 text-sm text-primary">
          {statusMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-4 px-4 py-2.5 rounded-xl bg-destructive/5 border border-destructive/10 text-sm text-destructive">
          {errorMsg}
        </div>
      )}

      {/* Documents Grid */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium tracking-[-0.01em] text-foreground">
          Documents ({documents.length})
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-xl text-xs"
          onClick={fetchDocs}
          disabled={loading}
        >
          <HiArrowPath className={cn('w-3.5 h-3.5 mr-1', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {loading && documents.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-muted rounded-xl h-24" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-16">
          <HiDocument className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No documents in the knowledge base</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Upload files or crawl a website to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {documents.map((doc, idx) => (
            <Card key={doc.id || idx} className="bg-card/75 backdrop-blur-[16px] border border-white/[0.18] shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      {fileTypeIcon(doc.fileType)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate tracking-[-0.01em]">
                        {doc.fileName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 uppercase">
                          {doc.fileType}
                        </Badge>
                        <Badge className={cn('text-[10px] py-0 px-1.5 h-4', statusColor(doc.status))}>
                          {doc.status || 'unknown'}
                        </Badge>
                      </div>
                      {doc.uploadedAt && (
                        <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                          {(() => { try { return new Date(doc.uploadedAt).toLocaleDateString() } catch { return doc.uploadedAt } })()}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
                    onClick={() => handleDelete(doc.fileName)}
                  >
                    <HiTrash className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
