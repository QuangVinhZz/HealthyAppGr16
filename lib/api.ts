// lib/api.ts

// ================== API roots ==================
export const API_BASE = 'https://690b4dad6ad3beba00f45548.mockapi.io'; // <-- đổi theo project của bạn
const USERS = `${API_BASE}/users`;
const DATA  = `${API_BASE}/data`;

// ================== Types (optional) ==================
export type Metric = {
  id: string;
  type: 'metric';
  userId: string;
  date: string;            // YYYY-MM-DD
  steps: number;
  calories: number;
  sleep: number;
  heartRate: number;
  createdAt?: string;
};

export type Appointment = {
  id: string;
  type: 'appointment';
  userId: string;
  title: string;
  doctor: string;
  location?: string;
  time: string;            // ISO
  status?: 'scheduled' | 'done' | 'canceled';
  note?: string;
  createdAt?: string;
};

export type Article = {
  id: string;
  type: 'article';
  title: string;
  image: string;
  category?: string;
  votes?: number;
  slug?: string;
  content?: string;
  createdAt?: string;
};

// ================== Utils ==================
async function handle(res: Response) {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText} ${text ? `- ${text}` : ''}`);
  }
  return res.json();
}

function qs(obj: Record<string, string | number | boolean | undefined>) {
  const sp = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null) sp.set(k, String(v));
  });
  return sp.toString();
}

// ================== API surface ==================
export const api = {
  // ------- Metrics -------
  metrics: {
    /**
     * Lấy danh sách metrics theo cấu trúc mới /data?type=metric[&userId]
     * Mặc định sort theo date tăng dần (asc) để nhóm số liệu tuần/tháng thuận tiện.
     */
    list: (opts?: { userId?: string; order?: 'asc' | 'desc' }) => {
      const query = qs({
        type: 'metric',
        userId: opts?.userId,
        sortBy: 'date',
        order: opts?.order ?? 'asc',
      });
      return fetch(`${DATA}?${query}`).then(handle) as Promise<Metric[]>;
    },

    /** Lấy bản ghi metrics “mới nhất theo date” (tùy chọn lọc theo userId) */
    today: async (opts?: { userId?: string }) => {
      const list = await api.metrics.list({ userId: opts?.userId, order: 'desc' });
      if (!Array.isArray(list) || list.length === 0) return null;
      // vì đã sort desc theo date, phần tử đầu là mới nhất
      return list[0];
    },
  },

  // ------- Appointments -------
  appointments: {
    /** Danh sách appointment (có thể lọc theo userId / status) */
    list: (opts?: { userId?: string; status?: string; order?: 'asc' | 'desc' }) => {
      const query = qs({
        type: 'appointment',
        userId: opts?.userId,
        status: opts?.status,
        sortBy: 'time',
        order: opts?.order ?? 'asc',
      });
      return fetch(`${DATA}?${query}`).then(handle) as Promise<Appointment[]>;
    },

    /** Tạo appointment mới: POST vào /data với type='appointment' */
    create: (body: Omit<Appointment, 'id' | 'type' | 'createdAt'>) => {
      const payload = { ...body, type: 'appointment' as const };
      return fetch(DATA, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(handle) as Promise<Appointment>;
    },
  },

  // ------- Articles -------
  articles: {
    /** Danh sách bài viết: /data?type=article&sortBy=createdAt&order=desc */
    list: () => {
      const query = qs({ type: 'article', sortBy: 'createdAt', order: 'desc' });
      return fetch(`${DATA}?${query}`).then(handle) as Promise<Article[]>;
    },

    /** Lấy bài viết theo id: /data/{id} (kèm kiểm tra type) */
    get: async (id: string) => {
      const res = await fetch(`${DATA}/${id}`);
      const data = (await handle(res)) as Article;
      if (data?.type !== 'article') throw new Error('Not an article');
      return data;
    },

    /** (tuỳ chọn) Lấy bài viết theo slug: /data?type=article&slug=... */
    getBySlug: async (slug: string) => {
      const query = qs({ type: 'article', slug });
      const res = await fetch(`${DATA}?${query}`);
      const list = (await handle(res)) as Article[];
      return Array.isArray(list) && list.length > 0 ? list[0] : null;
    },
  },
};
