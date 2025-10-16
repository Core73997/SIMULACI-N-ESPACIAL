// Sistema Solar 3D - Archivo Principal
class SpaceExplorer {
    constructor() {
        this.solarSystem = null;
        this.physicsComparison = null;
        this.isLoaded = false;
        this.audioEnabled = true;
        this.currentSection = 'simulator';
        
        this.init();
    }

    async init() {
        try {
            // Mostrar pantalla de carga
            this.showLoadingScreen();
            
            // Registrar Service Worker
            this.registerServiceWorker();
            
            // Inicializar componentes principales
            await this.initializeComponents();
            
            // Configurar eventos globales
            this.setupGlobalEventListeners();
            
            // Ocultar pantalla de carga
            this.hideLoadingScreen();
            
            // Inicializar navegación
            this.initializeNavigation();
            
            // Marcar como cargado
            this.isLoaded = true;
            
            console.log('Sistema Solar 3D iniciado correctamente');
            
        } catch (error) {
            console.error('Error al inicializar el sistema:', error);
            this.showError('Error al cargar la aplicación. Por favor, recarga la página.');
        }
    }

    async initializeComponents() {
        try {
            // Inicializar simulador del sistema solar
            this.solarSystem = new SolarSystem();
            
            // Inicializar comparador de física
            this.physicsComparison = new PhysicsComparison();
            
            // Inicializar efectos visuales si están disponibles
            if (window.visualEffects) {
                window.visualEffects.createHoverEffects();
                window.visualEffects.createLoadingAnimation();
            }
            
            // Pequeña pausa para permitir la carga
            await new Promise(resolve => setTimeout(resolve, 1500));
            
        } catch (error) {
            console.warn('Error inicializando componentes:', error);
            // Continuar aunque algunos componentes fallen
        }
    }

    setupGlobalEventListeners() {
        // Controles de audio
        const audioToggle = document.getElementById('audio-toggle');
        audioToggle.addEventListener('click', () => {
            this.audioEnabled = !this.audioEnabled;
            const icon = audioToggle.querySelector('i');
            icon.className = this.audioEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
            
            if (this.audioEnabled) {
                this.playAmbientSound();
            } else {
                this.stopAmbientSound();
            }
        });

        // Pantalla completa
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        fullscreenBtn.addEventListener('click', () => {
            this.toggleFullscreen();
        });

        // Eventos de teclado
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardInput(e);
        });

        // Eventos de scroll para navegación suave
        document.addEventListener('scroll', () => {
            this.handleScroll();
        });

        // Prevenir el menú contextual en el canvas
        document.getElementById('main-canvas').addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Eventos de redimensionamiento
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Eventos de visibilidad de la página
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
    }

    initializeNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remover clase activa de todos los enlaces
                navLinks.forEach(l => l.classList.remove('active'));
                
                // Añadir clase activa al enlace clickeado
                link.classList.add('active');
                
                // Obtener la sección objetivo
                const targetSection = link.getAttribute('href').substring(1);
                
                // Navegar a la sección
                this.navigateToSection(targetSection);
            });
        });

        // Navegación por scroll
        this.setupScrollNavigation();
    }

    navigateToSection(sectionName) {
        const section = document.getElementById(sectionName);
        if (section) {
            section.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
            
            this.currentSection = sectionName;
            this.updateActiveNavigation();
            
            // Actualizar componentes según la sección
            this.updateSectionContent(sectionName);
        }
    }

    updateSectionContent(sectionName) {
        switch (sectionName) {
            case 'simulator':
                if (this.solarSystem) {
                    this.solarSystem.onWindowResize();
                }
                break;
                
            case 'physics-comparison':
                if (this.physicsComparison) {
                    this.physicsComparison.createPhysicsVisualization();
                }
                break;
                
            case 'planet-info':
                this.loadPlanetInformation();
                break;
        }
    }

    setupScrollNavigation() {
        const sections = document.querySelectorAll('section[id]');
        const observerOptions = {
            threshold: 0.3,
            rootMargin: '-70px 0px -30% 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    this.currentSection = sectionId;
                    this.updateActiveNavigation();
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    updateActiveNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href').substring(1);
            
            if (href === this.currentSection) {
                link.classList.add('active');
            }
        });
    }

    handleKeyboardInput(event) {
        switch (event.code) {
            case 'Space':
                event.preventDefault();
                if (this.solarSystem) {
                    document.getElementById('play-pause').click();
                }
                break;
                
            case 'KeyR':
                if (this.solarSystem) {
                    this.solarSystem.resetCamera();
                }
                break;
                
            case 'KeyF':
                this.toggleFullscreen();
                break;
                
            case 'KeyM':
                document.getElementById('audio-toggle').click();
                break;
                
            case 'ArrowUp':
            case 'ArrowDown':
                event.preventDefault();
                this.adjustTimeSpeed(event.code === 'ArrowUp' ? 1 : -1);
                break;
                
            case 'Digit1':
            case 'Digit2':
            case 'Digit3':
            case 'Digit4':
            case 'Digit5':
            case 'Digit6':
            case 'Digit7':
            case 'Digit8':
            case 'Digit9':
                const planetIndex = parseInt(event.code.substring(5)) - 1;
                const planets = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
                if (planets[planetIndex]) {
                    this.selectPlanet(planets[planetIndex]);
                }
                break;
        }
    }

    adjustTimeSpeed(direction) {
        const slider = document.getElementById('time-speed');
        const currentValue = parseInt(slider.value);
        const newValue = Math.max(0, Math.min(100, currentValue + (direction * 5)));
        
        slider.value = newValue;
        slider.dispatchEvent(new Event('input'));
    }

    selectPlanet(planetName) {
        const planetCard = document.querySelector(`[data-planet="${planetName}"]`);
        if (planetCard) {
            planetCard.click();
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                const icon = document.querySelector('#fullscreen-btn i');
                icon.className = 'fas fa-compress';
            }).catch(err => {
                console.error('Error al entrar en pantalla completa:', err);
            });
        } else {
            document.exitFullscreen().then(() => {
                const icon = document.querySelector('#fullscreen-btn i');
                icon.className = 'fas fa-expand';
            });
        }
    }

    handleResize() {
        if (this.solarSystem) {
            this.solarSystem.onWindowResize();
        }
        
        if (this.physicsComparison) {
            // Actualizar el renderizador de física si existe
            const container = document.getElementById('physics-canvas');
            if (container && this.physicsComparison.renderer) {
                this.physicsComparison.renderer.setSize(
                    container.clientWidth, 
                    container.clientHeight
                );
            }
        }
    }

    handleScroll() {
        // Efectos de parallax y animaciones basadas en scroll
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        
        // Animar elementos con fade-in
        const fadeElements = document.querySelectorAll('.fade-in');
        fadeElements.forEach(element => {
            const elementTop = element.offsetTop;
            const elementHeight = element.offsetHeight;
            
            if (scrollY > elementTop - windowHeight + elementHeight / 3) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    }

    handleVisibilityChange() {
        if (document.hidden) {
            // Pausar animaciones cuando la pestaña no está visible
            if (this.solarSystem) {
                this.solarSystem.controls.isPlaying = false;
            }
        } else {
            // Reanudar animaciones cuando la pestaña se vuelve visible
            if (this.solarSystem && this.solarSystem.controls.isPlaying) {
                this.solarSystem.controls.isPlaying = true;
            }
        }
    }

    loadPlanetInformation() {
        // Cargar información detallada del planeta seleccionado
        const selectedPlanet = this.solarSystem ? this.solarSystem.controls.selectedPlanet : 'earth';
        
        // Actualizar contenido de información del planeta
        this.updatePlanetInfoContent(selectedPlanet);
    }

    updatePlanetInfoContent(planetName) {
        const planetData = {
            mercury: {
                title: 'Mercurio - El Mensajero Solar',
                description: 'Mercurio es el planeta más cercano al Sol y el más pequeño del sistema solar. Su superficie está cubierta de cráteres, similar a la Luna, y experimenta las variaciones de temperatura más extremas de todos los planetas.',
                facts: [
                    'Distancia del Sol: 57.9 millones de km',
                    'Período orbital: 88 días terrestres',
                    'Día: 59 días terrestres',
                    'Gravedad: 3.7 m/s²',
                    'Temperatura: -173°C a 427°C'
                ],
                exploration: 'La misión Messenger de la NASA fue la primera en orbitar Mercurio, proporcionando imágenes detalladas de su superficie y descubriendo hielo en los polos.'
            },
            venus: {
                title: 'Venus - El Planeta Gemelo',
                description: 'Venus es el planeta más caliente del sistema solar debido a su efecto invernadero extremo. Su densa atmósfera de dióxido de carbono atrapa el calor de manera efectiva.',
                facts: [
                    'Distancia del Sol: 108.2 millones de km',
                    'Período orbital: 225 días terrestres',
                    'Día: 243 días terrestres (retrogrado)',
                    'Gravedad: 8.87 m/s²',
                    'Temperatura superficial: 462°C'
                ],
                exploration: 'Las misiones soviéticas Venera fueron las primeras en aterrizar en Venus, sobreviviendo solo minutos en las condiciones extremas.'
            },
            earth: {
                title: 'Tierra - Nuestro Hogar Planetario',
                description: 'La Tierra es el único planeta conocido que alberga vida. Su atmósfera única, presencia de agua líquida y campo magnético protector la convierten en un oasis en el cosmos.',
                facts: [
                    'Distancia del Sol: 149.6 millones de km',
                    'Período orbital: 365.25 días',
                    'Día: 24 horas',
                    'Gravedad: 9.8 m/s²',
                    'Temperatura: -89°C a 58°C'
                ],
                exploration: 'La Tierra ha sido estudiada extensivamente desde el espacio, con satélites proporcionando datos cruciales sobre el clima, los océanos y la superficie terrestre.'
            },
            mars: {
                title: 'Marte - El Planeta Rojo',
                description: 'Marte ha sido objeto de fascinación humana durante siglos. Su color rojizo se debe al óxido de hierro en su superficie, y es el planeta más similar a la Tierra en muchos aspectos.',
                facts: [
                    'Distancia del Sol: 227.9 millones de km',
                    'Período orbital: 687 días terrestres',
                    'Día: 24.6 horas',
                    'Gravedad: 3.71 m/s²',
                    'Temperatura: -87°C a -5°C'
                ],
                exploration: 'Múltiples rovers como Perseverance y Curiosity están explorando activamente la superficie marciana, buscando signos de vida pasada o presente.'
            },
            jupiter: {
                title: 'Júpiter - El Gigante Gaseoso',
                description: 'Júpiter es el planeta más grande del sistema solar, con una masa mayor que todos los demás planetas combinados. Su Gran Mancha Roja es una tormenta gigante que ha durado siglos.',
                facts: [
                    'Distancia del Sol: 778.5 millones de km',
                    'Período orbital: 12 años terrestres',
                    'Día: 9.9 horas',
                    'Gravedad: 24.79 m/s²',
                    'Temperatura: -110°C'
                ],
                exploration: 'La misión Juno de la NASA está estudiando la atmósfera y el interior de Júpiter, mientras que Galileo descubrió muchas de sus lunas.'
            },
            saturn: {
                title: 'Saturno - El Señor de los Anillos',
                description: 'Saturno es famoso por sus espectaculares anillos, compuestos principalmente de partículas de hielo y roca. Es el segundo planeta más grande del sistema solar.',
                facts: [
                    'Distancia del Sol: 1.43 mil millones de km',
                    'Período orbital: 29 años terrestres',
                    'Día: 10.7 horas',
                    'Gravedad: 10.44 m/s²',
                    'Temperatura: -140°C'
                ],
                exploration: 'La misión Cassini-Huygens proporcionó información invaluable sobre Saturno y sus lunas, incluyendo la luna Titán con sus lagos de metano.'
            },
            uranus: {
                title: 'Urano - El Planeta Inclinado',
                description: 'Urano es único porque gira de lado, con un eje de rotación inclinado 98 grados. Esto causa estaciones extremas que duran 21 años terrestres cada una.',
                facts: [
                    'Distancia del Sol: 2.87 mil millones de km',
                    'Período orbital: 84 años terrestres',
                    'Día: 17.2 horas',
                    'Gravedad: 8.69 m/s²',
                    'Temperatura: -195°C'
                ],
                exploration: 'Voyager 2 es la única nave que ha visitado Urano, proporcionando las primeras imágenes detalladas del planeta y sus lunas.'
            },
            neptune: {
                title: 'Neptuno - El Viento del Mar',
                description: 'Neptuno tiene los vientos más rápidos del sistema solar, con velocidades de hasta 2,100 km/h. Es el planeta más lejano del Sol y el más denso de los gigantes gaseosos.',
                facts: [
                    'Distancia del Sol: 4.5 mil millones de km',
                    'Período orbital: 165 años terrestres',
                    'Día: 16.1 horas',
                    'Gravedad: 11.15 m/s²',
                    'Temperatura: -200°C'
                ],
                exploration: 'Voyager 2 también visitó Neptuno en 1989, descubriendo su Gran Mancha Oscura y estudiando su atmósfera dinámica.'
            }
        };

        const data = planetData[planetName] || planetData.earth;
        
        // Actualizar el contenido de la sección de información
        const contentArea = document.querySelector('#overview-content h3');
        if (contentArea) {
            contentArea.textContent = data.title;
        }
        
        // Actualizar descripción
        const descriptionArea = document.querySelector('.info-description');
        if (descriptionArea) {
            descriptionArea.innerHTML = `
                <p>${data.description}</p>
                <p><strong>Datos de exploración:</strong> ${data.exploration}</p>
            `;
        }
        
        // Actualizar estadísticas
        const statsContainer = document.querySelector('.info-stats');
        if (statsContainer) {
            statsContainer.innerHTML = data.facts.map(fact => {
                const [label, value] = fact.split(': ');
                return `
                    <div class="stat">
                        <span class="stat-label">${label}</span>
                        <span class="stat-value">${value}</span>
                    </div>
                `;
            }).join('');
        }
    }

    playAmbientSound() {
        // Aquí podrías implementar sonidos ambientales del espacio
        // Por ahora, solo un placeholder
        console.log('Sonido ambiental activado');
    }

    stopAmbientSound() {
        console.log('Sonido ambiental desactivado');
    }

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.style.display = 'flex';
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        
        // Animar salida
        loadingScreen.style.opacity = '0';
        loadingScreen.style.transition = 'opacity 0.5s ease-out';
        
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('Service Worker registrado:', registration);
                    
                    // Manejar actualizaciones
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                this.showUpdateNotification();
                            }
                        });
                    });
                })
                .catch((error) => {
                    console.log('Service Worker no registrado:', error);
                });
            
            // Manejar mensajes del Service Worker
            navigator.serviceWorker.addEventListener('message', (event) => {
                console.log('Mensaje del Service Worker:', event.data);
            });
        }
    }

    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="update-content">
                <i class="fas fa-rocket"></i>
                <span>¡Nueva versión disponible!</span>
                <button onclick="location.reload()" class="btn-update">Actualizar</button>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: var(--glass-bg);
            border: 1px solid var(--glass-border);
            border-radius: 8px;
            padding: 1rem;
            backdrop-filter: blur(20px);
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover después de 10 segundos
        setTimeout(() => {
            notification.remove();
        }, 10000);
    }

    showError(message) {
        // Crear modal de error
        const errorModal = document.createElement('div');
        errorModal.className = 'error-modal';
        errorModal.innerHTML = `
            <div class="error-content">
                <h3>Error</h3>
                <p>${message}</p>
                <button onclick="location.reload()" class="btn-primary">Recargar</button>
            </div>
        `;
        
        // Añadir estilos
        errorModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        document.body.appendChild(errorModal);
    }

    // Métodos de utilidad
    formatNumber(num, decimals = 2) {
        return parseFloat(num).toFixed(decimals);
    }

    lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    // Método para obtener estadísticas del sistema
    getSystemStats() {
        return {
            planetsLoaded: Object.keys(this.solarSystem?.planets || {}).length,
            audioEnabled: this.audioEnabled,
            currentSection: this.currentSection,
            isLoaded: this.isLoaded,
            selectedPlanet: this.solarSystem?.controls.selectedPlanet || 'earth',
            timeSpeed: this.solarSystem?.controls.timeSpeed || 1
        };
    }

    // Método para exportar configuración
    exportSettings() {
        const settings = {
            audioEnabled: this.audioEnabled,
            selectedPlanet: this.solarSystem?.controls.selectedPlanet,
            timeSpeed: this.solarSystem?.controls.timeSpeed,
            viewMode: this.solarSystem?.controls.viewMode,
            physicsObject: this.physicsComparison?.currentObject,
            physicsPlanet: this.physicsComparison?.currentPlanet
        };
        
        return JSON.stringify(settings, null, 2);
    }

    // Método para importar configuración
    importSettings(settingsJson) {
        try {
            const settings = JSON.parse(settingsJson);
            
            if (settings.audioEnabled !== undefined) {
                this.audioEnabled = settings.audioEnabled;
            }
            
            if (settings.selectedPlanet && this.solarSystem) {
                this.solarSystem.controls.selectedPlanet = settings.selectedPlanet;
            }
            
            if (settings.timeSpeed && this.solarSystem) {
                this.solarSystem.controls.timeSpeed = settings.timeSpeed;
            }
            
            console.log('Configuración importada correctamente');
        } catch (error) {
            console.error('Error al importar configuración:', error);
        }
    }

    // Método de limpieza
    dispose() {
        if (this.solarSystem) {
            this.solarSystem.dispose();
        }
        
        if (this.physicsComparison) {
            this.physicsComparison.resetPhysicsVisualization();
        }
        
        // Limpiar event listeners
        document.removeEventListener('keydown', this.handleKeyboardInput);
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        
        console.log('Sistema Solar 3D cerrado correctamente');
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.spaceExplorer = new SpaceExplorer();
});

// Manejar cierre de la página
window.addEventListener('beforeunload', () => {
    if (window.spaceExplorer) {
        window.spaceExplorer.dispose();
    }
});

// Manejar errores globales
window.addEventListener('error', (event) => {
    console.error('Error global:', event.error);
});

// Manejar rechazos de promesas no capturados
window.addEventListener('unhandledrejection', (event) => {
    console.error('Rechazo de promesa no manejado:', event.reason);
    event.preventDefault();
});

// Funciones de utilidad global
window.SpaceUtils = {
    formatDistance: (km) => {
        if (km >= 1000000) {
            return (km / 1000000).toFixed(1) + 'M km';
        } else if (km >= 1000) {
            return (km / 1000).toFixed(1) + 'K km';
        }
        return km + ' km';
    },
    
    formatTime: (hours) => {
        if (hours >= 24) {
            const days = Math.floor(hours / 24);
            const remainingHours = hours % 24;
            return `${days}d ${remainingHours}h`;
        }
        return hours + 'h';
    },
    
    formatTemperature: (celsius) => {
        const fahrenheit = (celsius * 9/5) + 32;
        return `${celsius}°C / ${fahrenheit}°F`;
    },
    
    getRandomColor: () => {
        const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
};