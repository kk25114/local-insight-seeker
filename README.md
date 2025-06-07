# SPSS AI

A web interface for AI-assisted statistical analysis built with React, TypeScript and Supabase. Users can upload datasets, run analysis methods and chat with an AI assistant. The project integrates multiple AI providers via a Supabase edge function.

## Features

- **Dataset management** – upload CSV or JSON files and store them in Supabase
- **Analysis queue** – select algorithms from the sidebar and track progress
- **Custom algorithms** – create and categorize your own analysis prompts
- **AI model configuration** – manage external model IDs and API keys
- **Chat assistant** – interactive helper with streaming responses
- **Supabase backend** – authentication, database and serverless functions

## Development

```bash
npm install
npm run dev
```

The development server runs on `http://localhost:5173` by default.

See [docs/setup.md](docs/setup.md) for environment variable information.

## Project Structure

- `src/` – application source code
- `supabase/` – edge functions and configuration
- `public/` – static assets
- `docs/` – additional documentation

More details about the architecture can be found in [docs/architecture.md](docs/architecture.md).

## License

This repository was generated via Lovable and is provided without any warranty.

