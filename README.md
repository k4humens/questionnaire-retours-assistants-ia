# Questionnaire Retours Assistants IA

Application de collecte des retours terrain sur les assistants IA déployés.

## Stack

- React 18 + Vite + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (BDD + Edge Functions)
- Notion (sync des réponses)

## Setup

```bash
npm install
cp .env.example .env  # Renseigner les variables Supabase
npm run dev
```

## Variables d'environnement

```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## Migration Supabase

Exécuter le contenu de `supabase/migrations/001_initial.sql` dans le SQL Editor du projet Supabase.

## Edge Function

Déployer `supabase/functions/sync-feedback-to-notion/` avec les secrets :

```bash
supabase secrets set NOTION_API_KEY=secret_xxx
supabase secrets set NOTION_FEEDBACK_DB_ID=9860597d856b41ec8443248adc6eb1ff
```

## Notion

BDD Notion "Retours Assistants IA" créée sous la page Conceptory - Assistants IA.
ID : `9860597d856b41ec8443248adc6eb1ff`
