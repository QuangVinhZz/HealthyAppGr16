// lib/auth.ts
export const API_BASE =
  'https://68308dba6205ab0d6c398c70.mockapi.io/api/dbjson/healthyApp';

async function safeJson(res: Response) {
  try { return await res.json(); } catch { return null; }
}

// Lọc theo email + entity trên server, so sánh password CHÍNH XÁC ở client
export async function loginWithMockApi(email: string, password: string) {
  const url = `${API_BASE}?` + new URLSearchParams({
    entity: 'user',
    email: email.trim()
  }).toString();

  const res = await fetch(url);
  const body = await safeJson(res);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const list = Array.isArray(body) ? body : [];

  // So khớp chặt chẽ: email không phân biệt hoa thường, password so sánh tuyệt đối
  const user = list.find(u =>
    String(u?.email || '').toLowerCase() === email.trim().toLowerCase() &&
    String(u?.password || '') === String(password)
  );

  return user || null;
}
