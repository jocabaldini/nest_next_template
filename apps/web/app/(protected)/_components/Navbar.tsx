'use client';

import { useTransition } from 'react';
import { logoutAction } from '@/lib/auth/actions';
import type { Dictionary } from '@/lib/i18n';

interface NavbarProps {
  userName: string;
  dict: Dictionary['navbar'];
}

export default function Navbar({ userName, dict }: NavbarProps) {
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await logoutAction();
    });
  }

  return (
    <header className="w-full border-b border-gray-800 bg-gray-900 px-6 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <span className="text-lg font-semibold text-white">{dict.appName}</span>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{userName}</span>
          <button
            onClick={handleLogout}
            disabled={isPending}
            className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50 cursor-pointer"
          >
            {isPending ? dict.loggingOut : dict.logout}
          </button>
        </div>
      </div>
    </header>
  );
}
