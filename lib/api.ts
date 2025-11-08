// lib/api.ts

// ================== API roots ==================
export const API_BASE = 'https://690b4dad6ad3beba00f45548.mockapi.io';
const USERS = `${API_BASE}/users`;
const DATA  = `${API_BASE}/data`;

// ================== Types (Giữ nguyên) ==================
export type Metric = {
  id: string;
  type: 'metric';
  userId: string;
  date: string;          // YYYY-MM-DD
  steps: number;
  calories: number;
  sleep: number;
  heartRate: number;
  createdAt?: string;
};
export type Appointment = {
  // ... (giữ nguyên type của bạn)
  id: string; type: 'appointment'; userId: string; title: string; doctor: string;
  location?: string; time: string; status?: 'scheduled' | 'done' | 'canceled';
  note?: string; createdAt?: string;
};
export type Article = {
  // ... (giữ nguyên type của bạn)
  id: string; type: 'article'; title: string; image: string; category?: string;
  votes?: number; slug?: string; content?: string; createdAt?: string;
};

// ================== Utils (Giữ nguyên) ==================
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

// 👈 [THAY ĐỔI] Thêm bộ nhớ cache (biến tạm) cho phiên làm việc
let localMetricsCache: Metric[] | null = null;
const todayDate = "2025-11-09"; // Giữ ngày giả lập để khớp dữ liệu

// ================== API surface ==================
export const api = {
  // ------- Metrics -------
  metrics: {
    /**
     * Lấy danh sách metrics.
     * 1. Nếu có cache (đã lưu tạm), trả về cache.
     * 2. Nếu chưa, gọi API thật, lưu vào cache rồi trả về.
     */
    list: async (opts?: { userId?: string; order?: 'asc' | 'desc' }) => {
      // 1. Nếu có cache, trả về cache ngay
      if (localMetricsCache) {
        // Sắp xếp lại theo yêu cầu (mặc định 'asc')
        const order = opts?.order ?? 'asc';
        localMetricsCache.sort((a, b) => {
            const val = new Date(a.date).getTime() - new Date(b.date).getTime();
            return order === 'asc' ? val : -val;
        });
        return Promise.resolve(localMetricsCache);
      }

      // 2. Nếu không có cache, gọi API thật
      const query = qs({
        type: 'metric',
        userId: opts?.userId,
        sortBy: 'date',
        order: opts?.order ?? 'asc',
      });
      const metrics = await fetch(`${DATA}?${query}`).then(handle) as Metric[];
      
      // 3. Lưu vào cache và trả về
      localMetricsCache = metrics;
      return localMetricsCache;
    },

    /** Lấy bản ghi metrics “mới nhất theo date” */
    today: async (opts?: { userId?: string }) => {
      // Hàm này giờ sẽ đọc từ 'list' (đã có cache)
      const list = await api.metrics.list({ userId: opts?.userId, order: 'asc' });
      if (!Array.isArray(list) || list.length === 0) return null;
      // Trả về phần tử cuối cùng (vì list 'asc' - tăng dần)
      return list[list.length - 1];
    },

    // 👈 [THAY ĐỔI] Hàm này giờ sẽ LƯU TẠM VÀO CACHE
    /**
     * Cập nhật hoặc tạo mới metric cho hôm nay, LƯU CỤC BỘ VÀO CACHE.
     */
    createOrUpdateForToday: async (opts: { userId: string; sleep: number }) => {
      const { userId, sleep } = opts;

      // 1. Đảm bảo cache đã được tải ít nhất 1 lần
      if (!localMetricsCache) {
        await api.metrics.list({ userId });
      }

      // 2. Giờ chúng ta chắc chắn cache đã có
      const cache = localMetricsCache!; 

      const existingMetric = cache.find(
        (m) => m.type === 'metric' && m.userId === userId && m.date === todayDate
      );

      if (existingMetric) {
        // 3. Đã có -> Cập nhật sleep trong cache
        existingMetric.sleep = sleep;
      } else {
        // 4. Chưa có -> Thêm bản ghi mới vào cache
        const newMetric: Metric = {
          id: String(Math.random()), // ID giả ngẫu nhiên
          type: 'metric',
          userId: userId,
          date: todayDate,
          sleep: sleep,
          steps: 0,
          calories: 0,
          heartRate: 0,
          createdAt: new Date().toISOString(),
        };
        cache.push(newMetric);
      }
      
      // 5. Giả lập độ trễ và trả về thành công (luôn luôn)
      await new Promise(res => setTimeout(res, 300)); // 300ms
      return Promise.resolve({ success: true });
    },
  },

  // ------- Appointments (Giữ nguyên) -------
  appointments: {
    list: (opts?: { userId?: string; status?: string; order?: 'asc' | 'desc' }) => {
      const query = qs({
        type: 'appointment', userId: opts?.userId, status: opts?.status,
        sortBy: 'time', order: opts?.order ?? 'asc',
      });
      return fetch(`${DATA}?${query}`).then(handle) as Promise<Appointment[]>;
    },
    create: (body: Omit<Appointment, 'id' | 'type' | 'createdAt'>) => {
      const payload = { ...body, type: 'appointment' as const };
      return fetch(DATA, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(handle) as Promise<Appointment>;
    },
  },

  // ------- Articles (Giữ nguyên) -------
  articles: {
    list: () => {
      const query = qs({ type: 'article', sortBy: 'createdAt', order: 'desc' });
      return fetch(`${DATA}?${query}`).then(handle) as Promise<Article[]>;
    },
    get: async (id: string) => {
      const res = await fetch(`${DATA}/${id}`);
      const data = (await handle(res)) as Article;
      if (data?.type !== 'article') throw new Error('Not an article');
      return data;
    },
    getBySlug: async (slug: string) => {
      const query = qs({ type: 'article', slug });
      const res = await fetch(`${DATA}?${query}`);
      const list = (await handle(res)) as Article[];
      return Array.isArray(list) && list.length > 0 ? list[0] : null;
    },
  },
};