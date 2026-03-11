import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { genericOAuth } from 'better-auth/plugins';
import { db } from '@/lib/db';
import * as schema from './db/schema';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: schema,
  }),
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: 'linear',
          clientId: process.env.LINEAR_CLIENT_ID || '',
          clientSecret: process.env.LINEAR_CLIENT_SECRET || '',
          authorizationUrl: 'https://linear.app/oauth/authorize',
          tokenUrl: 'https://api.linear.app/oauth/token',
          userInfoUrl: 'https://api.linear.app/graphql',
          redirectURI: `${process.env.BETTER_AUTH_URL || 'http://localhost:3000'}/api/auth/callback/linear`,
          scopes: ['read', 'write', 'issues:create', 'comments:create'],
          getUserInfo: async ({ accessToken }) => {
            const res = await fetch('https://api.linear.app/graphql', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                query: '{ viewer { id name email avatarUrl } }',
              }),
            });
            const data = await res.json();
            const viewer = data.data?.viewer;
            if (!viewer) return null;
            return {
              id: viewer.id,
              name: viewer.name,
              email: viewer.email,
              avatar: viewer.avatarUrl,
              emailVerified: true,
            };
          },
        },
      ],
    }),
  ],
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || 'http://localhost:3000',
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ],
  emailAndPassword: {
    enabled: true,
    async sendResetPassword({ user, url }) {
      const { sendResetPasswordEmail } = await import('./email');
      await sendResetPasswordEmail(user.email, url);
    },
  },
  // Enable account linking to connect social accounts to existing users
  account: {
    accountLinking: {
      enabled: true,
      // Allow linking social accounts with different emails
      allowDifferentEmails: true,
      // Required to allow linking this provider
      trustedProviders: [],
    },
  },
});
