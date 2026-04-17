import { memo } from "react";
import type { LocalScreenCredentials, PlaylistItemPayload } from "@/player/types";

interface PlaybackScreenProps {
  credentials: LocalScreenCredentials | null;
  items: PlaylistItemPayload[];
  currentItem: PlaylistItemPayload | null;
  currentMediaUrl: string | null;
  onVideoEnded: () => void;
  onMediaError: () => void;
}

export const PlaybackScreen = memo(function PlaybackScreen({
  credentials,
  items,
  currentItem,
  currentMediaUrl,
  onVideoEnded,
  onMediaError,
}: PlaybackScreenProps) {
  if (!currentItem || !currentMediaUrl) return null;

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden">
      <div className="absolute left-4 top-4 z-10 rounded-full bg-black/40 px-3 py-1 text-xs backdrop-blur-md">
        {credentials?.screenName ?? "Tela não identificada"}
      </div>

      {currentItem.media_type === "video" ? (
        <video
          key={currentItem.id}
          src={currentMediaUrl}
          className="h-full w-full object-contain bg-black"
          autoPlay
          muted
          playsInline
          onEnded={onVideoEnded}
          onError={onMediaError}
        />
      ) : currentItem.media_type === "html" ? (
        <iframe
          key={currentItem.id}
          src={currentMediaUrl}
          className="h-full w-full border-0 bg-white"
          onError={onMediaError}
          sandbox="allow-scripts allow-same-origin allow-popups"
          title="Conteúdo HTML"
        />
      ) : (
        <img
          key={currentItem.id}
          src={currentMediaUrl}
          alt=""
          className="h-full w-full object-cover"
          onError={onMediaError}
        />
      )}

      <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-5">
        <div className="mb-2 text-xs text-white/70">
          Item {Math.min(items.length, currentItem.position)} / {items.length}
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/20">
          <div
            key={currentItem.id}
            className="h-full bg-white animate-[playerProgress_linear_forwards]"
            style={{ animationDuration: `${Math.max(4, currentItem.duration_seconds)}s` }}
          />
        </div>
      </div>
    </div>
  );
});
