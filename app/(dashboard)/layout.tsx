import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { GuidedTour } from '@/components/tour/GuidedTour';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      <Sidebar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 md:pl-0 w-full">
        <Header />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 h-[calc(100vh-60px)] overflow-hidden">
          {children}
        </main>
      </div>
      <GuidedTour />
    </div>
  );
}
