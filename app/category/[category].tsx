import React, { useEffect, useMemo, useState } from "react";
import { Image, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { Card, Container, Screen } from "../../components/Ui";
import { api } from "../../lib/api";
import { theme } from "../../theme";

// React Navigation
import { NavigationProp, RouteProp, useNavigation, useRoute } from "@react-navigation/native";

type Article = {
  id: string;
  type: "article";
  createdAt: string;
  title: string;
  image: string;
  category: string;
  votes: number;
  slug: string;
  content: string;
};

type RootStackParamList = {
  Category: { category: string };
  Article: { id: string };
};

const normalize = (s: string) => s.trim().toLowerCase();

export default function CategoryList() {
  const route = useRoute<RouteProp<RootStackParamList, "Category">>();
  const nav = useNavigation<NavigationProp<RootStackParamList>>();

  const category = route.params?.category ?? "";
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(opts?: { refresh?: boolean }) {
    try {
      if (opts?.refresh) setRefreshing(true); else setLoading(true);
      setError(null);

      const list = await api.articles.list();
      const arr: Article[] = Array.isArray(list) ? (list as Article[]) : [];
      setItems(arr);
    } catch {
      setError("Không tải được dữ liệu. Kéo để thử lại.");
    } finally {
      if (opts?.refresh) setRefreshing(false); else setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const data = useMemo(
    () => items.filter(x => normalize(x.category) === normalize(category)),
    [items, category]
  );

  const onBack = () => {
    // quay lại trang trước (Explore). Nếu không có history thì không làm gì.
    // (tuỳ cấu trúc app bạn có thể điều hướng fallback tới tab Home/Explore)
    // if (!(nav as any).canGoBack?.()) nav.navigate("Explore" as never); // nếu bạn có route Explore
    nav.goBack();
  };

  return (
    <Screen>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load({ refresh: true })} />}>
        <Container style={{ paddingVertical: 12 }}>
          {/* Header + back */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <Pressable
              onPress={onBack}
              hitSlop={12}
              style={{
                width: 36, height: 36, borderRadius: 18,
                alignItems: "center", justifyContent: "center",
                backgroundColor: "#EAF2FF", marginRight: 8
              }}>
              <Text style={{ color: theme.primary, fontSize: 18 }}>‹</Text>
            </Pressable>
            <Text style={{ fontSize: 20, fontWeight: "800" }}>{category}</Text>
          </View>

          {!!error && <Text style={{ color: "red", marginBottom: 8 }}>{error}</Text>}
          {loading && <Text style={{ color: theme.subtext }}>Loading...</Text>}
          {!loading && data.length === 0 && (
            <Text style={{ color: theme.subtext }}>Không có bài trong mục này.</Text>
          )}

          {data.map(item => (
            <Card key={item.id} style={{ padding: 0, overflow: "hidden", marginBottom: 12 }}>
              <Image source={{ uri: item.image }} style={{ width: "100%", height: 160 }} />
              <View style={{ padding: 12 }}>
                <Text style={{ color: theme.subtext, marginBottom: 4 }}>{item.category}</Text>
                <Text style={{ fontSize: 18, fontWeight: "800" }}>{item.title}</Text>
                <View style={{ flexDirection: "row", marginTop: 10, justifyContent: "space-between" }}>
                  <Text style={{
                    backgroundColor: "#E8FBF0", color: "#16A34A",
                    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999
                  }}>
                    👍 {item.votes} votes
                  </Text>
                  <Pressable onPress={() => nav.navigate("Article", { id: item.id })}>
                    <Text style={{ color: theme.primary, fontWeight: "700" }}>Tell me more ›</Text>
                  </Pressable>
                </View>
              </View>
            </Card>
          ))}
        </Container>
      </ScrollView>
    </Screen>
  );
}
