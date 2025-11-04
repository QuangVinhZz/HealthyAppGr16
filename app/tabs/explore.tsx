import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
};

const { width } = Dimensions.get('window');
const CARD_W = Math.min(280, width - 48);
const CARD_H = 360;

// Card blog giữ kích thước ổn định
const BlogCard = ({ item }: { item: Article }) => (
  <TouchableOpacity
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
      source={{ uri: item.image || item.thumbnail || 'https://picsum.photos/seed/health1/800/600' }}
      style={{ width: '100%', height: 160, borderRadius: 18, resizeMode: 'cover' }}
    />
    {!!item.category && (
      <Text style={{ color: theme.subtext, marginTop: 12, fontWeight: '600', fontSize: 14 }}>
        {item.category}
      </Text>
    )}
    <Text
      numberOfLines={3}
      style={{ fontSize: 18, fontWeight: '900', marginTop: 6, lineHeight: 24, color: '#1F2937' }}>
      {item.title}
    </Text>

    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#E6FBFF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 }}>
        <Text style={{ fontSize: 14 }}>👍</Text>
        <Text style={{ color: theme.primary, marginLeft: 6, fontWeight: '700' }}>
          {(item.votes ?? 0)} votes
        </Text>
      </View>
      <Text style={{ color: theme.subtext }}>Tell me more ›</Text>
    </View>
  </TouchableOpacity>
);

// Pill “For you”
const ForYouPill = ({ icon, label }: { icon: string; label: string }) => (
  <View style={{ width: 120, backgroundColor: '#EAFBFF', paddingVertical: 16, borderRadius: 20, alignItems: 'center', marginRight: 12 }}>
    <Image source={{ uri: icon }} style={{ width: 42, height: 42, marginBottom: 10 }} />
    <Text style={{ fontWeight: '700' }}>{label}</Text>
  </View>
);

export default function Explore() {
  const [list, setList] = useState<Article[]>([]);

  useEffect(() => {
    api.articles.list().then((arr) => setList(arr || [])).catch(() => {});
  }, []);

  return (
    <Screen>
      <ScrollView>
        <Container style={{ paddingVertical: 12 }}>
          {/* Search + avatar */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F4F7', borderRadius: 24, paddingHorizontal: 14, height: 44 }}>
              <Image source={{ uri: 'https://img.icons8.com/ios-glyphs/30/9CA3AF/search--v1.png' }}
                     style={{ width: 18, height: 18, tintColor: '#9CA3AF', marginRight: 8 }} />
              <TextInput placeholder="Search topic" placeholderTextColor="#9CA3AF" style={{ flex: 1 }} />
            </View>
            <Image source={{ uri: 'https://i.pravatar.cc/100?img=12' }} style={{ width: 36, height: 36, borderRadius: 18, marginLeft: 10 }} />
          </View>

          {/* For you */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
            <Text style={{ fontSize: 22, fontWeight: '800' }}>For you</Text>
            <Text style={{ color: theme.subtext }}>•••</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 10 }}>
            <ForYouPill icon="https://img.icons8.com/fluency/96/salad.png" label="Nutrition" />
            <ForYouPill icon="https://cdn-icons-png.flaticon.com/128/4645/4645268.png" label="Sports" />
            <ForYouPill icon="https://cdn-icons-png.flaticon.com/128/5479/5479005.png" label="Running" />
            <ForYouPill icon="https://cdn-icons-png.flaticon.com/128/2647/2647625.png" label="Yoga" />
          </ScrollView>

          {/* Newest blogs */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <Text style={{ fontSize: 22, fontWeight: '800' }}>Newest blogs</Text>
            <Text style={{ color: theme.subtext }}>View more ›</Text>
          </View>

          <FlatList
            data={list}
            horizontal
            keyExtractor={(it) => String(it.id)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 10 }}
            renderItem={({ item }) => <BlogCard item={item} />}
            snapToInterval={CARD_W + 14}
            decelerationRate="fast"
            snapToAlignment="start"
          />

          {/* Collection header (placeholder) */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 8 }}>
            <Text style={{ fontSize: 22, fontWeight: '800' }}>Collection</Text>
            <Text style={{ color: theme.subtext }}>View more ›</Text>
          </View>
          {/* Bạn có thể render thêm grid “collection” ở đây nếu muốn */}
        </Container>
      </ScrollView>
    </Screen>
  );
}
