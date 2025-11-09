import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Card, Container, Screen } from '../../components/Ui';
import { api } from '../../lib/api';
import { theme } from '../../theme';

const CURRENT_USER_ID = '2';

type Item = {
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  bg: string;
  title: string;
  value: string;
  unit?: string;
  subtitle?: string;
  onPress?: () => void;
};

const Row = ({ it, onPress }: { it: Item; onPress?: () => void }) => (
  <Pressable onPress={onPress}>
    <Card
      style={{
        marginBottom: 12,
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: '#ECEFF3',
        backgroundColor: '#fff',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            width: 54,
            height: 54,
            borderRadius: 14,
            backgroundColor: it.bg,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 14,
          }}
        >
          <Ionicons name={it.icon} size={26} color={it.tint} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ color: '#6B7280', marginBottom: 2 }}>{it.title}</Text>
          {!!it.subtitle && (
            <Text style={{ color: theme.subtext, marginBottom: 4, fontSize: 12 }}>
              {it.subtitle}
            </Text>
          )}
          <Text style={{ fontSize: 22, fontWeight: '900', color: '#111827' }}>
            {it.value}
            {!!it.unit && (
              <Text style={{ color: '#6B7280', fontSize: 12, fontWeight: '700' }}>
                {' '}{it.unit}
              </Text>
            )}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
      </View>
    </Card>
  </Pressable>
);

export default function AllData() {
  const router = useRouter();

  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadAll(opts?: { refresh?: boolean }) {
    try {
      if (opts?.refresh) setRefreshing(true); else setLoading(true);
      setError(null);

      const mList = await api.metrics.list({ userId: CURRENT_USER_ID, order: 'desc' });
      setMetrics(Array.isArray(mList) ? mList : []);
    } catch {
      setError('Không tải được dữ liệu. Kéo xuống để thử lại.');
    } finally {
      if (opts?.refresh) setRefreshing(false); else setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  // Metric mới nhất
  const latest = useMemo(() => (metrics && metrics.length ? metrics[0] : null), [metrics]);

  // Sleep display: "7  hr  31  min"
  const sleepDisplay = useMemo(() => {
    const h = Number(latest?.sleep ?? 0);
    const hrs = Math.floor(h);
    const mins = Math.round((h - hrs) * 60);
    if (hrs === 0 && mins === 0) return '0';
    if (mins === 0) return `${hrs}`;
    if (hrs === 0) return `${mins}`;
    return `${hrs}  hr  ${mins}  min`;
  }, [latest]);

  // Cycle tracking: lấy trực tiếp từ trường `date` của metric (format "DD Month")
  const cycleLabel = useMemo(() => {
    const raw = latest?.date as string | undefined; // ví dụ "2025-11-04"
    if (!raw) return '--';
    try {
      const d = new Date(raw.length <= 10 ? `${raw}T00:00:00` : raw);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long' }); // "10 November"
    } catch {
      return '--';
    }
  }, [latest]);

  const rows: Item[] = [
    {
      icon: 'walk-outline',
      tint: '#F97316',
      bg: '#FFF3E8',
      title: 'Steps',
      value: (latest?.steps ?? 0).toLocaleString(),
      unit: 'steps',
      onPress: () => router.push('/stack/steps'),
    },
    {
      icon: 'calendar-outline',
      tint: '#8B5CF6',
      bg: '#F3EDFF',
      title: 'Cycle tracking',
      value: cycleLabel,
      onPress: () => router.push('/stack/cycle'),
    },
    {
      icon: 'bed-outline',
      tint: '#EF4444',
      bg: '#FFECEC',
      title: 'Sleep',
      value: sleepDisplay,
      onPress: () => router.push('/stack/sleeps'),
    },
    {
      icon: 'heart-outline',
      tint: '#EF4444',
      bg: '#FFE7E7',
      title: 'Heart',
      value: String(latest?.heartRate ?? 0),
      unit: 'BPM',
    },
    {
      icon: 'flame-outline',
      tint: '#2563EB',
      bg: '#EEF2FF',
      title: 'Burned calories',
      value: String(latest?.calories ?? 0),
      unit: 'kcal',
    },
    {
      icon: 'body-outline',
      tint: '#06B6D4',
      bg: '#E6FAFD',
      title: 'Body mass index',
      value: '18,69',
      unit: 'BMI',
    },
  ];

  const goBack = () => {
    if (window?.history?.length && window.history.length > 1) router.back();
    else router.replace('/tabs/home');
  };

  return (
    <Screen>
      <View style={{ position: 'absolute', inset: 0, backgroundColor: '#F7F8FA' }} />

      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 }}>
        <Pressable
          onPress={goBack}
          style={{
            width: 36, height: 36, borderRadius: 18, backgroundColor: '#EDF2FF',
            alignItems: 'center', justifyContent: 'center', marginRight: 8
          }}>
          <Ionicons name="chevron-back" size={20} color={theme.primary} />
        </Pressable>
        <Text style={{ fontSize: 20, fontWeight: '700' }}>All Health Data</Text>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadAll({ refresh: true })} />}
      >
        <Container style={{ paddingVertical: 12 }}>
          {loading && <Text style={{ color: theme.subtext, marginBottom: 10 }}>Loading...</Text>}
          {!!error && <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>}

          {rows.map((it, idx) => (
            <Row key={idx} it={it} onPress={it.onPress} />
          ))}

          {!loading && !error && rows.length === 0 && (
            <Text style={{ color: theme.subtext }}>No data.</Text>
          )}
        </Container>
      </ScrollView>
    </Screen>
  );
}
