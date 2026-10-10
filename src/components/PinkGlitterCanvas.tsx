/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  shape: 'star' | 'heart' | 'diamond' | 'circle';
  rotation: number;
  rotationSpeed: number;
  tiltAngle: number;
  tiltSpeed: number;
  alpha: number;
  fadeRate: number;
  twinklePhase: number;
  twinkleSpeed: number;
  wobbleFreq: number;
  wobbleAmp: number;
}

const GLITTER_COLORS = [
  '#ff4081', // Vivid rose pink
  '#ff80ab', // Soft bubblegum pink
  '#f50057', // Deep magenta rose
  '#f48fb1', // Pastel petal pink
  '#f8bbd0', // Light baby pink
  '#e91e63', // Rich ruby pink
  '#ff6090', // Coral rose
  '#ffd54f', // Champagne gold shimmer
  '#ffe082', // Delicate gold
  '#ffffff', // Diamond pure glint
];

interface PinkGlitterCanvasProps {
  triggerCount: number;
}

export function PinkGlitterCanvas({ triggerCount }: PinkGlitterCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (triggerCount === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Spawn 110 pink glitter particles with a burst from upper center
    const originX = width / 2;
    const originY = Math.min(height * 0.3, 260);

    const newParticles: Particle[] = [];
    const particleCount = width < 640 ? 80 : 130;

    for (let i = 0; i < particleCount; i++) {
      // Radial angle with bias upwards and outwards
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 9;
      const shapeRand = Math.random();
      let shape: Particle['shape'] = 'circle';
      if (shapeRand < 0.35) shape = 'star';
      else if (shapeRand < 0.6) shape = 'diamond';
      else if (shapeRand < 0.75) shape = 'heart';

      newParticles.push({
        x: originX + (Math.random() - 0.5) * 40,
        y: originY + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (2 + Math.random() * 3), // Initial loft upwards
        size: shape === 'star' || shape === 'heart' ? 7 + Math.random() * 8 : 3.5 + Math.random() * 5,
        color: GLITTER_COLORS[Math.floor(Math.random() * GLITTER_COLORS.length)],
        shape,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.12,
        tiltAngle: Math.random() * Math.PI,
        tiltSpeed: 0.05 + Math.random() * 0.1,
        alpha: 0.95 + Math.random() * 0.05,
        fadeRate: 0.007 + Math.random() * 0.008,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.15 + Math.random() * 0.25,
        wobbleFreq: 0.03 + Math.random() * 0.05,
        wobbleAmp: 0.5 + Math.random() * 1.5,
      });
    }

    particlesRef.current = [...particlesRef.current, ...newParticles];

    // Ensure animation loop is running
    const render = () => {
      const cvs = canvasRef.current;
      if (!cvs) return;
      const ctx = cvs.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const displayWidth = window.innerWidth;
      const displayHeight = window.innerHeight;

      if (cvs.width !== displayWidth * dpr || cvs.height !== displayHeight * dpr) {
        cvs.width = displayWidth * dpr;
        cvs.height = displayHeight * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, displayWidth, displayHeight);

      const remainingParticles: Particle[] = [];

      for (const p of particlesRef.current) {
        // Update physics
        p.x += p.vx + Math.sin(p.wobbleFreq * p.y) * p.wobbleAmp;
        p.y += p.vy;
        p.vx *= 0.985;
        p.vy = p.vy * 0.985 + 0.11; // Gravity & air drag
        p.rotation += p.rotationSpeed;
        p.tiltAngle += p.tiltSpeed;
        p.twinklePhase += p.twinkleSpeed;
        p.alpha -= p.fadeRate;

        if (p.alpha > 0 && p.y < displayHeight + 50) {
          remainingParticles.push(p);

          // Render particle with 3D tilt and twinkle opacity
          const twinkleAlpha = Math.max(0, Math.min(1, p.alpha * (0.65 + 0.35 * Math.sin(p.twinklePhase))));
          const tiltScale = Math.cos(p.tiltAngle);

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.scale(tiltScale, 1);
          ctx.globalAlpha = twinkleAlpha;
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = p.size * 0.8;

          if (p.shape === 'star') {
            // 4-point pointed star (✦)
            drawSparkleStar(ctx, p.size);
          } else if (p.shape === 'heart') {
            // Little heart (♡)
            drawTinyHeart(ctx, p.size);
          } else if (p.shape === 'diamond') {
            // Rhombus diamond (◆)
            ctx.beginPath();
            ctx.moveTo(0, -p.size);
            ctx.lineTo(p.size * 0.7, 0);
            ctx.lineTo(0, p.size);
            ctx.lineTo(-p.size * 0.7, 0);
            ctx.closePath();
            ctx.fill();
          } else {
            // Glowing circular glitter speck
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 0.6, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        }
      }

      ctx.restore();
      particlesRef.current = remainingParticles;

      if (particlesRef.current.length > 0) {
        animFrameRef.current = requestAnimationFrame(render);
      } else {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };

    if (!animFrameRef.current) {
      animFrameRef.current = requestAnimationFrame(render);
    }
  }, [triggerCount]);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      aria-hidden="true"
    />
  );
}

function drawSparkleStar(ctx: CanvasRenderingContext2D, size: number) {
  ctx.beginPath();
  const inner = size * 0.22;
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    const nextAngle = angle + Math.PI / 4;
    if (i === 0) {
      ctx.moveTo(Math.cos(angle) * size, Math.sin(angle) * size);
    } else {
      ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size);
    }
    ctx.lineTo(Math.cos(nextAngle) * inner, Math.sin(nextAngle) * inner);
  }
  ctx.closePath();
  ctx.fill();
}

function drawTinyHeart(ctx: CanvasRenderingContext2D, size: number) {
  const s = size * 0.8;
  ctx.beginPath();
  ctx.moveTo(0, s * 0.3);
  ctx.bezierCurveTo(-s * 0.5, -s * 0.4, -s, 0, 0, s);
  ctx.bezierCurveTo(s, 0, s * 0.5, -s * 0.4, 0, s * 0.3);
  ctx.closePath();
  ctx.fill();
}
