import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Erreur d&apos;authentification</h1>
        <p className="mt-2 text-muted-foreground">Une erreur est survenue lors de la connexion.</p>
        <Link 
          href="/auth/login" 
          className="mt-4 inline-block text-primary underline underline-offset-4"
        >
          Retour a la connexion
        </Link>
      </div>
    </div>
  )
}
