'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';
import { Toast, type ToastVariant } from '../_components/Toast';

export default function HomeClient() {
  const [health, setHealth] = useState<unknown>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastVariant, setToastVariant] = useState<ToastVariant>('info');

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const data = await api.get('/health');

        if (cancelled) return;
        setHealth(data);
        setToastVariant('success');
        setToastMessage('API connected');
        setToastOpen(true);
      } catch (err) {
        if (cancelled) return;

        const msg =
          err instanceof Error ? err.message : 'Unknown error connecting to API';

        setToastVariant('error');
        setToastMessage(`API connection failed: ${msg}`);
        setToastOpen(true);
        console.error(err);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold">Next / Nest Starter</h1>
          <p className="mt-2 text-slate-600">
            Next.js (App Router) talking to Nest through a Next proxy route.
          </p>

          <div className="mt-6 rounded-lg bg-slate-100 p-4 font-mono text-sm text-slate-800">
            <div className="opacity-70">/api/health response:</div>
            <pre className="mt-2">{JSON.stringify(health, null, 2)}</pre>
          </div>
        </div>
      </div>

      <Toast
        open={toastOpen}
        message={toastMessage}
        variant={toastVariant}
        onClose={() => setToastOpen(false)}
      />
    </main>
  );
}
