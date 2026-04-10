'use client'

import { useState, useEffect } from 'react'
import { Moon, Sun, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Text {
  id: string
  content: string
  created_at: string
}

interface PublicViewProps {
  initialTexts: Text[]
}

export function PublicView({ initialTexts }: PublicViewProps) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = () => {
    setIsDark(!isDark)
    if (!isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <div className="min-h-svh bg-background transition-colors duration-300">
      <header className="fixed right-0 top-0 z-10 flex items-center gap-2 p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full"
          aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
        >
          {isDark ? (
            <Sun className="h-5 w-5 text-foreground" />
          ) : (
            <Moon className="h-5 w-5 text-foreground" />
          )}
        </Button>
        <Link href="/auth/login">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Lock className="h-4 w-4 text-muted-foreground" />
          </Button>
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-20">
        <header className="mb-16 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            fuzoxx
          </h1>
          <p className="mt-2 text-muted-foreground">Mes pensees</p>
        </header>

        {initialTexts.length === 0 ? (
          <div className="text-center">
            <p className="text-muted-foreground">Aucun texte pour le moment...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {initialTexts.map((text) => (
              <article
                key={text.id}
                className="rounded-lg border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <p className="whitespace-pre-wrap text-lg leading-relaxed text-card-foreground">
                  {text.content}
                </p>
                <time className="mt-4 block text-sm text-muted-foreground">
                  {new Date(text.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </time>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className="py-8 text-center text-sm text-muted-foreground">
        fuzoxx
      </footer>
    </div>
  )
}
