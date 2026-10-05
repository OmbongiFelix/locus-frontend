# Locus API — Developer Portal

> **Interactive API documentation portal for Locus** — a Kenyan reverse-geocoding service backed by PostGIS. Resolve WGS 84 coordinates to administrative boundaries (county, constituency, ward, sub-county) across Kenya.

---

## Overview

The Locus Developer Portal is a React-based API reference and interactive playground that lets developers explore, test, and integrate the Locus geocoding API directly in the browser — no Postman or terminal required.

**Live API:** `https://locus-xhvj.onrender.com`  
**OpenAPI spec:** [`openapi.json`](./openapi.json)

---

## Features

- 📖 **Rich endpoint documentation** — full parameter tables, request/response schemas, and code snippets (cURL, JavaScript, Python)
- 🧪 **Interactive playground** — execute live API calls with real responses, timing, and header inspection
- 🗺️ **Kenya preset locations** — one-click coordinate presets (Nairobi, Mombasa, Kisumu, Nakuru, Eldoret, Uasin Gishu)
- 🔍 **Schema browser** — navigate all request/response models from the OpenAPI spec
- 📋 **Code generation** — auto-generated cURL, Fetch, and Python snippets for every endpoint
- 🌊 **Midnight Ocean theme** — purpose-built dark palette for geospatial developer tooling

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/v1/geocode/reverse` | Single-point reverse geocode | `X-API-Key` |
| `POST` | `/v1/geocode/reverse/batch` | Batch reverse geocode (multiple points) | `X-API-Key` |
| `GET` | `/v1/boundaries/version` | Active boundary dataset version | — |
| `GET` | `/v1/health` | Liveness / readiness probe | — |

### Example — Single Reverse Geocode

```bash
curl -X GET "https://locus-xhvj.onrender.com/v1/geocode/reverse?lat=-1.286389&lon=36.817223" \
  -H "X-API-Key: your-api-key"
```

```json
{
  "county_name": "Nairobi",
  "constituency": "Westlands",
  "ward_name": "Kilimani",
  "sub_county_name": "Westlands",
  "location_name": "Kilimani",
  "sub_location": null,
  "match_type": "exact",
  "distance_m": 0.0,
  "boundary_version": "gadm41-ken-2022"
}
```

### Example — Batch Reverse Geocode

```bash
curl -X POST "https://locus-xhvj.onrender.com/v1/geocode/reverse/batch" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "points": [
      { "lat": -1.286389, "lon": 36.817223 },
      { "lat": -4.043477, "lon": 39.668206 },
      { "lat": -0.091702, "lon": 34.767956 }
    ]
  }'
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + Vite 8 |
| Compiler | React Compiler (Babel plugin) |
| Icons | Lucide React |
| Styling | Vanilla CSS (custom design system) |
| Font | Inter + JetBrains Mono |
| Dev Proxy | Vite proxy → backend (bypasses CORS in dev) |
| Deploy | Render (static site) |

---

## Getting Started

### Prerequisites

- Node.js `>=18`
- npm `>=9`

### Install & Run

```bash
# Clone the repository
git clone <repo-url>
cd locus-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The portal will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

Output is written to `dist/`.

---

## Project Structure

```
locus-frontend/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── components/
│   │   ├── CodeBlock.jsx          # Syntax-highlighted code renderer
│   │   ├── EndpointDoc.jsx        # Full endpoint documentation panel
│   │   ├── EndpointPlayground.jsx # Interactive API request console
│   │   ├── JsonSyntaxViewer.jsx   # JSON response viewer
│   │   ├── Navbar.jsx             # Top navigation bar
│   │   ├── OverviewSection.jsx    # Landing overview page
│   │   ├── SchemaViewer.jsx       # Schema object renderer
│   │   ├── SchemasPage.jsx        # Schema reference page
│   │   └── Sidebar.jsx            # Left navigation sidebar
│   ├── App.jsx                    # Root application component
│   ├── index.css                  # Global design system (Midnight Ocean theme)
│   ├── main.jsx                   # React entry point
│   └── openapiData.js             # OpenAPI spec parser & data helpers
├── openapi.json                   # Locus OpenAPI 3.1 specification
├── render.yaml                    # Render deployment config (proxy rules)
├── vite.config.js                 # Vite config with dev proxy
└── package.json
```

---

## CORS & Proxy

The Locus backend requires requests to carry an `X-API-Key` header. To avoid browser CORS restrictions during development, the Vite dev server proxies requests:

```
Browser → /api-proxy/v1/... → https://locus-xhvj.onrender.com/v1/...
```

This is configured in [`vite.config.js`](./vite.config.js). The same rewrite is applied in production via [`render.yaml`](./render.yaml).

> **Backend fix (recommended):** Add `CORSMiddleware` to the FastAPI backend to allow cross-origin requests natively — see [FastAPI CORS docs](https://fastapi.tiangolo.com/tutorial/cors/).

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Deployment

The portal is deployed as a **Render static site**. Configuration is in [`render.yaml`](./render.yaml), which:

1. Builds the site with `npm run build`
2. Serves the `dist/` directory as static files
3. Rewrites `/api-proxy/*` → `https://locus-xhvj.onrender.com/*` to proxy API requests

---

## Response Schema

A successful geocode returns a `GeocodeResponse` object:

| Field | Type | Description |
|-------|------|-------------|
| `county_name` | `string` | Kenya county (e.g. `"Nairobi"`) |
| `constituency` | `string` | Constituency (e.g. `"Westlands"`) |
| `ward_name` | `string` | Ward name |
| `sub_county_name` | `string \| null` | Sub-county, if available |
| `location_name` | `string \| null` | Location name, if available |
| `sub_location` | `string \| null` | Sub-location, if available |
| `match_type` | `"exact" \| "nearest"` | Whether the point fell inside a boundary or was snapped to the nearest |
| `distance_m` | `number` | Distance in metres from point to matched boundary (0 if exact) |
| `boundary_version` | `string` | Boundary dataset version (e.g. `"gadm41-ken-2022"`) |

---

## License

MIT
