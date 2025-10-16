class SolarSystem {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.planets = {};
        this.satellites = {};
        this.controls = {
            timeSpeed: 1,
            isPlaying: true,
            selectedPlanet: 'earth',
            viewMode: 'system'
        };
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.clock = new THREE.Clock();
        
        this.init();
    }

    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createLights();
        this.createStarField();
        this.createPlanets();
        this.createSatellites();
        this.createOrbits();
        this.setupEventListeners();
        this.animate();
    }

    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011);
    }

    createCamera() {
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 10000);
        this.camera.position.set(0, 50, 100);
        this.camera.lookAt(0, 0, 0);
    }

    createRenderer() {
        const canvas = document.getElementById('main-canvas');
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias: true,
            alpha: true 
        });
        
        const container = document.getElementById('solar-system-canvas');
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    createLights() {
        // Luz ambiental
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);

        // Luz del sol (punto de luz)
        const sunLight = new THREE.PointLight(0xffffff, 2, 1000);
        sunLight.position.set(0, 0, 0);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        this.scene.add(sunLight);
    }

    createStarField() {
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 10000;
        const positions = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 2000;
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 1,
            sizeAttenuation: false
        });

        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);
    }

    createPlanets() {
        const planetData = {
            sun: {
                radius: 8,
                distance: 0,
                speed: 0,
                color: 0xffd700,
                emissive: 0xffaa00,
                texture: 'sun'
            },
            mercury: {
                radius: 0.8,
                distance: 15,
                speed: 0.02,
                color: 0x8c7853,
                texture: 'rocky'
            },
            venus: {
                radius: 1.2,
                distance: 22,
                speed: 0.015,
                color: 0xffc649,
                texture: 'venus'
            },
            earth: {
                radius: 1.3,
                distance: 30,
                speed: 0.01,
                color: 0x6b93d6,
                texture: 'earth'
            },
            mars: {
                radius: 1.0,
                distance: 40,
                speed: 0.008,
                color: 0xcd5c5c,
                texture: 'mars'
            },
            jupiter: {
                radius: 4.5,
                distance: 60,
                speed: 0.005,
                color: 0xd8ca9d,
                texture: 'jupiter'
            },
            saturn: {
                radius: 3.8,
                distance: 80,
                speed: 0.003,
                color: 0xfab27b,
                texture: 'saturn'
            },
            uranus: {
                radius: 2.5,
                distance: 100,
                speed: 0.002,
                color: 0x4fd0e7,
                texture: 'uranus'
            },
            neptune: {
                radius: 2.4,
                distance: 120,
                speed: 0.001,
                color: 0x4169e1,
                texture: 'neptune'
            }
        };

        Object.keys(planetData).forEach(name => {
            const data = planetData[name];
            
            // Crear geometría y material
            const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
            let material;

            if (name === 'sun') {
                material = new THREE.MeshBasicMaterial({
                    color: data.color,
                    emissive: data.emissive,
                    emissiveIntensity: 0.3
                });
            } else {
                material = new THREE.MeshPhongMaterial({
                    color: data.color,
                    shininess: name === 'earth' ? 30 : 10
                });
            }

            const planet = new THREE.Mesh(geometry, material);
            planet.position.x = data.distance;
            planet.castShadow = name !== 'sun';
            planet.receiveShadow = name !== 'sun';
            planet.userData = { name, data };

            // Crear grupo para el planeta y sus órbitas
            const planetGroup = new THREE.Group();
            planetGroup.add(planet);
            
            this.scene.add(planetGroup);
            this.planets[name] = {
                mesh: planet,
                group: planetGroup,
                data: data,
                angle: Math.random() * Math.PI * 2
            };

            // Añadir anillos a Saturno
            if (name === 'saturn') {
                this.createSaturnRings(planet);
            }
        });
    }

    createSaturnRings(planet) {
        const ringGeometry = new THREE.RingGeometry(5, 8, 64);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xc4a484,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7
        });
        
        const rings = new THREE.Mesh(ringGeometry, ringMaterial);
        rings.rotation.x = Math.PI / 2;
        planet.add(rings);
    }

    createSatellites() {
        // Luna (Tierra)
        const moonGeometry = new THREE.SphereGeometry(0.35, 16, 16);
        const moonMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        
        const moonGroup = new THREE.Group();
        moonGroup.add(moon);
        this.planets.earth.mesh.add(moonGroup);
        
        moon.position.x = 3;
        moon.castShadow = true;
        moon.receiveShadow = true;
        
        this.satellites.moon = {
            mesh: moon,
            group: moonGroup,
            parent: 'earth',
            distance: 3,
            speed: 0.1,
            angle: 0
        };

        // Fobos (Marte)
        const phobosGeometry = new THREE.SphereGeometry(0.2, 12, 12);
        const phobosMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
        const phobos = new THREE.Mesh(phobosGeometry, phobosMaterial);
        
        const phobosGroup = new THREE.Group();
        phobosGroup.add(phobos);
        this.planets.mars.mesh.add(phobosGroup);
        
        phobos.position.x = 2.5;
        phobos.castShadow = true;
        phobos.receiveShadow = true;
        
        this.satellites.phobos = {
            mesh: phobos,
            group: phobosGroup,
            parent: 'mars',
            distance: 2.5,
            speed: 0.15,
            angle: 0
        };
    }

    createOrbits() {
        Object.keys(this.planets).forEach(name => {
            if (name === 'sun') return;
            
            const planet = this.planets[name];
            const orbitGeometry = new THREE.BufferGeometry();
            const orbitMaterial = new THREE.LineBasicMaterial({ 
                color: 0x444444,
                transparent: true,
                opacity: 0.3
            });
            
            const points = [];
            const segments = 128;
            for (let i = 0; i <= segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                points.push(new THREE.Vector3(
                    Math.cos(angle) * planet.data.distance,
                    0,
                    Math.sin(angle) * planet.data.distance
                ));
            }
            
            orbitGeometry.setFromPoints(points);
            const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
            this.scene.add(orbit);
        });
    }

    setupEventListeners() {
        // Controles de simulación
        const timeSpeedSlider = document.getElementById('time-speed');
        const speedValue = document.getElementById('speed-value');
        const playPauseBtn = document.getElementById('play-pause');
        const resetViewBtn = document.getElementById('reset-view');
        const viewModeSelect = document.getElementById('view-mode');

        timeSpeedSlider.addEventListener('input', (e) => {
            this.controls.timeSpeed = e.target.value / 50;
            speedValue.textContent = (this.controls.timeSpeed).toFixed(1) + 'x';
        });

        playPauseBtn.addEventListener('click', () => {
            this.controls.isPlaying = !this.controls.isPlaying;
            const icon = playPauseBtn.querySelector('i');
            if (this.controls.isPlaying) {
                icon.className = 'fas fa-pause';
                playPauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pausar';
            } else {
                icon.className = 'fas fa-play';
                playPauseBtn.innerHTML = '<i class="fas fa-play"></i> Reproducir';
            }
        });

        resetViewBtn.addEventListener('click', () => {
            this.resetCamera();
        });

        viewModeSelect.addEventListener('change', (e) => {
            this.controls.viewMode = e.target.value;
            this.updateCameraView();
        });

        // Selector de planetas
        document.querySelectorAll('.planet-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.planet-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                this.controls.selectedPlanet = card.dataset.planet;
                this.focusOnPlanet(this.controls.selectedPlanet);
            });
        });

        // Mouse events
        const canvas = this.renderer.domElement;
        canvas.addEventListener('click', (e) => this.onMouseClick(e));
        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = this.clock.getDelta() * this.controls.timeSpeed;
        
        if (this.controls.isPlaying) {
            this.updatePlanets(deltaTime);
            this.updateSatellites(deltaTime);
        }
        
        this.updateCamera();
        this.renderer.render(this.scene, this.camera);
    }

    updatePlanets(deltaTime) {
        Object.keys(this.planets).forEach(name => {
            const planet = this.planets[name];
            if (name === 'sun') {
                // Rotación del sol
                planet.mesh.rotation.y += 0.001 * deltaTime;
            } else {
                // Órbita alrededor del sol
                planet.angle += planet.data.speed * deltaTime;
                planet.group.position.x = Math.cos(planet.angle) * planet.data.distance;
                planet.group.position.z = Math.sin(planet.angle) * planet.data.distance;
                
                // Rotación del planeta
                planet.mesh.rotation.y += 0.01 * deltaTime;
            }
        });
    }

    updateSatellites(deltaTime) {
        Object.keys(this.satellites).forEach(name => {
            const satellite = this.satellites[name];
            satellite.angle += satellite.speed * deltaTime;
            
            satellite.group.position.x = Math.cos(satellite.angle) * satellite.distance;
            satellite.group.position.z = Math.sin(satellite.angle) * satellite.distance;
            
            satellite.mesh.rotation.y += 0.02 * deltaTime;
        });
    }

    updateCamera() {
        if (this.controls.viewMode === 'planet' && this.controls.selectedPlanet) {
            const planet = this.planets[this.controls.selectedPlanet];
            if (planet) {
                const targetPosition = new THREE.Vector3();
                planet.mesh.getWorldPosition(targetPosition);
                
                const cameraOffset = new THREE.Vector3(10, 5, 10);
                this.camera.position.lerp(targetPosition.clone().add(cameraOffset), 0.05);
                this.camera.lookAt(targetPosition);
            }
        }
    }

    focusOnPlanet(planetName) {
        const planet = this.planets[planetName];
        if (planet) {
            const targetPosition = new THREE.Vector3();
            planet.mesh.getWorldPosition(targetPosition);
            
            // Animar cámara hacia el planeta
            const startPosition = this.camera.position.clone();
            const endPosition = targetPosition.clone().add(new THREE.Vector3(15, 8, 15));
            
            this.animateCamera(startPosition, endPosition, targetPosition);
        }
    }

    animateCamera(startPos, endPos, lookAt) {
        const duration = 2000;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            this.camera.position.lerpVectors(startPos, endPos, easeProgress);
            this.camera.lookAt(lookAt);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    resetCamera() {
        this.camera.position.set(0, 50, 100);
        this.camera.lookAt(0, 0, 0);
        this.controls.viewMode = 'system';
        document.getElementById('view-mode').value = 'system';
    }

    updateCameraView() {
        if (this.controls.viewMode === 'system') {
            this.resetCamera();
        } else if (this.controls.viewMode === 'planet') {
            this.focusOnPlanet(this.controls.selectedPlanet);
        }
    }

    onMouseClick(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        const planetMeshes = Object.values(this.planets).map(p => p.mesh);
        const intersects = this.raycaster.intersectObjects(planetMeshes);
        
        if (intersects.length > 0) {
            const clickedPlanet = intersects[0].object;
            const planetName = clickedPlanet.userData.name;
            this.showPlanetInfo(planetName);
        }
    }

    onMouseMove(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        const planetMeshes = Object.values(this.planets).map(p => p.mesh);
        const intersects = this.raycaster.intersectObjects(planetMeshes);
        
        if (intersects.length > 0) {
            document.body.style.cursor = 'pointer';
        } else {
            document.body.style.cursor = 'default';
        }
    }

    showPlanetInfo(planetName) {
        // Actualizar selector de planetas
        document.querySelectorAll('.planet-card').forEach(card => {
            card.classList.toggle('active', card.dataset.planet === planetName);
        });
        
        this.controls.selectedPlanet = planetName;
        this.focusOnPlanet(planetName);
        
        // Mostrar información en el panel lateral
        this.updatePlanetInfoPanel(planetName);
    }

    updatePlanetInfoPanel(planetName) {
        const planetData = {
            mercury: {
                name: 'Mercurio',
                description: 'El planeta más cercano al Sol y el más pequeño del sistema solar.',
                gravity: 3.7,
                temperature: '427°C (día) / -173°C (noche)',
                dayLength: '59 días terrestres',
                yearLength: '88 días terrestres'
            },
            venus: {
                name: 'Venus',
                description: 'El planeta más caliente del sistema solar con una densa atmósfera de dióxido de carbono.',
                gravity: 8.87,
                temperature: '462°C',
                dayLength: '243 días terrestres',
                yearLength: '225 días terrestres'
            },
            earth: {
                name: 'Tierra',
                description: 'Nuestro hogar planetario, el único planeta conocido que alberga vida.',
                gravity: 9.8,
                temperature: '15°C (promedio)',
                dayLength: '24 horas',
                yearLength: '365.25 días'
            },
            mars: {
                name: 'Marte',
                description: 'El planeta rojo, objetivo principal de futuras misiones humanas.',
                gravity: 3.71,
                temperature: '-65°C (promedio)',
                dayLength: '24.6 horas',
                yearLength: '687 días terrestres'
            },
            jupiter: {
                name: 'Júpiter',
                description: 'El gigante gaseoso más grande del sistema solar con una gran tormenta persistente.',
                gravity: 24.79,
                temperature: '-110°C',
                dayLength: '9.9 horas',
                yearLength: '12 años terrestres'
            },
            saturn: {
                name: 'Saturno',
                description: 'Famoso por sus espectaculares anillos, compuestos principalmente de hielo.',
                gravity: 10.44,
                temperature: '-140°C',
                dayLength: '10.7 horas',
                yearLength: '29 años terrestres'
            },
            uranus: {
                name: 'Urano',
                description: 'El planeta inclinado que gira de lado, con una composición de hielo y gas.',
                gravity: 8.69,
                temperature: '-195°C',
                dayLength: '17.2 horas',
                yearLength: '84 años terrestres'
            },
            neptune: {
                name: 'Neptuno',
                description: 'El viento más rápido del sistema solar, con velocidades de hasta 2,100 km/h.',
                gravity: 11.15,
                temperature: '-200°C',
                dayLength: '16.1 horas',
                yearLength: '165 años terrestres'
            }
        };

        const data = planetData[planetName];
        if (data) {
            // Aquí podrías actualizar un panel de información en la interfaz
            console.log(`Información de ${data.name}:`, data);
        }
    }

    onWindowResize() {
        const container = document.getElementById('solar-system-canvas');
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    dispose() {
        this.renderer.dispose();
        Object.values(this.planets).forEach(planet => {
            planet.mesh.geometry.dispose();
            planet.mesh.material.dispose();
        });
    }
}