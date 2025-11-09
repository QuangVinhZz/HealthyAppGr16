import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Container, Screen } from '../../components/Ui';
import { api } from '../../lib/api';
import { theme } from '../../theme';

type Article = {
  id: string;
  title: string;
  image?: string;
  thumbnail?: string;
  category?: string;
  votes?: number;
  slug?: string; // 👈 thêm slug
};

const { width } = Dimensions.get('window');
const CARD_W = Math.min(280, width - 48);
const CARD_H = 360;

const normalize = (s?: string) => (s || '').trim().toLowerCase();

// 🔹 Blog Card
const BlogCard = ({ item, onPress }: { item: Article; onPress?: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.9}
    style={{
      width: CARD_W,
      minHeight: CARD_H,
      backgroundColor: '#fff',
      borderRadius: 24,
      padding: 14,
      marginRight: 14,
      borderWidth: 1,
      borderColor: '#EFF1F4',
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
      justifyContent: 'flex-start',
    }}
  >
    <Image
      source={{
        uri: item.image || item.thumbnail || 'https://picsum.photos/seed/health1/800/600',
      }}
      style={{
        width: '100%',
        height: 160,
        borderRadius: 18,
        resizeMode: 'cover',
      }}
    />
    {!!item.category && (
      <Text
        style={{
          color: theme.subtext,
          marginTop: 12,
          fontWeight: '600',
          fontSize: 14,
        }}
      >
        {item.category}
      </Text>
    )}
    <Text
      numberOfLines={3}
      style={{
        fontSize: 18,
        fontWeight: '900',
        marginTop: 6,
        lineHeight: 24,
        color: '#1F2937',
      }}
    >
      {item.title}
    </Text>

    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 'auto',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#E6FBFF',
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 16,
        }}
      >
        <Text style={{ fontSize: 14 }}>👍</Text>
        <Text
          style={{
            color: theme.primary,
            marginLeft: 6,
            fontWeight: '700',
          }}
        >
          {(item.votes ?? 0)} votes
        </Text>
      </View>
      <Text style={{ color: theme.subtext }}>Tell me more ›</Text>
    </View>
  </TouchableOpacity>
);

// 🔹 For You Pill
const ForYouPill = ({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress?: () => void;
}) => (
  <Pressable
    onPress={onPress}
    android_ripple={{ color: '#d7f7ff', borderless: false }}
    style={{
      width: 120,
      backgroundColor: '#EAFBFF',
      paddingVertical: 16,
      borderRadius: 20,
      alignItems: 'center',
      marginRight: 12,
    }}
  >
    <Image source={{ uri: icon }} style={{ width: 42, height: 42, marginBottom: 10 }} />
    <Text style={{ fontWeight: '700' }}>{label}</Text>
  </Pressable>
);

export default function Explore() {
  const [list, setList] = useState<Article[]>([]);
  const [q, setQ] = useState('');
  const router = useRouter();

  useEffect(() => {
    api.articles
      .list()
      .then((arr) => setList(arr || []))
      .catch(() => {});
  }, []);

  const openCategory = (cat: string) => {
    router.push(`../category/${encodeURIComponent(cat)}`);
  };

  // 🔹 Lọc realtime theo title + category
  const filtered = useMemo(() => {
    const key = normalize(q);
    if (!key) return list;
    return list.filter((it) => {
      const inTitle = normalize(it.title).includes(key);
      const inCat = normalize(it.category).includes(key);
      return inTitle || inCat;
    });
  }, [list, q]);

  // 🔹 Nhấn Enter → mở category nếu trùng
  const submitSearch = () => {
    const key = normalize(q);
    if (!key) return;
    const cats = ['nutrition', 'sport', 'running', 'yoga'];
    const match = cats.find((c) => c.startsWith(key));
    if (match) openCategory(match[0].toUpperCase() + match.slice(1));
  };

  return (
    <Screen>
      <ScrollView>
        <Container style={{ paddingVertical: 12 }}>
          {/* Search + Avatar */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#F2F4F7',
                borderRadius: 24,
                paddingHorizontal: 14,
                height: 44,
              }}
            >
              <Image
                source={{
                  uri: 'https://img.icons8.com/ios-glyphs/30/9CA3AF/search--v1.png',
                }}
                style={{
                  width: 18,
                  height: 18,
                  tintColor: '#9CA3AF',
                  marginRight: 8,
                }}
              />
              <TextInput
                value={q}
                onChangeText={setQ}
                onSubmitEditing={submitSearch}
                placeholder="Search by title or category"
                placeholderTextColor="#9CA3AF"
                style={{ flex: 1 }}
                returnKeyType="search"
              />
              {!!q && (
                <Pressable onPress={() => setQ('')}>
                  <Text style={{ color: '#9CA3AF', fontWeight: '700' }}>✕</Text>
                </Pressable>
              )}
            </View>
            <Image
              source={{ uri: 'https://cdn.24h.com.vn/upload/4-2022/images/2022-12-19/238006022_5119916614690811_3899681092719348092_n--1--1671431214-677-width1000height1500.jpg' }}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                marginLeft: 10,
              }}
            />
          </View>

          {/* For You */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 16,
            }}
          >
            <Text style={{ fontSize: 22, fontWeight: '800' }}>For you</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 10 }}
          >
            <ForYouPill
              icon="https://img.icons8.com/fluency/96/salad.png"
              label="Nutrition"
              onPress={() => openCategory('Nutrition')}
            />
            <ForYouPill
              icon="https://cdn-icons-png.flaticon.com/128/4645/4645268.png"
              label="Sport"
              onPress={() => openCategory('Sport')}
            />
            <ForYouPill
              icon="https://cdn-icons-png.flaticon.com/128/5479/5479005.png"
              label="Running"
              onPress={() => openCategory('Running')}
            />
            <ForYouPill
              icon="https://cdn-icons-png.flaticon.com/128/2647/2647625.png"
              label="Yoga"
              onPress={() => openCategory('Yoga')}
            />
          </ScrollView>

          {/* Newest Blogs */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 8,
            }}
          >
            <Text style={{ fontSize: 22, fontWeight: '800' }}>Newest blogs</Text>
            <Text style={{ color: theme.subtext }}>View more ›</Text>
          </View>

          <FlatList
            data={filtered}
            horizontal
            keyExtractor={(it) => String(it.id)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 10 }}
            renderItem={({ item }) => (
              <BlogCard
                item={item}
                onPress={() => router.push(`/blog/${item.slug || item.id}` as any)}
              />
            )}
            snapToInterval={CARD_W + 14}
            decelerationRate="fast"
            snapToAlignment="start"
          />

          {/* Collection */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 8,
              marginBottom: 8,
            }}
          >
            <Text style={{ fontSize: 22, fontWeight: '800' }}>Collection</Text>
            <Text style={{ color: theme.subtext }}>View more ›</Text>
          </View>
        </Container>
      </ScrollView>
    </Screen>
  );
}
