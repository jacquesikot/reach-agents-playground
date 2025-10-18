# Agent Playground — Product Spec (Simplified Frontend Only)

## Overview

This is a **frontend-only internal tool** built with **TypeScript**, **Vite**, **TailwindCSS**, **Shadcn UI**, and **Axios**. It helps **product teams test and iterate on AI agents** created by engineering teams.

There is **no backend server**. The app interacts directly with:

- Supabase (for authentication)
- The internal agents API (for fetching agents and running them)
- Comet Opik API (for fetching and managing prompts)

---

## Tech Stack

- **Frontend Framework:** Vite + React (TypeScript)
- **UI Components:** Shadcn/UI + TailwindCSS
- **State Management:** React Query (for API caching and reactivity)
- **HTTP Client:** Axios
- **Auth:** Supabase Auth (Email/Password or OAuth)

---

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://hwjilvdaufmniksokzis.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_I3sZpfdL45cb1vr7HQFHpA_FnYixm_T

# Internal Agent API
AGENT_API_BASE_URL=http://localhost:8000/api/internal
AGENT_API_KEY=ellTUUtbNWrmDgiiDaPmc4UWaL9KpdrCa
AGENT_ORG_ID=09b54a11-1563-47ab-9f9c-1d670322a54c

# Opik Prompt Management
OPIK_API_KEY=Cnq5Ct50lEkE48nFabe0hThHM
OPIK_WORKSPACE=reach
```

---

## Core Flows

### 1. Authentication Flow

- On launch, user logs in via Supabase.
- After login, retrieve **accessToken** for API calls.
- Store token in memory using React Query or React Context.

### 2. Fetch Agents

- Make a GET request:

  ```bash
  GET http://localhost:8000/api/internal/agents
  headers: {
    'content-type': 'application/json',
    'x-api-key': AGENT_API_KEY,
    'x-organization-id': AGENT_ORG_ID
  }
  ```

- Display returned agents in a **list/grid** with:

  - Name
  - Description
  - Model used
  - Capabilities (collapsible)

### 3. Agent Selection

- When a user selects an agent:

  - Load its `model_input_schema`.
  - Dynamically render input fields (using schema properties).
  - Fetch its prompt definition from Opik using:

    ```bash
    GET https://api.opik.ai/v1/workspaces/{OPIK_WORKSPACE}/prompts/{agent.id}
    headers: { Authorization: `Bearer ${OPIK_API_KEY}` }
    ```

### 4. Prompt Editing UI

- A simple **text editor area** (Shadcn textarea or code editor like Monaco if available).
- User can:

  - View and edit the current prompt.
  - Save updated version (calls Opik API PATCH or PUT endpoint).
  - Duplicate a prompt version.

### 5. Running the Agent

- On “Run Agent”, make a POST request to the agent’s endpoint:

  ```bash
  POST http://localhost:8000${agent.endpoint}
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  }
  body: { inputs from model_input_schema }
  ```

- Show loading state → Then render structured JSON response prettily.
- Optionally allow user to toggle between **Raw JSON** and **Formatted UI** view.

### 6. History View

- Cache recent runs in localStorage.
- Display a list of recent inputs and outputs per agent.

---

## UI Layout

### **1. Login Page**

- Simple Supabase login form.
- Redirect to dashboard on success.

### **2. Dashboard Page**

- Sidebar:

  - List of all agents (fetched from API)
  - Click to open details

- Main area:

  - Agent overview
  - Prompt editor panel
  - Dynamic input form (from schema)
  - Run button
  - Output display area (JSON/Pretty)

### **3. Minimal Navigation**

- Top bar with:

  - User avatar + Logout
  - Agent search/filter

---

## Example Component Structure

```
src/
  components/
    AuthProvider.tsx
    AgentList.tsx
    AgentDetails.tsx
    PromptEditor.tsx
    InputForm.tsx
    OutputViewer.tsx
  pages/
    Login.tsx
    Dashboard.tsx
  hooks/
    useAgents.ts
    usePrompt.ts
    useRunAgent.ts
  lib/
    supabaseClient.ts
    apiClient.ts
```

---

## API Layer (Axios)

```ts
// apiClient.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.AGENT_API_BASE_URL,
  headers: {
    'x-api-key': import.meta.env.AGENT_API_KEY,
    'x-organization-id': import.meta.env.AGENT_ORG_ID,
  },
});
```

---

## MVP Scope

✅ Supabase Auth
✅ Fetch and display agents
✅ Dynamic input form generation
✅ Prompt fetching/editing (Opik)
✅ Run agent with inputs and show output
✅ Simple history (local cache)

---

## Future Enhancements

- Versioned prompt management (save to Opik)
- Collaboration view for prompt editing
- Compare run results between versions
- Role-based permissions via Supabase

---

This version focuses purely on a **frontend UI tool**, easy to set up and extend, no backend configuration required.
