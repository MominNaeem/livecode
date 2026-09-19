"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { LiveblocksProvider, RoomProvider } from "@liveblocks/react";
import PresenceAvatars from "@/components/presence-avatars";
import { getColorForName } from "@/lib/colors";

const CollaborativeEditor = dynamic(
  () => import("@/components/collaborative-editor"),
  { ssr: false, loading: () => <EditorSkeleton /> }
);

const LANGUAGES = [
  { value: "javascript", label: "JS" },
  { value: "typescript", label: "TS" },
  { value: "python", label: "Python" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "markdown", label: "Markdown" },
];

function EditorSkeleton() {
  return (
    <div className="h-full bg-[#1e1e1e] animate-pulse flex items-start p-5">
      <div className="space-y-3 w-full max-w-lg">
        {[60, 45, 80, 35, 70].map((w, i) => (
          <div key={i} className="h-4 bg-gray-700 rounded" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}

function OutputPanel({
  lines,
  onClose,
}: {
  lines: { type: "log" | "error"; text: string }[];
  onClose: () => void;
}) {
  return (
    <div className="h-40 border-t border-gray-800 bg-gray-950 flex flex-col">
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-gray-800">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Output</span>
        <button onClick={onClose} className="text-gray-600 hover:text-gray-400 text-xs">
          ✕ close
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-2 font-mono text-xs space-y-0.5">
        {lines.length === 0 ? (
          <span className="text-gray-600">No output.</span>
        ) : (
          lines.map((l, i) => (
            <div key={i} className={l.type === "error" ? "text-red-400" : "text-green-300"}>
              {l.text}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function RoomContent({ roomId }: { roomId: string }) {
  const router = useRouter();
  const [userName, setUserName] = useState("Anonymous");
  const [userColor, setUserColor] = useState("#60a5fa");
  const [language, setLanguage] = useState("javascript");
  const [copied, setCopied] = useState(false);
  const [output, setOutput] = useState<{ type: "log" | "error"; text: string }[]>([]);
  const [showOutput, setShowOutput] = useState(false);
  const getEditorValue = useRef<(() => string) | null>(null);

  useEffect(() => {
    const name = localStorage.getItem("livecode-name") || "Anonymous";
    setUserName(name);
    setUserColor(getColorForName(name));
  }, []);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = () => {
    if (!getEditorValue.current) return;
    const code = getEditorValue.current();
    const lines: { type: "log" | "error"; text: string }[] = [];
    setOutput([]);
    setShowOutput(true);

    const html = `<!DOCTYPE html><html><body><script>
      const _log = console.log.bind(console);
      const _err = console.error.bind(console);
      console.log = (...a) => { parent.postMessage({t:'log',d:a.map(x=>typeof x==='object'?JSON.stringify(x):String(x)).join(' ')},'*'); _log(...a); };
      console.error = (...a) => { parent.postMessage({t:'error',d:a.map(x=>typeof x==='object'?JSON.stringify(x):String(x)).join(' ')},'*'); _err(...a); };
      window.onerror = (m,_,l) => { parent.postMessage({t:'error',d:m+' (line '+l+')'},'*'); return true; };
      try { ${code.replace(/<\/script>/g, "<\\/script>")} } catch(e) { parent.postMessage({t:'error',d:e.message},'*'); }
    <\/script></body></html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.style.display = "none";
    iframe.sandbox.add("allow-scripts");
    document.body.appendChild(iframe);

    const handler = (e: MessageEvent) => {
      if (e.data?.t) {
        lines.push({ type: e.data.t === "error" ? "error" : "log", text: e.data.d });
        setOutput([...lines]);
      }
    };
    window.addEventListener("message", handler);

    setTimeout(() => {
      window.removeEventListener("message", handler);
      document.body.removeChild(iframe);
      URL.revokeObjectURL(url);
    }, 3000);
  };

  const handleEditorReady = useCallback((getValue: () => string) => {
    getEditorValue.current = getValue;
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-950">
      <div className="h-12 bg-gray-900 border-b border-gray-800 flex items-center px-4 gap-3 shrink-0">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 text-white font-bold text-sm hover:text-blue-400 transition-colors"
        >
          <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-white">
              <path
                d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3m13 0h-3a2 2 0 0 1-2-2v-3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          LiveCode
        </button>

        <span className="text-gray-600 text-xs">·</span>
        <span className="text-gray-500 text-xs font-mono">{roomId}</span>

        <div className="flex-1" />

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-gray-800 text-gray-300 text-xs rounded-md px-2.5 py-1.5 border border-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer"
        >
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>

        <PresenceAvatars />

        {language === "javascript" && (
          <button
            onClick={handleRun}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
              <path d="M8 5v14l11-7z" />
            </svg>
            Run
          </button>
        )}

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs px-3 py-1.5 rounded-md border border-gray-700 transition-colors"
        >
          {copied ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Share
            </>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        <CollaborativeEditor
          userName={userName}
          userColor={userColor}
          language={language}
          onEditorReady={handleEditorReady}
        />
      </div>

      {showOutput && (
        <OutputPanel lines={output} onClose={() => setShowOutput(false)} />
      )}
    </div>
  );
}

export default function RoomPage() {
  const params = useParams();
  const roomId = params.id as string;
  const [userName, setUserName] = useState("Anonymous");
  const [userColor, setUserColor] = useState("#60a5fa");

  useEffect(() => {
    const name = localStorage.getItem("livecode-name") || "Anonymous";
    setUserName(name);
    setUserColor(getColorForName(name));
  }, []);

  return (
    <LiveblocksProvider publicApiKey={process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!}>
      <RoomProvider id={roomId} initialPresence={{ name: userName, color: userColor }}>
        <RoomContent roomId={roomId} />
      </RoomProvider>
    </LiveblocksProvider>
  );
}
