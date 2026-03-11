import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/lib/db';
import * as schema from './db/schema';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: schema,
  }),
  socialProviders: {
    linear: {
      clientId: process.env.LINEAR_CLIENT_ID || '',
      clientSecret: process.env.LINEAR_CLIENT_SECRET || '',
      // Linear provider automatically handles scopes and user mapping
    },
  },
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
