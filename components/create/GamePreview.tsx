'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { gameTemplate } from '@/lib/gameTemplate';

interface GamePreviewProps {
  code: string;
  building: boolean;
  // Called when the iframe reports a runtime error, so the host can offer a fix.
  onRuntimeError: (message: string) => void;
}

export default function GamePreview({ code, building, onRuntimeError }: GamePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [showOverlay, setShowOverlay] = useState(true);

  const srcDoc = useMemo(() => (code ? gameTemplate(code) : ''), [code]);

  // A fresh code string (or manual reload) re-mounts the iframe and re-shows the
  // "click to play" overlay.
  useEffect(() => {
    setShowOverlay(true);
  }, [code, reloadKey]);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e?.data?.type === 'seed-game-error' && typeof e.data.message === 'string') {
        onRuntimeError(e.data.message);
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [onRuntimeError]);

  // When the user clicks into the iframe it takes focus and the parent window
  // blurs — that's our signal that play has started, so drop the hint. We must
  // NOT intercept the click in the parent frame: pointer lock requires the user
  // gesture to originate *inside* the iframe.
  useEffect(() => {
    function onBlur() {
      if (document.activeElement === iframeRef.current) setShowOverlay(false);
    }
    window.addEventListener('blur', onBlur);
    return () => window.removeEventListener('blur', onBlur);
  }, []);

  return (
    <div className="relative w-full h-full bg-seed-carbon">
      {/* Toolbar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 h-10 bg-black/40 backdrop-blur-md border-b border-white/10 font-space text-[10px] tracking-[0.2em] text-seed-platinum">
        <span className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${building ? 'bg-yellow-400 animate-pulse' : 'bg-seed-green'}`}
          />
          {building ? 'BUILDING…' : 'PREVIEW: LIVE'}
        </span>
        <button
          onClick={() => setReloadKey((k) => k + 1)}
          className="hover:text-seed-green transition-colors tracking-[0.2em]"
        >
          ↻ RELOAD
        </button>
      </div>

      {/* The game iframe */}
      {code ? (
        <iframe
          key={reloadKey}
          ref={iframeRef}
          srcDoc={srcDoc}
          title="Game preview"
          sandbox="allow-scripts allow-pointer-lock allow-same-origin"
          allow="fullscreen; pointer-lock; gamepad"
          className="absolute inset-0 w-full h-full pt-10 bg-seed-carbon"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-seed-platinum">
          <div className="w-10 h-10 border-2 border-white/20 border-t-seed-green rounded-full animate-spin" />
          <span className="font-space text-xs tracking-[0.2em]">
            {building ? 'WRITING YOUR WORLD…' : 'WAITING FOR FIRST BUILD'}
          </span>
        </div>
      )}

      {/* Click-to-play hint. pointer-events-none so the click passes THROUGH to
          the iframe and counts as an in-iframe user gesture (required for
          pointer lock). It hides itself once the iframe takes focus. */}
      {code && showOverlay && (
        <div className="pointer-events-none absolute inset-0 top-10 z-10 flex flex-col items-center justify-center gap-3 bg-black/30 backdrop-blur-[2px]">
          <span className="font-space text-sm tracking-[0.3em] text-seed-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
            ▶ CLICK TO PLAY
          </span>
          <span className="font-space text-[10px] tracking-[0.2em] text-seed-platinum">
            WASD / MOUSE — CLICK INSIDE TO CAPTURE CONTROLS
          </span>
        </div>
      )}
    </div>
  );
}
