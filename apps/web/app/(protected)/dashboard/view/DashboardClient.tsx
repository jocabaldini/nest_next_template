import Navbar from '../../_components/Navbar';
import type { Dictionary } from '@/lib/i18n';

interface DashboardClientProps {
  userName: string;
  dict: Dictionary;
}

export default function DashboardClient({ userName, dict }: DashboardClientProps) {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar userName={userName} dict={dict['navbar']} />

      <main className="flex flex-1 items-center justify-center">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-200">
          {dict.dashboard.title}
        </h1>
      </main>
    </div>
  );
}
