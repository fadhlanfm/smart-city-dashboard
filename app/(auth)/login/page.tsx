import { signIn } from '@/auth';

export default function LoginPage() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-muted/40">
      <div className="w-full max-w-sm rounded-lg border bg-card text-card-foreground shadow-sm">
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
              await signIn('credentials');
            }}
          >
            <button className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              Dummy Login (Guest)
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
