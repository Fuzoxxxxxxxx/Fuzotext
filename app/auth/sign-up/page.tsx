'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [accountExists, setAccountExists] = useState<boolean | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    checkIfAccountExists()
  }, [])

  const checkIfAccountExists = async () => {
    try {
      const response = await fetch('/api/check-account')
      const data = await response.json()
      setAccountExists(data.exists)
    } catch {
      setAccountExists(false)
    } finally {
      setChecking(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
            `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      setSuccess(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-background p-6">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    )
  }

  if (accountExists) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Acces refuse</CardTitle>
              <CardDescription>
                Un compte existe deja sur ce site.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Ce site est reserve a un seul utilisateur. Les inscriptions sont fermees.
              </p>
              <Link href="/auth/login">
                <Button variant="outline" className="w-full">
                  Retour a la connexion
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Verifie tes emails</CardTitle>
              <CardDescription>
                Un lien de confirmation a ete envoye a {email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Clique sur le lien dans l&apos;email pour activer ton compte, puis tu pourras te connecter.
              </p>
              <Link href="/auth/login">
                <Button variant="outline" className="w-full">
                  Retour a la connexion
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Creer ton compte</CardTitle>
            <CardDescription>
              Bienvenue fuzoxx! Cree ton unique compte admin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ton@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum 6 caracteres
                  </p>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creation...' : 'Creer mon compte'}
                </Button>
              </div>
            </form>
            <div className="mt-4 text-center">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
                Retour au site
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
