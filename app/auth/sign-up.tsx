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
import { auth } from '../../lib/api';
import { theme } from '../../theme';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUp() {
  const router = useRouter();

  // ── Form states
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');

  // ── UI states
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [loading, setLoading] = useState(false);

  // ── Validation
  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!fullname.trim()) e.fullname = 'Vui lòng nhập họ tên';
    if (!email.trim()) e.email = 'Vui lòng nhập email';
    else if (!emailRegex.test(email.trim())) e.email = 'Email không hợp lệ';
    if (!pw) e.pw = 'Nhập mật khẩu';
    else if (pw.length < 6) e.pw = 'Tối thiểu 6 ký tự';
    if (!pw2) e.pw2 = 'Nhập lại mật khẩu';
    else if (pw !== pw2) e.pw2 = 'Mật khẩu xác nhận không khớp';
    return e;
  }, [fullname, email, pw, pw2]);

  const formValid = Object.keys(errors).length === 0;

  // ── Submit
  async function onSignUp() {
    if (!formValid || loading) return;
    try {
      setLoading(true);

      const user = await auth.signUp({
        fullname: fullname.trim(),
        email: email.trim().toLowerCase(),
        password: pw, // DÙNG pw, không còn biến password thừa
      });

      Alert.alert('Tạo tài khoản thành công', `Chào mừng ${user.fullname}!`, [
        { text: 'Đăng nhập', onPress: () => router.replace('/auth/sign-in') },
        // Nếu bạn đã có session, có thể vào thẳng home:
        // { text: 'Vào app', onPress: () => router.replace('/tabs/home') },
      ]);
    } catch (e: any) {
      Alert.alert('Đăng ký thất bại', String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Container style={{ marginTop: 70 }}>
        <Text style={{ fontSize: 28, fontWeight: '800', marginBottom: 18, textAlign: 'center' }}>
          Create account ✨
        </Text>

        {/* Full name */}
        <Text style={{ fontWeight: '700', marginBottom: 8, marginTop: 6 }}>Full name</Text>
        <TextInput
          placeholder="Your name"
          value={fullname}
          onChangeText={setFullname}
          autoCapitalize="words"
          style={styles.input}
        />
        {!!errors.fullname && <Text style={styles.err}>{errors.fullname}</Text>}

        {/* Email */}
        <Text style={{ fontWeight: '700', marginBottom: 8, marginTop: 6 }}>Email</Text>
        <TextInput
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />
        {!!errors.email && <Text style={styles.err}>{errors.email}</Text>}

        {/* Password */}
        <Text style={{ fontWeight: '700', marginBottom: 8, marginTop: 6 }}>Password</Text>
        <View style={{ position: 'relative' }}>
          <TextInput
            placeholder="At least 6 characters"
            secureTextEntry={!showPw}
            value={pw}
            onChangeText={setPw}
            style={styles.input}
          />
          <Text
            onPress={() => setShowPw((s) => !s)}
            style={{ position: 'absolute', right: 12, top: 14, color: theme.subtext }}
          >
            {showPw ? '🙈' : '👁️'}
          </Text>
        </View>
        {!!errors.pw && <Text style={styles.err}>{errors.pw}</Text>}

        {/* Confirm password */}
        <Text style={{ fontWeight: '700', marginBottom: 8, marginTop: 6 }}>Confirm password</Text>
        <View style={{ position: 'relative' }}>
          <TextInput
            placeholder="Re-enter password"
            secureTextEntry={!showPw2}
            value={pw2}
            onChangeText={setPw2}
            style={styles.input}
          />
          <Text
            onPress={() => setShowPw2((s) => !s)}
            style={{ position: 'absolute', right: 12, top: 14, color: theme.subtext }}
          >
            {showPw2 ? '🙈' : '👁️'}
          </Text>
        </View>
        {!!errors.pw2 && <Text style={styles.err}>{errors.pw2}</Text>}

        {/* Submit */}
        <View style={{ marginTop: 16 }}>
          <TouchableOpacity disabled={loading || !formValid} onPress={onSignUp}>
            <View style={{ opacity: loading || !formValid ? 0.6 : 1 }}>
              <PrimaryButton title={loading ? 'Signing up...' : 'Sign Up'} onPress={onSignUp} />
            </View>
          </TouchableOpacity>
          {loading && <ActivityIndicator style={{ marginTop: 8 }} />}
        </View>

        {/* Socials (disabled) */}
        <View style={{ alignItems: 'center', marginVertical: 16 }}>
          <Text style={{ color: theme.subtext }}>OR SIGN UP WITH</Text>
          <View style={{ flexDirection: 'row', marginTop: 12 }}>
            {[
              { uri: 'https://cdn-icons-png.flaticon.com/128/5968/5968764.png', label: 'Facebook' },
              { uri: 'https://cdn-icons-png.flaticon.com/128/281/281764.png', label: 'Google' },
              { uri: 'https://cdn-icons-png.flaticon.com/128/731/731985.png', label: 'Apple' },
            ].map((p, i) => (
              <TouchableOpacity
                key={i}
                disabled
                style={{
                  opacity: 0.5,
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  marginHorizontal: 6,
                }}
              >
                <Image source={{ uri: p.uri }} style={{ width: 18, height: 18, marginRight: 8 }} />
                <Text style={{ color: theme.purple, fontWeight: '700' }}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Link to sign-in */}
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <Text style={{ color: theme.subtext }}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.replace('/auth/sign-in' as any)}>
            <Text style={{ color: theme.text, fontWeight: '700' }}>Sign in</Text>
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
