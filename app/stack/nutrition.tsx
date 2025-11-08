// @ts-nocheck
import { useLocalSearchParams, useRouter } from 'expo-router'; // 👈 [BƯỚC 1] Dùng hook
import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Progress from 'react-native-progress';
import { Container, Screen } from '../../components/Ui';
import { theme } from '../../theme';

// --- Giả lập mục tiêu hàng ngày ---
const GOAL_KCAL = 1300;
const GOAL_FAT = 60; // gam
const GOAL_PROTEIN = 100; // gam
const GOAL_CARBS = 150; // gam

// Component MacroBar (Không thay đổi)
const MacroBar = ({ icon, name, value, goal, color }) => (
  <View style={styles.macroRow}>
    <View style={styles.macroInfo}>
      <Text style={styles.macroIcon}>{icon}</Text>
      <Text style={styles.macroName}>{name}</Text>
    </View>
    <View style={styles.macroProgress}>
      <Progress.Bar
        progress={value / goal}
        width={null}
        height={8}
        color={color}
        unfilledColor="#F0F4F8"
        borderWidth={0}
        borderRadius={8}
        style={{ flex: 1 }}
      />
    </View>
    <Text style={styles.macroValue}>{`${Math.round(value)}g / ${goal}g`}</Text>
  </View>
);

// 👈 [BƯỚC 2] Xóa { navigation, route }
export default function NutritionScreen() {
  // 👈 [BƯỚC 3] Lấy params và router bằng hook
  const params = useLocalSearchParams();
  const router = useRouter();

  const [consumedMeals, setConsumedMeals] = useState([
    { name: 'Bữa sáng', kcal: 350, fat: 12, protein: 20, carbs: 40 },
    { name: 'Bữa trưa', kcal: 610, fat: 20, protein: 52, carbs: 56 },
  ]);

  // 👈 [BƯỚC 4] Sửa lại logic để đọc từ params
  useEffect(() => {
    // Lắng nghe 'newMealKcal' (giá trị bạn gửi về từ trang add-meal)
    if (params.newMealKcal) {
      // Chuyển đổi params (luôn là string) về đúng kiểu dữ liệu
      const newMeal = {
        name: params.newMealName || 'My Meal',
        kcal: parseFloat(params.newMealKcal) || 0,
        fat: parseFloat(params.newMealFat) || 0,
        protein: parseFloat(params.newMealProtein) || 0,
        carbs: parseFloat(params.newMealCarbs) || 0,
      };
      
      // Thêm bữa ăn mới vào danh sách
      setConsumedMeals(prevMeals => [...prevMeals, newMeal]);
      
      // [QUAN TRỌNG] Xóa params đi để không bị thêm lại
      router.setParams({
          newMealName: '',
          newMealKcal: '',
          newMealFat: '',
          newMealProtein: '',
          newMealCarbs: '',
      });
    }
  }, [params.newMealKcal]); // Chỉ chạy lại khi 'newMealKcal' thay đổi

  // Logic tính toán (Không thay đổi)
  const totals = useMemo(() => {
    return consumedMeals.reduce(
      (sum, meal) => {
        sum.kcal += meal.kcal;
        sum.fat += meal.fat;
        sum.protein += meal.protein;
        sum.carbs += meal.carbs;
        return sum;
      },
      { kcal: 0, fat: 0, protein: 0, carbs: 0 }
    );
  }, [consumedMeals]);

  const kcalProgress = totals.kcal / GOAL_KCAL;
  const percentage = Math.round(kcalProgress * 100);

  return (
    <Screen style={styles.screen}>
      <ScrollView>
        <Container style={styles.container}>
          {/* Header đã cập nhật */}
          <Text style={styles.headerText}>
            Amount of kcal from your meal:
          </Text>
          <Text style={styles.headerKcal}>{Math.round(totals.kcal)} kcal</Text>

          {/* Biểu đồ tròn */}
          <View style={styles.circleContainer}>
            <Progress.Circle
              size={200}
              progress={kcalProgress}
              color={'#FFFFFF'}
              thickness={15}
              borderWidth={0}
              unfilledColor="rgba(255, 255, 255, 0.3)"
              showsText={true}
              formatText={() => (
                <View style={{ alignItems: 'center' }}>
                  <Text style={[styles.circleTextLarge, {color: '#FFFFFF'}]}>{percentage}%</Text>
                  <Text style={[styles.circleTextSmall, {color: 'rgba(255, 255, 255, 0.8)'}]}>of {GOAL_KCAL} kcal</Text>
                </View>
              )}
            />
          </View>

          {/* Danh sách Macros */}
          <View style={styles.macroContainer}>
            <MacroBar
              icon="🥑"
              name="Fat"
              value={totals.fat}
              goal={GOAL_FAT}
              color="#FFC107"
            />
            <MacroBar
              icon="🍗"
              name="Protein"
              value={totals.protein}
              goal={GOAL_PROTEIN}
              color="#E91E63"
            />
            <MacroBar
              icon="🍞"
              name="Carbs"
              value={totals.carbs}
              goal={GOAL_CARBS}
              color="#2196F3"
            />
          </View>

          {/* Nút Add meals */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/stack/add-meal')}
          >
            <Text style={styles.addButtonText}>＋ Add meals</Text>
          </TouchableOpacity>
        </Container>
      </ScrollView>
    </Screen>
  );
}

// --- Styles (Không thay đổi) ---
const styles = StyleSheet.create({
  screen: {
    backgroundColor: theme.primaryLight,
  },
  container: {
    paddingVertical: 24,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  headerKcal: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  circleContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  circleTextLarge: {
    fontSize: 40,
    fontWeight: 'bold',
    color: theme.primary,
  },
  circleTextSmall: {
    fontSize: 16,
    color: '#555',
  },
  macroContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  macroInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
  },
  macroIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  macroName: {
    fontSize: 16,
    fontWeight: '600',
  },
  macroProgress: {
    flex: 1,
    marginHorizontal: 12,
  },
  macroValue: {
    fontSize: 12,
    color: '#777',
    width: 80,
    textAlign: 'right',
  },
  addButton: {
    backgroundColor: theme.primary,
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 24,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});