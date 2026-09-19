"use client";

import { useOthers, useSelf } from "@liveblocks/react";

export default function PresenceAvatars() {
  const self = useSelf();
  const others = useOthers();

  const users = [
    self
      ? { id: "self", name: self.presence.name, color: self.presence.color, isMe: true }
      : null,
    ...others.map((o) => ({
      id: String(o.connectionId),
      name: o.presence.name,
      color: o.presence.color,
      isMe: false,
    })),
  ].filter(Boolean) as { id: string; name: string; color: string; isMe: boolean }[];

  const visible = users.slice(0, 5);
  const overflow = users.length - visible.length;

  return (
    <div className="flex items-center -space-x-2" title={users.map((u) => u.name).join(", ")}>
      {visible.map((u) => (
        <div
          key={u.id}
          className="w-7 h-7 rounded-full border-2 border-gray-900 flex items-center justify-center text-xs font-bold text-gray-950 ring-0 transition-transform hover:scale-110 hover:z-10 relative"
          style={{ backgroundColor: u.color }}
          title={u.isMe ? `${u.name} (you)` : u.name}
        >
          {u.name[0]?.toUpperCase() ?? "?"}
        </div>
      ))}
      {overflow > 0 && (
        <div className="w-7 h-7 rounded-full border-2 border-gray-900 bg-gray-700 flex items-center justify-center text-xs text-gray-300 relative">
          +{overflow}
        </div>
      )}
    </div>
  );
}
