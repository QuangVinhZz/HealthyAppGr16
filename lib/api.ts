// lib/api.ts
const API_ROOT = 'https://690b4dad6ad3beba00f45548.mockapi.io';

/* -------------------- UTILS -------------------- */
async function safeJson(res: Response) {
  try { return await res.json(); } catch { return null; }
}
function getTodayStr(d = new Date()) {
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 10); // YYYY-MM-DD
}

/* -------------------- AUTH -------------------- */
export const auth = {
  async login(email: string, password: string) {
    const url = `${API_ROOT}/users?email=${encodeURIComponent(email.trim())}`;
    const res = await fetch(url);
    const body = await safeJson(res);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const list = Array.isArray(body) ? body : [];
    const user = list.find(
      (u: any) =>
        String(u?.email || '').toLowerCase() === email.trim().toLowerCase() &&
        String(u?.password || '') === String(password)
    );
    return user || null;
  },

  async signUp(payload: {
    fullname: string;
    email: string;
    password: string;
    avatar?: string;
    birthday?: string | null;
  }) {
    const { fullname, email, password, avatar, birthday = null } = payload;
    const check = await fetch(
      `${API_ROOT}/users?email=${encodeURIComponent(email.trim())}`
    );
    const arr = await safeJson(check);
    if (
      Array.isArray(arr) &&
      arr.some((u: any) => String(u.email).toLowerCase() === email.trim().toLowerCase())
    ) {
      throw new Error('Email đã tồn tại');
    }

    const newUser = {
      fullname,
      email: email.trim(),
      password,
      avatar: avatar ?? 'https://i.pravatar.cc/150?img=12',
      birthday,
    };

    const res = await fetch(`${API_ROOT}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await safeJson(res);
  },
};

/* -------------------- SESSION (Lưu tạm) -------------------- */
/** Lưu tạm trong phiên đăng nhập (không ghi MockAPI) */
const _session = {
  sleep: {
    date: '' as string,      // YYYY-MM-DD
    hours: null as number | null, // vd: 7.5
  },
};

/* -------------------- METRICS -------------------- */
export const metrics = {
  /** Danh sách metric từ MockAPI (không ảnh hưởng lưu tạm) */
  async list(opts?: { userId?: string; order?: 'asc' | 'desc' }) {
    const params = new URLSearchParams();
    if (opts?.userId) params.set('userId', opts.userId);
    if (opts?.order) params.set('order', opts.order);
    const res = await fetch(`${API_ROOT}/data?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await safeJson(res);
  },

  /** Tính số giờ ngủ từ giờ/phút đi ngủ & thức dậy */
  computeSleepHours(
    bedHour: string, bedMin: string, wakeHour: string, wakeMin: string
  ) {
    const d1 = new Date();
    d1.setHours(parseInt(bedHour, 10), parseInt(bedMin, 10), 0, 0);
    const d2 = new Date();
    d2.setHours(parseInt(wakeHour, 10), parseInt(wakeMin, 10), 0, 0);
    if (d2.getTime() < d1.getTime()) d2.setDate(d2.getDate() + 1); // qua ngày
    const hours = (d2.getTime() - d1.getTime()) / (1000 * 60 * 60);
    return +hours.toFixed(2);
  },

  /** Lưu tạm số giờ ngủ cho NGÀY HÔM NAY trong phiên */
  saveTodaySleep(hours: number) {
    _session.sleep.date = getTodayStr();
    _session.sleep.hours = +hours;
    return { ..._session.sleep };
  },

  /** Lấy số giờ ngủ tạm (chỉ trả về nếu đúng ngày hôm nay) */
  getTodaySleep(): number | null {
    return _session.sleep.date === getTodayStr() ? _session.sleep.hours : null;
  },

  /** Xoá giá trị tạm (nếu cần) */
  clearTodaySleep() {
    _session.sleep.date = '';
    _session.sleep.hours = null;
  },
};

/* -------------------- ARTICLES -------------------- */
export const articles = {
  async list() {
    const res = await fetch(`${API_ROOT}/data?type=article`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await safeJson(res);
  },
};

/* -------------------- APPOINTMENTS -------------------- */
export const appointments = {
  async list() {
    const res = await fetch(`${API_ROOT}/appointments`);
    if (!res.ok) return [];
    return await safeJson(res);
  },
};

/* -------------------- EXPORT GỘP -------------------- */
export const api = {
  auth,
  metrics,
  articles,
  appointments,
};
