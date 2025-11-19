import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/lib/db';
import * as schema from './db/schema';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: schema,
  }),
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || 'http://localhost:3000',
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ],
  emailAndPassword: {
    enabled: true,
  },
  // Enable account linking to connect social accounts to existing users
  account: {
    accountLinking: {
      enabled: true,
      // Link accounts with the same email automatically
      trustedProviders: ['atlassian'],
    },
  },
  socialProviders: {
    atlassian: {
      clientId: process.env.ATLASSIAN_CLIENT_ID as string,
      clientSecret: process.env.ATLASSIAN_CLIENT_SECRET as string,
      scope: [
        'read:jira-user',
        'read:jira-work',
        'write:jira-work',
        'read:me',
        'manage:jira-project',
        'manage:jira-configuration',
        'offline_access',
      ],
    },
  },
});
