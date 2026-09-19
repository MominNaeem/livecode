"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [joinId, setJoinId] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("livecode-name");
    if (saved) setName(saved);
  }, []);

  const goToRoom = (roomId: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    localStorage.setItem("livecode-name", trimmed);
    router.push(`/room/${roomId}`);
  };

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    goToRoom(nanoid(8));
  };

  const handleJoin = (e: FormEvent) => {
    e.preventDefault();
    const id = joinId.trim();
    if (id) goToRoom(id);
  };

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white">
                <path
                  d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3m13 0h-3a2 2 0 0 1-2-2v-3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">LiveCode</h1>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            Real-time collaborative code editing.
            <br />
            Monaco Editor · Yjs CRDTs · WebSockets.
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl">
          <div className="mb-5">
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
              Display name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name…"
              autoFocus
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm border border-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition placeholder-gray-600"
            />
          </div>

          <form onSubmit={handleCreate}>
            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
            >
              + Create new room
            </button>
          </form>

          <div className="flex items-center my-5 gap-3">
            <div className="flex-1 border-t border-gray-800" />
            <span className="text-xs text-gray-600">or join with room ID</span>
            <div className="flex-1 border-t border-gray-800" />
          </div>

          <form onSubmit={handleJoin} className="flex gap-2">
            <input
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
              placeholder="Room ID…"
              className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm border border-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition placeholder-gray-600"
            />
            <button
              type="submit"
              disabled={!name.trim() || !joinId.trim()}
              className="bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap"
            >
              Join
            </button>
          </form>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {["Monaco Editor", "Yjs CRDTs", "Liveblocks", "Next.js 15", "TypeScript"].map((t) => (
            <span
              key={t}
              className="text-xs text-gray-600 bg-gray-900 border border-gray-800 px-2.5 py-1 rounded-full"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
