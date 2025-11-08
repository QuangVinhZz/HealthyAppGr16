import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { Image, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { Card, Container, Screen } from "../../components/Ui";
import { api } from "../../lib/api";
import { theme } from "../../theme";

const CURRENT_USER_ID = "2";

type Appt = { id: string; userId: string; time: string };

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function dd(date: Date) {
  const n = date.getDate();
  return (n < 10 ? "0" : "") + n;
}

export default function Cycle() {
  const [appointments, setAppointments] = useState<Appt[]>([]);
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
    } catch {
      setError("Không tải được dữ liệu. Kéo để thử lại.");
    } finally {
      if (opts?.refresh) setRefreshing(false);
      else setLoading(false);
    }
  }

  useEffect(() => { reloadAll(); }, []);

  // Kỳ tiếp theo
  const nextAppointment = useMemo(
    () =>
      appointments
        .filter((x) => x.userId === CURRENT_USER_ID)
        .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())[0],
    [appointments]
  );

  const daysLeft = nextAppointment
    ? Math.max(
        0,
        Math.ceil((startOfDay(new Date(nextAppointment.time)).getTime() - startOfDay().getTime()) / (1000 * 60 * 60 * 24))
      )
    : 12;

  // 7 ngày hiển thị (t2 -> CN) + đánh dấu hôm nay
  const week = useMemo(() => {
    // chuẩn hóa tuần: bắt đầu từ thứ 2
    const today = new Date();
    const dow = (today.getDay() + 6) % 7; // 0=Mon..6=Sun
    const monday = addDays(startOfDay(today), -dow);
    return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  }, []);

  const WEEK_ABBR = ["M", "T", "W", "T", "F", "S", "S"];
  const todayKey = startOfDay().getTime();

  return (
    <Screen>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => reloadAll({ refresh: true })} />}
      >
        <Container style={{ paddingVertical: 12 }}>
          {/* Header */}
          <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 6 }}>
            <Text style={{ fontSize: 18, fontWeight: "700" }}>Cycle tracking</Text>
          </View>

          {!!error && <Text style={{ textAlign: "center", color: "red", marginBottom: 8 }}>{error}</Text>}

          {/* Calendar bar with dates */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 14 }}>
            {week.map((d, i) => {
              const isToday = startOfDay(d).getTime() === todayKey;
              return (
                <View key={i} style={{ alignItems: "center", width: 42 }}>
                  <Text style={{ color: theme.subtext, fontSize: 12 }}>{WEEK_ABBR[i]}</Text>
                  <View
                    style={{
                      marginTop: 6,
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: isToday ? theme.primary : "#E9EEF5",
                      shadowColor: "#000",
                      shadowOpacity: isToday ? 0.15 : 0,
                      shadowRadius: 6,
                      elevation: isToday ? 3 : 0,
                    }}
                  >
                    <Text style={{ color: isToday ? "#fff" : "#2E3A59", fontWeight: "700" }}>{dd(d)}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Big circle info */}
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#BDF5F7",
              borderRadius: 999,
              width: 260,
              height: 260,
              alignSelf: "center",
              shadowColor: "#00C7CE",
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 4,
              marginBottom: 14,
            }}
          >
            <Text style={{ opacity: 0.8 }}>Period in</Text>
            <Text style={{ fontSize: 44, fontWeight: "900", color: theme.primary, marginVertical: 6 }}>
              {daysLeft} days
            </Text>
            <Text style={{ color: "#5D6B85" }}>Low chance of getting pregnant</Text>

            <Pressable
              onPress={() => {}}
              style={{
                marginTop: 16,
                backgroundColor: "#fff",
                borderRadius: 999,
                paddingVertical: 10,
                paddingHorizontal: 16,
                shadowColor: "#000",
                shadowOpacity: 0.08,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <Text style={{ color: theme.primary, fontWeight: "700" }}>Edit period dates</Text>
            </Pressable>
          </View>

          {/* Quick actions */}
          <Text style={{ marginTop: 16, fontWeight: "800" }}>
  How are you feeling today?
</Text>
<View style={{ flexDirection: 'row', marginTop: 8 }}>
  <Card style={{ flex: 1, marginRight: 8, alignItems: 'center', paddingVertical: 16}}>
  <MaterialCommunityIcons name="bookmark-plus-outline" size={28} color={theme.primary} style={{ marginBottom: 6 }} />
  <Text style={{ fontWeight: '700' , textAlign: "center"}}>Share your symptoms</Text>
  <Text style={{ color: theme.subtext, fontSize: 12, textAlign: 'center' }}>Log cramps, mood, flow…</Text>
</Card>

<Card style={{ flex: 1, marginLeft: 8, alignItems: 'center', paddingVertical: 16 }}>
  <MaterialCommunityIcons name="chart-pie" size={28} color="#9C6BFF" style={{ marginBottom: 6 }} />
  <Text style={{ fontWeight: '700' , textAlign: "center"}}>Here’s your daily insights</Text>
  <Text style={{ color: theme.subtext, fontSize: 12, textAlign: 'center' }}>Tips based on your cycle</Text>
</Card>

</View>


          {/* Menstrual health section */}
          <View style={{ marginTop: 18, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontSize: 16, fontWeight: "800" }}>Menstrual health</Text>
            <Pressable hitSlop={10}><Text style={{ color: theme.primary, fontWeight: "700" }}>View more ›</Text></Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
            {[1, 2].map((i) => (
              <View key={i} style={{ width: 220, marginRight: 12 }}>
                <Card style={{ padding: 0, overflow: "hidden" }}>
                  <Image
                    source={{ uri: i === 1
                      ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSb_c8sGahpDjcMjRbZHfZEHmePdccksZypeg&s"
                      : "https://cdn.nhathuoclongchau.com.vn/unsafe/800x0/cac_bien_phap_tranh_thai_an_toan_va_hieu_qua_ma_cac_cap_doi_can_biet_5_87e67eff32.jpg"
                    }}
                    style={{ width: "100%", height: 120 }}
                  />
                  <View style={{ padding: 12 }}>
                    <Text style={{ fontWeight: "700" }}>
                      {i === 1 ? "Craving sweets on your period?" : "Is birth control right for your health?"}
                    </Text>
                    <Text style={{ color: theme.subtext, marginTop: 4, fontSize: 12 }} numberOfLines={2}>
                      {i === 1
                        ? "Why it happens and what to do about it."
                        : "Understand pros and cons before deciding."}
                    </Text>
                  </View>
                </Card>
              </View>
            ))}
          </ScrollView>
        </Container>
      </ScrollView>
    </Screen>
  );
}
