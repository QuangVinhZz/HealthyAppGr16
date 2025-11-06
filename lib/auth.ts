// lib/auth.ts
export const API_BASE =
  'https://68308dba6205ab0d6c398c70.mockapi.io/api/dbjson/healthyApp';

// ---- Types ---------------------------------------------------------------
export type User = {
  id: string;
  entity: 'user';
  fullname: string;
  email: string;
  password: string;
  image?: string;
  birthday?: string | null;
  // Có thể được MockAPI tự thêm
  createdAt?: string;
  name?: string;
  avatar?: string;
};

type Json = Record<string, any> | any[] | null;

// ---- Utils ---------------------------------------------------------------
async function safeJson(res: Response): Promise<Json> {
  try { return await res.json(); } catch { return null; }
}

function normEmail(e: string) {
  return String(e || '').trim().toLowerCase();
}

async function getUsersByEmail(email: string): Promise<User[]> {
  const url = `${API_BASE}?` + new URLSearchParams({
    entity: 'user',
    email: email.trim(),         // MockAPI filter trên server
  }).toString();

  const res = await fetch(url);
  const body = await safeJson(res);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const list = Array.isArray(body) ? body : [];
  // Lọc chắc chắn lần nữa ở client theo email không phân biệt hoa/thường
  return list.filter(u => normEmail(u?.email) === normEmail(email)) as User[];
}

// ---- Auth APIs -----------------------------------------------------------

// GIỮ NGUYÊN: Lọc theo email + entity trên server, so sánh password CHÍNH XÁC ở client
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

// MỚI: Đăng ký — check trùng email (case-insensitive) trong entity=user, rồi POST entity=user
export async function signUpWithMockApi(params: {
  fullname: string;
  email: string;
  password: string;
  image?: string;
  birthday?: string | null;
}): Promise<User> {
  const { fullname, email, password, image, birthday = null } = params;

  // 1) Kiểm tra trùng email
  const existed = await getUsersByEmail(email);
  if (existed.length > 0) {
    throw new Error('Email đã tồn tại.');
  }

  // 2) Tạo user mới (entity=user). Lưu ý: demo nên mật khẩu để plain; production cần hash.
  const payload: Partial<User> = {
    entity: 'user',
    fullname,
    email: email.trim(),
    password,
    image: image ?? 'https://i.pravatar.cc/150?img=12',
    birthday,
  };

  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`Đăng ký thất bại (${res.status}). ${t}`);
  }

  const created = await safeJson(res) as User;
  // Phòng khi MockAPI auto thêm field lạ — trả về đúng kiểu User
  return created;
}

// (tuỳ chọn) ví dụ fetch metrics luôn filter theo entity
export async function fetchMetrics() {
  const url = `${API_BASE}?` + new URLSearchParams({ entity: 'metric' }).toString();
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await safeJson(res) as Array<{
    id: string; entity: 'metric'; date: string; steps: number; calories: number; sleep: number; heartRate: number;
  }>;
}
