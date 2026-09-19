"use client";

import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { useRoom, useUpdateMyPresence } from "@liveblocks/react";
import * as Y from "yjs";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { MonacoBinding } from "y-monaco";
import type { Awareness } from "y-protocols/awareness";
import type * as Monaco from "monaco-editor";

type Props = {
  userName: string;
  userColor: string;
  language: string;
  onEditorReady: (getValue: () => string) => void;
};

export default function CollaborativeEditor({
  userName,
  userColor,
  language,
  onEditorReady,
}: Props) {
  const room = useRoom();
  const updateMyPresence = useUpdateMyPresence();
  const [editor, setEditor] = useState<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);
  const providerRef = useRef<LiveblocksYjsProvider | null>(null);
  const docRef = useRef<Y.Doc | null>(null);

  useEffect(() => {
    updateMyPresence({ name: userName, color: userColor });
  }, [userName, userColor, updateMyPresence]);

  useEffect(() => {
    if (!editor) return;

    const yDoc = new Y.Doc();
    const yText = yDoc.getText("monaco");
    const provider = new LiveblocksYjsProvider(room, yDoc);

    provider.awareness.setLocalStateField("user", {
      name: userName,
      color: userColor,
    });

    const model = editor.getModel();
    if (!model) return;

    const binding = new MonacoBinding(
      yText,
      model,
      new Set([editor]),
      provider.awareness as unknown as Awareness
    );

    bindingRef.current = binding;
    providerRef.current = provider;
    docRef.current = yDoc;

    onEditorReady(() => editor.getValue());

    return () => {
      binding.destroy();
      provider.destroy();
      yDoc.destroy();
    };
  }, [room, editor]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Editor
      height="100%"
      language={language}
      theme="vs-dark"
      onMount={(editorInstance) => setEditor(editorInstance)}
      options={{
        fontSize: 14,
        lineHeight: 22,
        fontFamily: '"JetBrains Mono", "Fira Code", Menlo, Monaco, Consolas, monospace',
        fontLigatures: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        padding: { top: 20, bottom: 20 },
        cursorSmoothCaretAnimation: "on",
        smoothScrolling: true,
        wordWrap: "on",
        bracketPairColorization: { enabled: true },
        renderLineHighlight: "gutter",
        tabSize: 2,
        overviewRulerLanes: 0,
        scrollbar: {
          verticalScrollbarSize: 6,
          horizontalScrollbarSize: 6,
        },
      }}
    />
  );
}
