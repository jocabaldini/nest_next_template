export function getApiUrl(): string {
  const url = process.env.API_URL;
  if (!url) throw new Error('Missing API_URL in apps/web/.env.local');
  return url.replace(/\/$/, '');
}
