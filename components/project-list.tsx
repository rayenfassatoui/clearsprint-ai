import { desc, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { ProjectCard } from '@/components/project-card';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';

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

  if (userProjects.length === 0) {
    return (
      <div className="text-center p-12 border-2 border-dashed rounded-xl bg-muted/20">
        <p className="text-muted-foreground">
          No projects yet. Upload a document to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {userProjects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
