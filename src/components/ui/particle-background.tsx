
import { useEffect, useRef } from 'react';

export const ParticleBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        let animationFrameId: number;
        let particles: any[] = [];
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        class Particle {
            x: number; y: number; size: number; speedX: number; speedY: number; opacity: number; color: string;
            constructor() {
                this.x = Math.random() * canvas!.width; this.y = Math.random() * canvas!.height;
                this.size = Math.random() * 2;
                this.speedX = (Math.random() - 0.5) * 0.5; this.speedY = (Math.random() - 0.5) * 0.5;
                this.opacity = Math.random() * 0.5; this.color = Math.random() > 0.5 ? '212, 175, 55' : '16, 185, 129';
            }
            update() {
                this.x += this.speedX; this.y += this.speedY;
                if (this.x > canvas!.width) this.x = 0; if (this.x < 0) this.x = canvas!.width;
                if (this.y > canvas!.height) this.y = 0; if (this.y < 0) this.y = canvas!.height;
            }
            draw() {
                ctx!.fillStyle = `rgba(${this.color}, ${this.opacity})`;
                ctx!.beginPath(); ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx!.fill();
            }
        }
        const init = () => { particles = []; for (let i = 0; i < 70; i++) { particles.push(new Particle()); } };
        const animate = () => {
            ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
            const gradient = ctx!.createLinearGradient(0, 0, canvas!.width, canvas!.height);
            gradient.addColorStop(0, 'rgba(10, 10, 12, 0)'); gradient.addColorStop(1, 'rgba(20, 20, 25, 0.2)');
            ctx!.fillStyle = gradient; ctx!.fillRect(0, 0, canvas!.width, canvas!.height);
            particles.forEach(p => { p.update(); p.draw(); });
            animationFrameId = requestAnimationFrame(animate);
        };
        window.addEventListener('resize', resizeCanvas); resizeCanvas(); init(); animate();
        return () => { window.removeEventListener('resize', resizeCanvas); cancelAnimationFrame(animationFrameId); };
    }, []);
    return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-0" />;
};
