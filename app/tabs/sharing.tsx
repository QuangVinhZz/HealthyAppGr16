import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Card, Container, Screen } from '../../components/Ui';
import { theme } from '../../theme';

const RowCard = ({
  icon,
  tint,
  title,
  desc,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  title: string;
  desc: string;
}) => (
  <Card
    style={{
      marginTop: 12,
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: '#EFF2F6',
    }}
  >
    <View style={{ flexDirection: 'row' }}>
      {/* Icon bubble */}
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: `${tint}22`, // nhạt
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <Ionicons name={icon} size={22} color={tint} />
      </View>

      {/* Text */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '800', fontSize: 16, color: '#111827' }}>
          {title}
        </Text>
        <Text style={{ color: theme.subtext, marginTop: 6 }}>{desc}</Text>
      </View>
    </View>
  </Card>
);

export default function Sharing() {
  return (
    <Screen>
      <ScrollView>
        <Container style={{ paddingVertical: 12 }}>
          <Text style={{ fontSize: 28, fontWeight: '800' }}>Sharing</Text>

          <RowCard
            icon="stats-chart-outline"
            tint="#EF4444"
            title="Keep your health in check"
            desc="Keep loved ones informed about your condition."
          />

          <RowCard
            icon="shield-checkmark-outline"
            tint="#8B5CF6"
            title="Protect your privacy"
            desc="Share key conclusions. Stop anytime."
          />

          <RowCard
            icon="notifications-outline"
            tint="#0EA5E9"
            title="Notifications"
            desc="Get notified of updates to shared dashboards."
          />

          {/* Buttons */}
          <View style={{ marginTop: 18 }}>
            {/* Start sharing */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {}}
              style={{
                height: 54,
                borderRadius: 28,
                backgroundColor: theme.primary,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
              }}
            >
              <Ionicons name="share-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>
                Start sharing
              </Text>
            </TouchableOpacity>

            {/* Setting */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {}}
              style={{
                height: 54,
                borderRadius: 28,
                borderWidth: 1.2,
                borderColor: '#E5E7EB',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                marginTop: 12,
                backgroundColor: '#fff',
              }}
            >
              <Ionicons name="settings-outline" size={20} color="#111827" style={{ marginRight: 8 }} />
              <Text style={{ color: '#111827', fontWeight: '800', fontSize: 16 }}>
                Setting
              </Text>
            </TouchableOpacity>
          </View>
        </Container>
      </ScrollView>
    </Screen>
  );
}
