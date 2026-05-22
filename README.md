# 🌴 monis.rent — Workspace Designer

A state-of-the-art, premium interactive **Workspace Designer** built for **monis.rent**—an office gear rental company catering to digital nomads, remote developers, and creators residing in Bali's tropical hub. 

This project was built as a developer assessment for **Desent Solutions**, engineered using a modern reactive architecture, high-performance procedural 3D elements, and sleek organic design palettes.

---

## 🚀 Key Features

### 1. High-Performance Procedural 3D Visualizer
* **Pure Mathematical Meshes:** Built entirely from Three.js primitives (no external heavy `.gltf` model downloads). Guaranteed instant load times and lightweight network footprint.
* **Orbit Camera Controls:** Smooth 360° rotation and pinch-to-zoom limits to keep the camera elegantly framed above the Stone Villa floor platform.
* **Physics-Based Spring Tweens:** Custom GSAP entrance/exit animations (`ease: "back.out(1.5)"`) that bounce accessories down from the sky when activated, and spin chairs on their hydraulic axes during product swaps.

### 2. Stand & Elevate: Telescoping standing desk sync
* **Nested Coordinate Trees:** Monitors, input packs, desk lamps, and mechanical keyboards are nested directly as children inside the desk tabletop group.
* **Smooth Vertical Elevation:** When toggling between the standard walnut desk (sitting height: $72\text{cm}$) and the bamboo desk (standing height: $115\text{cm}$), a GSAP tween interpolates the group Y-coordinate. **All accessories elevate in perfect, frame-precise synchrony!**

### 3. Day / Night Ambience & RGB Neon LED customizer
* **Day Mode:** Renders warm, direct, natural tropical sunshine casting soft directional shadows and highlighting the light bamboo wood grains.
* **Night Mode:** Transitions to a dark, cozy moonlit villa setup, activates dimmable warm spot-lighting from the desk lamp, and fires a glowing **RGB neon under-glow LED light strip** beneath the desk.
* **Custom Backlight Colors:** An interactive palette lets users cycle between glowing Bali vibing tones like *Sunset Amber*, *Jungle Green*, *Surf Teal*, and *Blossom Pink*.

### 4. Eco-themed Light Dashboard
* **Bali Vibe Room Presets:** Tap one-click presets like *Ubud Eco Minimalist*, *Canggu Indie Hacker*, or *Seminyak Power Exec* to instantly swap between curated configurations.
* **Lease Savings Slider:** Fully customizable term selections (1, 3, 6, 12 months) with compound discount rates (0%, 5%, 15%, 25%) represented visually.
* **USD / IDR Toggle:** Switch between currencies in real-time, instantly converting monthly rates with localized formatting.

### 5. Multi-Step Glassmorphic Checkout Modal
* **Step 1: Logistics:** Integrated Bali neighborhood selectors (Canggu 🏄‍♂️, Ubud 🌴, Seminyak ☕, Uluwatu 🌊), calendar date pickers, and real-time checkout invoice summaries.
* **Step 2: WhatsApp Contacts:** Input dispatch coordinates for direct local delivery matching Bali courier standards.
* **Step 3: Celebration Canvas:** A celebratory confirmation overlay styled with an organic **falling leaf particle physics simulator** written in pure CSS modules.

---

## 🛠 Tech Stack

* **Core Framework:** Next.js (App Router) + TypeScript
* **State Layer:** React Context API (`ConfiguratorProvider`) with localStorage state hydration persistence.
* **3D Engine:** React Three Fiber (R3F) + `@react-three/drei` + Three.js
* **Physics & Motion:** GSAP (GreenSock Animation Platform)
* **Icons:** Lucide React
* **Styling Paradigm:** **Hybrid BEM + Tailwind CSS v4 CSS Modules**
  * Decouples inline styles into semantic class structures (e.g. `styles.configurator__cta`, `styles.modalCard__neighborhoodGrid`).
  * Utilizes Tailwind's v4 `@apply` directive inside `.module.css` stylesheets to compile down into ultra-thin stylesheets.

---

## 📂 Project Architecture

```
monis.rent/
├── src/
│   ├── app/
│   │   ├── page.tsx               # Main Layout coordinator
│   │   ├── layout.tsx             # Root Layout (Fonts & Metadata)
│   │   └── globals.css            # Tailwind Imports
│   ├── components/
│   │   ├── ModelPrimitives/
│   │   │   ├── DeskModel.tsx      # Telescoping columns & LED lights
│   │   │   ├── ChairModel.tsx     # Ergo breeze mesh & Tan Nomad leather
│   │   │   └── AccessoryModel.tsx # Drop-in monitors, monstera & audio stand
│   │   ├── WorkspaceVisualizer/
│   │   │   ├── WorkspaceVisualizer.tsx        # 3D canvas, orbit, lights, stars
│   │   │   └── WorkspaceVisualizer.module.css  # Studio overlay styles
│   │   ├── ConfiguratorPanel/
│   │   │   ├── ConfiguratorPanel.tsx          # Tabbed dashboard controls
│   │   │   └── ConfiguratorPanel.module.css    # Minimalist eco light styles
│   │   └── CheckoutModal/
│   │       ├── CheckoutModal.tsx              # Multi-step booking forms
│   │       └── CheckoutModal.module.css        # Glassmorphism & leaf particles
│   ├── constants/
│   │   └── products.ts            # catalog, pricing, presets, terms
│   └── context/
│       └── ConfiguratorContext.tsx# Single source of truth state manager
```

---

## ⚡ Setup & Development

### 1. Install Dependencies
This project uses **React 19** and **Next.js 15**. Install packages cleanly:
```bash
npm install
```

### 2. Start Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the workspace configurator.

### 3. Production Build
Ensure complete TypeScript compilation and optimization:
```bash
npm run build
```

---

## 🌟 Visual Guidelines (Minimalist Eco Light Theme)

The UI was crafted around a curated **Bali Nomads Light Palette**:
* Cream White Base: `#F9F6F0`
* Sand / Clay Borders: `#E6E1D6`
* Rich Tropical Palm Green: `#059669`
* Muted Forest details: `#115e59`
* Warm bamboo: `#eed9b3`
* Midnight Moon: `#0b0f19` (Visualizer Canvas Night Mode)
