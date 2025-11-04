import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Card, Container, Screen } from '../../components/Ui';
import { theme } from '../../theme';

type Item = {
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;          // màu chính (đậm)
  bg: string;            // nền nhạt
  title: string;
  value: string;         // phần số
  unit?: string;         // phần đơn vị/chu thích nhỏ
};

const Row = ({ it }: { it: Item }) => (
  <Card
    style={{
      marginBottom: 12,
      borderRadius: 18,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: '#EFF2F6',
    }}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {/* Icon bubble */}
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          backgroundColor: it.bg,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 14,
        }}
      >
        <Ionicons name={it.icon} size={26} color={it.tint} />
      </View>

      {/* Texts */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '800', color: '#111827', marginBottom: 6 }}>
          {it.title}
        </Text>
        <Text style={{ fontSize: 22, fontWeight: '900', color: '#1F2937' }}>
          {it.value}
          {!!it.unit && (
            <Text style={{ color: theme.subtext, fontSize: 12, fontWeight: '600' }}>
              {' '}{it.unit}
            </Text>
          )}
        </Text>
      </View>

      {/* Chevron */}
      <Ionicons name="chevron-forward" size={18} color={theme.subtext} />
    </View>
  </Card>
);

export default function AllData() {
  const items: Item[] = [
    { icon: 'disc-outline',       tint: '#06B6D4', bg: '#E6FBFF', title: 'Double Support Time', value: '29.7', unit: '%' },
    { icon: 'footsteps-outline',  tint: '#F59E0B', bg: '#FFF4E6', title: 'Steps',               value: '11,875', unit: 'steps' },
    { icon: 'calendar-outline',   tint: '#8B5CF6', bg: '#F3E8FF', title: 'Cycle tracking',      value: '08', unit: 'April' },
    { icon: 'bed-outline',        tint: '#0EA5E9', bg: '#EAF6FF', title: 'Sleep',               value: '7 h 31', unit: 'min' },
    { icon: 'heart-outline',      tint: '#EF4444', bg: '#FFECEC', title: 'Heart',               value: '68', unit: 'BPM' },
    { icon: 'flame-outline',      tint: '#2563EB', bg: '#EEF2FF', title: 'Burned calories',     value: '850', unit: 'kcal' },
    { icon: 'accessibility-outline', tint: '#06B6D4', bg: '#E6FBFF', title: 'Body mass index', value: '18,69', unit: 'BMI' },
  ];

  return (
    <Screen>
      <ScrollView>
        <Container style={{ paddingVertical: 12 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 10 }}>
            All Health Data
          </Text>

          {items.map((it, idx) => (
            <Row key={idx} it={it} />
          ))}
        </Container>
      </ScrollView>
    </Screen>
  );
}
