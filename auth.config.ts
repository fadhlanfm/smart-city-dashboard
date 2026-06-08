import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: 'Dummy Account',
      credentials: {},
      async authorize() {
        return {
          id: 'dummy-id',
          name: 'Dummy User',
          email: 'dummy@example.com',
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isApiRoute = nextUrl.pathname.startsWith('/api/');
      const isHealthRoute = nextUrl.pathname === '/api/health';
      const isNextAuthRoute = nextUrl.pathname.startsWith('/api/auth');
      const isAuthRoute = nextUrl.pathname.startsWith('/login');

      if (isHealthRoute || isNextAuthRoute) return true;

      if (isApiRoute) {
        if (!isLoggedIn) return Response.json({ error: 'Unauthorized' }, { status: 401 });
        return true;
      }

      if (isAuthRoute) {
        if (isLoggedIn) return Response.redirect(new URL('/', nextUrl));
        return true;
      }

      return isLoggedIn; // All other routes require login
    },
  },
} satisfies NextAuthConfig;
