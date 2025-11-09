// @ts-nocheck
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Card, Container, Screen } from '../../components/Ui';
import { api } from '../../lib/api';
import { theme } from '../../theme';

const CURRENT_USER_ID = '2';
const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
const HOURS = Array.from({ length: 24 }, (_, i) => pad(i));
const MINUTES = Array.from({ length: 60 }, (_, i) => pad(i));

/** YYYY-MM-DD theo local timezone */
function todayStr(d = new Date()) {
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60_000);
  return local.toISOString().slice(0, 10);
}

/** Dữ liệu 7 ngày gần nhất (ưu tiên giá trị tạm lưu trong phiên cho hôm nay) */
function buildChartData(metrics: any[]) {
  const data: { date: string; dayLabel: string; height: number; isToday: boolean }[] = [];
  const now = new Date();
  const sessionToday = api.metrics.getTodaySleep();
  const tStr = todayStr(now);

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const ymd = todayStr(d);
    const dow = (d.getDay() + 6) % 7; // 0=Mon ... 6=Sun

    let sleep = 0;
    if (ymd === tStr && sessionToday != null) {
      sleep = sessionToday;
    } else {
      const m = metrics.find((x) => x.date === ymd);
      sleep = Number(m?.sleep ?? 0);
    }

    data.push({
      date: ymd,
      dayLabel: DAYS_OF_WEEK[dow],
      height: sleep ? Math.max(16, (sleep / 10) * 140) : 0,
      isToday: ymd === tStr,
    });
  }
  return data;
}

export default function Sleep() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'Weekly'>('Weekly');

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [bedtimeHour, setBedtimeHour] = useState('22');
  const [bedtimeMinute, setBedtimeMinute] = useState('00');
  const [wakeUpHour, setWakeUpHour] = useState('07');
  const [wakeUpMinute, setWakeUpMinute] = useState('30');

  async function reloadAll(opts?: { refresh?: boolean }) {
    try {
      opts?.refresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      const list = await api.metrics.list({ userId: CURRENT_USER_ID, order: 'desc' });
      setMetrics(Array.isArray(list) ? list : []);
    } catch {
      setError('Không tải được dữ liệu. Kéo để thử lại.');
    } finally {
      opts?.refresh ? setRefreshing(false) : setLoading(false);
    }
  }

  useEffect(() => { reloadAll(); }, []);

  /** Save schedule -> tính giờ ngủ -> lưu tạm trong phiên -> refresh UI */
  const handleScheduleSave = async () => {
    try {
      setIsSaving(true);
      const hours = api.metrics.computeSleepHours(
        bedtimeHour, bedtimeMinute, wakeUpHour, wakeUpMinute
      );
      api.metrics.saveTodaySleep(hours); // lưu tạm session, không gọi MockAPI
      // Không cần reloadAll; nhưng nếu muốn sync biểu đồ, ta vẫn gọi nhẹ
      await reloadAll({ refresh: false });
    } catch {
      setError('Không thể lưu lịch trình.');
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  // ---------- Tính toán hiển thị hôm nay ----------
  const tStr = todayStr();
  const sessionToday = api.metrics.getTodaySleep();
  const serverToday = useMemo(
    () => metrics.find((m) => m.date === tStr) || null,
    [metrics, tStr]
  );
  const todaySleepValue: number = sessionToday ?? Number(serverToday?.sleep ?? 0);
  const todaySleepRate = Math.round((todaySleepValue / 8) * 100);
  const todayHours = Math.floor(todaySleepValue);
  const todayMinutes = Math.round((todaySleepValue % 1) * 60);
  const todaySleepText = `${todayHours}h ${todayMinutes}min`;

  // ---------- Data biểu đồ ----------
  const chartData = useMemo(() => buildChartData(metrics), [metrics, sessionToday]);

  return (
    <Screen style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => reloadAll({ refresh: true })} />
        }
      >
        <Container>
          <View>
            <Text style={{ fontSize: 18, fontWeight: '500', textAlign: 'center', opacity: 0.8 }}>
              Your sleep time today
            </Text>
          </View>

          <View style={styles.periodContainer}>
            <TouchableOpacity
              style={[styles.periodButton, styles.periodButtonActive]}
              onPress={() => setPeriod('Weekly')}
            >
              <Text style={[styles.periodText, styles.periodTextActive]}>Weekly</Text>
            </TouchableOpacity>
          </View>

          {(loading || refreshing) && !isSaving && (
            <Text style={styles.loadingText}>Loading data...</Text>
          )}
          {!!error && <Text style={styles.errorText}>{error}</Text>}

          {/* Chart */}
          <View style={styles.chartContainer}>
            {chartData.map((d, idx) => (
              <View key={idx} style={styles.barWrapper}>
                <View style={styles.barBackground}>
                  {!!d.height && (
                    <View
                      style={[
                        styles.barForeground,
                        { height: d.height },
                        d.isToday ? styles.barToday : styles.barOtherDay,
                      ]}
                    />
                  )}
                </View>
                <Text style={styles.dayLabel}>{d.dayLabel}</Text>
              </View>
            ))}
          </View>

          {/* Info cards */}
          <View style={styles.infoCardsContainer}>
            <Card style={styles.infoCard}>
              <Text style={styles.cardTitle}>🌟 Sleep rate</Text>
              <Text style={styles.cardValue}>{loading ? '--' : `${todaySleepRate}%`}</Text>
            </Card>
            <Card style={styles.infoCard}>
              <Text style={styles.cardTitle}>😴 Deepsleep</Text>
              <Text style={styles.cardValue}>{loading ? '--' : todaySleepText}</Text>
            </Card>
          </View>

          {/* Schedule */}
          <View style={styles.scheduleHeader}>
            <Text style={styles.sectionTitle}>Set your schedule</Text>
            <TouchableOpacity onPress={isEditing ? handleScheduleSave : () => setIsEditing(true)} disabled={isSaving}>
              <Text style={styles.editText}>{isEditing ? (isSaving ? 'Saving...' : 'Done') : 'Edit'}</Text>
            </TouchableOpacity>
          </View>

          {isSaving && (
            <View style={styles.savingOverlay}>
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
          )}

          <View style={[styles.scheduleCardsContainer, isSaving && { opacity: 0.5 }]}>
            <Card style={[styles.scheduleCard, { backgroundColor: '#FFE6E0' }]}>
              <Text style={styles.scheduleCardLabel}>🛏️ Bedtime</Text>
              {isEditing ? (
                <View style={styles.pickerContainer}>
                  <Picker selectedValue={bedtimeHour} onValueChange={setBedtimeHour} style={styles.picker} mode="dropdown">
                    {HOURS.map((h) => <Picker.Item key={`bh-${h}`} label={h} value={h} />)}
                  </Picker>
                  <Picker selectedValue={bedtimeMinute} onValueChange={setBedtimeMinute} style={styles.picker} mode="dropdown">
                    {MINUTES.map((m) => <Picker.Item key={`bm-${m}`} label={m} value={m} />)}
                  </Picker>
                </View>
              ) : (
                <Text style={styles.scheduleCardTime}>{bedtimeHour}:{bedtimeMinute}</Text>
              )}
            </Card>

            <Card style={[styles.scheduleCard, { backgroundColor: '#FFE9C7' }]}>
              <Text style={styles.scheduleCardLabel}>⏰ Wake up</Text>
              {isEditing ? (
                <View style={styles.pickerContainer}>
                  <Picker selectedValue={wakeUpHour} onValueChange={setWakeUpHour} style={styles.picker} mode="dropdown">
                    {HOURS.map((h) => <Picker.Item key={`wh-${h}`} label={h} value={h} />)}
                  </Picker>
                  <Picker selectedValue={wakeUpMinute} onValueChange={setWakeUpMinute} style={styles.picker} mode="dropdown">
                    {MINUTES.map((m) => <Picker.Item key={`wm-${m}`} label={m} value={m} />)}
                  </Picker>
                </View>
              ) : (
                <Text style={styles.scheduleCardTime}>{wakeUpHour}:{wakeUpMinute}</Text>
              )}
            </Card>
          </View>
        </Container>
      </ScrollView>
    </Screen>
  );
}

/* -------------------- Styles -------------------- */
const styles = StyleSheet.create({
  screen: { backgroundColor: '#FFFFFF' },
  scrollContainer: { paddingVertical: 16 },

  periodContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
    backgroundColor: '#F0F4F8',
    borderRadius: 20,
    alignSelf: 'center',
    padding: 4,
  },
  periodButton: { paddingVertical: 8, paddingHorizontal: 24, borderRadius: 16 },
  periodButtonActive: { backgroundColor: theme.primary },
  periodText: { fontWeight: '600', color: '#888' },
  periodTextActive: { color: '#FFFFFF' },

  loadingText: { textAlign: 'center', color: theme.subtext, marginVertical: 20 },
  errorText: { textAlign: 'center', color: 'red', marginVertical: 20 },

  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    paddingHorizontal: 8,
  },
  barWrapper: { flex: 1, alignItems: 'center' },
  barBackground: {
    width: 30, height: 140, backgroundColor: '#F0F4F8',
    borderRadius: 15, justifyContent: 'flex-end', overflow: 'hidden',
  },
  barForeground: { width: '100%', borderRadius: 15 },
  barToday: { backgroundColor: theme.primary },
  barOtherDay: { backgroundColor: '#A8D5FF' },
  dayLabel: { marginTop: 8, fontSize: 12, color: '#888', fontWeight: '500' },

  infoCardsContainer: { flexDirection: 'row', marginTop: 24, marginHorizontal: -8 },
  infoCard: { flex: 1, marginHorizontal: 8, padding: 16, borderRadius: 20, backgroundColor: '#F8F9FA' },
  cardTitle: { fontSize: 14, fontWeight: '500', color: '#555', marginBottom: 8 },
  cardValue: { fontSize: 18, fontWeight: 'bold', color: '#000' },

  scheduleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 32 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold' },
  editText: { fontSize: 16, fontWeight: '600', color: theme.primary },

  savingOverlay: { position: 'absolute', left: 0, right: 0, top: '40%', alignItems: 'center', zIndex: 10 },

  scheduleCardsContainer: { flexDirection: 'row', marginTop: 16, marginHorizontal: -8 },
  scheduleCard: {
    flex: 1, marginHorizontal: 8, paddingVertical: 16, paddingHorizontal: 8,
    borderRadius: 20, minHeight: 120, justifyContent: 'flex-start', alignItems: 'center',
  },
  scheduleCardLabel: { fontSize: 14, fontWeight: '500', color: '#333', marginBottom: 8 },
  scheduleCardTime: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  pickerContainer: { flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'center', marginTop: -10 },
  picker: { flex: 1, height: 50 },
});
