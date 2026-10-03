export function encodeShareUrl(path: string, data: Record<string, string>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(data)) {
    if (value) {
      try {
        params.set(key, btoa(encodeURIComponent(value)));
      } catch {
        params.set(key, encodeURIComponent(value));
      }
    }
  }
  const base = window.location.origin;
  return `${base}${path}?${params.toString()}`;
}

export function decodeShareParam(encoded: string): string {
  try {
    return decodeURIComponent(atob(encoded));
  } catch {
    try {
      return decodeURIComponent(encoded);
    } catch {
      return encoded;
    }
  }
}
