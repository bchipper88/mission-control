# Mission Control 🎯

Command center for the Dark Lord's digital empire.

## Features

- **Dashboard** - Overview of agent status and activity
- **Team** - View and manage your AI agent workforce
- **Memory** - Searchable knowledge base synced from markdown files
- **Tasks** - Track what you and agents are working on (coming soon)
- **Calendar** - View scheduled tasks and cron jobs (coming soon)

## Tech Stack

- **Next.js 16** - React framework
- **Convex** - Real-time database
- **Tailwind CSS** - Styling

## Setup

### 1. Install dependencies

```bash
cd mission-control
npm install
```

### 2. Set up Convex

Create a Convex account at [convex.dev](https://convex.dev) if you don't have one.

```bash
npx convex dev
```

This will:
- Prompt you to log in to Convex
- Create a new project (or link existing)
- Generate the `.env.local` file with your project URL
- Start the Convex dev server

### 3. Run the app

In a new terminal:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Initialize the team

Click "Initialize Team" on the Team page to seed the default agents.

## Syncing Memories

To sync memories from markdown files, use the import script:

```bash
# Coming soon - script to parse MEMORY.md and memory/*.md into Convex
```

## Agent Status Updates

Agents can update their status via the Convex API:

```typescript
// From agent code
await convex.mutation(api.agents.updateStatus, {
  name: "Bellatrix",
  status: "working",
  currentTask: "Building Mission Control"
});
```

## Mission Statement

> "Achieve financial independence through autonomous digital businesses managed by AI agents."

---

Built with 🖤 by Bellatrix
