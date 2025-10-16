// Efectos visuales adicionales para Sistema Solar 3D
class VisualEffects {
    constructor() {
        this.particleSystems = [];
        this.backgroundEffects = [];
        this.activeAnimations = [];
        
        this.init();
    }

    init() {
        this.createStarField();
        this.createNebulaEffect();
        this.setupScrollAnimations();
        this.createParticleSystem();
    }

    createStarField() {
        const canvas = document.createElement('canvas');
        canvas.id = 'starfield-canvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '-1';
        canvas.style.opacity = '0.8';
        
        document.body.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        let animationId;
        
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        
        const createStars = () => {
            const stars = [];
            const numStars = 200;
            
            for (let i = 0; i < numStars; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    radius: Math.random() * 2,
                    opacity: Math.random(),
                    twinkleSpeed: Math.random() * 0.02 + 0.005
                });
            }
            
            return stars;
        };
        
        let stars = createStars();
        
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            stars.forEach(star => {
                star.opacity += Math.sin(Date.now() * star.twinkleSpeed) * 0.01;
                star.opacity = Math.max(0.1, Math.min(1, star.opacity));
                
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
                ctx.fill();
                
                // Añadir brillo
                if (star.radius > 1) {
                    ctx.beginPath();
                    ctx.arc(star.x, star.y, star.radius * 2, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * 0.2})`;
                    ctx.fill();
                }
            });
            
            animationId = requestAnimationFrame(animate);
        };
        
        resizeCanvas();
        animate();
        
        window.addEventListener('resize', () => {
            resizeCanvas();
            stars = createStars();
        });
    }

    createNebulaEffect() {
        const nebula = document.createElement('div');
        nebula.className = 'nebula-effect';
        nebula.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
                        radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%);
            pointer-events: none;
            z-index: -2;
            animation: nebulaPulse 20s ease-in-out infinite;
        `;
        
        document.body.appendChild(nebula);
        
        // Añadir animación CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes nebulaPulse {
                0%, 100% { opacity: 0.8; transform: scale(1) rotate(0deg); }
                50% { opacity: 1; transform: scale(1.1) rotate(180deg); }
            }
        `;
        document.head.appendChild(style);
    }

    createParticleSystem() {
        // Sistema de partículas para efectos especiales
        this.particleCanvas = document.createElement('canvas');
        this.particleCanvas.id = 'particle-canvas';
        this.particleCanvas.style.position = 'fixed';
        this.particleCanvas.style.top = '0';
        this.particleCanvas.style.left = '0';
        this.particleCanvas.style.width = '100%';
        this.particleCanvas.style.height = '100%';
        this.particleCanvas.style.pointerEvents = 'none';
        this.particleCanvas.style.zIndex = '10';
        this.particleCanvas.style.opacity = '0.6';
        
        document.body.appendChild(this.particleCanvas);
        
        this.particleCtx = this.particleCanvas.getContext('2d');
        this.particles = [];
        
        this.resizeParticleCanvas();
        this.animateParticles();
        
        window.addEventListener('resize', () => {
            this.resizeParticleCanvas();
        });
    }

    resizeParticleCanvas() {
        this.particleCanvas.width = window.innerWidth;
        this.particleCanvas.height = window.innerHeight;
    }

    createParticle(x, y, type = 'default') {
        const particle = {
            x: x || Math.random() * this.particleCanvas.width,
            y: y || Math.random() * this.particleCanvas.height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 1.0,
            decay: Math.random() * 0.02 + 0.005,
            size: Math.random() * 3 + 1,
            color: this.getParticleColor(type),
            type: type
        };
        
        this.particles.push(particle);
        return particle;
    }

    getParticleColor(type) {
        const colors = {
            default: 'rgba(255, 255, 255, 0.8)',
            energy: 'rgba(102, 126, 234, 0.8)',
            plasma: 'rgba(245, 87, 108, 0.8)',
            cosmic: 'rgba(79, 172, 254, 0.8)'
        };
        return colors[type] || colors.default;
    }

    animateParticles() {
        this.particleCtx.clearRect(0, 0, this.particleCanvas.width, this.particleCanvas.height);
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Actualizar posición
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Actualizar vida
            particle.life -= particle.decay;
            
            // Remover partículas muertas
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            
            // Dibujar partícula
            this.particleCtx.save();
            this.particleCtx.globalAlpha = particle.life;
            this.particleCtx.fillStyle = particle.color;
            
            this.particleCtx.beginPath();
            this.particleCtx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.particleCtx.fill();
            
            // Añadir brillo
            this.particleCtx.shadowBlur = 10;
            this.particleCtx.shadowColor = particle.color;
            this.particleCtx.fill();
            
            this.particleCtx.restore();
        }
        
        requestAnimationFrame(() => this.animateParticles());
    }

    createExplosion(x, y, count = 20, type = 'energy') {
        for (let i = 0; i < count; i++) {
            const particle = this.createParticle(x, y, type);
            const angle = (Math.PI * 2 * i) / count;
            const speed = Math.random() * 5 + 2;
            
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            particle.size = Math.random() * 4 + 2;
            particle.decay = 0.02;
        }
    }

    createTrail(x, y, type = 'cosmic') {
        if (Math.random() < 0.3) {
            const particle = this.createParticle(x, y, type);
            particle.vx *= 0.5;
            particle.vy *= 0.5;
            particle.size = Math.random() * 2 + 0.5;
            particle.decay = 0.05;
        }
    }

    setupScrollAnimations() {
        // Animaciones de scroll con Anime.js
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                }
            });
        }, observerOptions);

        // Observar elementos con animación
        const animatedElements = document.querySelectorAll('.fade-in, .slide-in, .bounce-in');
        animatedElements.forEach(el => observer.observe(el));
    }

    animateElement(element) {
        if (element.classList.contains('fade-in')) {
            anime({
                targets: element,
                opacity: [0, 1],
                translateY: [30, 0],
                duration: 800,
                easing: 'easeOutCubic'
            });
        }
        
        if (element.classList.contains('slide-in')) {
            anime({
                targets: element,
                opacity: [0, 1],
                translateX: [-50, 0],
                duration: 600,
                easing: 'easeOutCubic'
            });
        }
        
        if (element.classList.contains('bounce-in')) {
            anime({
                targets: element,
                opacity: [0, 1],
                scale: [0.8, 1],
                duration: 600,
                easing: 'easeOutBounce'
            });
        }
    }

    createHoverEffects() {
        // Efectos hover para elementos interactivos
        const interactiveElements = document.querySelectorAll('.planet-card, .object-card, .btn-primary, .btn-secondary');
        
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                anime({
                    targets: e.target,
                    scale: 1.05,
                    translateY: -5,
                    duration: 200,
                    easing: 'easeOutCubic'
                });
                
                // Crear partículas en hover
                const rect = e.target.getBoundingClientRect();
                this.createExplosion(
                    rect.left + rect.width / 2,
                    rect.top + rect.height / 2,
                    5,
                    'energy'
                );
            });
            
            element.addEventListener('mouseleave', (e) => {
                anime({
                    targets: e.target,
                    scale: 1,
                    translateY: 0,
                    duration: 200,
                    easing: 'easeOutCubic'
                });
            });
        });
    }

    createLoadingAnimation() {
        const loadingText = document.querySelector('#loading-screen p');
        if (loadingText) {
            anime({
                targets: loadingText,
                opacity: [0.3, 1],
                duration: 1500,
                loop: true,
                direction: 'alternate',
                easing: 'easeInOutSine'
            });
        }
    }

    createTextAnimations() {
        // Animación de escritura para títulos
        const titles = document.querySelectorAll('h1, h2, h3');
        
        titles.forEach(title => {
            const text = title.textContent;
            title.textContent = '';
            
            const chars = text.split('');
            chars.forEach((char, index) => {
                const span = document.createElement('span');
                span.textContent = char === ' ' ? '\u00A0' : char;
                span.style.opacity = '0';
                title.appendChild(span);
                
                anime({
                    targets: span,
                    opacity: 1,
                    duration: 50,
                    delay: index * 30,
                    easing: 'easeOutCubic'
                });
            });
        });
    }

    createBackgroundShader() {
        // Crear efecto de shader de fondo con p5.js
        const sketch = (p) => {
            let time = 0;
            
            p.setup = () => {
                const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
                canvas.parent('background-shader');
                canvas.style('position', 'fixed');
                canvas.style('top', '0');
                canvas.style('left', '0');
                canvas.style('z-index', '-3');
                canvas.style('pointer-events', 'none');
            };
            
            p.draw = () => {
                p.clear();
                
                // Crear patrón de ondas sinusoidales
                for (let x = 0; x < p.width; x += 20) {
                    for (let y = 0; y < p.height; y += 20) {
                        const wave1 = p.sin(x * 0.01 + time) * 50;
                        const wave2 = p.cos(y * 0.01 + time * 0.5) * 30;
                        const intensity = (wave1 + wave2) / 100;
                        
                        const alpha = p.map(intensity, -1, 1, 0, 0.1);
                        
                        p.fill(102, 126, 234, alpha * 255);
                        p.noStroke();
                        p.circle(x, y, 10);
                    }
                }
                
                time += 0.01;
            };
            
            p.windowResized = () => {
                p.resizeCanvas(p.windowWidth, p.windowHeight);
            };
        };
        
        // Crear contenedor para el shader
        const shaderContainer = document.createElement('div');
        shaderContainer.id = 'background-shader';
        document.body.appendChild(shaderContainer);
        
        new p5(sketch);
    }

    // Métodos de utilidad
    fadeIn(element, duration = 500) {
        return anime({
            targets: element,
            opacity: [0, 1],
            duration: duration,
            easing: 'easeOutCubic'
        });
    }

    fadeOut(element, duration = 500) {
        return anime({
            targets: element,
            opacity: [1, 0],
            duration: duration,
            easing: 'easeOutCubic'
        });
    }

    slideIn(element, direction = 'left', duration = 600) {
        const translateProperty = direction === 'left' ? 'translateX' : 'translateY';
        const startValue = direction === 'left' ? -50 : -30;
        
        return anime({
            targets: element,
            opacity: [0, 1],
            [translateProperty]: [startValue, 0],
            duration: duration,
            easing: 'easeOutCubic'
        });
    }

    pulse(element, scale = 1.1, duration = 400) {
        return anime({
            targets: element,
            scale: [1, scale, 1],
            duration: duration,
            easing: 'easeOutCubic'
        });
    }

    shake(element, intensity = 10, duration = 500) {
        return anime({
            targets: element,
            translateX: [
                { value: intensity, duration: duration / 8 },
                { value: -intensity, duration: duration / 8 },
                { value: intensity / 2, duration: duration / 8 },
                { value: -intensity / 2, duration: duration / 8 },
                { value: 0, duration: duration / 2 }
            ],
            easing: 'easeOutCubic'
        });
    }

    // Limpiar efectos
    dispose() {
        // Cancelar todas las animaciones
        anime.remove('*');
        
        // Detener animaciones de partículas
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Remover elementos creados
        const elementsToRemove = [
            '#starfield-canvas',
            '#particle-canvas',
            '.nebula-effect',
            '#background-shader'
        ];
        
        elementsToRemove.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.remove();
            }
        });
        
        console.log('Efectos visuales limpiados');
    }
}

// Inicializar efectos visuales cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.visualEffects = new VisualEffects();
});