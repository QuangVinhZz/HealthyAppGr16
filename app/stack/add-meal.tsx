import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Container, Screen } from '../../components/Ui';
import { theme } from '../../theme';

// Component ô nhập liệu
const MealInput = ({
  label,
  value,
  onChangeText,
  keyboardType = 'default',
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'numeric';
}) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      placeholder={label.split(' ')[0]}
      placeholderTextColor="#999"
    />
  </View>
);

export default function AddMealScreen() {
  const router = useRouter();
  const [mealName, setMealName] = useState('');
  const [fat, setFat] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');

  const handleSaveMeal = () => {
    const fatVal = parseFloat(fat) || 0;
    const proteinVal = parseFloat(protein) || 0;
    const carbsVal = parseFloat(carbs) || 0;

    // Kiểm tra nếu không nhập gì
    if (fatVal <= 0 && proteinVal <= 0 && carbsVal <= 0) {
      Alert.alert('Invalid Input', 'Please enter values for fat, protein, or carbs.');
      return;
    }

    // Tự động tính toán Kcal
    // 1g Fat = 9 kcal, 1g Protein = 4 kcal, 1g Carbs = 4 kcal
    const calculatedKcal = (fatVal * 9) + (proteinVal * 4) + (carbsVal * 4);

    // Quay lại và gửi DỮ LIỆU ĐÃ TÍNH TOÁN
    if (router.canGoBack()) {
      router.back();
      router.setParams({
        newMealName: mealName || 'My Meal',
        newMealKcal: String(calculatedKcal), // Gửi Kcal đã tính
        newMealFat: String(fatVal),
        newMealProtein: String(proteinVal),
        newMealCarbs: String(carbsVal),
      });
    }
  };

  return (
    <Screen style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Container>
            <Text style={styles.title}>🍳 Add a new meal</Text>

            <MealInput
              label="Meal Name"
              value={mealName}
              onChangeText={setMealName}
            />
            {/* Ô nhập Kcal đã được xóa */}
            <MealInput
              label="Fat (g)"
              value={fat}
              onChangeText={setFat}
              keyboardType="numeric"
            />
            <MealInput
              label="Protein (g)"
              value={protein}
              onChangeText={setProtein}
              keyboardType="numeric"
            />
            <MealInput
              label="Carbs (g)"
              value={carbs}
              onChangeText={setCarbs}
              keyboardType="numeric"
            />
          </Container>
        </ScrollView>
        <SafeAreaView style={styles.footer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveMeal}>
            <Text style={styles.saveButtonText}>Save Meal</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  screen: {
    backgroundColor: theme.primary,
  },
  scrollContainer: {
    paddingBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    marginTop: 16,
    color: '#111',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontWeight: '500',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: theme.primary,
  },
  saveButton: {
    backgroundColor: theme.primary,
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
    marginVertical: 12,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});