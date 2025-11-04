import React, { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Card, Container, Screen } from '../../components/Ui';
import { theme } from '../../theme';

const Ring = ({
  size = 220,
  stroke = 20,
  percent = 80,
  color = theme.primary,
  bg = '#EEF2F7',
  children,
}: {
  size?: number;
  stroke?: number;
  percent?: number;
  color?: string;
  bg?: string;
  children?: React.ReactNode;
}) => {
  // Vòng tròn nền + “overlay” trắng tạo cảm giác vòng còn lại
  const inner = size - stroke * 2;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* vòng trên (màu) */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: stroke,
          borderColor: color,
          borderRightColor: 'transparent',
          borderBottomColor: 'transparent',
          transform: [{ rotate: `${(percent / 100) * 270 - 135}deg` }], // xoay để tạo đầu vòng
          opacity: 0.9,
        }}
      />
      {/* che phần còn lại để trông như gauge 270deg */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: 'transparent',
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            position: 'absolute',
            bottom: -size * 0.15,
            left: -size * 0.15,
            right: -size * 0.15,
            height: size * 0.5,
            backgroundColor: '#fff',
            borderTopLeftRadius: size,
            borderTopRightRadius: size,
          }}
        />
      </View>

      {/* lõi trắng */}
      <View
        style={{
          width: inner,
          height: inner,
          borderRadius: inner / 2,
          backgroundColor: '#fff',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </View>
    </View>
  );
};

const MiniStat = ({
  tint,
  label,
  value,
  icon,
}: {
  tint: string;
  label: string;
  value: string;
  icon?: string;
}) => (
  <View style={{ flex: 1, alignItems: 'center' }}>
    <View
      style={{
        width: 78,
        height: 78,
        borderRadius: 39,
        borderWidth: 8,
        borderColor: '#F0F3F7',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          position: 'absolute',
          width: 78,
          height: 78,
          borderRadius: 39,
          borderWidth: 8,
          borderColor: tint,
          borderLeftColor: 'transparent',
          borderBottomColor: 'transparent',
          transform: [{ rotate: '30deg' }],
          opacity: 0.9,
        }}
      />
      <View
        style={{
          width: 58,
          height: 58,
          borderRadius: 29,
          backgroundColor: '#fff',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon ? (
          <Image source={{ uri: icon }} style={{ width: 28, height: 28, tintColor: tint }} />
        ) : null}
      </View>
    </View>
    <Text style={{ marginTop: 8, fontWeight: '700' }}>{value}</Text>
    <Text style={{ color: theme.subtext, marginTop: 2 }}>{label}</Text>
  </View>
);

export default function Steps() {
  const [tab, setTab] = useState<'today' | 'weekly' | 'monthly'>('weekly');

  return (
    <Screen>
      <ScrollView>
        <Container style={{ paddingVertical: 16 }}>
          {/* Title */}
          <Text style={{ textAlign: 'center', fontSize: 18, fontWeight: '800', marginBottom: 8 }}>
            Steps
          </Text>

          {/* Headline */}
          <Text style={{ textAlign: 'center', fontSize: 18, fontWeight: '800' }}>
            You have achieved{' '}
            <Text style={{ color: theme.primary }}>80%</Text>
            {' '}of your goal
          </Text>
          <Text style={{ textAlign: 'center', fontSize: 18, fontWeight: '800' }}>today</Text>

          {/* Big ring */}
          <View style={{ alignItems: 'center', marginTop: 10 }}>
            <Ring percent={80}>
              <Image
                source={{ uri: 'https://img.icons8.com/ios-filled/100/00B8D9/footsteps.png' }}
                style={{ width: 26, height: 26, tintColor: theme.primary, marginBottom: 6 }}
              />
              <Text style={{ fontSize: 28, fontWeight: '900' }}>11,857</Text>
              <Text style={{ color: theme.subtext, marginTop: 2 }}>Steps out of 18k</Text>
            </Ring>
          </View>

          {/* three mini stats */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 }}>
            <MiniStat tint="#F2994A" value="850 kcal" label="" icon={'https://img.icons8.com/ios-filled/50/ff7a00/fire-element.png'} />
            <MiniStat tint="#E37E86" value="5 km" label="" icon={'https://img.icons8.com/ios-filled/50/e37e86/marker.png'} />
            <MiniStat tint={theme.primary} value="120 min" label="" icon={'https://img.icons8.com/ios-filled/50/00b8d9/clock.png'} />
          </View>

          {/* Chart card */}
          <Card style={{ marginTop: 16, padding: 0, overflow: 'hidden' }}>
            <View
              style={{
                backgroundColor: theme.primary,
                borderRadius: 18,
                padding: 14,
              }}
            >
              {/* Segmented control */}
              <View
                style={{
                  flexDirection: 'row',
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  borderRadius: 20,
                  alignSelf: 'center',
                  padding: 4,
                }}
              >
                {(['today', 'weekly', 'monthly'] as const).map((k) => {
                  const active = tab === k;
                  return (
                    <TouchableOpacity
                      key={k}
                      onPress={() => setTab(k)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 16,
                        backgroundColor: active ? '#fff' : 'transparent',
                        marginHorizontal: 4,
                      }}
                    >
                      <Text style={{ color: active ? theme.primary : '#fff', fontWeight: '800' }}>
                        {k[0].toUpperCase() + k.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* fake chart lines để giống mock */}
              <View style={{ height: 180, marginTop: 14, justifyContent: 'flex-end' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', height: 150 }}>
                  {[60, 30, 120, 20, 140, 50, 130].map((h, i) => (
                    <View
                      key={i}
                      style={{
                        width: 12,
                        height: h,
                        backgroundColor: '#fff',
                        opacity: 0.9,
                        borderTopLeftRadius: 6,
                        borderTopRightRadius: 6,
                        alignSelf: 'flex-end',
                      }}
                    />
                  ))}
                </View>
                {/* labels weekdays */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                  {['Mo', 'Tu', 'We', 'Th', 'Fri', 'Sa', 'Su'].map((d) => (
                    <Text key={d} style={{ color: '#fff', opacity: 0.9 }}>
                      {d}
                    </Text>
                  ))}
                </View>
              </View>
            </View>
          </Card>
        </Container>
      </ScrollView>
    </Screen>
  );
}
