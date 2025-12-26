/**
 * TURBO RACING 3D
 * Jogo de corrida arcade em Three.js
 * Circuitos inspirados em pistas reais
 */

// ============================================
// VARIÁVEIS GLOBAIS
// ============================================

// Three.js
let scene, camera, renderer;
let clock = new THREE.Clock();

// Jogo
let gameState = 'menu'; // menu, trackSelect, countdown, racing, finished
let raceTime = 0;
let totalLaps = 3;
let totalRacers = 6;
let selectedTrack = 'monaco';

// Jogador
let playerCar;
let playerSpeed = 0;
let playerMaxSpeed = 200;
let playerAcceleration = 80;
let playerBrakeForce = 120;
let playerFriction = 30;
let playerTurnSpeed = 2.5;
let playerCurrentLap = 1;
let playerCheckpoint = 0;
let playerPosition = 1;

// Controles
const keys = {
    forward: false,
    backward: false,
    left: false,
    right: false
};

// Pista
let trackPath;
let trackWidth = 18;
let trackPoints = [];
let checkpoints = [];
let trackObjects = []; // Para limpar a pista ao trocar
let barriers = []; // Guard rails para colisão

// IA
let aiCars = [];
let aiCount = 5;

// Sistema de dano
let playerDamage = 0; // 0-100
let damageDisplay;

// Sistema de Pit Stop
let pitStopZone = null;
let isInPitStop = false;
let pitStopTimer = 0;
let pitStopDuration = 3; // 3 segundos
let canEnterPit = true;

// Elementos do DOM
let mainMenu, hud, countdown, finishScreen, trackSelectScreen;
let speedValue, positionValue, lapsValue, timerValue, trackNameDisplay;
let bgMusic;

// ============================================
// DEFINIÇÃO DOS CIRCUITOS
// ============================================

const TRACKS = {
    // Monaco - Circuito de rua, sentido horário, muitas curvas apertadas
    // Baseado na imagem: formato de "gancho" descendo à direita
    monaco: {
        name: 'Monaco',
        description: 'Curvas apertadas • Técnico',
        color: 0xe94560,
        groundColor: 0x2a5c3a,
        maxSpeed: 180,
        width: 14,
        points: [
            { x: 0, z: 0 },           // Linha de largada
            { x: 25, z: 5 },          // Sainte Devote
            { x: 50, z: 25 },         // Subida Beau Rivage
            { x: 55, z: 50 },
            { x: 45, z: 70 },         // Massenet
            { x: 25, z: 80 },         // Casino
            { x: 5, z: 85 },
            { x: -15, z: 75 },        // Mirabeau
            { x: -25, z: 55 },        // Hairpin Grand Hotel
            { x: -20, z: 35 },
            { x: -5, z: 20 },         // Portier
            { x: 15, z: 10 },         // Túnel
            { x: 35, z: -10 },
            { x: 55, z: -25 },        // Chicane
            { x: 60, z: -45 },
            { x: 45, z: -60 },        // Tabac
            { x: 20, z: -65 },
            { x: -5, z: -55 },        // Piscina
            { x: -25, z: -40 },
            { x: -35, z: -20 },       // La Rascasse
            { x: -25, z: -5 }         // Anthony Noghes
        ]
    },

    // Monza - Formato triangular com chicanes, sentido horário
    // Baseado na imagem: triângulo com retas longas
    monza: {
        name: 'Monza',
        description: 'Alta velocidade • Retas longas',
        color: 0x4ecdc4,
        groundColor: 0x3d8c40,
        maxSpeed: 250,
        width: 20,
        points: [
            { x: 0, z: 0 },           // Linha de largada
            { x: 40, z: -5 },         // Reta principal
            { x: 80, z: -15 },
            { x: 100, z: -30 },       // Variante del Rettifilo (chicane 1)
            { x: 105, z: -50 },
            { x: 95, z: -70 },
            { x: 110, z: -100 },      // Curva Grande
            { x: 130, z: -130 },
            { x: 140, z: -160 },      // Variante della Roggia (chicane 2)
            { x: 130, z: -180 },
            { x: 100, z: -190 },      // Lesmo 1
            { x: 70, z: -185 },       // Lesmo 2
            { x: 40, z: -170 },
            { x: 10, z: -150 },       // Serraglio
            { x: -20, z: -120 },
            { x: -40, z: -90 },       // Ascari
            { x: -50, z: -60 },
            { x: -45, z: -30 },       // Parabolica
            { x: -30, z: -10 },
            { x: -15, z: 0 }
        ]
    },

    // Interlagos - Formato de "A" inclinado, sentido anti-horário
    // Baseado na imagem: circuito compacto com "S" do Senna
    interlagos: {
        name: 'Interlagos',
        description: 'Circuito misto • Desafiador',
        color: 0xffd700,
        groundColor: 0x4a7c3a,
        maxSpeed: 210,
        width: 16,
        points: [
            { x: 0, z: 0 },           // Linha de largada
            { x: -30, z: 10 },        // Curva 1 (Senna S)
            { x: -50, z: 25 },
            { x: -65, z: 45 },        // Curva do Sol
            { x: -55, z: 70 },
            { x: -35, z: 90 },        // Reta Oposta
            { x: -10, z: 100 },
            { x: 25, z: 105 },
            { x: 55, z: 95 },         // Descida do Lago
            { x: 75, z: 75 },
            { x: 85, z: 50 },         // Ferradura
            { x: 80, z: 25 },
            { x: 65, z: 10 },         // Laranjinha
            { x: 45, z: -5 },
            { x: 30, z: -20 },        // Pinheirinho
            { x: 20, z: -35 },
            { x: 25, z: -50 },        // Bico de Pato
            { x: 40, z: -55 },
            { x: 55, z: -45 },        // Mergulho
            { x: 60, z: -25 },
            { x: 50, z: -10 },        // Junção
            { x: 30, z: -5 }
        ]
    },

    // Spa-Francorchamps - Circuito longo com Eau Rouge
    // Baseado na imagem: formato irregular com muitas curvas
    spa: {
        name: 'Spa-Francorchamps',
        description: 'Eau Rouge • Lendário',
        color: 0xff6600,
        groundColor: 0x2d6b2d,
        maxSpeed: 260,
        width: 18,
        points: [
            { x: 0, z: 0 },           // La Source (hairpin)
            { x: 20, z: -20 },        // Descida para Eau Rouge
            { x: 35, z: -50 },        // Eau Rouge (vale)
            { x: 50, z: -80 },        // Raidillon (subida íngreme)
            { x: 80, z: -110 },       // Kemmel Straight
            { x: 120, z: -130 },
            { x: 150, z: -135 },      // Les Combes
            { x: 170, z: -120 },
            { x: 175, z: -95 },       // Malmedy
            { x: 165, z: -70 },
            { x: 145, z: -50 },       // Rivage
            { x: 120, z: -40 },
            { x: 95, z: -25 },        // Pouhon (dupla esquerda)
            { x: 70, z: -5 },
            { x: 50, z: 20 },         // Fagnes
            { x: 35, z: 50 },
            { x: 30, z: 80 },         // Stavelot
            { x: 40, z: 105 },
            { x: 60, z: 120 },        // Paul Frère
            { x: 85, z: 125 },
            { x: 105, z: 115 },       // Blanchimont (alta velocidade)
            { x: 115, z: 95 },
            { x: 110, z: 70 },
            { x: 90, z: 50 },         // Bus Stop chicane
            { x: 65, z: 40 },
            { x: 40, z: 30 },
            { x: 20, z: 15 }          // Volta para La Source
        ]
    }
};

// ============================================
// INICIALIZAÇÃO
// ============================================

function init() {
    // Referências DOM
    mainMenu = document.getElementById('mainMenu');
    trackSelectScreen = document.getElementById('trackSelect');
    hud = document.getElementById('hud');
    countdown = document.getElementById('countdown');
    finishScreen = document.getElementById('finishScreen');
    speedValue = document.querySelector('#speedometer .value');
    positionValue = document.querySelector('#position .current');
    lapsValue = document.querySelector('#laps .value');
    timerValue = document.querySelector('#timer .time');
    trackNameDisplay = document.getElementById('currentTrackName');
    bgMusic = document.getElementById('bgMusic');

    // Cena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 100, 600);

    // Câmera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 20);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    // Luzes
    createLights();

    // Céu (comum a todas as pistas)
    createSky();

    // Eventos
    setupEvents();

    // Loop
    animate();
}

function createLights() {
    // Luz ambiente
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    // Luz direcional (sol)
    const sun = new THREE.DirectionalLight(0xffffff, 0.8);
    sun.position.set(50, 100, 50);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 500;
    sun.shadow.camera.left = -150;
    sun.shadow.camera.right = 150;
    sun.shadow.camera.top = 150;
    sun.shadow.camera.bottom = -150;
    scene.add(sun);

    // Luz hemisférica
    const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x3d5c5c, 0.4);
    scene.add(hemiLight);
}

// ============================================
// CRIAÇÃO DA PISTA
// ============================================

function createTrack(trackId) {
    // Limpar pista anterior
    clearTrack();

    const track = TRACKS[trackId];
    trackWidth = track.width;
    playerMaxSpeed = track.maxSpeed;

    // Converter pontos para Vector3
    const points = track.points.map(p => new THREE.Vector3(p.x, 0, p.z));

    // Criar curva fechada
    trackPath = new THREE.CatmullRomCurve3(points, true);
    trackPoints = trackPath.getPoints(200);

    // Criar checkpoints
    checkpoints = [];
    for (let i = 0; i < 10; i++) {
        const t = i / 10;
        const point = trackPath.getPointAt(t);
        checkpoints.push({ position: point, index: i });
    }

    // Chão (grama)
    const groundGeo = new THREE.PlaneGeometry(500, 500);
    const groundMat = new THREE.MeshLambertMaterial({ color: track.groundColor });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    scene.add(ground);
    trackObjects.push(ground);

    // Criar geometria da pista
    createTrackMesh(track.color);

    // Linha de chegada
    createFinishLine();

    // Bordas da pista
    createTrackBorders(track.color);

    // Arquibancadas
    createStands(track);

    // Decorações específicas
    createTrackDecorations(trackId);
}

function clearTrack() {
    // Remover objetos da pista anterior
    trackObjects.forEach(obj => {
        scene.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
            if (Array.isArray(obj.material)) {
                obj.material.forEach(m => m.dispose());
            } else {
                obj.material.dispose();
            }
        }
    });
    trackObjects = [];
    barriers = [];
    playerDamage = 0;

    // Remover carros IA
    aiCars.forEach(car => scene.remove(car));
    aiCars = [];

    // Remover carro do jogador
    if (playerCar) {
        scene.remove(playerCar);
    }
}

function createTrackMesh(accentColor) {
    // Pista usando pontos do caminho
    const segments = 150;
    const innerPoints = [];
    const outerPoints = [];

    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const point = trackPath.getPointAt(t);
        const tangent = trackPath.getTangentAt(t);
        const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

        innerPoints.push(point.clone().add(normal.clone().multiplyScalar(-trackWidth / 2)));
        outerPoints.push(point.clone().add(normal.clone().multiplyScalar(trackWidth / 2)));
    }

    // Criar mesh da pista
    const trackGeo = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];

    for (let i = 0; i <= segments; i++) {
        vertices.push(innerPoints[i].x, 0.01, innerPoints[i].z);
        vertices.push(outerPoints[i].x, 0.01, outerPoints[i].z);
    }

    for (let i = 0; i < segments; i++) {
        const a = i * 2;
        const b = i * 2 + 1;
        const c = (i + 1) * 2;
        const d = (i + 1) * 2 + 1;
        indices.push(a, c, b);
        indices.push(b, c, d);
    }

    trackGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    trackGeo.setIndex(indices);
    trackGeo.computeVertexNormals();

    const trackMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const trackMesh = new THREE.Mesh(trackGeo, trackMat);
    trackMesh.receiveShadow = true;
    scene.add(trackMesh);
    trackObjects.push(trackMesh);

    // Linha central tracejada
    for (let i = 0; i < 100; i += 2) {
        const t1 = i / 100;
        const t2 = (i + 1) / 100;
        const p1 = trackPath.getPointAt(t1);
        const p2 = trackPath.getPointAt(t2);

        const lineGeo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
        const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
        const line = new THREE.Line(lineGeo, lineMat);
        line.position.y = 0.02;
        scene.add(line);
        trackObjects.push(line);
    }

    // Zebras nas curvas (estilo F1)
    createCurbStripes(innerPoints, outerPoints, accentColor);
}

function createCurbStripes(innerPoints, outerPoints, color) {
    // Zebras estilo F1 nas duas bordas
    const stripeColors = [color, 0xffffff];

    for (let i = 0; i < innerPoints.length - 2; i += 2) {
        const colorIndex = Math.floor(i / 2) % 2;
        const stripeMat = new THREE.MeshBasicMaterial({ color: stripeColors[colorIndex] });

        // Borda interna (lado esquerdo)
        const innerStrip = createCurbSegment(
            innerPoints[i], innerPoints[Math.min(i + 2, innerPoints.length - 1)],
            outerPoints[i], outerPoints[Math.min(i + 2, innerPoints.length - 1)],
            -1, stripeMat
        );
        scene.add(innerStrip);
        trackObjects.push(innerStrip);

        // Borda externa (lado direito)
        const outerStrip = createCurbSegment(
            innerPoints[i], innerPoints[Math.min(i + 2, innerPoints.length - 1)],
            outerPoints[i], outerPoints[Math.min(i + 2, innerPoints.length - 1)],
            1, stripeMat
        );
        scene.add(outerStrip);
        trackObjects.push(outerStrip);
    }
}

function createCurbSegment(inner1, inner2, outer1, outer2, side, material) {
    const curbWidth = 1.2;
    const geometry = new THREE.BufferGeometry();

    // Calcular posições das zebras
    const dir1 = new THREE.Vector3().subVectors(outer1, inner1).normalize();
    const dir2 = new THREE.Vector3().subVectors(outer2, inner2).normalize();

    let p1, p2, p3, p4;
    if (side === -1) {
        // Lado interno
        p1 = inner1.clone();
        p2 = inner1.clone().add(dir1.clone().multiplyScalar(curbWidth));
        p3 = inner2.clone();
        p4 = inner2.clone().add(dir2.clone().multiplyScalar(curbWidth));
    } else {
        // Lado externo
        p1 = outer1.clone().sub(dir1.clone().multiplyScalar(curbWidth));
        p2 = outer1.clone();
        p3 = outer2.clone().sub(dir2.clone().multiplyScalar(curbWidth));
        p4 = outer2.clone();
    }

    const vertices = new Float32Array([
        p1.x, 0.02, p1.z,
        p2.x, 0.02, p2.z,
        p3.x, 0.02, p3.z,
        p3.x, 0.02, p3.z,
        p2.x, 0.02, p2.z,
        p4.x, 0.02, p4.z
    ]);

    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();

    return new THREE.Mesh(geometry, material);
}

function createFinishLine() {
    const finishGeo = new THREE.PlaneGeometry(trackWidth, 4);
    const finishMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide
    });
    const finish = new THREE.Mesh(finishGeo, finishMat);
    finish.rotation.x = -Math.PI / 2;
    finish.position.set(0, 0.02, 0);
    scene.add(finish);
    trackObjects.push(finish);

    // Padrão xadrez
    const checkerSize = trackWidth / 10;
    const checkerGeo = new THREE.PlaneGeometry(checkerSize, 0.8);
    const blackMat = new THREE.MeshBasicMaterial({ color: 0x000000 });

    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 5; j++) {
            if ((i + j) % 2 === 0) {
                const checker = new THREE.Mesh(checkerGeo, blackMat);
                checker.rotation.x = -Math.PI / 2;
                checker.position.set(-trackWidth / 2 + (i + 0.5) * checkerSize, 0.025, -1.6 + j * 0.8);
                scene.add(checker);
                trackObjects.push(checker);
            }
        }
    }

    // Arco de chegada
    const archGeo = new THREE.BoxGeometry(trackWidth + 4, 2, 1);
    const archMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const arch = new THREE.Mesh(archGeo, archMat);
    arch.position.set(0, 10, 0);
    scene.add(arch);
    trackObjects.push(arch);

    // Pilares do arco
    const pillarGeo = new THREE.BoxGeometry(2, 10, 2);
    const pillar1 = new THREE.Mesh(pillarGeo, archMat);
    pillar1.position.set(-trackWidth / 2 - 1, 5, 0);
    scene.add(pillar1);
    trackObjects.push(pillar1);

    const pillar2 = new THREE.Mesh(pillarGeo, archMat);
    pillar2.position.set(trackWidth / 2 + 1, 5, 0);
    scene.add(pillar2);
    trackObjects.push(pillar2);
}

function createTrackBorders(accentColor) {
    const segments = 150;

    // Criar guard rails contínuos em ambos os lados
    for (let side = -1; side <= 1; side += 2) {
        const railPoints = [];

        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const point = trackPath.getPointAt(t);
            const tangent = trackPath.getTangentAt(t);
            const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
            railPoints.push(point.clone().add(normal.clone().multiplyScalar(side * (trackWidth / 2 + 2))));
        }

        // Guard rail contínuo (metal)
        const railCurve = new THREE.CatmullRomCurve3(railPoints, true);

        // Barra superior
        const topRailGeo = new THREE.TubeGeometry(railCurve, segments, 0.08, 6, true);
        const railMat = new THREE.MeshLambertMaterial({ color: 0xaaaaaa });
        const topRail = new THREE.Mesh(topRailGeo, railMat);
        topRail.position.y = 0.8;
        scene.add(topRail);
        trackObjects.push(topRail);

        // Barra do meio
        const midRail = new THREE.Mesh(topRailGeo.clone(), railMat);
        midRail.position.y = 0.5;
        scene.add(midRail);
        trackObjects.push(midRail);

        // Barra inferior
        const bottomRail = new THREE.Mesh(topRailGeo.clone(), railMat);
        bottomRail.position.y = 0.25;
        scene.add(bottomRail);
        trackObjects.push(bottomRail);

        // Postes verticais a cada intervalo
        for (let i = 0; i < segments; i += 5) {
            const t = i / segments;
            const point = trackPath.getPointAt(t);
            const tangent = trackPath.getTangentAt(t);
            const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

            const postPos = point.clone().add(normal.clone().multiplyScalar(side * (trackWidth / 2 + 2)));

            const postGeo = new THREE.BoxGeometry(0.1, 1, 0.1);
            const postMat = new THREE.MeshLambertMaterial({ color: 0x666666 });
            const post = new THREE.Mesh(postGeo, postMat);
            post.position.copy(postPos);
            post.position.y = 0.5;
            scene.add(post);
            trackObjects.push(post);
        }
    }

    // Criar áreas de escape (cascalho) em curvas acentuadas
    createEscapeAreas();

    // Barreiras TecPro nas curvas
    createSafetyBarriers();
}

function createEscapeAreas() {
    // Áreas de escape em pontos de frenagem
    const escapePositions = [0.2, 0.45, 0.7, 0.9];

    escapePositions.forEach(t => {
        const point = trackPath.getPointAt(t);
        const tangent = trackPath.getTangentAt(t);
        const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

        // Área de escape externa (cascalho/brita)
        const escapeGeo = new THREE.PlaneGeometry(15, 12);
        const escapeMat = new THREE.MeshLambertMaterial({ color: 0xc4a574 }); // Cor de cascalho
        const escape = new THREE.Mesh(escapeGeo, escapeMat);

        const escapePos = point.clone().add(normal.clone().multiplyScalar(trackWidth / 2 + 10));
        escape.position.copy(escapePos);
        escape.position.y = 0.005;
        escape.rotation.x = -Math.PI / 2;
        escape.rotation.z = Math.atan2(tangent.x, tangent.z);

        scene.add(escape);
        trackObjects.push(escape);
    });
}

function createSafetyBarriers() {
    // Barreiras TecPro azuis nas curvas perigosas
    const barrierPositions = [0.15, 0.35, 0.55, 0.75, 0.9];

    barrierPositions.forEach(t => {
        const point = trackPath.getPointAt(t);
        const tangent = trackPath.getTangentAt(t);
        const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

        // TecPro barrier (múltiplos blocos)
        for (let b = 0; b < 4; b++) {
            const barrierGeo = new THREE.BoxGeometry(2.5, 1.2, 1.5);
            const barrierMat = new THREE.MeshLambertMaterial({ color: 0x0055aa });

            const barrier = new THREE.Mesh(barrierGeo, barrierMat);
            const offset = (b - 1.5) * 2.5;
            const barrierPos = point.clone()
                .add(normal.clone().multiplyScalar(trackWidth / 2 + 5))
                .add(tangent.clone().multiplyScalar(offset));

            barrier.position.copy(barrierPos);
            barrier.position.y = 0.6;
            barrier.rotation.y = Math.atan2(tangent.x, tangent.z);
            scene.add(barrier);
            trackObjects.push(barrier);
            barriers.push(barrier);
        }
    });
}

function createTrackDecorations(trackId) {
    const track = TRACKS[trackId];

    // Bandeiras ao redor da pista
    for (let i = 0; i < 8; i++) {
        const t = i / 8;
        const point = trackPath.getPointAt(t);
        const tangent = trackPath.getTangentAt(t);
        const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

        // Posicionar bandeira fora da pista
        const flagPos = point.clone().add(normal.clone().multiplyScalar(trackWidth / 2 + 15));

        const poleGeo = new THREE.CylinderGeometry(0.15, 0.15, 8, 8);
        const poleMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.copy(flagPos);
        pole.position.y = 4;
        scene.add(pole);
        trackObjects.push(pole);

        const flagGeo = new THREE.PlaneGeometry(3, 2);
        const flagMat = new THREE.MeshLambertMaterial({
            color: track.color,
            side: THREE.DoubleSide
        });
        const flag = new THREE.Mesh(flagGeo, flagMat);
        flag.position.copy(flagPos);
        flag.position.y = 7;
        flag.position.x += 1.5;
        scene.add(flag);
        trackObjects.push(flag);
    }

    // Árvores (para Interlagos e Monaco)
    if (trackId !== 'monza') {
        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 80 + Math.random() * 100;
            const x = Math.cos(angle) * dist;
            const z = Math.sin(angle) * dist + 50;

            createTree(x, z);
        }
    }

    // Prédios de boxes
    createPitBuildings(track.color);
}

function createTree(x, z) {
    const tree = new THREE.Group();

    // Tronco
    const trunkGeo = new THREE.CylinderGeometry(0.5, 0.7, 4, 8);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 2;
    tree.add(trunk);

    // Copa
    const leavesGeo = new THREE.ConeGeometry(3, 6, 8);
    const leavesMat = new THREE.MeshLambertMaterial({ color: 0x228B22 });
    const leaves = new THREE.Mesh(leavesGeo, leavesMat);
    leaves.position.y = 6;
    tree.add(leaves);

    tree.position.set(x, 0, z);
    scene.add(tree);
    trackObjects.push(tree);
}

function createPitBuildings(accentColor) {
    // Prédio principal dos boxes
    const pitGeo = new THREE.BoxGeometry(60, 8, 15);
    const pitMat = new THREE.MeshLambertMaterial({ color: 0x444444 });
    const pit = new THREE.Mesh(pitGeo, pitMat);
    pit.position.set(0, 4, -25);
    scene.add(pit);
    trackObjects.push(pit);

    // Teto
    const roofGeo = new THREE.BoxGeometry(65, 1, 20);
    const roofMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, 9, -25);
    scene.add(roof);
    trackObjects.push(roof);

    // Faixa colorida
    const stripeGeo = new THREE.BoxGeometry(60, 1, 15.1);
    const stripeMat = new THREE.MeshLambertMaterial({ color: accentColor });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.set(0, 7, -25);
    scene.add(stripe);
    trackObjects.push(stripe);

    // Garagens
    for (let i = -25; i <= 25; i += 10) {
        const garageGeo = new THREE.BoxGeometry(8, 5, 0.5);
        const garageMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
        const garage = new THREE.Mesh(garageGeo, garageMat);
        garage.position.set(i, 2.5, -17.5);
        scene.add(garage);
        trackObjects.push(garage);
    }
}

// ============================================
// CRIAÇÃO DO CARRO
// ============================================

function createCar(color, isPlayer = false) {
    const car = new THREE.Group();
    car.userData = {
        speed: 0,
        maxSpeed: isPlayer ? playerMaxSpeed : playerMaxSpeed * 0.7 + Math.random() * playerMaxSpeed * 0.25,
        lap: 1,
        checkpoint: 0,
        finished: false,
        trackProgress: 0,
        damage: 0,
        damageParts: []
    };

    const bodyMat = new THREE.MeshLambertMaterial({ color: color });
    const blackMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const carbonMat = new THREE.MeshLambertMaterial({ color: 0x222222 });

    // Chassi principal F1 (monocoque)
    const chassisGeo = new THREE.BoxGeometry(1.8, 0.35, 5);
    const chassis = new THREE.Mesh(chassisGeo, bodyMat);
    chassis.position.set(0, 0.35, 0);
    chassis.castShadow = true;
    car.add(chassis);
    car.userData.damageParts.push(chassis);

    // Bico (nose cone)
    const noseGeo = new THREE.BoxGeometry(0.8, 0.25, 1.5);
    const nose = new THREE.Mesh(noseGeo, bodyMat);
    nose.position.set(0, 0.3, 3);
    car.add(nose);
    car.userData.damageParts.push(nose);

    // Asa dianteira
    const frontWingGeo = new THREE.BoxGeometry(2.4, 0.06, 0.6);
    const frontWing = new THREE.Mesh(frontWingGeo, bodyMat);
    frontWing.position.set(0, 0.15, 3.5);
    car.add(frontWing);
    car.userData.damageParts.push(frontWing);

    // Endplates asa dianteira
    const endplateGeo = new THREE.BoxGeometry(0.05, 0.2, 0.6);
    [-1.15, 1.15].forEach(x => {
        const ep = new THREE.Mesh(endplateGeo, bodyMat);
        ep.position.set(x, 0.2, 3.5);
        car.add(ep);
    });

    // Sidepods
    const sidepodGeo = new THREE.BoxGeometry(0.8, 0.4, 2);
    [-1.1, 1.1].forEach(x => {
        const sidepod = new THREE.Mesh(sidepodGeo, bodyMat);
        sidepod.position.set(x, 0.4, -0.3);
        car.add(sidepod);
        car.userData.damageParts.push(sidepod);
    });

    // Cockpit
    const cockpitGeo = new THREE.BoxGeometry(0.9, 0.3, 1.2);
    const cockpit = new THREE.Mesh(cockpitGeo, blackMat);
    cockpit.position.set(0, 0.65, 0.8);
    car.add(cockpit);

    // Halo
    const haloMat = new THREE.MeshLambertMaterial({ color: 0x444444 });
    const haloCurveGeo = new THREE.TorusGeometry(0.4, 0.04, 8, 16, Math.PI);
    const halo = new THREE.Mesh(haloCurveGeo, haloMat);
    halo.position.set(0, 0.85, 0.6);
    halo.rotation.x = Math.PI / 2;
    halo.rotation.z = Math.PI;
    car.add(halo);

    // Piloto (capacete)
    const helmetGeo = new THREE.SphereGeometry(0.2, 8, 8);
    const helmetMat = new THREE.MeshLambertMaterial({ color: isPlayer ? 0xffff00 : 0xffffff });
    const helmet = new THREE.Mesh(helmetGeo, helmetMat);
    helmet.position.set(0, 0.85, 0.8);
    car.add(helmet);

    // Motor cover
    const engineCoverGeo = new THREE.BoxGeometry(0.7, 0.5, 1.8);
    const engineCover = new THREE.Mesh(engineCoverGeo, bodyMat);
    engineCover.position.set(0, 0.5, -1.2);
    car.add(engineCover);

    // Asa traseira principal
    const rearWingGeo = new THREE.BoxGeometry(1.8, 0.08, 0.4);
    const rearWing = new THREE.Mesh(rearWingGeo, bodyMat);
    rearWing.position.set(0, 1.1, -2.3);
    car.add(rearWing);
    car.userData.damageParts.push(rearWing);

    // Asa traseira inferior (beam wing)
    const beamWingGeo = new THREE.BoxGeometry(1.6, 0.05, 0.3);
    const beamWing = new THREE.Mesh(beamWingGeo, carbonMat);
    beamWing.position.set(0, 0.7, -2.3);
    car.add(beamWing);

    // Suportes asa traseira
    const rearSupportGeo = new THREE.BoxGeometry(0.06, 0.5, 0.06);
    [-0.7, 0.7].forEach(x => {
        const support = new THREE.Mesh(rearSupportGeo, carbonMat);
        support.position.set(x, 0.85, -2.3);
        car.add(support);
    });

    // Endplates asa traseira
    const rearEndplateGeo = new THREE.BoxGeometry(0.05, 0.5, 0.5);
    [-0.9, 0.9].forEach(x => {
        const ep = new THREE.Mesh(rearEndplateGeo, bodyMat);
        ep.position.set(x, 0.9, -2.3);
        car.add(ep);
    });

    // Rodas F1 (maiores, expostas)
    const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.4, 16);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
    const wheelPositions = [
        [-1.3, 0.45, 2.2],
        [1.3, 0.45, 2.2],
        [-1.3, 0.45, -1.8],
        [1.3, 0.45, -1.8]
    ];

    wheelPositions.forEach((pos, idx) => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.position.set(pos[0], pos[1], pos[2]);
        wheel.rotation.z = Math.PI / 2;
        wheel.castShadow = true;
        wheel.name = 'wheel_' + idx;
        car.add(wheel);

        // Aro
        const rimGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.41, 5);
        const rimMat = new THREE.MeshLambertMaterial({ color: 0xcccccc });
        const rim = new THREE.Mesh(rimGeo, rimMat);
        rim.position.set(pos[0], pos[1], pos[2]);
        rim.rotation.z = Math.PI / 2;
        car.add(rim);
    });

    // Difusor
    const diffuserGeo = new THREE.BoxGeometry(1.6, 0.3, 0.4);
    const diffuser = new THREE.Mesh(diffuserGeo, carbonMat);
    diffuser.position.set(0, 0.25, -2.6);
    car.add(diffuser);

    // Luz traseira
    const rearLightGeo = new THREE.BoxGeometry(0.4, 0.1, 0.05);
    const rearLightMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const rearLight = new THREE.Mesh(rearLightGeo, rearLightMat);
    rearLight.position.set(0, 0.5, -2.7);
    car.add(rearLight);

    return car;
}


function createAICars() {
    const colors = [0x3366ff, 0x33cc33, 0xffcc00, 0xff6600, 0x9933ff];

    for (let i = 0; i < aiCount; i++) {
        const car = createCar(colors[i % colors.length], false);

        // Posicionar na linha de largada
        const startT = 0.98 - (i + 1) * 0.02;
        const startPoint = trackPath.getPointAt(startT);
        const tangent = trackPath.getTangentAt(startT);

        car.position.copy(startPoint);
        car.position.y = 0.5;
        car.position.x += (i % 2 === 0 ? -4 : 4);

        // Orientar na direção da pista
        const angle = Math.atan2(tangent.x, tangent.z);
        car.rotation.y = angle;

        car.userData.trackT = startT;
        car.userData.targetSpeed = car.userData.maxSpeed * (0.88 + Math.random() * 0.12);

        scene.add(car);
        aiCars.push(car);
    }
}

// ============================================
// ARQUIBANCADAS E CENÁRIO
// ============================================

function createStands(track) {
    // Posições dinâmicas baseadas no formato da pista
    const positions = [];
    for (let i = 0; i < 4; i++) {
        const t = (i * 0.25 + 0.125) % 1;
        const point = trackPath.getPointAt(t);
        const tangent = trackPath.getTangentAt(t);
        const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

        // Alternar lados
        const side = i % 2 === 0 ? 1 : -1;
        const pos = point.clone().add(normal.clone().multiplyScalar(side * (trackWidth / 2 + 35)));
        positions.push({
            x: pos.x,
            z: pos.z,
            rotY: Math.atan2(tangent.x, tangent.z) + (side > 0 ? Math.PI / 2 : -Math.PI / 2)
        });
    }

    positions.forEach(pos => {
        const stand = createStand(track.color);
        stand.position.set(pos.x, 0, pos.z);
        stand.rotation.y = pos.rotY;
        scene.add(stand);
        trackObjects.push(stand);
    });
}

function createStand(accentColor) {
    const stand = new THREE.Group();

    // Base
    const baseGeo = new THREE.BoxGeometry(50, 4, 12);
    const baseMat = new THREE.MeshLambertMaterial({ color: 0x555555 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 2;
    stand.add(base);

    // Degraus
    for (let i = 0; i < 6; i++) {
        const stepGeo = new THREE.BoxGeometry(50, 0.8, 1.8);
        const stepMat = new THREE.MeshLambertMaterial({ color: 0x777777 });
        const step = new THREE.Mesh(stepGeo, stepMat);
        step.position.set(0, 4 + i * 1, -4 + i * 1.5);
        stand.add(step);
    }

    // Teto com cor de destaque
    const roofGeo = new THREE.BoxGeometry(52, 0.5, 16);
    const roofMat = new THREE.MeshLambertMaterial({ color: accentColor });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, 12, 2);
    stand.add(roof);

    // Pilares
    for (let x = -22; x <= 22; x += 11) {
        const pillarGeo = new THREE.CylinderGeometry(0.4, 0.4, 12, 8);
        const pillarMat = new THREE.MeshLambertMaterial({ color: 0x444444 });
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(x, 6, 9);
        stand.add(pillar);
    }

    // Pessoas animadas
    const crowdColors = [0xff3333, 0x33ff33, 0x3333ff, 0xffff33, 0xff33ff, 0x33ffff, 0xffffff];
    for (let i = 0; i < 80; i++) {
        const personGeo = new THREE.BoxGeometry(0.4, 0.9, 0.3);
        const personMat = new THREE.MeshLambertMaterial({
            color: crowdColors[Math.floor(Math.random() * crowdColors.length)]
        });
        const person = new THREE.Mesh(personGeo, personMat);
        person.position.set(
            -22 + Math.random() * 44,
            4.5 + Math.floor(Math.random() * 6) * 1,
            -3.5 + Math.floor(Math.random() * 6) * 1.5
        );
        stand.add(person);
    }

    return stand;
}

function createSky() {
    // Nuvens volumétricas
    const cloudGeo = new THREE.SphereGeometry(12, 8, 8);
    const cloudMat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });

    for (let i = 0; i < 25; i++) {
        const cloudGroup = new THREE.Group();

        const cloudParts = 4 + Math.floor(Math.random() * 4);
        for (let j = 0; j < cloudParts; j++) {
            const cloud = new THREE.Mesh(cloudGeo, cloudMat);
            cloud.position.set(
                (Math.random() - 0.5) * 25,
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 25
            );
            cloud.scale.set(
                0.5 + Math.random() * 0.6,
                0.3 + Math.random() * 0.3,
                0.5 + Math.random() * 0.6
            );
            cloudGroup.add(cloud);
        }

        cloudGroup.position.set(
            (Math.random() - 0.5) * 500,
            60 + Math.random() * 60,
            (Math.random() - 0.5) * 500
        );

        scene.add(cloudGroup);
    }

    // Sol
    const sunGeo = new THREE.SphereGeometry(18, 16, 16);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffdd44 });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    sun.position.set(120, 180, -150);
    scene.add(sun);

    // Halo do sol
    const haloGeo = new THREE.SphereGeometry(25, 16, 16);
    const haloMat = new THREE.MeshBasicMaterial({ color: 0xffffaa, transparent: true, opacity: 0.3 });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.copy(sun.position);
    scene.add(halo);
}

// ============================================
// EVENTOS E CONTROLES
// ============================================

function setupEvents() {
    // Teclado
    window.addEventListener('keydown', (e) => {
        switch (e.code) {
            case 'ArrowUp':
            case 'KeyW':
                keys.forward = true;
                break;
            case 'ArrowDown':
            case 'KeyS':
                keys.backward = true;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                keys.left = true;
                break;
            case 'ArrowRight':
            case 'KeyD':
                keys.right = true;
                break;
            case 'KeyP':
                // Pit stop
                if (canEnterPit && !isInPitStop && playerCar && playerCar.userData.damage > 10) {
                    enterPitStop();
                }
                break;
        }
    });

    window.addEventListener('keyup', (e) => {
        switch (e.code) {
            case 'ArrowUp':
            case 'KeyW':
                keys.forward = false;
                break;
            case 'ArrowDown':
            case 'KeyS':
                keys.backward = false;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                keys.left = false;
                break;
            case 'ArrowRight':
            case 'KeyD':
                keys.right = false;
                break;
        }
    });

    // Redimensionar
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Botão iniciar - agora abre seleção de pista
    document.getElementById('startButton').addEventListener('click', showTrackSelect);
    document.getElementById('restartButton').addEventListener('click', showTrackSelect);

    // Seleção de pistas
    document.querySelectorAll('.track-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const trackId = e.currentTarget.dataset.track;
            selectTrack(trackId);
        });
    });

    document.getElementById('backToMenu')?.addEventListener('click', () => {
        trackSelectScreen.style.display = 'none';
        mainMenu.style.display = 'flex';
    });
}

function showTrackSelect() {
    mainMenu.style.display = 'none';
    finishScreen.style.display = 'none';
    trackSelectScreen.style.display = 'flex';
}

function selectTrack(trackId) {
    selectedTrack = trackId;
    trackSelectScreen.style.display = 'none';

    // Criar pista selecionada
    createTrack(trackId);

    // Criar carro do jogador
    playerCar = createCar(0xff3333, true);
    playerCar.position.set(0, 0.5, 0);
    scene.add(playerCar);

    // Criar carros IA
    createAICars();

    // Atualizar nome da pista no HUD
    if (trackNameDisplay) {
        trackNameDisplay.textContent = TRACKS[trackId].name;
    }

    // Iniciar jogo
    startGame();
}

function startGame() {
    // Tocar música
    bgMusic.volume = 0.3;
    bgMusic.play().catch(() => { });

    // Inicializar som do motor
    if (window.initEngineSound) {
        window.initEngineSound();
    }

    // Reset de estado
    playerSpeed = 0;
    playerCurrentLap = 1;
    playerCheckpoint = 0;
    playerPosition = 1;
    raceTime = 0;

    // Reset pit stop
    isInPitStop = false;
    pitStopTimer = 0;
    canEnterPit = true;

    // Posicionar jogador na largada
    playerCar.position.set(0, 0.5, 0);
    playerCar.rotation.set(0, 0, 0);
    playerCar.userData.finished = false;
    playerCar.userData.damage = 0;

    // Contagem regressiva
    gameState = 'countdown';
    let count = 3;
    countdown.style.display = 'block';
    countdown.textContent = count;

    const countInterval = setInterval(() => {
        count--;
        if (count > 0) {
            countdown.textContent = count;
            countdown.style.animation = 'none';
            countdown.offsetHeight;
            countdown.style.animation = 'countPulse 1s ease-in-out';
        } else if (count === 0) {
            countdown.textContent = 'GO!';
            countdown.style.color = '#4ecdc4';
        } else {
            clearInterval(countInterval);
            countdown.style.display = 'none';
            countdown.style.color = '#fff';
            hud.style.display = 'block';
            gameState = 'racing';
        }
    }, 1000);
}

function restartGame() {
    // Reset jogador
    playerCar.position.set(0, 0.5, 0);
    playerCar.rotation.set(0, 0, 0);
    playerSpeed = 0;
    playerCurrentLap = 1;
    playerCheckpoint = 0;
    playerPosition = 1;
    playerCar.userData.finished = false;
    raceTime = 0;

    // Reset IA
    aiCars.forEach((car, i) => {
        const startT = 0.98 - (i + 1) * 0.02;
        const startPoint = trackPath.getPointAt(startT);
        const tangent = trackPath.getTangentAt(startT);

        car.position.copy(startPoint);
        car.position.y = 0.5;
        car.position.x += (i % 2 === 0 ? -4 : 4);

        const angle = Math.atan2(tangent.x, tangent.z);
        car.rotation.y = angle;

        car.userData.trackT = startT;
        car.userData.speed = 0;
        car.userData.lap = 1;
        car.userData.checkpoint = 0;
        car.userData.finished = false;
    });

    // Esconder tela de fim e mostrar contagem
    finishScreen.style.display = 'none';
    hud.style.display = 'none';

    startGame();
}

// ============================================
// SISTEMA DE PIT STOP
// ============================================

function enterPitStop() {
    if (isInPitStop) return;

    isInPitStop = true;
    pitStopTimer = 0;
    canEnterPit = false;

    // Parar o carro
    playerSpeed = 0;

    // Mostrar indicador
    const indicator = document.getElementById('pitStopIndicator');
    const pitHint = document.getElementById('pitHint');
    if (indicator) indicator.style.display = 'block';
    if (pitHint) pitHint.style.display = 'none';

    // Parar som do motor
    if (window.stopEngineSound) {
        window.stopEngineSound();
    }
}

function updatePitStop(delta) {
    pitStopTimer += delta;

    const progress = (pitStopTimer / pitStopDuration) * 100;
    const progressBar = document.getElementById('pitStopProgress');
    const progressText = document.getElementById('pitStopText');

    if (progressBar) {
        progressBar.style.width = `${Math.min(progress, 100)}%`;
    }

    if (progressText) {
        const remaining = Math.max(0, pitStopDuration - pitStopTimer).toFixed(1);
        progressText.textContent = `Reparando... ${remaining}s`;
    }

    // Reparar dano gradualmente
    if (playerCar.userData.damage > 0) {
        playerCar.userData.damage = Math.max(0, playerCar.userData.damage - (100 / pitStopDuration) * delta);

        // Restaurar peças visuais do carro
        if (playerCar.userData.damageParts) {
            playerCar.userData.damageParts.forEach(part => {
                // Restaurar posição original gradualmente
                part.position.x *= 0.95;
                part.position.y = Math.abs(part.position.y) < 0.5 ? part.position.y * 0.95 : part.position.y;
                part.rotation.x *= 0.9;
                part.rotation.z *= 0.9;
            });
        }
    }

    // Pit stop concluído
    if (pitStopTimer >= pitStopDuration) {
        exitPitStop();
    }
}

function exitPitStop() {
    isInPitStop = false;
    pitStopTimer = 0;

    // Resetar dano completamente
    playerCar.userData.damage = 0;

    // Esconder indicador
    const indicator = document.getElementById('pitStopIndicator');
    const progressBar = document.getElementById('pitStopProgress');
    if (indicator) indicator.style.display = 'none';
    if (progressBar) progressBar.style.width = '0%';

    // Cooldown antes de poder fazer outro pit
    setTimeout(() => {
        canEnterPit = true;
    }, 10000); // 10 segundos de cooldown
}

// ============================================
// ATUALIZAÇÕES DO JOGO
// ============================================

function updatePlayer(delta) {
    if (gameState !== 'racing' || playerCar.userData.finished) return;

    // Atualizar pit stop
    if (isInPitStop) {
        updatePitStop(delta);
        return;
    }

    // Mostrar dica de pit se dano > 30%
    const pitHint = document.getElementById('pitHint');
    if (pitHint) {
        pitHint.style.display = playerCar.userData.damage > 30 ? 'block' : 'none';
    }

    // Atualizar som do motor
    if (window.updateEngineSound) {
        window.updateEngineSound(playerSpeed, playerMaxSpeed);
    }

    // Aceleração e frenagem
    if (keys.forward) {
        playerSpeed += playerAcceleration * delta;
    } else if (keys.backward) {
        playerSpeed -= playerBrakeForce * delta;
    } else {
        // Atrito
        if (playerSpeed > 0) {
            playerSpeed -= playerFriction * delta;
            if (playerSpeed < 0) playerSpeed = 0;
        } else if (playerSpeed < 0) {
            playerSpeed += playerFriction * delta;
            if (playerSpeed > 0) playerSpeed = 0;
        }
    }

    // Limitar velocidade
    playerSpeed = Math.max(-playerMaxSpeed * 0.3, Math.min(playerMaxSpeed, playerSpeed));

    // Rotação (só se estiver em movimento)
    if (Math.abs(playerSpeed) > 5) {
        const turnFactor = playerSpeed > 0 ? 1 : -1;
        const speedFactor = Math.min(Math.abs(playerSpeed) / 100, 1);

        if (keys.left) {
            playerCar.rotation.y += playerTurnSpeed * delta * turnFactor * speedFactor;
        }
        if (keys.right) {
            playerCar.rotation.y -= playerTurnSpeed * delta * turnFactor * speedFactor;
        }
    }

    // Movimento
    const moveSpeed = playerSpeed * delta;
    playerCar.position.x += Math.sin(playerCar.rotation.y) * moveSpeed;
    playerCar.position.z += Math.cos(playerCar.rotation.y) * moveSpeed;

    // Manter na pista
    keepOnTrack(playerCar);
}

function updateAI(delta) {
    if (gameState !== 'racing') return;

    aiCars.forEach(car => {
        if (car.userData.finished) return;

        // Seguir a pista
        const currentT = car.userData.trackT;
        const targetT = (currentT + 0.002) % 1;
        const targetPoint = trackPath.getPointAt(targetT);

        // Direção para o próximo ponto
        const direction = new THREE.Vector3().subVectors(targetPoint, car.position);
        direction.y = 0;
        const distance = direction.length();
        direction.normalize();

        // Rotação suave
        const targetAngle = Math.atan2(direction.x, direction.z);
        let angleDiff = targetAngle - car.rotation.y;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        car.rotation.y += angleDiff * 4 * delta;

        // Velocidade
        const targetSpeed = car.userData.targetSpeed;
        if (car.userData.speed < targetSpeed) {
            car.userData.speed += 60 * delta;
        }

        // Reduzir velocidade em curvas
        const curveFactor = 1 - Math.abs(angleDiff) * 0.6;
        const adjustedSpeed = car.userData.speed * Math.max(0.4, curveFactor);

        // Movimento
        const moveSpeed = adjustedSpeed * delta;
        car.position.x += Math.sin(car.rotation.y) * moveSpeed;
        car.position.z += Math.cos(car.rotation.y) * moveSpeed;

        // Atualizar trackT
        if (distance < 8) {
            car.userData.trackT = targetT;
        }

        // Manter na pista
        keepOnTrack(car);
    });
}

function keepOnTrack(car) {
    // Encontrar ponto mais próximo na pista
    let closestT = 0;
    let closestDist = Infinity;

    for (let t = 0; t < 1; t += 0.01) {
        const point = trackPath.getPointAt(t);
        const dist = car.position.distanceTo(point);
        if (dist < closestDist) {
            closestDist = dist;
            closestT = t;
        }
    }

    // Se muito longe da pista, puxar de volta
    if (closestDist > trackWidth / 2 + 2) {
        const closestPoint = trackPath.getPointAt(closestT);
        const direction = new THREE.Vector3().subVectors(closestPoint, car.position).normalize();
        car.position.add(direction.multiplyScalar((closestDist - trackWidth / 2) * 0.1));

        // Penalidade de velocidade
        if (car === playerCar) {
            playerSpeed *= 0.92;
        } else {
            car.userData.speed *= 0.92;
        }
    }

    // Atualizar progresso na pista
    car.userData.trackProgress = closestT;
}

function updateCamera(delta) {
    if (!playerCar) return;

    // Posição alvo atrás do carro
    const cameraOffset = new THREE.Vector3(0, 6, -14);
    cameraOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), playerCar.rotation.y);

    const targetPosition = playerCar.position.clone().add(cameraOffset);

    // Interpolação suave
    camera.position.lerp(targetPosition, 6 * delta);

    // Olhar para frente do carro
    const lookTarget = playerCar.position.clone();
    lookTarget.y += 2;
    camera.lookAt(lookTarget);
}

function checkCollisions() {
    if (gameState !== 'racing') return;

    const playerBox = new THREE.Box3().setFromObject(playerCar);

    // Colisão com outros carros
    aiCars.forEach(aiCar => {
        const aiBox = new THREE.Box3().setFromObject(aiCar);

        if (playerBox.intersectsBox(aiBox)) {
            // Calcular velocidade do impacto
            const impactSpeed = Math.abs(playerSpeed - aiCar.userData.speed);
            const impactForce = impactSpeed / 50;

            // Direção de empurrão baseada na posição relativa
            const pushDir = new THREE.Vector3().subVectors(aiCar.position, playerCar.position);
            pushDir.y = 0;
            pushDir.normalize();

            // Determinar lado do impacto para dano
            const relativeAngle = Math.atan2(pushDir.x, pushDir.z) - playerCar.rotation.y;

            // Empurrar com física mais realista
            const playerMass = 1;
            const aiMass = 1;
            const totalMass = playerMass + aiMass;

            playerCar.position.sub(pushDir.clone().multiplyScalar(0.2 * impactForce * (aiMass / totalMass)));
            aiCar.position.add(pushDir.clone().multiplyScalar(0.2 * impactForce * (playerMass / totalMass)));

            // Rotação de impacto
            playerCar.rotation.y += (Math.random() - 0.5) * impactForce * 0.1;
            aiCar.rotation.y += (Math.random() - 0.5) * impactForce * 0.1;

            // Reduzir velocidade baseado no impacto
            playerSpeed *= Math.max(0.5, 1 - impactForce * 0.3);
            aiCar.userData.speed *= Math.max(0.5, 1 - impactForce * 0.3);

            // Aplicar dano visual
            applyDamage(playerCar, impactForce * 15, relativeAngle);
            applyDamage(aiCar, impactForce * 10, relativeAngle + Math.PI);
        }
    });

    // Colisão entre IAs
    for (let i = 0; i < aiCars.length; i++) {
        for (let j = i + 1; j < aiCars.length; j++) {
            const box1 = new THREE.Box3().setFromObject(aiCars[i]);
            const box2 = new THREE.Box3().setFromObject(aiCars[j]);

            if (box1.intersectsBox(box2)) {
                const pushDir = new THREE.Vector3().subVectors(aiCars[j].position, aiCars[i].position);
                pushDir.y = 0;
                pushDir.normalize();

                aiCars[i].position.sub(pushDir.clone().multiplyScalar(0.1));
                aiCars[j].position.add(pushDir.clone().multiplyScalar(0.1));

                aiCars[i].userData.speed *= 0.9;
                aiCars[j].userData.speed *= 0.9;
            }
        }
    }

    // Colisão com barreiras (guard rails)
    checkBarrierCollision(playerCar, true);
    aiCars.forEach(car => checkBarrierCollision(car, false));
}

function checkBarrierCollision(car, isPlayer) {
    // Verificar distância do centro da pista
    let closestT = 0;
    let closestDist = Infinity;

    for (let t = 0; t < 1; t += 0.02) {
        const point = trackPath.getPointAt(t);
        const dist = car.position.distanceTo(point);
        if (dist < closestDist) {
            closestDist = dist;
            closestT = t;
        }
    }

    const barrierDistance = trackWidth / 2 + 2;

    // Se bateu na barreira
    if (closestDist > barrierDistance) {
        const closestPoint = trackPath.getPointAt(closestT);
        const tangent = trackPath.getTangentAt(closestT);
        const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

        // Determinar de que lado da pista está
        const tocar = new THREE.Vector3().subVectors(car.position, closestPoint);
        const side = normal.dot(tocar) > 0 ? 1 : -1;

        // Colocar de volta no limite
        const limitPos = closestPoint.clone().add(normal.clone().multiplyScalar(side * barrierDistance * 0.95));
        car.position.x = limitPos.x;
        car.position.z = limitPos.z;

        // Velocidade do impacto
        const speed = isPlayer ? playerSpeed : car.userData.speed;
        const impactForce = Math.abs(speed) / 80;

        // Reflexão de velocidade (bouncing off barrier)
        if (isPlayer) {
            playerSpeed *= -0.3; // Rebote
            playerSpeed = Math.max(-30, Math.min(30, playerSpeed));

            // Aplicar dano
            applyDamage(car, impactForce * 25, side > 0 ? Math.PI / 2 : -Math.PI / 2);

            // Rotação de impacto
            car.rotation.y += side * impactForce * 0.3;
        } else {
            car.userData.speed *= 0.5;
        }
    }
}

function applyDamage(car, amount, impactAngle) {
    if (!car.userData.damageParts) return;

    car.userData.damage = Math.min(100, (car.userData.damage || 0) + amount);

    // Determinar parte afetada pelo ângulo
    let partIndex = 0;
    if (impactAngle > -Math.PI / 4 && impactAngle < Math.PI / 4) {
        partIndex = 1; // Frente (nose)
    } else if (impactAngle > Math.PI * 3 / 4 || impactAngle < -Math.PI * 3 / 4) {
        partIndex = car.userData.damageParts.length - 1; // Traseira
    } else {
        partIndex = impactAngle > 0 ? 3 : 4; // Lateral
    }

    partIndex = Math.min(partIndex, car.userData.damageParts.length - 1);
    const damagedPart = car.userData.damageParts[partIndex];

    if (damagedPart && amount > 5) {
        // Efeito visual de dano
        damagedPart.position.x += (Math.random() - 0.5) * 0.05 * amount;
        damagedPart.position.y += (Math.random() - 0.5) * 0.02 * amount;
        damagedPart.rotation.x += (Math.random() - 0.5) * 0.02 * amount;
        damagedPart.rotation.z += (Math.random() - 0.5) * 0.02 * amount;

        // Escurecer a cor
        if (damagedPart.material && damagedPart.material.color) {
            damagedPart.material.color.multiplyScalar(0.95);
        }
    }

    // Criar partículas de detritos
    if (amount > 10) {
        createDebris(car.position.clone(), amount);
    }
}

function createDebris(position, amount) {
    const debrisCount = Math.min(5, Math.floor(amount / 5));

    for (let i = 0; i < debrisCount; i++) {
        const debrisGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const debrisMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const debris = new THREE.Mesh(debrisGeo, debrisMat);

        debris.position.copy(position);
        debris.position.y = 0.5;

        debris.userData.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 5,
            Math.random() * 3,
            (Math.random() - 0.5) * 5
        );
        debris.userData.lifetime = 2;

        scene.add(debris);
        trackObjects.push(debris);

        // Animar e remover depois
        const animateDebris = () => {
            debris.userData.lifetime -= 0.016;
            if (debris.userData.lifetime <= 0) {
                scene.remove(debris);
                return;
            }
            debris.position.add(debris.userData.velocity.clone().multiplyScalar(0.016));
            debris.userData.velocity.y -= 9.8 * 0.016;
            debris.rotation.x += 0.1;
            debris.rotation.z += 0.1;
            requestAnimationFrame(animateDebris);
        };
        animateDebris();
    }
}

function updateLapSystem() {
    if (gameState !== 'racing') return;

    // Atualizar checkpoint do jogador
    const playerProgress = playerCar.userData.trackProgress;

    // Detectar cruzamento da linha de chegada
    if (playerCheckpoint >= 8 && playerProgress < 0.1) {
        playerCurrentLap++;
        playerCheckpoint = 0;

        if (playerCurrentLap > totalLaps) {
            playerCar.userData.finished = true;
            finishRace();
            return;
        }
    } else if (playerProgress > (playerCheckpoint + 1) / 10 && playerCheckpoint < 9) {
        playerCheckpoint = Math.floor(playerProgress * 10);
    }

    // Atualizar checkpoints da IA
    aiCars.forEach(car => {
        const progress = car.userData.trackProgress;

        if (car.userData.checkpoint >= 8 && progress < 0.1) {
            car.userData.lap++;
            car.userData.checkpoint = 0;

            if (car.userData.lap > totalLaps) {
                car.userData.finished = true;
            }
        } else if (progress > (car.userData.checkpoint + 1) / 10 && car.userData.checkpoint < 9) {
            car.userData.checkpoint = Math.floor(progress * 10);
        }
    });

    // Calcular posições
    calculatePositions();
}

function calculatePositions() {
    const allCars = [
        {
            car: playerCar,
            lap: playerCurrentLap,
            checkpoint: playerCheckpoint,
            progress: playerCar.userData.trackProgress,
            isPlayer: true
        },
        ...aiCars.map(car => ({
            car: car,
            lap: car.userData.lap,
            checkpoint: car.userData.checkpoint,
            progress: car.userData.trackProgress,
            isPlayer: false
        }))
    ];

    // Ordenar por volta, checkpoint e progresso
    allCars.sort((a, b) => {
        if (b.lap !== a.lap) return b.lap - a.lap;
        if (b.checkpoint !== a.checkpoint) return b.checkpoint - a.checkpoint;
        return b.progress - a.progress;
    });

    // Encontrar posição do jogador
    playerPosition = allCars.findIndex(c => c.isPlayer) + 1;
}

function finishRace() {
    gameState = 'finished';

    // Mostrar tela de fim
    finishScreen.style.display = 'flex';

    const positionText = playerPosition === 1 ? '1º' : playerPosition + 'º';
    document.querySelector('#finishScreen .result').textContent = positionText;
    document.querySelector('#finishScreen .time-result').textContent = 'Tempo: ' + formatTime(raceTime);

    // Cor do resultado baseada na posição
    const resultEl = document.querySelector('#finishScreen .result');
    if (playerPosition === 1) {
        resultEl.style.color = '#ffd700';
    } else if (playerPosition <= 3) {
        resultEl.style.color = '#4ecdc4';
    } else {
        resultEl.style.color = '#e94560';
    }
}

function updateHUD() {
    if (gameState !== 'racing') return;

    // Velocidade (converter para km/h visual)
    const displaySpeed = Math.abs(Math.round(playerSpeed * 1.5));
    speedValue.textContent = displaySpeed;

    // Posição
    positionValue.textContent = playerPosition;

    // Voltas
    lapsValue.textContent = `${Math.min(playerCurrentLap, totalLaps)} / ${totalLaps}`;

    // Tempo
    timerValue.textContent = formatTime(raceTime);

    // Barra de dano
    const damageBarFill = document.getElementById('damageBarFill');
    if (damageBarFill && playerCar) {
        const damage = playerCar.userData.damage || 0;
        damageBarFill.style.width = `${damage}%`;
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

// ============================================
// LOOP PRINCIPAL
// ============================================

function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.1);

    if (gameState === 'racing') {
        raceTime += delta;
    }

    updatePlayer(delta);
    updateAI(delta);
    updateCamera(delta);
    checkCollisions();
    updateLapSystem();
    updateHUD();

    renderer.render(scene, camera);
}

// ============================================
// INICIAR
// ============================================

init();
