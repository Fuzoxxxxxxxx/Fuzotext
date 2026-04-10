'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, LogOut, Sun, Moon, Eye, EyeOff, Pencil, X, Check, ArrowUp, ArrowDown, Home } from 'lucide-react'

interface Text {
  id: string
  content: string
  created_at: string
}

interface AdminPanelProps {
  initialTexts: Text[]
  userEmail: string
}

export function AdminPanel({ initialTexts, userEmail }: AdminPanelProps) {
  const [texts, setTexts] = useState<Text[]>(initialTexts)
  const [newText, setNewText] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [showPreview, setShowPreview] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const savedTheme = localStorage.getItem('fuzoxx-theme') as 'light' | 'dark' | null
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle('dark', savedTheme === 'dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('fuzoxx-theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  const handleAddText = async () => {
    if (!newText.trim()) return
    
    setIsAdding(true)
    
    const { data, error } = await supabase
      .from('texts')
      .insert({ content: newText.trim() })
      .select()
      .single()
    
    if (!error && data) {
      setTexts([data, ...texts])
      setNewText('')
      setShowPreview(false)
    }
    setIsAdding(false)
  }

  const handleDeleteText = async (id: string) => {
    if (!confirm('Supprimer ce texte?')) return
    
    const { error } = await supabase
      .from('texts')
      .delete()
      .eq('id', id)
    
    if (!error) {
      setTexts(texts.filter(t => t.id !== id))
    }
  }

  const handleUpdateText = async (id: string) => {
    if (!editingContent.trim()) return
    
    const { error } = await supabase
      .from('texts')
      .update({ content: editingContent.trim() })
      .eq('id', id)
    
    if (!error) {
      setTexts(texts.map(t => t.id === id ? { ...t, content: editingContent.trim() } : t))
      setEditingId(null)
      setEditingContent('')
    }
  }

  const startEditing = (text: Text) => {
    setEditingId(text.id)
    setEditingContent(text.content)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingContent('')
  }

  const moveText = async (id: string, direction: 'up' | 'down') => {
    const index = texts.findIndex(t => t.id === id)
    if (index === -1) return
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === texts.length - 1) return

    const targetIndex = direction === 'up' ? index - 1 : index + 1
    const currentText = texts[index]
    const targetText = texts[targetIndex]

    // Swap in local state first for instant feedback
    const newTexts = [...texts]
    newTexts[index] = targetText
    newTexts[targetIndex] = currentText
    setTexts(newTexts)

    // Swap created_at timestamps in database
    await supabase
      .from('texts')
      .update({ created_at: targetText.created_at })
      .eq('id', currentText.id)

    await supabase
      .from('texts')
      .update({ created_at: currentText.created_at })
      .eq('id', targetText.id)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const charCount = newText.length
  const totalChars = texts.reduce((acc, t) => acc + t.content.length, 0)

  return (
    <div className="min-h-svh bg-background text-foreground transition-colors">
      <div className="mx-auto max-w-2xl p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">fuzoxx</h1>
            <p className="text-sm text-muted-foreground">{userEmail}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} title="Changer le theme">
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => router.push('/')} title="Voir le site">
              <Home className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Deconnexion
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{texts.length}</div>
              <p className="text-sm text-muted-foreground">Textes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{totalChars.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Caracteres</p>
            </CardContent>
          </Card>
        </div>

        {/* Add new text */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Ajouter un texte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Textarea
                placeholder="Ecris ton texte ici..."
                value={newText}
                onChange={(e) => setNewText(e.target.value.slice(0, maxChars))}
                rows={4}
                className="resize-y pb-6"
              />
              <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                {charCount}/{maxChars}
              </div>
            </div>

            {newText && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="text-muted-foreground"
              >
                {showPreview ? <EyeOff className="mr-1 h-4 w-4" /> : <Eye className="mr-1 h-4 w-4" />}
                {showPreview ? 'Masquer apercu' : 'Apercu'}
              </Button>
            )}

            {showPreview && newText && (
              <div className="rounded-lg bg-muted p-4">
                <p className="mb-2 text-sm text-muted-foreground">Apercu:</p>
                <p className="whitespace-pre-wrap">{newText}</p>
              </div>
            )}

            <Button onClick={handleAddText} disabled={isAdding || !newText.trim()} className="w-full">
              {isAdding ? 'Publication...' : 'Publier'}
            </Button>
          </CardContent>
        </Card>

        {/* Texts list */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Mes textes ({texts.length})</h2>
          
          {texts.length === 0 ? (
            <p className="text-muted-foreground">Aucun texte pour le moment.</p>
          ) : (
            texts.map((text, index) => (
              <Card key={text.id}>
                <CardContent className="pt-4">
                  {editingId === text.id ? (
                    <div className="space-y-3">
                      <div className="relative">
                        <Textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value.slice(0, maxChars))}
                          className="min-h-24 resize-y pb-6"
                        />
                        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                          {editingContent.length}/{maxChars}
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={cancelEditing}>
                          <X className="mr-1 h-4 w-4" />
                          Annuler
                        </Button>
                        <Button size="sm" onClick={() => handleUpdateText(text.id)} disabled={!editingContent.trim()}>
                          <Check className="mr-1 h-4 w-4" />
                          Sauvegarder
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="mb-3 whitespace-pre-wrap">{text.content}</p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{formatDate(text.created_at)}</span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => moveText(text.id, 'up')}
                            disabled={index === 0}
                            title="Monter"
                            className="h-8 w-8"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => moveText(text.id, 'down')}
                            disabled={index === texts.length - 1}
                            title="Descendre"
                            className="h-8 w-8"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEditing(text)}
                            title="Modifier"
                            className="h-8 w-8"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteText(text.id)}
                            title="Supprimer"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
