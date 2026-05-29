'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StylePhaseProps {
  // Called when the user confirms a prompt + generated style image.
  onConfirm: (prompt: string, styleImageUrl: string) => void;
}

export default function StylePhase({ onConfirm }: StylePhaseProps) {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    const text = prompt.trim();
    if (!text || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, aspectRatio: '16:9' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Generation failed.');
      setImageUrl(data.imageUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black flex flex-col items-center justify-center px-4">
      {/* Ambient corner frames, matching the landing aesthetic */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 border-l-2 border-t-2 border-seed-silver/30 rounded-tl-3xl" />
        <div className="absolute top-10 right-10 w-32 h-32 border-r-2 border-t-2 border-seed-silver/30 rounded-tr-3xl" />
        <div className="absolute bottom-10 left-10 w-32 h-32 border-l-2 border-b-2 border-seed-silver/30 rounded-bl-3xl" />
        <div className="absolute bottom-10 right-10 w-32 h-32 border-r-2 border-b-2 border-seed-silver/30 rounded-br-3xl" />
      </div>

      <div className="absolute top-12 w-full flex justify-center pointer-events-none opacity-60 font-space text-xs text-seed-platinum tracking-[0.2em]">
        <span>SEED · CREATE A WORLD</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-2xl flex flex-col items-center gap-8"
      >
        <h1 className="text-center font-space font-bold text-3xl md:text-4xl tracking-[0.1em] text-seed-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
          DESCRIBE YOUR WORLD
        </h1>
        <p className="text-center text-seed-platinum font-rajdhani text-lg -mt-4">
          Tell Seed what you want to play. We&apos;ll preview the style, then build it live.
        </p>

        {/* Prompt composer */}
        <div className="relative group w-full">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)] transition-all duration-300 group-focus-within:border-seed-green/50 group-focus-within:shadow-[0_0_30px_rgba(68,204,68,0.15)]" />
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                generate();
              }
            }}
            placeholder="A neon cyberpunk rooftop parkour course at night, glowing edges, rainy skyline…"
            rows={3}
            className="relative z-10 w-full bg-transparent resize-none px-5 py-4 text-base text-seed-white placeholder:text-seed-platinum/60 focus:outline-none font-rajdhani"
          />
        </div>

        {error && (
          <p className="font-space text-xs tracking-[0.1em] text-red-400 text-center -mt-4">{error}</p>
        )}

        {/* Preview image */}
        <AnimatePresence>
          {(loading || imageUrl) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4 }}
              className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/20 bg-seed-carbon"
            >
              {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <div className="w-10 h-10 border-2 border-white/20 border-t-seed-green rounded-full animate-spin" />
                  <span className="font-space text-xs tracking-[0.2em] text-seed-platinum">
                    PAINTING THE STYLE…
                  </span>
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl!} alt="Style preview" className="w-full h-full object-cover" />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <GlassButton onClick={generate} disabled={loading || !prompt.trim()}>
            {imageUrl ? 'REGENERATE' : 'PREVIEW STYLE'}
          </GlassButton>
          {imageUrl && !loading && (
            <GlassButton accent onClick={() => onConfirm(prompt.trim(), imageUrl)}>
              BUILD THIS WORLD ▸
            </GlassButton>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function GlassButton({
  children,
  onClick,
  disabled,
  accent,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group relative px-10 py-4 overflow-hidden bg-transparent disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <div
        className={`absolute inset-0 backdrop-blur-xl border transition-all duration-300 ${
          accent
            ? 'bg-seed-green/15 border-seed-green/40 group-hover:bg-seed-green/25 group-hover:shadow-[0_0_30px_rgba(68,204,68,0.4)]'
            : 'bg-white/5 border-white/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] group-hover:bg-white/10 group-hover:shadow-[0_0_30px_rgba(68,204,68,0.3)]'
        }`}
      />
      <span className="relative z-10 font-space font-bold text-sm tracking-[0.2em] text-seed-white group-hover:text-seed-green transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] group-disabled:group-hover:text-seed-white">
        {children}
      </span>
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-seed-white/50 group-hover:border-seed-green transition-colors" />
      <div className="absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 border-seed-white/50 group-hover:border-seed-green transition-colors" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-l-2 border-b-2 border-seed-white/50 group-hover:border-seed-green transition-colors" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-seed-white/50 group-hover:border-seed-green transition-colors" />
    </button>
  );
}
