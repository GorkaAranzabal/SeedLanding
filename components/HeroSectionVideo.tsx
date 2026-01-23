'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { droneData } from '@/data/droneData';
import { useTacticalSound } from '@/hooks/use-tactical-sound';

export default function HeroSectionVideo() {
  const { playHover, playClick } = useTacticalSound();

  useEffect(() => {
    const audio = new Audio('/audio/SeedMusicLoop.wav');
    audio.loop = true;
    audio.volume = 0.5;

    const playAudio = () => {
      audio.play().then(() => {
        // Remove listeners once playing
        ['click', 'mousemove', 'keydown', 'touchstart', 'scroll', 'wheel'].forEach(event => 
          window.removeEventListener(event, playAudio)
        );
      }).catch((e) => {
        // Autoplay blocked, keep listeners active
      });
    };

    // Try to play immediately
    playAudio();

    // Add listeners for ANY user interaction to start audio ASAP
    ['click', 'mousemove', 'keydown', 'touchstart', 'scroll', 'wheel'].forEach(event => 
      window.addEventListener(event, playAudio)
    );

    return () => {
      audio.pause();
      audio.currentTime = 0;
      ['click', 'mousemove', 'keydown', 'touchstart', 'scroll', 'wheel'].forEach(event => 
        window.removeEventListener(event, playAudio)
      );
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover opacity-80"
      >
        <source src={droneData.hero.videoPath} type="video/mp4" />
      </video>

      {/* Overlay Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />

      {/* Tactical Grid / HUD Elements (Optional subtle decoration) */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 border-l-2 border-t-2 border-exec-silver/50" />
        <div className="absolute top-10 right-10 w-32 h-32 border-r-2 border-t-2 border-exec-silver/50" />
        <div className="absolute bottom-10 left-10 w-32 h-32 border-l-2 border-b-2 border-exec-silver/50" />
        <div className="absolute bottom-10 right-10 w-32 h-32 border-r-2 border-b-2 border-exec-silver/50" />
        
        {/* Center Crosshair */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[1px] bg-exec-platinum/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-[500px] bg-exec-platinum/10" />
      </div>

      {/* Top Header Label */}
      <div className="absolute top-12 w-full flex justify-center items-start pointer-events-none opacity-60 font-space text-xs text-exec-platinum tracking-[0.2em]">
        <span>A PROJECT BY GORKA GAMES</span>
      </div>

      {/* Center Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-12"
        >
          <div className="relative w-[350px] h-[112px] md:w-[1000px] md:h-[320px]">
            <Image
              src="/images/SeedLogo.png"
              alt="Seed Logo"
              fill
              className="object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
              priority
            />
          </div>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-8 items-center justify-center w-full">
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.3 }}
            onClick={() => {
              playClick();
              window.open('https://docs.google.com/forms/d/e/1FAIpQLSe4MZht1WCb2CnNvwSghrFRGK-sR2BE2i-8cYZ5o_0xwwM-3w/viewform?usp=dialog', '_blank');
            }}
            onMouseEnter={playHover}
            className="group relative px-12 py-6 overflow-hidden bg-transparent"
          >
            {/* Liquid Glass Background */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-xl border border-white/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] transition-all duration-300 group-hover:bg-white/10 group-hover:shadow-[0_0_30px_rgba(0,255,65,0.3)]" />
            
            {/* Moving Liquid Sheen */}
            <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-liquid-shimmer" />
            
            {/* Glass Reflection / Gloss */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50" />

            {/* Text Content */}
            <span className="relative z-10 font-space font-bold text-lg tracking-[0.2em] text-exec-white group-hover:text-exec-green transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              JOIN WAITLIST
            </span>

            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-exec-white/50 group-hover:border-exec-green transition-colors" />
            <div className="absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 border-exec-white/50 group-hover:border-exec-green transition-colors" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-l-2 border-b-2 border-exec-white/50 group-hover:border-exec-green transition-colors" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-exec-white/50 group-hover:border-exec-green transition-colors" />
          </motion.button>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            onClick={() => {
              playClick();
              window.open('https://discord.gg/7qfQTQu5yG', '_blank');
            }}
            onMouseEnter={playHover}
            className="group relative px-12 py-6 overflow-hidden bg-transparent"
          >
            {/* Liquid Glass Background */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-xl border border-white/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] transition-all duration-300 group-hover:bg-white/10 group-hover:shadow-[0_0_30px_rgba(0,255,65,0.3)]" />
            
            {/* Moving Liquid Sheen */}
            <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-liquid-shimmer" />
            
            {/* Glass Reflection / Gloss */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50" />

            {/* Text Content */}
            <span className="relative z-10 font-space font-bold text-lg tracking-[0.2em] text-exec-white group-hover:text-exec-green transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              JOIN COMMUNITY
            </span>

            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-exec-white/50 group-hover:border-exec-green transition-colors" />
            <div className="absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 border-exec-white/50 group-hover:border-exec-green transition-colors" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-l-2 border-b-2 border-exec-white/50 group-hover:border-exec-green transition-colors" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-exec-white/50 group-hover:border-exec-green transition-colors" />
          </motion.button>
        </div>
      </div>

      {/* HUD Footer Status (Decorative) */}
      <div className="absolute bottom-16 w-full px-20 flex justify-between items-end pointer-events-none opacity-60 font-space text-xs text-exec-platinum">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            SYSTEM: ONLINE
          </span>
          <span>LOC: 37.4419° N, 122.1430° W</span>
        </div>
        <div className="text-right">
             <span>SEED vUnreleased</span>
        </div>
      </div>
    </div>
  );
}
