# Project Architecture

This document gives an overview of the main pieces that compose **SPSS AI**, a web application for data analysis powered by AI models.

## Frontend

The frontend is built with **React**, **TypeScript** and **Vite**. Styling is based on **Tailwind CSS** and various components from **shadcn-ui**.

```
src/
  components/       Reusable UI and page components
  pages/            React Router pages
  integrations/     Utility clients (Supabase)
  hooks/            Custom React hooks
  config/           Static configuration such as analysis names
```

Key components include:

- **AnalysisSidebar** – list of available analysis methods and custom algorithms.
- **WorkArea** – main area to select datasets and launch analysis tasks.
- **DataManagement** – upload, manage and initialize datasets for analysis.
- **ModelManagement** – configure external AI models and API keys.
- **AlgorithmManagement** – manage custom analysis algorithms.
- **ChatWidget** – floating assistant with streaming responses.

Routing starts from `src/pages/Index.tsx` which brings together the sidebar, header and work area. Authentication pages and a marketing landing page are also provided.

## Backend

Supabase is used for authentication, database storage and edge functions. The function `supabase/functions/analyze-data` acts as a proxy to various AI providers (OpenAI, Anthropic, xAI) and streams results back to the frontend.

Database tables referenced in the code include:

- `ai_models` – configured AI model definitions.
- `analysis_algorithms` – custom algorithms for the sidebar.
- `datasets` – uploaded datasets in JSON/CSV form.
- `analysis_logs` – logs of executed analysis prompts and responses.

The function uses environment secrets for API keys. See the Supabase dashboard to configure them.

