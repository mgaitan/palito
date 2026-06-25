# AGENTS.md — Documentación Técnica

## El Monte de Palito · Arquitectura y stack tecnológico

---

## Stack

| Componente | Tecnología | Versión | Justificación |
|---|---|---|---|
| Motor de juego | [Phaser 3](https://phaser.io/) | 3.80.x | El framework 2D más maduro para juegos en browser; física arcade integrada, sistema de animaciones, cámara con parallax |
| Bundler | [Vite](https://vitejs.dev/) | 5.x | Dev server rápido con HMR, build optimizado para Cloudflare Pages, zero-config |
| Lenguaje | JavaScript ES2022 | — | Módulos nativos, clases, sin transpilación adicional necesaria |
| Runtime build | Node.js | 18+ | Requerido por Vite |
| Deploy | Cloudflare Pages | — | CDN global, gratis para proyectos estáticos |

---

## Arquitectura

### Flujo de escenas

```
BootScene
    │  genera todas las texturas proceduralmente
    ▼
MenuScene  ◄────────────────────────────────────────────┐
    │  botón "Jugar"                                     │
    ▼                                                    │
IntroScene                                              │
    │  avanzar / skip                                    │
    ▼                                                    │
GameScene (level: 0)  ──completado──► GameScene (level: 1) ──► GameScene (level: 2)
                                                                     │
                                                                     ▼
                                                                 WinScene ──────────┘
```

### Escenas

| Archivo | Clase | Responsabilidad |
|---|---|---|
| `src/scenes/BootScene.js` | `BootScene` | Genera todas las texturas canvas → Phaser, registra animaciones |
| `src/scenes/MenuScene.js` | `MenuScene` | Menú principal con animaciones, info del proyecto |
| `src/scenes/IntroScene.js` | `IntroScene` | Historia con efecto typewriter, paginada |
| `src/scenes/GameScene.js` | `GameScene` | Escena de juego compartida para los 3 niveles (inyecta `level: 0|1|2`) |
| `src/scenes/WinScene.js` | `WinScene` | Animación del Gran Árbol creciendo, créditos |

### Objetos de juego

| Archivo | Clase | Hereda de | Responsabilidad |
|---|---|---|---|
| `src/objects/Palito.js` | `Palito` | `Phaser.Physics.Arcade.Sprite` | Jugador: movimiento, salto, ataque, daño, hitbox de ataque separado |
| `src/objects/Machine.js` | `Machine` | `Phaser.Physics.Arcade.Sprite` | Enemigo: IA de patrulla/persecución, recibir daño, barra de vida, explosión |
| `src/objects/Plant.js` | `Plant` | `Phaser.GameObjects.Sprite` | Vegetación: estados full/wilted/stump/regrowing con tweens |
| `src/objects/Animal.js` | `Animal` | `Phaser.Physics.Arcade.Sprite` | Fauna: deambula, se asusta cerca de máquinas, regresa al destruirlas |

### Utilidades

| Archivo | Función | Responsabilidad |
|---|---|---|
| `src/drawUtils.js` | `makePalito`, `makeExcavator`, etc. | Dibuja todos los sprites con `scene.make.graphics()` + `generateTexture()` |
| `src/constants.js` | — | Constantes físicas, paleta de colores, datos de los 3 niveles |

---

## Generación procedural de gráficos

Todos los sprites se generan en tiempo de ejecución en `BootScene`, sin archivos de imagen externos.

**Técnica:**
```js
// BootScene.create()
const g = scene.make.graphics({ x: 0, y: 0, add: false });
g.fillStyle(0xFFDBA4, 1);
g.fillCircle(16, 9, 8);        // cabeza de Palito
// ... más primitivas geométricas ...
g.generateTexture('palito_idle', 32, 56);
g.destroy();
```

Esto produce texturas WebGL nativas que Phaser trata exactamente igual que sprites cargados de PNG.

**Ventajas:**
- Cero archivos de imagen → bundle más liviano
- Estilo visual consistente (todo xkcd/garabato)
- Modificable programáticamente (tints, escalas)

---

## Sistema de niveles

Los datos de cada nivel están declarados en `src/constants.js` como array `LEVELS[0|1|2]`.

Cada nivel define:
- `worldW`: ancho del mundo (el juego tiene scroll horizontal)
- `platforms[]`: array de `{x, y, w, h}` que `GameScene` convierte en tiles físicos
- `machines[]`: array de `{type, x, y}` — `'excavator'` o `'bulldozer'`
- `plants[]`: array de `{type, x, y}` — `'quebracho'`, `'algarrobo'`, `'jarilla'`, `'cactus'`
- `animals[]`: array de `{type, x, y}` — voladores y terrestres
- `seedX`, `seedY`: solo en nivel 3, posición de la semilla final

---

## Física (Arcade Physics)

- **Gravedad global**: 900 px/s²
- **Palito**: cuerpo dinámico 22×44, `setCollideWorldBounds(false)` (cae al vacío = muerte)
- **Máquinas**: cuerpo dinámico, colisionan con plataformas, `allowGravity: true`
- **Animales voladores**: `body.allowGravity = false`, se mueven con `setVelocity`
- **Hitbox de ataque**: rectángulo separado sin gravedad, se activa/desactiva con cada swing

---

## Parallax

El fondo usa `setScrollFactor()` de Phaser para crear efecto de profundidad:

| Capa | `scrollFactor` | Sensación |
|---|---|---|
| Cielo | 0 (fijo a cámara) | Fondo lejano |
| Montañas lejanas | 0.15 | Muy lejos |
| Montañas medias | 0.35 | Mediana distancia |
| Suelo / plataformas | 1 (default) | Primer plano |
| Personajes | 1 | Primer plano |

---

## IA de máquinas (state machine simple)

```
Estado: PATROL
  ├── si dist(player) < 320 → CHASE
  │
Estado: CHASE  
  ├── si dist(player) > 420 → PATROL
  │
Estado: STUNNED (al recibir golpe)
  └── después de 420ms → vuelve al estado previo
```

---

## Alcance del proyecto

### Implementado
- [x] 3 niveles con diseños únicos
- [x] Personaje con física, animaciones, ataque
- [x] 2 tipos de máquinas enemigas (excavadora y topadora)
- [x] Sistema de plantas con 4 especies nativas cordobesas
- [x] 5 tipos de animales nativos (vizcacha, pájaro, lagartija, zorro, cóndor)
- [x] Mecánica de regrowth: destruir máquina → plantas rebrotan → animales regresan
- [x] Semilla especial en nivel 3 → Gran Árbol → Pantalla de victoria
- [x] Menú animado, pantalla de intro con typewriter, créditos
- [x] HUD con corazones y contador de máquinas
- [x] Parallax de 3 capas
- [x] Efectos de partículas (golpes, explosiones, sparkles, celebración)
- [x] Shake de cámara en explosiones
- [x] Deploy-ready para Cloudflare Pages

### Posibles extensiones futuras
- [ ] Sonido y música (Phaser soporta Web Audio API)
- [ ] Power-ups (escudo, palo más grande)
- [ ] Marcador de puntos
- [ ] Mobile touch controls (joystick virtual)
- [ ] Más niveles
- [ ] Modo multijugador local

---

## Comandos de desarrollo

```bash
npm run dev      # servidor local con HMR en :3000
npm run build    # build de producción → dist/
npm run preview  # previsualizar el build
```

O con Make:

```bash
make dev
make build
make preview
```
