# Local Setup

1. **Install dependencies**

```bash
npm install
```

2. **Run the development server**

```bash
npm run dev
```

The app will be available at `http://localhost:5173` by default.

3. **Environment variables**

API keys for the AI models are stored as secrets in Supabase. When running locally you can create a `.env` file with the following entries (replace with your own keys):

```
VITE_SUPABASE_URL=your-project.supabase.co
VITE_SUPABASE_KEY=public-anon-key
```

Supabase CLI will read any secrets configured for edge functions. See [Supabase documentation](https://supabase.com/docs) for details on setting secrets.

