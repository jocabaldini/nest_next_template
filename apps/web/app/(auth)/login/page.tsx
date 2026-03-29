import LoginClient from './view/LoginClient';
import { getDictionary, DEFAULT_LOCALE } from '@/lib/i18n';

export const metadata = {
  title: 'Login',
};

export default function LoginPage() {
  const dict = getDictionary(DEFAULT_LOCALE);
  return <LoginClient dict={dict['login']} />;
}
