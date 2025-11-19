import { desc, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { MobileNav, Sidebar } from '@/components/sidebar';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';

async function getProjects(userId: string) {
  return db
    .select({ id: projects.id, name: projects.name })
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(desc(projects.id));
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/auth/signin');
  }

  const userProjects = await getProjects(session.user.id);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="md:hidden flex items-center p-4 border-b">
        <MobileNav projects={userProjects} />
        <span className="font-bold ml-2">ClearSprint AI</span>
      </div>
      <aside className="hidden md:block w-64 border-r bg-background">
        <Sidebar projects={userProjects} />
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
