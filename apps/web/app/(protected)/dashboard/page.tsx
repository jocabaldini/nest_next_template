import DashboardClient from './view/DashboardClient';
import { getMe } from './actions';
import { getDictionary, DEFAULT_LOCALE } from '@/lib/i18n';

export default async function DashboardPage() {
  const [user, dict] = await Promise.all([
    getMe(),
    Promise.resolve(getDictionary(DEFAULT_LOCALE)),
  ]);

  return (
    <DashboardClient
      userName={user?.name ?? 'Usuário'}
      dict={dict}
    />
  );
}
