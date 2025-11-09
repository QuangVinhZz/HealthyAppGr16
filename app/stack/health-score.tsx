import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { Card, Container, Screen } from '../../components/Ui';
import { api } from '../../lib/api';
import { theme } from '../../theme';

const CURRENT_USER_ID = '2';

/**
 * Công thức đơn giản (có comment để bạn chỉnh dễ):
 * - Steps (30%):      10k bước/ngày đạt 100 điểm (clamp 0..100)
 * - Sleep (30%):      7–8h là tốt nhất (7h=100, 8h=95, xa dần giảm điểm)
 * - Calories (20%):   mục tiêu 1800–2400 kcal/ngày (trong range = 100, lệch xa giảm)
 * - Resting HR (20%): 55–70 bpm là tốt (trong range = 100, lệch xa giảm)
 * Tổng = Σ(weight * factorScore) → scale về 0..100
 */

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function scoreSteps(avgSteps: number) {
  // 0 -> 20k, 10k = 100
  return clamp((avgSteps / 10000) * 100, 0, 100);
}

function scoreSleep(avgSleepHrs: number) {
  // 7h tốt nhất (100), 8h ~95, 6h ~80, <5h giảm mạnh
  const diff = Math.abs(avgSleepHrs - 7);
  const s = clamp(100 - diff * 20, 0, 100);
  return s;
}

function scoreCalories(avgKcal: number) {
  const low = 1800, high = 2400;
  if (avgKcal >= low && avgKcal <= high) return 100;
  const diff = avgKcal < low ? low - avgKcal : avgKcal - high;
  // mỗi 100 kcal lệch giảm 10 điểm
  return clamp(100 - (diff / 100) * 10, 0, 100);
}

function scoreRestingHR(avgHR: number) {
  const low = 55, high = 70;
  if (avgHR >= low && avgHR <= high) return 100;
  const diff = avgHR < low ? low - avgHR : avgHR - high;
  // mỗi 5 bpm lệch giảm 10 điểm
  return clamp(100 - (diff / 5) * 10, 0, 100);
}

function badge(color: string, text: string) {
  return (
    <View style={{ backgroundColor: color, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 }}>
      <Text style={{ color: '#fff', fontWeight: '800' }}>{text}</Text>
    </View>
  );
}

function Progress({ value }: { value: number }) {
  return (
    <View style={{ height: 10, backgroundColor: '#EEF2FF', borderRadius: 999, overflow: 'hidden' }}>
      <View style={{ width: `${clamp(value, 0, 100)}%`, height: '100%', backgroundColor: theme.primary }} />
    </View>
  );
}

export default function HealthScoreScreen() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(opts?: { refresh?: boolean }) {
    try {
      opts?.refresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      const list = await api.metrics.list({ userId: CURRENT_USER_ID, order: 'desc' });
      setMetrics(Array.isArray(list) ? list : []);
    } catch {
      setError('Không tải được dữ liệu.');
    } finally {
      opts?.refresh ? setRefreshing(false) : setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // Lấy 7 bản ghi gần nhất (nếu ít hơn thì lấy tất cả)
  const last7 = useMemo(() => metrics.slice(0, 7), [metrics]);

  const avgSteps = useMemo(
    () => (last7.length ? Math.round(last7.reduce((a, m) => a + (m.steps || 0), 0) / last7.length) : 0),
    [last7]
  );
  const avgSleep = useMemo(
    () => (last7.length ? +(last7.reduce((a, m) => a + (m.sleep || 0), 0) / last7.length).toFixed(2) : 0),
    [last7]
  );
  const avgKcal = useMemo(
    () => (last7.length ? Math.round(last7.reduce((a, m) => a + (m.calories || 0), 0) / last7.length) : 0),
    [last7]
  );
  const avgHR = useMemo(
    () => (last7.length ? Math.round(last7.reduce((a, m) => a + (m.heartRate || 0), 0) / last7.length) : 0),
    [last7]
  );

  const sSteps = scoreSteps(avgSteps);
  const sSleep = scoreSleep(avgSleep);
  const sKcal = scoreCalories(avgKcal);
  const sHR = scoreRestingHR(avgHR);

  const weights = { steps: 0.3, sleep: 0.3, kcal: 0.2, hr: 0.2 };
  const totalScore = Math.round(
    (sSteps * weights.steps) +
    (sSleep * weights.sleep) +
    (sKcal * weights.kcal) +
    (sHR * weights.hr)
  );

  const level = totalScore >= 85 ? 'Excellent'
              : totalScore >= 70 ? 'Good'
              : totalScore >= 55 ? 'Fair'
              : 'Poor';

  // Recommendations
  const advice: string[] = [];
  if (avgSteps < 8000) advice.push('Tăng hoạt động: đặt mục tiêu ≥ 10.000 bước/ngày (đi bộ 30–45 phút).');
  if (avgSleep < 7) advice.push('Ngủ chưa đủ: cố gắng đạt ≥ 7 giờ/đêm, giữ giờ ngủ cố định.');
  if (avgSleep > 9) advice.push('Bạn đang ngủ quá nhiều; thử duy trì 7–8 giờ/đêm.');
  if (avgKcal < 1800) advice.push('Lượng kcal thấp: bổ sung bữa phụ lành mạnh (hạt, sữa chua, trái cây).');
  if (avgKcal > 2400) advice.push('Kiểm soát khẩu phần: ưu tiên protein nạc, rau, hạn chế đường tinh luyện.');
  if (avgHR && (avgHR < 55 || avgHR > 70)) advice.push('Nhịp tim nghỉ lệch: tập cardio 3–4 buổi/tuần (20–30 phút/buổi).');
  if (advice.length === 0) advice.push('Duy trì thói quen hiện tại: bạn đang làm tốt!');

  const goBack = () => {
    if (window?.history?.length && window.history.length > 1) router.back();
    else router.replace('/tabs/home');
  };

  const ItemRow = ({
    icon, color, bg, title, value, unit, score, onPress,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    color: string; bg: string; title: string;
    value: string; unit?: string; score: number;
    onPress?: () => void;
  }) => (
    <Pressable onPress={onPress}>
      <Card style={{ padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#ECEFF3', marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 54, height: 54, borderRadius: 14, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
            <Ionicons name={icon} size={26} color={color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#6B7280' }}>{title}</Text>
            <Text style={{ fontSize: 22, fontWeight: '900', color: '#111827' }}>
              {value}{unit ? <Text style={{ color: '#6B7280', fontSize: 12, fontWeight: '700' }}> {unit}</Text> : null}
            </Text>
            <View style={{ marginTop: 8 }}>
              <Progress value={score} />
            </View>
          </View>
          <Text style={{ fontWeight: '800', color: theme.primary }}>{Math.round(score)}</Text>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" style={{ marginLeft: 6 }} />
        </View>
      </Card>
    </Pressable>
  );

  return (
    <Screen>
      <View style={{ position: 'absolute', inset: 0, backgroundColor: '#F7F8FA' }} />

      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 }}>
        <Pressable
          onPress={goBack}
          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#EDF2FF', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}
        >
          <Ionicons name="chevron-back" size={20} color={theme.primary} />
        </Pressable>
        <Text style={{ fontSize: 20, fontWeight: '700' }}>Health Score</Text>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load({ refresh: true })} />}
      >
        <Container style={{ paddingVertical: 12 }}>
          {/* Tổng quan điểm */}
          {/* Tổng quan điểm - FIX chồng chéo */}
<Card
  style={{
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E6F4F9',
    backgroundColor: '#E6FAFD',
    marginBottom: 14,
  }}
>
  <View style={{ position: 'relative' }}>
    {/* Nội dung bên trái, CHỪA CHỖ cho score box */}
    <View style={{ paddingRight: 96 }}>
      <Text style={{ fontSize: 18, fontWeight: '900' }}>Your overall score</Text>
      <Text style={{ color: theme.subtext, marginTop: 4 }}>
        Dựa trên 7 ngày gần nhất, điểm của bạn là {totalScore} — mức {level}.
      </Text>

      {/* Badges có wrap + khoảng cách */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
        {[
          { text: 'steps 30%', bg: '#22C55E' },
          { text: 'sleep 30%', bg: '#06B6D4' },
          { text: 'kcal 20%',  bg: '#2563EB' },
          { text: 'rest HR 20%', bg: '#F97316' },
        ].map((b, i) => (
          <View
            key={i}
            style={{
              backgroundColor: b.bg,
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 12,
              marginRight: 8,
              marginBottom: 8,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '800' }}>{b.text}</Text>
          </View>
        ))}
      </View>
    </View>

    {/* Score box bên phải, không ảnh hưởng layout badges */}
    <View
      style={{
        position: 'absolute',
        right: 8,
        top: 8,
        width: 72,
        height: 72,
        borderRadius: 16,
        backgroundColor: theme.primary,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      }}
    >
      <Text style={{ color: '#fff', fontSize: 28, fontWeight: '900' }}>
        {totalScore}
      </Text>
    </View>
  </View>
</Card>

          {/* Từng yếu tố + link chi tiết */}
          <ItemRow
            icon="walk-outline"
            color="#F97316"
            bg="#FFF3E8"
            title="Steps"
            value={avgSteps.toLocaleString()}
            unit="steps"
            score={sSteps}
            onPress={() => router.push('/stack/steps')}
          />
          <ItemRow
            icon="bed-outline"
            color="#0EA5E9"
            bg="#EAF6FF"
            title="Sleep"
            value={avgSleep.toString()}
            unit="hrs"
            score={sSleep}
            onPress={() => router.push('/stack/sleeps')}
          />
          <ItemRow
            icon="flame-outline"
            color="#2563EB"
            bg="#EEF2FF"
            title="Calories"
            value={avgKcal.toString()}
            unit="kcal"
            score={sKcal}
            onPress={() => router.push('/stack/nutrition')}
          />
          <ItemRow
            icon="heart-outline"
            color="#EF4444"
            bg="#FFE7E7"
            title="Resting heart rate"
            value={avgHR.toString()}
            unit="bpm"
            score={sHR}
            onPress={() => router.push('/stack/all-data')}
          />

          {/* Khuyến nghị */}
          <Text style={{ marginTop: 8, marginBottom: 6, fontWeight: '800', fontSize: 16 }}>Recommendations</Text>
          {advice.map((t, i) => (
            <Card key={i} style={{ padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#EFF2F6' }}>
              <Text style={{ color: '#111827' }}>• {t}</Text>
            </Card>
          ))}

          {/* Trạng thái tải / lỗi */}
          {loading && <Text style={{ color: theme.subtext, marginTop: 6 }}>Loading...</Text>}
          {!!error && <Text style={{ color: 'red', marginTop: 6 }}>{error}</Text>}
        </Container>
      </ScrollView>
    </Screen>
  );
}
