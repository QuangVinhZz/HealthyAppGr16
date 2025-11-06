import { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Screen, Container } from '../../components/Ui';
import { api } from '../../lib/api';
import { theme } from '../../theme';

// khớp schema mới
type Article = {
  id: string;
  type: 'article';
  title: string;
  image?: string;
  category?: string;
  votes?: number;
  slug?: string;
  content?: string;
};

export default function BlogDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<Article | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    (async () => {
      try {
        setError(null);
        setData(null);

        // 1) thử lấy theo ID
        let article: Article | null = null;
        try {
          article = await api.articles.get(String(id));
        } catch {
          // 2) nếu không phải id hợp lệ, thử coi như slug
          article = await api.articles.getBySlug?.(String(id)) ?? null;
        }

        if (!cancelled) {
          if (!article) setError('Không tìm thấy bài viết');
          else setData(article);
        }
      } catch {
        if (!cancelled) setError('Không tải được bài viết');
      }
    })();

    return () => { cancelled = true; };
  }, [id]);

  if (error) {
    return (
      <Screen>
        <Container style={{ paddingTop: 40 }}>
          <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>
          <TouchableOpacity
            onPress={() => {
              // reload lại effect
              setError(null);
              setData(null);
            }}
            style={{ backgroundColor: theme.primary, padding: 12, borderRadius: 10, alignSelf: 'flex-start' }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Try again</Text>
          </TouchableOpacity>
        </Container>
      </Screen>
    );
  }

  if (!data) {
    // skeleton ngắn gọn
    return (
      <Screen>
        <View style={{ width: '100%', height: 220, backgroundColor: '#eee' }} />
        <Container>
          <View style={{ width: '70%', height: 28, backgroundColor: '#eee', borderRadius: 6, marginTop: 16 }} />
          <View style={{ width: '50%', height: 16, backgroundColor: '#eee', borderRadius: 6, marginTop: 10 }} />
        </Container>
      </Screen>
    );
  }

  const cover = data.image || 'https://picsum.photos/seed/placeholder/900/600';
  const votes = Number(data.votes ?? 0);

  return (
    <Screen>
      <Stack.Screen options={{ title: data.title || 'Blog' }} />

      <ScrollView>
        <Image source={{ uri: cover }} style={{ width: '100%', height: 240, resizeMode: 'cover' }} />

        <Container style={{ paddingTop: 16, paddingBottom: 28 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            {!!data.category && (
              <View style={{ backgroundColor: '#E6FBFF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14 }}>
                <Text style={{ color: theme.primary, fontWeight: '700' }}>{data.category}</Text>
              </View>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 12 }}>
              <Text>👍</Text>
              <Text style={{ marginLeft: 6, color: theme.subtext }}>{votes} votes</Text>
            </View>
          </View>

          <Text style={{ fontSize: 24, lineHeight: 30, fontWeight: '900', color: '#111827' }}>
            {data.title}
          </Text>

          <View style={{ flexDirection: 'row', marginTop: 14 }}>
            <TouchableOpacity
              onPress={() => {
                if (liking) return;
                setLiking(true);
                setData({ ...data, votes: votes + 1 }); // demo tăng vote local
                setTimeout(() => setLiking(false), 400);
              }}
              style={{ backgroundColor: theme.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, marginRight: 10 }}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>{liking ? 'Liked!' : 'Like'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {}}
              style={{ borderWidth: 1.2, borderColor: '#E5E7EB', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 }}>
              <Text style={{ color: theme.text, fontWeight: '700' }}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: 18 }}>
            <Text style={{ color: theme.subtext, fontSize: 16, lineHeight: 24 }}>
              {data.content?.trim() || 'No content available'}
            </Text>
          </View>
        </Container>
      </ScrollView>
    </Screen>
  );
}
