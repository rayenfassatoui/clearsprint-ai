import type { InferSelectModel } from 'drizzle-orm';
import type { projects, tickets, user } from '@/lib/db/schema';

// Database Models
export type User = InferSelectModel<typeof user>;
export type Project = InferSelectModel<typeof projects>;
export type Ticket = InferSelectModel<typeof tickets>;
