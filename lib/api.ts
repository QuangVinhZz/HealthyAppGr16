// lib/api.ts
export const API_BASE =
  'https://68308dba6205ab0d6c398c70.mockapi.io/api/dbjson/healthyApp';

async function handle(res: Response) {
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export const api = {
  metrics: {
    list: () =>
      fetch(`${API_BASE}?entity=metric`).then(handle),
    today: async () => {
      const list = await api.metrics.list();
      if (!Array.isArray(list) || list.length === 0) return null;
      return list.sort(
        (a: any, b: any) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];
    },
  },
  appointments: {
    list: () =>
      fetch(`${API_BASE}?entity=appointment`).then(handle),
    create: (body: any) =>
      fetch(`${API_BASE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // luôn gắn entity='appointment'
        body: JSON.stringify({ entity: 'appointment', ...body }),
      }).then(handle),
  },
  articles: {
    list: () =>
      fetch(`${API_BASE}?entity=article`).then(handle),
  },
};
