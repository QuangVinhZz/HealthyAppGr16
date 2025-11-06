import React, { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View, RefreshControl } from 'react-native';
import { Card, Container, Screen } from '../../components/Ui';
import { theme } from '../../theme';
import { api } from '../../lib/api';

const CURRENT_USER_ID = '2'; // tạm thời

const Ring = ({
  size = 220,
  stroke = 20,
  percent = 80,
  color = theme.primary,
  bg = '#EEF2F7',
  children,
}: {
  size?: number;
  stroke?: number;
  percent?: number;
  color?: string;
  bg?: string;
  children?: React.ReactNode;
}) => {
  const inner = size - stroke * 2;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: stroke,
          borderColor: color,
          borderRightColor: 'transparent',
          borderBottomColor: 'transparent',
          transform: [{ rotate: `${(percent / 100) * 270 - 135}deg` }],
          opacity: 0.9,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: 'transparent',
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            position: 'absolute',
            bottom: -size * 0.15,
            left: -size * 0.15,
            right: -size * 0.15,
            height: size * 0.5,
            backgroundColor: '#fff',
            borderTopLeftRadius: size,
            borderTopRightRadius: size,
          }}
        />
      </View>

      <View
        style={{
          width: inner,
          height: inner,
          borderRadius: inner / 2,
          backgroundColor: '#fff',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </View>
    </View>
  );
};

const MiniStat = ({
  tint,
  label,
  value,
  icon,
}: {
  tint: string;
  label: string;
  value: string;
  icon?: string;
}) => (
  <View style={{ flex: 1, alignItems: 'center' }}>
    <View
      style={{
        width: 78,
        height: 78,
        borderRadius: 39,
        borderWidth: 8,
        borderColor: '#F0F3F7',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          position: 'absolute',
          width: 78,
          height: 78,
          borderRadius: 39,
          borderWidth: 8,
          borderColor: tint,
          borderLeftColor: 'transparent',
          borderBottomColor: 'transparent',
          transform: [{ rotate: '30deg' }],
          opacity: 0.9,
        }}
      />
      <View
        style={{
          width: 58,
          height: 58,
          borderRadius: 29,
          backgroundColor: '#fff',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon ? (
          <Image source={{ uri: icon }} style={{ width: 28, height: 28, tintColor: tint }} />
        ) : null}
      </View>
    </View>
    <Text style={{ marginTop: 8, fontWeight: '700' }}>{value}</Text>
    <Text style={{ color: theme.subtext, marginTop: 2 }}>{label}</Text>
  </View>
);

export default function Steps() {
  const [tab, setTab] = useState<'today' | 'weekly' | 'monthly'>('weekly');
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

  // lấy bản ghi mới nhất
  const today = metrics.length ? metrics[metrics.length - 1] : { steps: 0, calories: 0, sleep: 0 };
  const goal = 18000;
  const percent = Math.min(100, Math.round((today.steps / goal) * 100));

  // 7 ngày gần nhất để vẽ chart
  const last7 = metrics.slice(-7);
  const barHeights = last7.map((m) => (m.steps ?? 0) / goal * 150);

  return (
    <Screen>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => reloadAll({ refresh: true })} />
        }
      >
        <Container style={{ paddingVertical: 16 }}>
          <Text style={{ textAlign: 'center', fontSize: 18, fontWeight: '800', marginBottom: 8 }}>
            Steps
          </Text>

          {loading && <Text style={{ textAlign: 'center', color: theme.subtext }}>Loading...</Text>}
          {!!error && <Text style={{ textAlign: 'center', color: 'red' }}>{error}</Text>}

          <Text style={{ textAlign: 'center', fontSize: 18, fontWeight: '800' }}>
            You have achieved <Text style={{ color: theme.primary }}>{percent}%</Text> of your goal
          </Text>
          <Text style={{ textAlign: 'center', fontSize: 18, fontWeight: '800' }}>today</Text>

          <View style={{ alignItems: 'center', marginTop: 10 }}>
            <Ring percent={percent}>
              <Image
                source={{ uri: 'https://img.icons8.com/ios-filled/100/00B8D9/footsteps.png' }}
                style={{ width: 26, height: 26, tintColor: theme.primary, marginBottom: 6 }}
              />
              <Text style={{ fontSize: 28, fontWeight: '900' }}>
                {today.steps?.toLocaleString() ?? 0}
              </Text>
              <Text style={{ color: theme.subtext, marginTop: 2 }}>
                Steps out of {goal.toLocaleString()}
              </Text>
            </Ring>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 }}>
            <MiniStat
              tint="#F2994A"
              value={`${today.calories ?? 0} kcal`}
              label="Calories"
              icon="https://img.icons8.com/ios-filled/50/ff7a00/fire-element.png"
            />
            <MiniStat
              tint="#E37E86"
              value={`${(today.steps / 1250).toFixed(1)} km`}
              label="Distance"
              icon="https://img.icons8.com/ios-filled/50/e37e86/marker.png"
            />
            <MiniStat
              tint={theme.primary}
              value={`${Math.round(today.steps / 150)} min`}
              label="Duration"
              icon="https://img.icons8.com/ios-filled/50/00b8d9/clock.png"
            />
          </View>

          {/* Chart */}
          <Card style={{ marginTop: 16, padding: 0, overflow: 'hidden' }}>
            <View style={{ backgroundColor: theme.primary, borderRadius: 18, padding: 14 }}>
              <View
                style={{
                  flexDirection: 'row',
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  borderRadius: 20,
                  alignSelf: 'center',
                  padding: 4,
                }}
              >
                {(['today', 'weekly', 'monthly'] as const).map((k) => {
                  const active = tab === k;
                  return (
                    <TouchableOpacity
                      key={k}
                      onPress={() => setTab(k)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 16,
                        backgroundColor: active ? '#fff' : 'transparent',
                        marginHorizontal: 4,
                      }}
                    >
                      <Text style={{ color: active ? theme.primary : '#fff', fontWeight: '800' }}>
                        {k[0].toUpperCase() + k.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={{ height: 180, marginTop: 14, justifyContent: 'flex-end' }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    height: 150,
                    alignItems: 'flex-end',
                  }}
                >
                  {barHeights.length > 0
                    ? barHeights.map((h, i) => (
                        <View
                          key={i}
                          style={{
                            width: 12,
                            height: Math.max(8, h),
                            backgroundColor: '#fff',
                            opacity: 0.9,
                            borderTopLeftRadius: 6,
                            borderTopRightRadius: 6,
                            alignSelf: 'flex-end',
                          }}
                        />
                      ))
                    : [60, 30, 120, 20, 140, 50, 130].map((h, i) => (
                        <View
                          key={i}
                          style={{
                            width: 12,
                            height: h,
                            backgroundColor: '#fff',
                            opacity: 0.9,
                            borderTopLeftRadius: 6,
                            borderTopRightRadius: 6,
                            alignSelf: 'flex-end',
                          }}
                        />
                      ))}
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: 8,
                  }}
                >
                  {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
                    <Text key={d} style={{ color: '#fff', opacity: 0.9 }}>
                      {d}
                    </Text>
                  ))}
                </View>
              </View>
            </View>
          </Card>
        </Container>
      </ScrollView>
    </Screen>
  );
}
