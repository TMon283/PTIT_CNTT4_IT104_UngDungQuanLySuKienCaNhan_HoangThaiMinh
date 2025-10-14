export const AUTH_KEY = 'trello_user';

export function signIn(user: { id: number; email: string; username?: string }) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function signOut() {
  localStorage.removeItem(AUTH_KEY);
}

export function getCurrentUser<T = any>(): T | null {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return !!getCurrentUser();
}
