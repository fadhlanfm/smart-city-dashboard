import { signIn } from '@/auth';
import { Map, Layers, BarChart3, Bot } from 'lucide-react';

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
                <p className="text-sm text-slate-400">Full CRUD, instant Elasticsearch, and comprehensive data extraction including <strong>CSV, PDF, and GeoJSON Export</strong>.</p>
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
                await signIn('google');
              }}
            >
              <button className="inline-flex w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign In with Google
              </button>
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
                try {
                  console.log('Attempting dummy login...');
                  await signIn('credentials');
                } catch (error) {
                  // Next.js uses errors to handle redirects. If it's a redirect error, throw it.
                  if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
                    throw error;
                  }
                  console.error('Dummy Login Error:', error);
                  throw error;
                }
              }}
            >
              <button className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                Dummy Login (Guest)
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
