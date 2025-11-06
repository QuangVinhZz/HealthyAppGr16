import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { Card, Container, Screen } from '../../components/Ui';
import { theme } from '../../theme';
import { api } from '../../lib/api';

const CURRENT_USER_ID = '2';

export default function Cycle() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function reloadAll(opts?: { refresh?: boolean }) {
    try {
      if (opts?.refresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const list = await api.appointments.list();
      setAppointments(Array.isArray(list) ? list : []);
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

  // Lấy kỳ hẹn gần nhất (ví dụ giả định cho kỳ hành kinh)
  const nextAppointment = appointments
    .filter((x) => x.userId === CURRENT_USER_ID)
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())[0];

  const daysLeft = nextAppointment
    ? Math.max(
        0,
        Math.ceil(
          (new Date(nextAppointment.time).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 12;

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
          {loading && (
            <Text style={{ textAlign: 'center', color: theme.subtext }}>
              Loading...
            </Text>
          )}
          {!!error && (
            <Text style={{ textAlign: 'center', color: 'red' }}>{error}</Text>
          )}

          {/* Calendar bar */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <View key={i} style={{ alignItems: 'center' }}>
                <Text style={{ color: theme.subtext }}>{d}</Text>
                <View
                  style={{
                    marginTop: 8,
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor:
                      i === new Date().getDay() - 1
                        ? theme.primary
                        : '#F2F4F7',
                  }}
                />
              </View>
            ))}
          </View>

          {/* Period Info */}
          <Card style={{ alignItems: 'center' }}>
            <Text>Period in</Text>
            <Text
              style={{
                fontSize: 28,
                fontWeight: '900',
                color: theme.primary,
              }}
            >
              {daysLeft} days
            </Text>
            <Text style={{ color: theme.subtext }}>
              Low chance of getting pregnant
            </Text>
          </Card>

          {/* Extra actions */}
          <Text style={{ marginTop: 16, fontWeight: '800' }}>
            How are you feeling today?
          </Text>
          <View style={{ flexDirection: 'row', marginTop: 8 }}>
            <Card style={{ flex: 1, marginRight: 8 }}>
              <Text>Share your symptoms</Text>
            </Card>
            <Card style={{ flex: 1, marginLeft: 8 }}>
              <Text>Daily insights</Text>
            </Card>
          </View>
        </Container>
      </ScrollView>
    </Screen>
  );
}
