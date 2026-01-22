
import React, { useEffect, useRef } from 'react';

export const ExplosionFX = ({ active, x, y, type, onComplete }: any) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!active) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let particles: any[] = [];
        const particleCount = 60;
        const colors = type === 'debt'
            ? ['#ef4444', '#7f1d1d', '#111111', '#555555']
            : ['#d4af37', '#10b981', '#ffffff', '#fbf5b7'];

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: x, y: y,
                vx: (Math.random() - 0.5) * (type === 'debt' ? 15 : 10),
                vy: (Math.random() - 0.5) * (type === 'debt' ? 15 : 10) - (type === 'credit' ? 5 : 0),
                size: Math.random() * (type === 'debt' ? 6 : 8),
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 1.0, decay: Math.random() * 0.02 + 0.01
            });
        }

        let animationFrameId: number;
        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let activeParticles = 0;
            particles.forEach(p => {
                if (p.life > 0) {
                    activeParticles++;
                    p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.life -= p.decay;
                    ctx.globalAlpha = p.life; ctx.fillStyle = p.color;
                    if (type === 'debt') {
                        ctx.beginPath(); ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p.x + p.size, p.y + p.size * 0.5);
                        ctx.lineTo(p.x + p.size * 0.5, p.y + p.size);
                        ctx.fill();
                    } else {
                        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
                    }
                }
            });
            if (activeParticles > 0) { animationFrameId = requestAnimationFrame(render); }
            else { onComplete(); }
        };
        render();
        return () => cancelAnimationFrame(animationFrameId);
    }, [active, x, y, type, onComplete]);

    if (!active) return null;
    return <canvas ref={canvasRef} className="fixed inset-0 z-[100] pointer-events-none" />;
};
