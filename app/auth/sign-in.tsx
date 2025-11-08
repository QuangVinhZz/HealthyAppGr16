import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Container, PrimaryButton, Screen } from '../../components/Ui';
import { loginWithMockApi } from '../../lib/auth';
import { theme } from '../../theme';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = 'Vui lòng nhập email';
    else if (!emailRegex.test(email.trim())) e.email = 'Email không hợp lệ';
    if (!pw) e.pw = 'Vui lòng nhập mật khẩu';
    return e;
  }, [email, pw]);

  const formValid = Object.keys(errors).length === 0;

  async function onSignIn() {
    if (!formValid || loading) return;
    try {
      setLoading(true);
      const user = await loginWithMockApi(email.trim().toLowerCase(), pw);
      if (user) {
        Alert.alert('Thành công', `Xin chào ${user.fullname}!`, [
          { text: 'OK', onPress: () => router.replace('/tabs/home') },
        ]);
      } else {
        Alert.alert('Đăng nhập thất bại', 'Tài khoản hoặc mật khẩu không hợp lệ.');
      }
    } catch (e: any) {
      Alert.alert('Lỗi mạng', String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Container style={{ marginTop: 70 }}>
        <Text style={{ fontSize: 28, fontWeight: '800', marginBottom: 18, textAlign: 'center' }}>
          Welcome back 👋
        </Text>

        <Text style={{ fontWeight: '700', marginBottom: 8, marginTop: 24 }}>Email</Text>
        <TextInput
          placeholder="Enter email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />
        {!!errors.email && <Text style={styles.err}>{errors.email}</Text>}

        <Text style={{ fontWeight: '700', marginBottom: 8, marginTop: 6 }}>Password</Text>
        <View style={{ position: 'relative' }}>
          <TextInput
            placeholder="Enter password"
            secureTextEntry={!showPw}
            value={pw}
            onChangeText={setPw}
            style={styles.input}
          />
          <Text
            onPress={() => setShowPw(s => !s)}
            style={{ position: 'absolute', right: 12, top: 14, color: theme.subtext }}
          >
            {showPw ? '🙈' : '👁️'}
          </Text>
        </View>
        {!!errors.pw && <Text style={styles.err}>{errors.pw}</Text>}

        <View style={{ alignItems: 'flex-end', marginTop: 8 }}>
          <TouchableOpacity onPress={() => { /* TODO: forgot */ }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={{ uri: 'https://cdn-icons-png.flaticon.com/128/17508/17508481.png' }}
                style={{ width: 18, height: 18, marginRight: 8 }}
              />
              <Text style={{ color: theme.text }}>Forgot password?</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 16 }}>
          <TouchableOpacity disabled={loading || !formValid} onPress={onSignIn}>
            <View style={{ opacity: loading || !formValid ? 0.6 : 1 }}>
              {/* KHÔNG truyền disabled ở đây */}
              <PrimaryButton title={loading ? 'Signing in...' : 'Sign In'} onPress={onSignIn} />
            </View>
          </TouchableOpacity>
          {loading && <ActivityIndicator style={{ marginTop: 8 }} />}
        </View>

        <View style={{ alignItems: 'center', marginVertical: 16 }}>
          <Text style={{ color: theme.subtext }}>OR LOG IN WITH</Text>
          <View style={{ flexDirection: 'row', marginTop: 12 }}>
            {[
              { uri: 'https://cdn-icons-png.flaticon.com/128/5968/5968764.png', label: 'Facebook' },
              { uri: 'https://cdn-icons-png.flaticon.com/128/281/281764.png', label: 'Google' },
              { uri: 'https://cdn-icons-png.flaticon.com/128/731/731985.png', label: 'Apple' },
            ].map((p, i) => (
              <TouchableOpacity key={i} disabled style={{ opacity: 0.5, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, marginHorizontal: 6 }}>
                <Image source={{ uri: p.uri }} style={{ width: 18, height: 18, marginRight: 8 }} />
                <Text style={{ color: theme.purple, fontWeight: '700' }}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <Text style={{ color: theme.subtext }}>Don{"'"}t have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/sign-up' as any)}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: theme.text, fontWeight: '700' }}>Sign up</Text>
            </View>
          </TouchableOpacity>
        </View>
      </Container>
    </Screen>
  );
}

const styles = {
  input: {
    backgroundColor: '#F2F4F7',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EAECF0',
    marginBottom: 6,
  },
  err: { color: '#EF4444', marginBottom: 6 },
} as const;
