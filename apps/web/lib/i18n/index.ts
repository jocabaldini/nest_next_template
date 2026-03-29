import { ptBR } from './locales/pt-BR';
import { enUS } from './locales/en-US';

export type Locale = 'pt-BR' | 'en-US';

export type Dictionary = {
  readonly login: {
    readonly title: string;
    readonly subtitle: string;
    readonly email: string;
    readonly emailPlaceholder: string;
    readonly password: string;
    readonly passwordPlaceholder: string;
    readonly submit: string;
    readonly submitting: string;
    readonly errorFallback: string;
  };
  readonly dashboard: {
    readonly title: string;
  };
  readonly navbar: {
    readonly appName: string;
    readonly logout: string;
    readonly loggingOut: string;
  };
};

const dictionaries: Record<Locale, Dictionary> = {
  'pt-BR': ptBR,
  'en-US': enUS,
};

export const DEFAULT_LOCALE: Locale = 'pt-BR';

export function getDictionary(locale: Locale = DEFAULT_LOCALE): Dictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}
