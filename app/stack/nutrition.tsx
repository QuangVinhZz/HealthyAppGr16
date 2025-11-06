import React, { useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { Card, Container, PrimaryButton, Screen } from '../../components/Ui';
import { theme } from '../../theme';
import { api } from '../../lib/api';

const CURRENT_USER_ID = '2';        // tạm thời
const CAL_GOAL = 1300;              // mục tiêu kcal/ngày
const MACRO_RATIO = {               // tỉ lệ mặc định: 40% carbs, 30% protein, 30% fat
  carbs: 0.4,
  protein: 0.3,
  fat: 0.3,
};

// helper: kcal -> gram theo 4/4/9
function macrosFromCalories(kcal: number, ratio = MACRO_RATIO) {
  const carbsK = kcal * ratio.carbs;
  const proteinK = kcal * ratio.protein;
  const fatK = kcal * ratio.fat;
  return {
    carbsG: Math.round(carbsK / 4),
    proteinG: Math.round(proteinK / 4),
    fatG: Math.round(fatK / 9),
  };
}

export default function Nutrition() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function reloadAll(opts?: { refresh?: boolean }) {
    try {
      if (opts?.refresh) setRefreshing(true); else setLoading(true);
      setError(null);
      const list = await api.metrics.list({ userId: CURRENT_USER_ID, order: 'desc' });
      setMetrics(Array.isArray(list) ? list : []);
    } catch (e) {
      setError('Không tải được dữ liệu. Kéo xuống để thử lại.');
    } finally {
      if (opts?.refresh) setRefreshing(false); else setLoading(false);
    }
  }

  useEffect(() => {
    reloadAll();
  }, []);

  // lấy bản mới nhất trong ngày
  const today = useMemo(() => {
    if (!metrics.length) return { calories: 0, steps: 0, sleep: 0 };
    return metrics[metrics.length - 1];
  }, [metrics]);

  const kcal = Number(today.calories ?? 0);
  const percent = Math.max(0, Math.min(100, Math.round((kcal / CAL_GOAL) * 100)));

  const { carbsG, proteinG, fatG } = macrosFromCalories(kcal);

  return (
    <Screen>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => reloadAll({ refresh: true })} />
        }
      >
        <Container style={{ paddingVertical: 16 }}>
          {loading && <Text style={{ textAlign: 'center', color: theme.subtext }}>Loading...</Text>}
          {!!error && <Text style={{ textAlign: 'center', color: 'red' }}>{error}</Text>}

          <Text style={{ textAlign: 'center' }}>
            You have consumed{' '}
            <Text style={{ color: theme.primary, fontWeight: '900' }}>
              {kcal.toLocaleString()} kcal
            </Text>{' '}
            today
          </Text>

          {/* Progress ring đơn giản */}
          <View
            style={{
              alignSelf: 'center',
              marginVertical: 16,
              width: 220,
              height: 220,
              borderRadius: 110,
              borderWidth: 16,
              borderColor: theme.primary,
              justifyContent: 'center',
              alignItems: 'center',
              // che 40% để nhìn như 60% -> chỉ là minh họa, percent hiển thị chuẩn bên trong
            }}
          >
            <Text style={{ fontSize: 28, fontWeight: '900' }}>{percent}%</Text>
            <Text style={{ color: theme.subtext }}>of {CAL_GOAL.toLocaleString()} kcal</Text>
          </View>

          {/* Macros từ dữ liệu thật (ước lượng theo ratio) */}
          {[
            { label: 'Fat', key: 'fat', g: fatG },
            { label: 'Protein', key: 'protein', g: proteinG },
            { label: 'Carbs', key: 'carbs', g: carbsG },
          ].map((r, i) => {
            const p = Math.round(MACRO_RATIO[r.key as keyof typeof MACRO_RATIO] * 100);
            return (
              <Card
                key={i}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                }}
              >
                <Text>{r.label}</Text>
                <Text>
                  {r.g}g {p}%
                </Text>
              </Card>
            );
          })}

          <PrimaryButton
            title="Add meals"
            onPress={() => {
              // TODO: điều hướng đến form add meal (sau này)
            }}
          />
        </Container>
      </ScrollView>
    </Screen>
  );
}
