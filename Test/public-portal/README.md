# Showcase Portal (public)

React 19 + TypeScript + Vite · MUI (dialogs/icons) · SCSS design system · zustand cart · Three.js / R3F / drei · Framer Motion · Lenis.

## Run
```bash
cp .env.example .env      # set VITE_API_BASE_URL and brand/contact values
npm install
npm run dev               # VITE_USE_MOCK=true (in .env.development) shows sample data, dev only
npm run build
```

## Connect to the existing backend (one place)
- `src/api/endpoints.ts` – URL paths for products, categories, projects, orders, inquiries.
- `src/api/normalizers.ts` – maps API fields → `src/types`. Accepts common name variants and list envelopes; add your field names to the key lists if they differ. Unpublished / inactive records are filtered out.
- `src/api/showcase.ts` – the only module pages use. Reads are GET-only; the only writes are `POST /orders` and `POST /inquiries`.
- Set `VITE_USE_MOCK=false` (or remove it) once wired.

## 3D
- Hero (`components/three/HeroScene`) and product viewer (`ModelViewer`) are lazy-loaded (`vendor-three` chunk).
- Product 3D: return a `.glb` URL in `modelUrl` / `model_url` / `glb`. No model → photo gallery. No WebGL / load error → static fallback.
- Reduced-motion: Lenis, tilt, magnetic, reveals and auto-rotate are disabled.

## Ordering
`VITE_ORDER_MODE=quote` (Request a Quote) or `order`. No payment is implemented in either mode. A unique reference is generated client-side and sent with the order.
