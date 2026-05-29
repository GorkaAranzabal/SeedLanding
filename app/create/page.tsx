'use client';

import { useState } from 'react';
import StylePhase from '@/components/create/StylePhase';
import BuilderLayout from '@/components/create/BuilderLayout';

type Phase =
  | { name: 'style' }
  | { name: 'build'; prompt: string; styleImageUrl: string };

export default function CreatePage() {
  const [phase, setPhase] = useState<Phase>({ name: 'style' });

  if (phase.name === 'style') {
    return (
      <StylePhase
        onConfirm={(prompt, styleImageUrl) => setPhase({ name: 'build', prompt, styleImageUrl })}
      />
    );
  }

  return <BuilderLayout prompt={phase.prompt} styleImageUrl={phase.styleImageUrl} />;
}
