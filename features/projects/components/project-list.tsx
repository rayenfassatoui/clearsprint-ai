import { desc, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';
import { ProjectListClient } from './project-list-client';

async function getProjects() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return [];
  return db
    .select()
    .from(projects)
    .where(eq(projects.userId, session.user.id))
    .orderBy(desc(projects.id));
}

export async function ProjectList() {
  const userProjects = await getProjects();

  return <ProjectListClient projects={userProjects} />;
}
