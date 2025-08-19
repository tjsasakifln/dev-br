import NextAuth, { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';

export const authOptions: AuthOptions = {
  debug: true, // Forçar debug sempre
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  logger: {
    error(code, metadata) {
      console.error('\n🚨 [NextAuth ERROR]', {
        code,
        message: metadata?.message || 'No message',
        cause: metadata?.cause || 'No cause',
        stack: metadata?.stack || 'No stack',
        timestamp: new Date().toISOString()
      });
    },
    warn(code) {
      console.warn('⚠️ [NextAuth WARN]', code);
    },
    debug(code, metadata) {
      console.log('🔍 [NextAuth DEBUG]', { code, metadata });
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Sempre redirecionar para baseUrl em desenvolvimento - Fix comprovado 2025
      if (process.env.NODE_ENV === 'development') {
        return baseUrl;
      }
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  // JWT strategy para maior compatibilidade
  session: {
    strategy: 'jwt',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };