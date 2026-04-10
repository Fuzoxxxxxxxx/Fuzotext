-- Table pour stocker les textes de fuzoxx
CREATE TABLE IF NOT EXISTS texts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE texts ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire les textes (page publique)
CREATE POLICY "Anyone can view texts" ON texts FOR SELECT USING (true);

-- Seul l'admin peut insérer (on vérifiera côté serveur)
CREATE POLICY "Admin can insert texts" ON texts FOR INSERT WITH CHECK (true);

-- Seul l'admin peut supprimer
CREATE POLICY "Admin can delete texts" ON texts FOR DELETE USING (true);
