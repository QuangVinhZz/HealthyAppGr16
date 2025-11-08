import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// Thư viện Picker đã cài
import { Picker } from '@react-native-picker/picker';
import { Card, Container, Screen } from '../../components/Ui';
import { api } from '../../lib/api';
import { theme } from '../../theme';

const CURRENT_USER_ID = '2';
const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DUMMY_CHART_HEIGHTS = [110, 80, 95, 100, 85, 120, 40];

const pad = (num: number) => (num < 10 ? '0' + num : String(num));
const HOURS = Array.from({ length: 24 }, (_, i) => pad(i));
const MINUTES = Array.from({ length: 60 }, (_, i) => pad(i));

// [HÀM] Tính tổng thời gian ngủ (Giữ nguyên)
const calculateTotalSleep = (bedHour: string, bedMin: string, wakeHour: string, wakeMin: string): number => {
  const bedTime = new Date();
  bedTime.setHours(parseInt(bedHour, 10), parseInt(bedMin, 10), 0, 0);

  const wakeTime = new Date();
  wakeTime.setHours(parseInt(wakeHour, 10), parseInt(wakeMin, 10), 0, 0);

  if (wakeTime.getTime() < bedTime.getTime()) {
    wakeTime.setDate(wakeTime.getDate() + 1);
  }

  const diffMs = wakeTime.getTime() - bedTime.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return parseFloat(diffHours.toFixed(2));
};

// [HÀM] Lấy 7 ngày gần nhất cho biểu đồ (Giữ nguyên)
const getChartData = (metrics: any[]) => {
  const data = [];
  const today = new Date("2025-11-09T12:00:00Z"); // Giả lập hôm nay
  
  for (let i = 6; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    const dateString = day.toISOString().split('T')[0];
    
    const dayIndex = (day.getDay() + 6) % 7;
    
    const metric = metrics.find(m => m.date === dateString);
    const sleep = metric?.sleep ?? 0;
    
    data.push({
      date: dateString,
      dayLabel: DAYS_OF_WEEK[dayIndex],
      sleep: sleep,
      height: sleep ? Math.max(20, (sleep / 10) * 140) : 0,
      isToday: i === 0,
    });
  }
  return data;
};

export default function Sleep() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'Today' | 'Weekly' | 'Monthly'>('Weekly');

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [bedtimeHour, setBedtimeHour] = useState('22');
  const [bedtimeMinute, setBedtimeMinute] = useState('00');
  const [wakeUpHour, setWakeUpHour] = useState('07');
  const [wakeUpMinute, setWakeUpMinute] = useState('30');
  
  // Các hàm reloadAll, useEffect, handleScheduleSave (Giữ nguyên)
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

  const handleScheduleSave = async () => {
    setIsSaving(true);
    const totalSleep = calculateTotalSleep(bedtimeHour, bedtimeMinute, wakeUpHour, wakeUpMinute);

    try {
      await api.metrics.createOrUpdateForToday({
        userId: CURRENT_USER_ID,
        sleep: totalSleep,
      });
      await reloadAll({ refresh: false });
    } catch (err) {
      setError('Không thể lưu lịch trình.');
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  // --- 👈 [CẬP NHẬT] Phần tính toán dữ liệu ---
  // Bỏ hoàn toàn logic tính avgSleep (trung bình)
  
  // Giả lập hôm nay
  const todayDate = "2025-11-09"; 
  
  // Tìm metric của ngày hôm nay từ list data đã load
  const todayMetric = metrics.find(m => m.date === todayDate);
  const todaySleepValue = todayMetric ? todayMetric.sleep : 0; // vd: 8.5 (nếu đã lưu)

  // Định dạng text cho header (vd: "8h 30min")
  const todayHours = Math.floor(todaySleepValue);
  const todayMinutes = Math.round((todaySleepValue % 1) * 60);
  const todaySleepText = `${todayHours}h ${todayMinutes}min`;

  // Tính Sleep rate cho NGÀY HÔM NAY
  const todaySleepRate = Math.round((todaySleepValue / 8) * 100);

  // Lấy dữ liệu 7 ngày cho biểu đồ (Giữ nguyên)
  const chartData = loading ? DUMMY_CHART_HEIGHTS.map(h => ({ height: h, isToday: false, dayLabel: '' })) : getChartData(metrics);


  return (
    <Screen style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => reloadAll({ refresh: true })}
          />
        }
      >
        <Container>
          {/* 👈 [CẬP NHẬT] Tiêu đề với thời gian CỦA HÔM NAY */}
          <View>
            <Text style={{ fontSize: 18, fontWeight: '500', textAlign:"center", opacity: 0.8 }}>Your sleep time in a day today</Text>
            
          </View>

          {/* Period Selector (giữ nguyên theo code của bạn) */}
          <View style={styles.periodContainer}>
            {['Weekly'].map(p => (
              <TouchableOpacity
                key={p}
                style={[styles.periodButton, period === p && styles.periodButtonActive]}
                onPress={() => setPeriod(p as any)}
              >
                <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {(loading || refreshing) && !isSaving && (
            <Text style={styles.loadingText}>Loading data...</Text>
          )}
          {!!error && <Text style={styles.errorText}>{error}</Text>}

          {/* [CẬP NHẬT] Chart (Giữ nguyên logic) */}
          <View style={styles.chartContainer}>
            {chartData.map((data, i) => (
              <View key={i} style={styles.barWrapper}>
                <View style={styles.barBackground}>
                  {data.height > 0 && (
                    <View
                      style={[
                        styles.barForeground,
                        { height: data.height },
                        data.isToday ? styles.barToday : styles.barOtherDay,
                      ]}
                    />
                  )}
                </View>
                <Text style={styles.dayLabel}>{data.dayLabel}</Text>
              </View>
            ))}
          </View>
          
          {/* 👈 [CẬP NHẬT] Info Cards */}
          <View style={styles.infoCardsContainer}>
            <Card style={styles.infoCard}>
                <Text style={styles.cardTitle}>🌟 Sleep rate</Text>
                {/* Hiển thị Sleep rate CỦA HÔM NAY */}
                <Text style={styles.cardValue}>{loading ? '--' : `${todaySleepRate}%`}</Text>
            </Card>
            <Card style={styles.infoCard}>
                <Text style={styles.cardTitle}>😴 Deepsleep</Text>
                {/* 👈 Hiển thị TỔNG THỜI GIAN NGỦ HÔM NAY (theo yêu cầu) */}
                <Text style={styles.cardValue}>{loading ? '--' : todaySleepText}</Text>
            </Card>
          </View>

          {/* Schedule (Giữ nguyên) */}
          <View style={styles.scheduleHeader}>
            <Text style={styles.sectionTitle}>Set your schedule</Text>
            <TouchableOpacity 
              onPress={isEditing ? handleScheduleSave : () => setIsEditing(true)}
              disabled={isSaving}
            >
                <Text style={styles.editText}>
                  {isEditing ? (isSaving ? 'Saving...' : 'Done') : 'Edit'}
                </Text>
            </TouchableOpacity>
          </View>

          {isSaving && (
            <View style={styles.savingOverlay}>
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
          )}

          <View style={[styles.scheduleCardsContainer, isSaving && { opacity: 0.5 }]}>
            {/* Thẻ Bedtime (Giữ nguyên) */}
            <Card style={[styles.scheduleCard, { backgroundColor: '#FFE6E0' }]}>
              <Text style={styles.scheduleCardLabel}>🛏️ Bedtime</Text>
              {isEditing ? (
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={bedtimeHour}
                    onValueChange={(itemValue) => setBedtimeHour(itemValue)}
                    style={styles.picker}
                    mode="dropdown"
                  >
                    {HOURS.map(h => <Picker.Item key={`bh-${h}`} label={h} value={h} />)}
                  </Picker>
                  <Picker
                    selectedValue={bedtimeMinute}
                    onValueChange={(itemValue) => setBedtimeMinute(itemValue)}
                    style={styles.picker}
                    mode="dropdown"
                  >
                    {MINUTES.map(m => <Picker.Item key={`bm-${m}`} label={m} value={m} />)}
                  </Picker>
                </View>
              ) : (
                <Text style={styles.scheduleCardTime}>{bedtimeHour}:{bedtimeMinute}</Text>
              )}
            </Card>
            
            {/* Thẻ Wake up (Giữ nguyên) */}
            <Card style={[styles.scheduleCard, { backgroundColor: '#FFE9C7' }]}>
              <Text style={styles.scheduleCardLabel}>⏰ Wake up</Text>
               {isEditing ? (
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={wakeUpHour}
                    onValueChange={(itemValue) => setWakeUpHour(itemValue)}
                    style={styles.picker}
                    mode="dropdown"
                  >
                    {HOURS.map(h => <Picker.Item key={`wh-${h}`} label={h} value={h} />)}
                  </Picker>
                  <Picker
                    selectedValue={wakeUpMinute}
                    onValueChange={(itemValue) => setWakeUpMinute(itemValue)}
                    style={styles.picker}
                    mode="dropdown"
                  >
                    {MINUTES.map(m => <Picker.Item key={`wm-${m}`} label={m} value={m} />)}
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

// --- Styles (Giữ nguyên) ---
const styles = StyleSheet.create({
  //...
  screen: {
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    paddingVertical: 16,
  },
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
  periodButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  periodButtonActive: {
    backgroundColor: theme.primary,
  },
  periodText: {
    fontWeight: '600',
    color: '#888',
  },
  periodTextActive: {
    color: '#FFFFFF',
  },
  loadingText: {
    textAlign: 'center',
    color: theme.subtext,
    marginVertical: 20,
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    marginVertical: 20,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    paddingHorizontal: 8,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  barBackground: {
    width: 30,
    height: 140,
    backgroundColor: '#F0F4F8',
    borderRadius: 15,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barForeground: {
    width: '100%',
    borderRadius: 15,
  },
  barToday: {
    backgroundColor: theme.primary, // Màu đậm
  },
  barOtherDay: {
    backgroundColor: '#A8D5FF', // Màu nhạt
  },
  dayLabel: {
    marginTop: 8,
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  infoCardsContainer: {
    flexDirection: 'row',
    marginTop: 24,
    marginHorizontal: -8,
  },
  infoCard: {
    flex: 1,
    marginHorizontal: 8,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#F8F9FA'
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  editText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.primary,
  },
  savingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '40%',
    alignItems: 'center',
    zIndex: 10,
  },
  scheduleCardsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginHorizontal: -8,
  },
  scheduleCard: {
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 20,
    minHeight: 120, 
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  scheduleCardLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  scheduleCardTime: {
    fontSize: 24, 
    fontWeight: 'bold',
    color: '#000',
  },
  pickerContainer: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -10,
  },
  picker: {
    flex: 1,
    height: 50,
  },
});