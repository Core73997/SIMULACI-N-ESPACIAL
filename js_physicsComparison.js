class PhysicsComparison {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.currentPlanet = 'earth';
        this.currentObject = 'astronaut';
        this.physicsData = {};
        this.animationId = null;
        
        this.init();
    }

    init() {
        this.createPhysicsData();
        this.setupEventListeners();
        this.updatePhysicsComparison();
    }

    createPhysicsData() {
        // Datos físicos de los planetas
        this.planetData = {
            mercury: {
                name: 'Mercurio',
                gravity: 3.7,
                escapeVelocity: 4.25,
                avgTemp: 167,
                atmosphere: 'Muy delgada',
                composition: 'Rocoso',
                dayLength: '59 días',
                yearLength: '88 días',
                moons: 0
            },
            venus: {
                name: 'Venus',
                gravity: 8.87,
                escapeVelocity: 10.36,
                avgTemp: 462,
                atmosphere: 'Dióxido de carbono denso',
                composition: 'Rocoso',
                dayLength: '243 días',
                yearLength: '225 días',
                moons: 0
            },
            earth: {
                name: 'Tierra',
                gravity: 9.8,
                escapeVelocity: 11.2,
                avgTemp: 15,
                atmosphere: 'Nitrógeno y oxígeno',
                composition: 'Rocoso',
                dayLength: '24 horas',
                yearLength: '365 días',
                moons: 1
            },
            mars: {
                name: 'Marte',
                gravity: 3.71,
                escapeVelocity: 5.03,
                avgTemp: -65,
                atmosphere: 'Dióxido de carbono delgado',
                composition: 'Rocoso',
                dayLength: '24.6 horas',
                yearLength: '687 días',
                moons: 2
            },
            jupiter: {
                name: 'Júpiter',
                gravity: 24.79,
                escapeVelocity: 59.5,
                avgTemp: -110,
                atmosphere: 'Hidrógeno y helio',
                composition: 'Gaseoso',
                dayLength: '9.9 horas',
                yearLength: '12 años',
                moons: 79
            },
            saturn: {
                name: 'Saturno',
                gravity: 10.44,
                escapeVelocity: 35.5,
                avgTemp: -140,
                atmosphere: 'Hidrógeno y helio',
                composition: 'Gaseoso',
                dayLength: '10.7 horas',
                yearLength: '29 años',
                moons: 82
            },
            uranus: {
                name: 'Urano',
                gravity: 8.69,
                escapeVelocity: 21.3,
                avgTemp: -195,
                atmosphere: 'Hidrógeno, helio, metano',
                composition: 'Gaseoso',
                dayLength: '17.2 horas',
                yearLength: '84 años',
                moons: 27
            },
            neptune: {
                name: 'Neptuno',
                gravity: 11.15,
                escapeVelocity: 23.5,
                avgTemp: -200,
                atmosphere: 'Hidrógeno, helio, metano',
                composition: 'Gaseoso',
                dayLength: '16.1 horas',
                yearLength: '165 años',
                moons: 14
            }
        };

        // Datos de los objetos
        this.objectData = {
            astronaut: {
                name: 'Astronauta',
                mass: 70,
                volume: 0.07,
                description: 'Ser humano en traje espacial',
                color: 0xffffff,
                model: 'humanoid'
            },
            rocket: {
                name: 'Cohete',
                mass: 50000,
                volume: 500,
                description: 'Cohete espacial para viajes interplanetarios',
                color: 0xcccccc,
                model: 'rocket'
            },
            rover: {
                name: 'Rover',
                mass: 1000,
                volume: 5,
                description: 'Vehículo de exploración planetaria',
                color: 0xff6600,
                model: 'rover'
            },
            satellite: {
                name: 'Satélite',
                mass: 500,
                volume: 10,
                description: 'Satélite de comunicaciones',
                color: 0x999999,
                model: 'satellite'
            },
            ball: {
                name: 'Pelota',
                mass: 0.5,
                volume: 0.005,
                description: 'Pelota de deporte estándar',
                color: 0xff0000,
                model: 'sphere'
            },
            car: {
                name: 'Auto',
                mass: 1500,
                volume: 15,
                description: 'Vehículo terrestre',
                color: 0x0066cc,
                model: 'car'
            }
        };
    }

    setupEventListeners() {
        // Selector de objetos
        document.querySelectorAll('.object-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.object-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                this.currentObject = card.dataset.object;
                this.updatePhysicsComparison();
            });
        });

        // Selector de planetas (del simulador)
        document.querySelectorAll('.planet-card').forEach(card => {
            card.addEventListener('click', () => {
                this.currentPlanet = card.dataset.planet;
                this.updatePhysicsComparison();
            });
        });
    }

    updatePhysicsComparison() {
        const planet = this.planetData[this.currentPlanet];
        const object = this.objectData[this.currentObject];
        
        if (!planet || !object) return;

        // Calcular física
        const weight = object.mass * planet.gravity / 9.8; // Peso relativo
        const jumpHeight = this.calculateJumpHeight(planet.gravity, object.mass);
        const fallSpeed = this.calculateFallSpeed(planet.gravity);
        
        // Actualizar UI
        this.updatePhysicsDisplay({
            gravity: planet.gravity,
            weight: weight.toFixed(1),
            temperature: planet.avgTemp,
            escapeVelocity: planet.escapeVelocity,
            jumpHeight: jumpHeight.toFixed(2),
            fallSpeed: fallSpeed.toFixed(1)
        });

        // Actualizar barras de comparación
        this.updateComparisonBars(planet);
    }

    updatePhysicsDisplay(data) {
        document.getElementById('gravity-value').textContent = data.gravity;
        document.getElementById('weight-value').textContent = data.weight;
        document.getElementById('temp-value').textContent = data.temperature;
        document.getElementById('escape-value').textContent = data.escapeVelocity;
    }

    updateComparisonBars(planet) {
        // Gravedad (0-25 m/s²)
        const gravityBar = document.getElementById('gravity-bar');
        gravityBar.style.width = `${(planet.gravity / 25) * 100}%`;
        
        // Peso relativo (0-5000 kg)
        const weightBar = document.getElementById('weight-bar');
        const object = this.objectData[this.currentObject];
        const relativeWeight = (object.mass * planet.gravity / 9.8);
        weightBar.style.width = `${Math.min((relativeWeight / 5000) * 100, 100)}%`;
        
        // Temperatura (-300°C a 500°C)
        const tempBar = document.getElementById('temp-bar');
        const normalizedTemp = ((planet.avgTemp + 300) / 800) * 100;
        tempBar.style.width = `${Math.max(0, Math.min(100, normalizedTemp))}%`;
        
        // Velocidad de escape (0-60 km/s)
        const escapeBar = document.getElementById('escape-bar');
        escapeBar.style.width = `${(planet.escapeVelocity / 60) * 100}%`;
    }

    calculateJumpHeight(gravity, mass) {
        // Altura de salto aproximada basada en gravedad
        const earthJumpHeight = 0.5; // 50cm en la Tierra
        return earthJumpHeight * (9.8 / gravity);
    }

    calculateFallSpeed(gravity) {
        // Velocidad terminal aproximada
        return Math.sqrt(2 * gravity * 10); // Desde 10 metros
    }

    showObjectBehavior() {
        const planet = this.planetData[this.currentPlanet];
        const object = this.objectData[this.currentObject];
        
        const behaviors = {
            astronaut: {
                earth: 'Caminar normalmente, saltar 50cm',
                moon: 'Saltar 3 metros, flotar lentamente',
                mars: 'Saltar 1.2 metros, caminar con menos esfuerzo',
                jupiter: 'No poder levantar los pies, peso extremo',
                venus: 'Caminar con dificultad, ambiente hostil',
                mercury: 'Saltar alto, pero superficie extrema'
            },
            rocket: {
                earth: 'Requiere 11.2 km/s para escapar',
                moon: 'Requiere 2.4 km/s para escapar',
                mars: 'Requiere 5.0 km/s para escapar',
                jupiter: 'Requiere 59.5 km/s para escapar',
                venus: 'Requiere 10.4 km/s para escapar',
                mercury: 'Requiere 4.3 km/s para escapar'
            },
            rover: {
                earth: 'Operación normal, tracción completa',
                moon: 'Mayor tracción, menor peso',
                mars: 'Similar a la Tierra, menos fricción',
                jupiter: 'Imposible, peso extremo y no hay superficie',
                venus: 'Difícil, superficie extremadamente caliente',
                mercury: 'Posible, pero temperaturas extremas'
            },
            ball: {
                earth: 'Rebote normal, caída en 1.4 segundos',
                moon: 'Rebote muy alto, caída lenta',
                mars: 'Rebote moderado, caída más lenta',
                jupiter: 'Caída rápida, poco o ningún rebote',
                venus: 'Caída similar a la Tierra, ambiente denso',
                mercury: 'Rebote alto, caída lenta'
            },
            car: {
                earth: 'Conducción normal, tracción completa',
                moon: 'Menor tracción, derrape fácil',
                mars: 'Tracción reducida, conducción cuidadosa',
                jupiter: 'Imposible, no hay superficie sólida',
                venus: 'Imposible, superficie extremadamente caliente',
                mercury: 'Difícil, temperaturas extremas'
            },
            satellite: {
                earth: 'Órbita estable a 7.8 km/s',
                moon: 'Órbita lunar a 1.6 km/s',
                mars: 'Órbita marciana a 3.6 km/s',
                jupiter: 'Órbita joviana a 42 km/s',
                venus: 'Órbita venusiana a 7.2 km/s',
                mercury: 'Órbita mercuriana a 3.0 km/s'
            }
        };
        
        return behaviors[this.currentObject]?.[this.currentPlanet] || 'Comportamiento desconocido';
    }

    createPhysicsVisualization() {
        // Crear canvas de visualización si no existe
        if (!this.renderer) {
            this.createPhysicsRenderer();
        }
        
        // Crear escena 3D para la simulación
        this.createPhysicsScene();
        this.animatePhysics();
    }

    createPhysicsRenderer() {
        const canvas = document.getElementById('physics-simulation');
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias: true,
            alpha: true 
        });
        
        const container = document.getElementById('physics-canvas');
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    createPhysicsScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011);
        
        // Cámara
        this.camera = new THREE.PerspectiveCamera(75, 
            this.renderer.domElement.width / this.renderer.domElement.height, 
            0.1, 1000);
        this.camera.position.set(0, 5, 10);
        
        // Luz
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        this.scene.add(directionalLight);
        
        // Crear objeto 3D
        this.createPhysicsObject();
        
        // Crear superficie planetaria
        this.createPlanetSurface();
    }

    createPhysicsObject() {
        const object = this.objectData[this.currentObject];
        const planet = this.planetData[this.currentPlanet];
        
        let geometry, material;
        
        switch (object.model) {
            case 'humanoid':
                geometry = new THREE.CapsuleGeometry(0.5, 1.5, 4, 8);
                break;
            case 'rocket':
                geometry = new THREE.ConeGeometry(0.5, 2, 8);
                break;
            case 'rover':
                geometry = new THREE.BoxGeometry(1, 0.5, 1.5);
                break;
            case 'satellite':
                geometry = new THREE.BoxGeometry(1, 0.3, 1);
                break;
            case 'sphere':
                geometry = new THREE.SphereGeometry(0.3, 16, 16);
                break;
            case 'car':
                geometry = new THREE.BoxGeometry(1.2, 0.6, 2);
                break;
            default:
                geometry = new THREE.SphereGeometry(0.5, 16, 16);
        }
        
        material = new THREE.MeshPhongMaterial({ 
            color: object.color,
            shininess: 30
        });
        
        this.physicsObject = new THREE.Mesh(geometry, material);
        this.physicsObject.position.set(-5, 3, 0);
        this.scene.add(this.physicsObject);
        
        // Añadir física de caída
        this.simulateFall();
    }

    createPlanetSurface() {
        const planet = this.planetData[this.currentPlanet];
        
        // Color según el planeta
        const surfaceColors = {
            mercury: 0x8c7853,
            venus: 0xffc649,
            earth: 0x6b93d6,
            mars: 0xcd5c5c,
            jupiter: 0xd8ca9d,
            saturn: 0xfab27b,
            uranus: 0x4fd0e7,
            neptune: 0x4169e1
        };
        
        const geometry = new THREE.PlaneGeometry(20, 20);
        const material = new THREE.MeshPhongMaterial({ 
            color: surfaceColors[this.currentPlanet] || 0x666666,
            side: THREE.DoubleSide
        });
        
        const surface = new THREE.Mesh(geometry, material);
        surface.rotation.x = -Math.PI / 2;
        surface.position.y = -2;
        surface.receiveShadow = true;
        this.scene.add(surface);
    }

    simulateFall() {
        const planet = this.planetData[this.currentPlanet];
        const gravity = planet.gravity;
        
        let velocity = 0;
        const startY = 3;
        let currentY = startY;
        
        const fallAnimation = () => {
            if (currentY > -1.5) {
                velocity += gravity * 0.01; // Aceleración
                currentY -= velocity * 0.01;
                this.physicsObject.position.y = currentY;
                
                // Rotación del objeto
                this.physicsObject.rotation.x += 0.02;
                this.physicsObject.rotation.z += 0.01;
                
                this.animationId = requestAnimationFrame(fallAnimation);
            } else {
                // Rebote
                velocity *= -0.3; // Coeficiente de restitución
                currentY = -1.4;
                
                if (Math.abs(velocity) > 0.1) {
                    this.animationId = requestAnimationFrame(fallAnimation);
                }
            }
        };
        
        fallAnimation();
    }

    animatePhysics() {
        if (!this.renderer || !this.scene || !this.camera) return;
        
        const animate = () => {
            if (this.animationId) {
                this.renderer.render(this.scene, this.camera);
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    resetPhysicsVisualization() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        if (this.physicsObject) {
            this.scene.remove(this.physicsObject);
            this.physicsObject.geometry.dispose();
            this.physicsObject.material.dispose();
        }
        
        // Limpiar la escena
        while (this.scene.children.length > 0) {
            const child = this.scene.children[0];
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
            this.scene.remove(child);
        }
    }

    // Método para obtener datos para gráficos
    getComparisonData() {
        const planet = this.planetData[this.currentPlanet];
        const object = this.objectData[this.currentObject];
        
        return {
            planet: planet.name,
            object: object.name,
            gravity: planet.gravity,
            weight: (object.mass * planet.gravity / 9.8).toFixed(1),
            temperature: planet.avgTemp,
            escapeVelocity: planet.escapeVelocity,
            jumpHeight: this.calculateJumpHeight(planet.gravity, object.mass),
            fallSpeed: this.calculateFallSpeed(planet.gravity),
            behavior: this.showObjectBehavior()
        };
    }

    // Método para cambiar planeta
    changePlanet(planetName) {
        this.currentPlanet = planetName;
        this.updatePhysicsComparison();
        this.resetPhysicsVisualization();
        this.createPhysicsVisualization();
    }

    // Método para cambiar objeto
    changeObject(objectName) {
        this.currentObject = objectName;
        this.updatePhysicsComparison();
        this.resetPhysicsVisualization();
        this.createPhysicsVisualization();
    }
}