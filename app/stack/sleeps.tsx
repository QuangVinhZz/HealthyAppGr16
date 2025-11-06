import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { Card, Container, Screen } from '../../components/Ui';
import { theme } from '../../theme';
import { api } from '../../lib/api';

const CURRENT_USER_ID = '2'; // tạm thời

export default function Sleep() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function reloadAll(opts?: { refresh?: boolean }) {
    try {
      if (opts?.refresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const list = await api.metrics.list({ userId: CURRENT_USER_ID, order: 'desc' });
      setMetrics(Array.isArray(list) ? list : []);
    } catch (err) {
      setError('Không tải được dữ liệu. Kéo để thử lại.');
    } finally {
      if (opts?.refresh) setRefreshing(false);
      else setLoading(false);
    }
  }

  useEffect(() => {
    reloadAll();
  }, []);

  // 7 ngày gần nhất
  const last7 = metrics.slice(-7);
  const avgSleep =
    last7.length > 0
      ? last7.reduce((s, x) => s + (x.sleep ?? 0), 0) / last7.length
      : 0;

  const avgText = `${Math.floor(avgSleep)}h ${Math.round((avgSleep % 1) * 60)}min`;

  // dữ liệu chart
  const chartHeights = last7.map((x) => Math.min(140, (x.sleep ?? 0) * 18 + 40));

  // deep sleep ước lượng 15–20% thời lượng
  const deepSleepH = Math.floor(avgSleep * 0.2);
  const deepSleepM = Math.round((avgSleep * 0.2 - deepSleepH) * 60);

  return (
    <Screen>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => reloadAll({ refresh: true })}
          />
        }
      >
        <Container style={{ paddingVertical: 16 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              textAlign: 'center',
              marginBottom: 10,
            }}
          >
            Your average sleep time per day is{' '}
            <Text style={{ color: theme.primary, fontWeight: '900' }}>{avgText}</Text>
          </Text>

          {loading && (
            <Text style={{ textAlign: 'center', color: theme.subtext }}>Loading...</Text>
          )}
          {!!error && <Text style={{ textAlign: 'center', color: 'red' }}>{error}</Text>}

          {/* Chart bars */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 12,
              height: 140,
            }}
          >
            {chartHeights.length > 0
              ? chartHeights.map((h, i) => (
                  <View
                    key={i}
                    style={{
                      width: 32,
                      height: 140,
                      borderRadius: 12,
                      backgroundColor: '#EEF2F7',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                    }}
                  >
                    <View
                      style={{
                        height: h,
                        width: 26,
                        backgroundColor: theme.primary,
                        borderBottomLeftRadius: 12,
                        borderBottomRightRadius: 12,
                      }}
                    />
                  </View>
                ))
              : Array.from({ length: 7 }).map((_, i) => (
                  <View
                    key={i}
                    style={{
                      width: 32,
                      height: 140,
                      borderRadius: 12,
                      backgroundColor: '#EEF2F7',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <View
                      style={{
                        height: 60 + (i % 3) * 18,
                        backgroundColor: theme.primary,
                        borderBottomLeftRadius: 12,
                        borderBottomRightRadius: 12,
                      }}
                    />
                  </View>
                ))}
          </View>

          {/* Sleep rate + deep sleep */}
          <View style={{ flexDirection: 'row', marginTop: 16 }}>
            <Card style={{ flex: 1, marginRight: 8 }}>
              <Text>🌟 Sleep rate {Math.round((avgSleep / 8) * 100)}%</Text>
            </Card>
            <Card style={{ flex: 1, marginLeft: 8 }}>
              <Text>
                😴 Deep sleep {deepSleepH}h {deepSleepM}min
              </Text>
            </Card>
          </View>

          {/* Schedule */}
          <Text style={{ marginTop: 16, fontWeight: '700' }}>Set your schedule</Text>
          <View style={{ flexDirection: 'row', marginTop: 8 }}>
            <Card style={{ flex: 1, marginRight: 8, backgroundColor: '#FFE6E0' }}>
              <Text>🕙 Bedtime</Text>
              <Text style={{ fontWeight: '900' }}>22:00 pm</Text>
            </Card>
            <Card style={{ flex: 1, marginLeft: 8, backgroundColor: '#FFE9C7' }}>
              <Text>⏰ Wake up</Text>
              <Text style={{ fontWeight: '900' }}>07:30 am</Text>
            </Card>
          </View>
        </Container>
      </ScrollView>
    </Screen>
  );
}
