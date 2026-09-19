# LiveCode

Real-time collaborative code editor. Multiple users edit the same file simultaneously with live cursors, synced via [Yjs](https://yjs.dev/) CRDTs over WebSockets.

**[→ Live demo](https://livecode-jet.vercel.app)** *(after deploying)*

## What it does

- Create a room, share the URL — anyone who joins edits the same document in real time
- Full [Monaco Editor](https://microsoft.github.io/monaco-editor/) (VS Code's editor) with syntax highlighting for JS, TS, Python, Go, Rust, HTML, CSS, JSON, and Markdown
- Colored presence avatars showing who's in the room, live remote cursors in the editor
- **Run** button (JS) — executes code in a sandboxed iframe, captures `console.log` output
- Rooms persist as long as users are connected; no login required

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Editor | Monaco Editor via `@monaco-editor/react` |
| Sync | Yjs CRDTs (`yjs`, `y-monaco`) |
| Transport | Liveblocks WebSockets (`@liveblocks/yjs`) |
| Presence | Liveblocks awareness |
| Styling | Tailwind CSS |
| Deploy | Vercel |

## How the sync works

Each room gets a shared `Y.Doc`. When you type, Yjs computes a CRDT update and the `LiveblocksYjsProvider` broadcasts it to all peers via WebSocket. Remote updates are applied to Monaco through the `MonacoBinding`, which also tracks each user's cursor via awareness.

## Running locally

```bash
npm install
# add your Liveblocks public key to .env.local:
# NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=pk_...
npm run dev
```

Open two browser tabs to the same room URL and edit simultaneously.
