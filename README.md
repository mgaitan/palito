# 🌳 El Monte de Palito

**Videojuego educativo sobre el desmonte del monte cordobés**

Creado por el **Grupo 4 de 5ºB** de la Escuela Domingo F. Sarmiento de Villa Los Aromos  
para la **Feria de Ciencias 2025 · Problemáticas ambientales**

*Jugadores: Rodri, Ciro, Alex, Mauri y Ema*

---

## 🎮 Cómo jugar

| Tecla | Acción |
|-------|--------|
| ← / → o A / D | Mover a Palito |
| ↑ / Espacio / W | Saltar |
| **Z** o **X** | ¡Atacar con el palo! |

### Objetivo
- Palito debe **destruir todas las máquinas** (excavadoras y topadoras) que quieren desmontear el bosque.
- Cuando destruís una máquina, las **plantas vuelven a crecer** y los **animales regresan**.
- Hay **3 niveles**: el último termina con la recolección de una **semilla sagrada** en la cumbre, que hace nacer el Gran Árbol.

### Niveles
1. **El Bajo del Monte** — terreno llano, 4 excavadoras
2. **Las Quebradas** — plataformas más complejas, 5 máquinas
3. **La Cumbre** — hay que trepar, 3 máquinas y la semilla final

---

## 🚀 Instalación y ejecución local

### Requisitos
- [Node.js](https://nodejs.org/) v18 o superior
- `npm` (incluido con Node.js)

### Comando rápido

```bash
make dev
```

Esto instala las dependencias y abre el juego en el navegador en `http://localhost:3000`.

### Comandos disponibles

```bash
make dev       # Instala e inicia el servidor de desarrollo (abre el navegador)
make build     # Genera el build de producción en dist/
make preview   # Previsualiza el build de producción localmente
```

Para abrir directo un nivel desde el servidor de desarrollo:

```bash
npm run dev -- --level 2   # opciones: 1, 2 o 3; default: 1
```

---

## 🌐 Deploy en Cloudflare Pages

1. Hacer build: `make build`
2. En [Cloudflare Pages](https://pages.cloudflare.com/), crear nuevo proyecto
3. Conectar repositorio Git **o** hacer drag & drop de la carpeta `dist/`
4. Configuración de build (si se usa Git):
   - **Build command:** `npm run build`
   - **Output directory:** `dist`

---

## 📖 Contexto educativo

Este juego fue creado para la Feria de Ciencias 2025 de la Escuela Domingo F. Sarmiento, abordando la problemática del **desmonte del monte cordobés**.

El monte nativo de Córdoba (Argentina) es uno de los ecosistemas más amenazados de Sudamérica. Sus quebrachos, algarrobos, jarillas y cactus dan hogar a zorros, vizcachas, lagartijas, pájaros y cóndores. La expansión urbana y agropecuaria ha reducido drásticamente su extensión.

El juego propone dos soluciones:
1. **Eliminar las máquinas** que desmontan (acción directa de defensa)
2. **La regeneración natural**: cuando las máquinas son destruidas, el bosque vuelve a crecer

---

## 🛠 Tecnología

Ver [AGENTS.md](AGENTS.md) para la documentación técnica completa.
