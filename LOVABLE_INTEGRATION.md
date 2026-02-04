# Lovable Integration Fix

## The Issue
Supabase Edge Functions require the `apikey` (anon key) header by default.

## The Fix

Update your fetch call in the Lovable component:

```typescript
const response = await fetch(
  'https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/agent-signup',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': 'YOUR_SUPABASE_ANON_KEY_HERE'  // ← Add this!
    },
    body: JSON.stringify({
      owner_email: email,
      agent_name: agentName,
      sdk_type: 'typescript',
    }),
  }
);
```

## Get Your Anon Key

1. Go to: https://supabase.com/dashboard/project/peruwnbrqkvmrldhpoom/settings/api
2. Copy the "anon public" key
3. Add it to your Lovable project environment variables
4. Use it in the fetch call

## Full Updated Component

```typescript
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const response = await fetch(
      'https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/agent-signup',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,  // ← Required!
        },
        body: JSON.stringify({
          owner_email: email,
          agent_name: agentName,
          sdk_type: 'typescript',
        }),
      }
    );

    // ... rest of code
  } catch (err) {
    // ... error handling
  }
};
```

## Security Note

The anon key is **safe to expose** in the frontend. It's designed to be public.
Your edge functions and RLS policies protect your data.
