# Agent Playground

A modern, frontend-only internal tool for testing and iterating on AI agents. Built with React, TypeScript, Vite, TailwindCSS, and Shadcn UI.

[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1.7-646CFF.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.18-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## Features

- **Authentication**: Secure login via Supabase Auth
- **Agent Management**: Browse, search, and select agents from your API
- **Dynamic Input Forms**: Automatically generated forms based on agent schemas
- **Prompt Editing**: View and edit agent prompts directly from Opik
- **Agent Execution**: Run agents with custom inputs and view structured outputs
- **History Tracking**: Local storage of recent agent runs
- **Responsive Design**: Modern, clean UI that works on all screen sizes

## Tech Stack

- **Frontend Framework**: Vite + React + TypeScript
- **Styling**: TailwindCSS + Shadcn UI
- **State Management**: React Query (TanStack Query)
- **HTTP Client**: Axios
- **Authentication**: Supabase Auth
- **Routing**: React Router

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project
- Access to your internal agents API
- Opik API credentials

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/reach-agent-playground.git
cd reach-agent-playground
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

The `.env` file has been created with the following variables. Update them as needed:

```bash
# Supabase
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-key

# Internal Agent API
VITE_AGENT_API_BASE_URL=http://localhost:8000/api/internal
VITE_AGENT_API_KEY=your-agent-api-key
VITE_AGENT_ORG_ID=your-org-id

# Opik Prompt Management
VITE_OPIK_API_KEY=your-opik-api-key
VITE_OPIK_WORKSPACE=your-workspace
```

4. Start the development server:

```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn UI components
│   ├── AgentList.tsx
│   ├── AgentDetails.tsx
│   ├── InputForm.tsx
│   ├── OutputViewer.tsx
│   ├── PromptEditor.tsx
│   └── Navbar.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── hooks/              # Custom React hooks
│   ├── useAgents.ts
│   └── useHistory.ts
├── lib/                # Utility libraries
│   ├── apiClient.ts
│   ├── supabaseClient.ts
│   └── utils.ts
├── pages/              # Page components
│   ├── Login.tsx
│   └── Dashboard.tsx
├── App.tsx             # Main app component
└── main.tsx            # Entry point
```

## Usage

### Authentication

1. Navigate to the login page
2. Enter your Supabase credentials
3. Upon successful login, you'll be redirected to the dashboard

### Working with Agents

1. **Browse Agents**: The sidebar shows all available agents
2. **Search**: Use the search bar in the top navigation to filter agents
3. **Select an Agent**: Click on an agent to view its details
4. **View Prompt**: The prompt editor displays the agent's current prompt from Opik
5. **Edit Prompt**: Make changes and click "Save" to update the prompt in Opik
6. **Configure Inputs**: Fill in the dynamic form generated from the agent's schema
7. **Run Agent**: Click "Run Agent" to execute with your inputs
8. **View Results**: See structured output with Pretty/Raw JSON toggle
9. **History**: View recent runs for the selected agent

### Features Detail

#### Dynamic Input Forms

The app automatically generates input forms based on the agent's `model_input_schema`. It supports:

- Text inputs
- Number inputs
- Textareas for long text
- Checkboxes for booleans
- Required field validation

#### Output Viewer

- **Pretty View**: Structured, readable output with success/error indicators
- **Raw JSON**: Full JSON response for debugging
- **Copy to Clipboard**: Quick copy functionality

#### History

- Recent runs are stored locally
- Shows timestamp and success/error status
- Up to 50 runs per agent
- Persists across sessions

## API Integration

### Agent API

Fetches agents from your internal API:

```typescript
GET /api/internal/agents
Headers:
  x-api-key: YOUR_API_KEY
  x-organization-id: YOUR_ORG_ID
```

### Opik API

Manages prompts:

```typescript
GET /v1/workspaces/{workspace}/prompts/{agentId}
PATCH /v1/workspaces/{workspace}/prompts/{agentId}
Headers:
  Authorization: Bearer YOUR_OPIK_API_KEY
```

### Running Agents

```typescript
POST {agent.endpoint}
Headers:
  Authorization: Bearer {supabase_access_token}
Body: { ...inputs from form }
```

## Development

### Code Style

- TypeScript strict mode enabled
- ESLint configured for React
- Prettier-compatible formatting

### Adding New Components

Follow the Shadcn UI pattern for consistency:

```bash
# Components go in src/components/ui/
# Use the cn() utility for className merging
```

## Troubleshooting

### Authentication Issues

- Verify Supabase URL and publishable key
- Check that your Supabase project allows password authentication
- Ensure users are created in your Supabase project

### API Connection Issues

- Verify all API endpoints are accessible
- Check CORS settings on your backend
- Confirm API keys are valid

### Build Issues

- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

## Future Enhancements

- [ ] Versioned prompt management
- [ ] Collaboration features for prompt editing
- [ ] Compare results between prompt versions
- [ ] Role-based permissions via Supabase
- [ ] Export/import agent configurations
- [ ] Batch agent execution
- [ ] Advanced filtering and sorting

## Screenshots

_Screenshots would go here once the application is deployed_

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please follow the existing code style and submit pull requests for review.

## Support

If you have any questions or need help, please:

- Open an issue on GitHub
- Check the troubleshooting section above
- Review the project documentation

## Acknowledgments

- Built with [Vite](https://vitejs.dev/) for fast development
- UI components from [Shadcn UI](https://ui.shadcn.com/)
- Styled with [TailwindCSS](https://tailwindcss.com/)
- Authentication powered by [Supabase](https://supabase.com/)
