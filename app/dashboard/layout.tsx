import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { MobileNav, Sidebar } from '@/components/sidebar';
import { auth } from '@/lib/auth';

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

  const user = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  };

  return (
    <div className="flex h-screen w-full flex-col md:flex-row overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center p-4 border-b shrink-0">
        <MobileNav user={user} />
        <span className="font-bold ml-2">ClearSprint AI</span>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-72 border-r bg-background shrink-0 h-full overflow-y-auto overflow-x-hidden">
        <Sidebar user={user} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto h-full">{children}</main>
    </div>
  );
}
