import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Card, Container, Screen } from '../../components/Ui';
import { theme } from '../../theme';
import { api } from '../../lib/api';

const CURRENT_USER_ID = '2'; // tạm, sau lấy từ auth

type Item = {
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  bg: string;
  title: string;
  value: string;
  unit?: string;
  subtitle?: string;
};

const Row = ({ it }: { it: Item }) => (
  <Card
    style={{
      marginBottom: 12,
      borderRadius: 18,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: '#EFF2F6',
    }}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {/* Icon bubble */}
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          backgroundColor: it.bg,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 14,
        }}
      >
        <Ionicons name={it.icon} size={26} color={it.tint} />
      </View>

      {/* Texts */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '800', color: '#111827', marginBottom: 2 }}>
          {it.title}
        </Text>
        {!!it.subtitle && (
          <Text style={{ color: theme.subtext, marginBottom: 4, fontSize: 12 }}>
            {it.subtitle}
          </Text>
        )}
        <Text style={{ fontSize: 22, fontWeight: '900', color: '#1F2937' }}>
          {it.value}
          {!!it.unit && (
            <Text
              style={{
                color: theme.subtext,
                fontSize: 12,
                fontWeight: '600',
              }}
            >
              {' '}
              {it.unit}
            </Text>
          )}
        </Text>
      </View>

      {/* Chevron */}
      <Ionicons name="chevron-forward" size={18} color={theme.subtext} />
    </View>
  </Card>
);

export default function AllData() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadAll(opts?: { refresh?: boolean }) {
    try {
      if (opts?.refresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const data = await api.metrics.list({ userId: CURRENT_USER_ID, order: 'desc' });
      setMetrics(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('Không tải được dữ liệu. Kéo xuống để thử lại.');
    } finally {
      if (opts?.refresh) setRefreshing(false);
      else setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  // metrics đang lấy theo ngày, ta map mỗi ngày 1 dòng
  const metricRows: Item[] = metrics.map((m) => {
    const dateLabel = m.date || m.createdAt || '';
    return {
      icon: 'footsteps-outline',
      tint: '#F59E0B',
      bg: '#FFF4E6',
      title: `Steps • ${dateLabel}`,
      value: (m.steps ?? 0).toLocaleString(),
      unit: 'steps',
      subtitle: `Calories: ${m.calories ?? 0} kcal • Sleep: ${m.sleep ?? 0} h • HR: ${
        m.heartRate ?? '–'
      } bpm`,
    };
  });

  // thêm vài dòng tĩnh để không trống
  const staticRows: Item[] = [
    {
      icon: 'bed-outline',
      tint: '#0EA5E9',
      bg: '#EAF6FF',
      title: 'Average sleep (7d)',
      value: '7.2',
      unit: 'hours',
      subtitle: 'calculated from latest metrics',
    },
    {
      icon: 'flame-outline',
      tint: '#2563EB',
      bg: '#EEF2FF',
      title: 'Average calories (7d)',
      value: '905',
      unit: 'kcal',
    },
    {
      icon: 'heart-outline',
      tint: '#EF4444',
      bg: '#FFECEC',
      title: 'Resting heart rate',
      value: '68',
      unit: 'bpm',
    },
  ];

  return (
    <Screen>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadAll({ refresh: true })}
          />
        }
      >
        <Container style={{ paddingVertical: 12 }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: '800',
              textAlign: 'center',
              marginBottom: 10,
            }}
          >
            All Health Data
          </Text>

          {loading && (
            <View style={{ paddingVertical: 10 }}>
              <Text style={{ color: theme.subtext }}>Loading...</Text>
            </View>
          )}

          {!!error && (
            <View style={{ paddingVertical: 10 }}>
              <Text style={{ color: 'red' }}>{error}</Text>
            </View>
          )}

          {/* hàng động từ API */}
          {metricRows.map((it, idx) => (
            <Row key={`metric-${idx}`} it={it} />
          ))}

          {/* hàng tĩnh demo */}
          {staticRows.map((it, idx) => (
            <Row key={`static-${idx}`} it={it} />
          ))}

          {!loading && metricRows.length === 0 && !error && (
            <View style={{ paddingVertical: 14 }}>
              <Text style={{ color: theme.subtext }}>
                Chưa có dữ liệu health nào cho người dùng này.
              </Text>
            </View>
          )}
        </Container>
      </ScrollView>
    </Screen>
  );
}
