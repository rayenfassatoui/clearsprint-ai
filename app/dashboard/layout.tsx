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
    <div className='flex min-h-screen flex-col md:flex-row'>
      {/* Mobile Header */}
      <div className='md:hidden flex items-center p-4 border-b'>
        <MobileNav user={user} />
        <span className='font-bold ml-2'>ClearSprint AI</span>
      </div>

      {/* Desktop Sidebar */}
      <aside className='hidden md:block w-64 border-r bg-background'>
        <Sidebar user={user} />
      </aside>

      {/* Main Content */}
      <main className='flex-1 p-8 overflow-y-auto'>{children}</main>
    </div>
  );
}
