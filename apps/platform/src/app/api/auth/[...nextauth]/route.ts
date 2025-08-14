import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'google-client-id-placeholder',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'google-client-secret-placeholder',
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || 'github-client-id-placeholder',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'github-client-secret-placeholder',
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Permite redirecionamento para /dashboard após login
      if (url.startsWith('/dashboard')) {
        return `${baseUrl}/dashboard`
      }
      // Permite redirecionamento para URLs da mesma origem
      if (url.startsWith(baseUrl)) {
        return url
      }
      // Redirecionamento padrão para /dashboard
      return `${baseUrl}/dashboard`
    },
    async session({ session, token }) {
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
  },
  session: {
    strategy: 'jwt',
  },
})

export { handler as GET, handler as POST }