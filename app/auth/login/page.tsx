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
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [accountExists, setAccountExists] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkIfAccountExists()
  }, [])

  const checkIfAccountExists = async () => {
    try {
      const response = await fetch('/api/check-account')
      const data = await response.json()
      setAccountExists(data.exists)
    } catch {
      setAccountExists(true) // Default to showing login only
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push('/admin')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Connexion Admin</CardTitle>
            <CardDescription>
              Connecte-toi pour ajouter des textes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Connexion...' : 'Se connecter'}
                </Button>
              </div>
            </form>
            {accountExists === false && (
              <div className="mt-4 text-center text-sm">
                Premiere visite?{' '}
                <Link href="/auth/sign-up" className="underline underline-offset-4">
                  Creer ton compte
                </Link>
              </div>
            )}
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
