# 🏙️ Smart City Operations Dashboard

![Vercel](https://therealsujitk-vercel-badge.vercel.app/?app=smart-city-dashboard-gray)
![Coverage](https://img.shields.io/badge/Coverage-90%25%2B-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![MapLibre](https://img.shields.io/badge/MapLibre-GL_JS-blue)
![AI-Assisted](https://img.shields.io/badge/Built_with-AI_Assisted_Coding-purple)

**Live Production:** [https://smart-city-dashboard-gray.vercel.app/](https://smart-city-dashboard-gray.vercel.app/)

A high-performance, data-driven Web GIS dashboard designed to turn complex urban data into actionable insights. Built from the ground up to support enterprise-scale spatial analysis, asset management, and real-time operational monitoring.

This project was developed rapidly using an **AI-Assisted Development / Vibe Coding** approach, combined with rigorous **Spec-Driven Development (SDD)** and **Test-Driven Development (TDD)** to ensure production-level stability under tight timelines.

---

## ✨ Core Features

Aligning with enterprise dashboard requirements, this application delivers:

- 🗺️ **Interactive Map View**: High-performance vector map rendering using **MapLibre GL JS**, supporting dynamic layers, clustered points, and spatial interactions.
- 📊 **Data Visualization**: Rich visualizations including summary cards, interactive charts (Recharts), and tabular data views.
- 🔍 **Advanced Filtering & Search**: Instant full-text search powered by **Elasticsearch** and complex multi-parameter data filtering.
- 🛠️ **Spatial Tools**: Built-in geospatial operations such as **Buffer Analysis** and **Intersection** using Turf.js and PostGIS.
- 📑 **Data Detail & Documentation**: Comprehensive modal views for asset details, including supporting photos, histories, and structured metadata.
- 📥 **Data Export**: Seamless export capabilities for reports (PDF) and raw data (CSV) directly from the dashboard.
- 🚀 **Performance Optimized**: Data fetching is cached using **Redis** to ensure sub-second load times even with massive datasets.

---

## 🛠️ Technology Stack

Designed for scalability, this project utilizes a modern Fullstack architecture:

### Frontend
- **React.js & Next.js 14**: Server-Side Rendering (SSR) and App Router for optimal performance and SEO.
- **MapLibre GL JS**: Open-source alternative to Mapbox for rendering complex spatial data.
- **Tailwind CSS & Shadcn/UI**: For a clean, informative, and highly responsive user interface.
- **Zustand**: Lightweight and fast global state management.
- **Recharts**: For rendering robust analytical charts.

### Backend & Database (Microservices Approach)
- **Node.js (Next.js API Routes)**: Serverless backend functions handling API integrations.
- **PostgreSQL + PostGIS**: Primary database handling complex spatial queries and geographic data structures.
- **MongoDB**: Handling unstructured data, metadata, and dynamic survey logs.
- **Redis (Upstash)**: In-memory caching layer to drastically accelerate data fetching and API responses.
- **Elasticsearch (Bonsai)**: Distributed, RESTful search engine for lightning-fast asset lookups.

---

## 🧪 Engineering Methodology

This project is not just about writing code; it's about shipping reliable software efficiently.

### 1. AI-Assisted Development ("Vibe Coding")
Built by leveraging advanced AI coding tools to accelerate the development lifecycle. From initial architecture planning to component generation, AI was utilized to draft, refactor, and debug code, proving the ability to adapt to dynamic requirements and tight project timelines.

### 2. Test-Driven Development (TDD)
Every core feature, service, and API endpoint is backed by automated tests.
- **Test Framework**: Jest & React Testing Library.
- **Code Coverage**: Achieved **> 90% Line Coverage** across all files (`services`, `api`, `components`, `hooks`).
- Ensures that rapid development does not sacrifice code quality or introduce regressions.

### 3. Spec-Driven Development (SDD)
The entire project architecture was meticulously documented before writing a single line of code. All features map directly to detailed Specifications (`spec.md`) and Implementation Plans (`plan.md`).

---

## 🚀 Running Locally

Want to run this project on your local machine?

### Prerequisites
- Node.js (v20+)
- Docker & Docker Compose (for local databases)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/fadhlanfm/smart-city-dashboard.git
   cd smart-city-dashboard
   ```

2. **Start Local Databases (Docker)**
   This will spin up PostgreSQL (with PostGIS), MongoDB, Redis, and Elasticsearch locally.
   ```bash
   docker-compose up -d
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Environment Variables**
   Copy `.env.example` to `.env.local` and add your MapTiler Key and Auth secrets.

5. **Generate Prisma Client & Seed Data**
   ```bash
   npx prisma generate
   npx prisma db push
   npm run es:setup
   ```

6. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 👨‍💻 About The Developer

This dashboard was developed to showcase fullstack proficiency, particularly in **Web GIS**, **API Integration**, and **Modern Frontend Architectures**. It perfectly demonstrates the capability to independently build, test, and ship a complex, data-driven dashboard from the ground up within weeks.

*Fast, independent, and adaptable to dynamic requirements.*
