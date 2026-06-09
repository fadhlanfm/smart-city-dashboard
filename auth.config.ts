import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';

export const authConfig = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'fallback_secret_for_development_only_12345',
  trustHost: true,
  session: { strategy: 'jwt' },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || 'dummy_client_id',
      clientSecret: process.env.AUTH_GOOGLE_SECRET || 'dummy_client_secret',
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
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
