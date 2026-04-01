-- Table des questionnaires de retours assistants IA
CREATE TABLE IF NOT EXISTS feedback_questionnaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  team_name TEXT NOT NULL,
  assistants JSONB NOT NULL,
  unique_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des réponses
CREATE TABLE IF NOT EXISTS feedback_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_id UUID REFERENCES feedback_questionnaires(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  tested_assistants JSONB NOT NULL DEFAULT '[]',
  assistant_answers JSONB NOT NULL DEFAULT '{}',
  untested_reasons JSONB NOT NULL DEFAULT '{}',
  potential_assistant TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Fonction pour générer un code unique
CREATE OR REPLACE FUNCTION generate_feedback_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_count INTEGER;
BEGIN
  LOOP
    code := lower(substring(md5(random()::text) from 1 for 8));
    SELECT COUNT(*) INTO exists_count FROM feedback_questionnaires WHERE unique_code = code;
    EXIT WHEN exists_count = 0;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- RLS
ALTER TABLE feedback_questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_responses ENABLE ROW LEVEL SECURITY;

-- Policies : accès public en lecture/écriture (pas d'auth requise pour les répondants)
CREATE POLICY "Public read feedback_questionnaires"
  ON feedback_questionnaires FOR SELECT USING (true);

CREATE POLICY "Public insert feedback_questionnaires"
  ON feedback_questionnaires FOR INSERT WITH CHECK (true);

CREATE POLICY "Public insert feedback_responses"
  ON feedback_responses FOR INSERT WITH CHECK (true);

-- Index pour recherche par code
CREATE INDEX IF NOT EXISTS idx_feedback_questionnaires_unique_code
  ON feedback_questionnaires(unique_code);
