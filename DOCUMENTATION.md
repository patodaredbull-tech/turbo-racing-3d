# Turbo Racing 3D - Documentação Técnica

## Estrutura do Projeto

```
/turbo-racing-3d
├── index.html    # Interface, menu, HUD, estilos CSS
└── game.js       # Lógica do jogo Three.js
```

---

## Arquitetura do Código (game.js)

### Variáveis Globais

| Variável | Tipo | Descrição |
|----------|------|-----------|
| `scene` | THREE.Scene | Cena principal |
| `camera` | THREE.PerspectiveCamera | Câmera do jogador |
| `renderer` | THREE.WebGLRenderer | Renderizador |
| `playerCar` | THREE.Group | Carro do jogador |
| `aiCars` | Array | Carros da IA |
| `trackPath` | THREE.CatmullRomCurve3 | Curva da pista |
| `trackWidth` | Number | Largura da pista |
| `barriers` | Array | Barreiras para colisão |
| `playerDamage` | Number | Dano do jogador (0-100) |
| `gameState` | String | Estado: menu/countdown/racing/finished |

### Física do Jogador

```javascript
playerMaxSpeed = 200      // Velocidade máxima
playerAcceleration = 80   // Aceleração
playerBrakeForce = 120    // Força de frenagem
playerFriction = 30       // Atrito
playerTurnSpeed = 2.5     // Velocidade de curva
```

---

## Funções Principais

### Inicialização
- `init()` - Inicializa Three.js, luzes e eventos
- `createTrack(trackId)` - Cria pista selecionada
- `createCar(color, isPlayer)` - Cria modelo F1
- `createAICars()` - Posiciona carros IA na largada

### Pista
- `createTrackMesh()` - Geometria do asfalto
- `createCurbStripes()` - Zebras vermelho/branco
- `createTrackBorders()` - Guard rails metálicos
- `createEscapeAreas()` - Áreas de cascalho
- `createSafetyBarriers()` - Barreiras TecPro

### Game Loop
- `animate()` - Loop principal (requestAnimationFrame)
- `updatePlayer(delta)` - Física do jogador
- `updateAI(delta)` - Movimento da IA
- `updateCamera(delta)` - Câmera follow
- `checkCollisions()` - Colisões carro-carro e carro-barreira
- `updateLapSystem()` - Voltas e checkpoints

### Sistema de Dano
- `applyDamage(car, amount, angle)` - Aplica dano visual
- `checkBarrierCollision(car, isPlayer)` - Colisão com barreiras
- `createDebris(position, amount)` - Partículas de detritos

---

## Circuitos (TRACKS)

| Circuito | maxSpeed | width | Característica |
|----------|----------|-------|----------------|
| monaco | 180 | 15 | Curvas apertadas |
| monza | 250 | 22 | Retas longas |
| interlagos | 210 | 18 | Misto |

### Estrutura de um Circuito
```javascript
{
    name: 'Monaco',
    description: 'Curvas apertadas',
    color: 0xe94560,        // Cor tema
    groundColor: 0x2a5c3a,  // Cor da grama
    maxSpeed: 180,
    width: 15,
    points: [ {x, z}, ... ] // Pontos da curva
}
```

---

## Modelo do Carro F1

### Partes (car.userData.damageParts)
1. Chassi (monocoque)
2. Bico (nose cone)
3. Asa dianteira
4. Sidepods (2x)
5. Asa traseira

### userData do Carro
```javascript
{
    speed: 0,
    maxSpeed: 200,
    lap: 1,
    checkpoint: 0,
    finished: false,
    trackProgress: 0,
    damage: 0,
    damageParts: []
}
```

---

## Sistema de Colisão

### Carro x Carro
- Calcula velocidade de impacto
- Empurra baseado em massa
- Aplica rotação de impacto
- Reduz velocidade proporcional
- Aplica dano visual às partes

### Carro x Barreira
- Detecta distância do centro da pista
- Se > barrierDistance, colide
- Rebote com velocidade negativa
- Aplica dano lateral

---

## Sistema de Dano Visual

### Efeitos
- Partes se deslocam (position offset)
- Partes rotacionam (rotation offset)
- Cor escurece (multiplyScalar)
- Detritos voam (partículas animadas)

### Barra de Dano (HUD)
- ID: `#damageBarFill`
- Width: 0-100%
- Gradiente: verde → amarelo → vermelho

---

## Estados do Jogo

```
menu → trackSelect → countdown → racing → finished
                         ↑                    |
                         └────────────────────┘
                              (restart)
```

---

## Eventos de Teclado

| Tecla | Ação |
|-------|------|
| W / ArrowUp | keys.forward = true |
| S / ArrowDown | keys.backward = true |
| A / ArrowLeft | keys.left = true |
| D / ArrowRight | keys.right = true |

---

## HUD (index.html)

| Elemento | ID | Conteúdo |
|----------|-----|----------|
| Velocímetro | #speedometer .value | km/h |
| Posição | #position .current | 1-6 |
| Voltas | #laps .value | X / 3 |
| Cronômetro | #timer .time | MM:SS.ms |
| Dano | #damageBarFill | width % |
| Pista | #currentTrackName | Nome |

---

## Para Adicionar Novos Recursos

### Novo Circuito
1. Adicionar objeto em `TRACKS`
2. Definir points, maxSpeed, width, colors

### Nova Parte do Carro
1. Criar geometria em `createCar()`
2. Adicionar a `car.userData.damageParts`

### Novo Sistema
1. Criar função de update
2. Chamar em `animate()`
