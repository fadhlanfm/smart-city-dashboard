import { signIn } from '@/auth';
import { Map, Layers, BarChart3, Bot } from 'lucide-react';
import { GoogleLoginButton, DummyLoginButton } from '@/components/auth/LoginButtons';

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full flex-col lg:flex-row">
      {/* Left side - Feature Showcase */}
      <div className="flex flex-col justify-center bg-slate-950 p-8 text-white lg:w-1/2 lg:p-16 xl:p-24">
        <div className="mx-auto w-full max-w-2xl">
          <h1 className="mb-6 text-4xl font-bold tracking-tight lg:text-5xl">
            Smart City Operations Dashboard
          </h1>
          <p className="mb-10 text-lg text-slate-300">
            A high-performance, full-stack Web GIS dashboard designed to turn complex urban data into actionable insights. Built rapidly to showcase enterprise-level architecture, advanced spatial analysis, and modern development practices.
          </p>

          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-blue-500/20 p-3 text-blue-400">
                <Map className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Advanced Web GIS</h3>
                <p className="text-sm text-slate-400">High-performance vector maps featuring <strong>Asset POIs</strong>, <strong>Detail POI Modals</strong> (with images & PDF), <strong>Incident Heatmaps</strong>, and <strong>District Choropleths</strong>.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-emerald-500/20 p-3 text-emerald-400">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Spatial Query & Dashboard</h3>
                <p className="text-sm text-slate-400">Real-time <strong>Spatial Analytics</strong> (Buffer & Intersect via PostGIS/Turf.js), interactive Recharts, and complex grids with two-way map synchronization.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-purple-500/20 p-3 text-purple-400">
                <Layers className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Enterprise Operations</h3>
                <p className="text-sm text-slate-400">Full CRUD, instant Elasticsearch, comprehensive data extraction (CSV, PDF, GeoJSON), and a <strong>Serverless Mock-DB Hydration layer</strong> adapting to Vercel's read-only file system.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-orange-500/20 p-3 text-orange-400">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Next-Gen Engineering</h3>
                <p className="text-sm text-slate-400">Built via <strong>AI-Assisted Vibe Coding</strong> (Claude Sonnet & Gemini 3.1 Pro High), rigorously guided by SDD and validated with {'>'}90% TDD Coverage.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex flex-1 items-center justify-center bg-muted/40 p-8">
        <div className="w-full max-w-sm rounded-lg border bg-card text-card-foreground shadow-xl">
          <div className="flex flex-col space-y-1.5 p-6 pb-4 text-center">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">Smart City</h3>
            <p className="text-sm text-muted-foreground">Sign in to access the dashboard</p>
          </div>
          <div className="flex flex-col space-y-3 p-6 pt-0">
            <form
              action={async () => {
                'use server';
                await signIn('google', { redirectTo: '/' });
              }}
            >
              <GoogleLoginButton />
            </form>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <form
              action={async () => {
                'use server';
                await signIn('credentials', { redirectTo: '/' });
              }}
            >
              <DummyLoginButton />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
