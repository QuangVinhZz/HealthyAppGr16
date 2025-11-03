import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Container, PrimaryButton, Screen } from '../../components/Ui';
import { loginWithMockApi } from '../../lib/auth'; // <-- thêm dòng này
import { theme } from '../../theme';

export default function SignIn(){
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSignIn() {
    if (!email || !pw) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập email và mật khẩu.');
      return;
    }
    try {
      setLoading(true);
      const user = await loginWithMockApi(email.trim(), pw);
      if (user) {
        // Đăng nhập thành công
        Alert.alert('Thành công', `Xin chào ${user.fullname}!`, [
          { text: 'OK', onPress: () => router.replace('/tabs/home') },
        ]);
      } else {
        // Sai email hoặc mật khẩu
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
      <Container style={{marginTop:70}}>
        <Text style={{fontSize:28, fontWeight:'800', marginBottom:18, textAlign:"center"}}>Welcome back 👋</Text>

        <Text style={{fontWeight:'700', marginBottom:15, marginTop:50}}>Email</Text>
        <TextInput
          placeholder="Enter email"
          value={email}
          onChangeText={setEmail}
          keyboardType='email-address'
          autoCapitalize="none"
          style={styles.input}
        />

        <Text style={{fontWeight:'700', marginBottom:8, marginTop:6}}>Password</Text>
        <View style={{position:'relative'}}>
          <TextInput
            placeholder="Enter password"
            secureTextEntry
            value={pw}
            onChangeText={setPw}
            style={styles.input}
          />
          <Text style={{position:'absolute', right:12, top:14, color: theme.subtext}}>👁️</Text>
        </View>

        <View style={{alignItems:'flex-end', marginTop:8}}>
          <TouchableOpacity onPress={()=> {/* TODO: navigate to forgot password */}}>
            <View style={{flexDirection:'row', alignItems:'center'}}>
              <Image source={{uri:'https://cdn-icons-png.flaticon.com/128/17508/17508481.png'}} style={{width:18, height:18, marginRight:8}} />
              <Text style={{color: theme.text}}>Forgot password?</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{marginTop:16}}>
          <TouchableOpacity disabled={loading} onPress={onSignIn}>
            <View style={{opacity: loading ? 0.7 : 1}}>
              <PrimaryButton title={loading ? 'Signing in...' : 'Sign In'} onPress={onSignIn} />
            </View>
          </TouchableOpacity>
          {loading && <ActivityIndicator style={{marginTop:8}}/>}
        </View>

        <View style={{alignItems:'center', marginVertical:16}}>
          <Text style={{color: theme.subtext}}>OR LOG IN WITH</Text>
          <View style={{flexDirection:'row', marginTop:12}}>
            {[
              { uri: 'https://cdn-icons-png.flaticon.com/128/5968/5968764.png', label: 'Facebook' },
              { uri: 'https://cdn-icons-png.flaticon.com/128/281/281764.png', label: 'Google' },
              { uri: 'https://cdn-icons-png.flaticon.com/128/731/731985.png', label: 'Apple' },
            ].map((p, i) => (
              <TouchableOpacity key={i} onPress={() => {}} style={{flexDirection:'row', alignItems:'center', paddingHorizontal:12, paddingVertical:8, marginHorizontal:6}}>
                <Image source={{uri: p.uri}} style={{width:18, height:18, marginRight:8}} />
                <Text style={{color: theme.purple, fontWeight:'700'}}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{flexDirection:'row', justifyContent:'center'}}>
          <Text style={{color: theme.subtext}}> Don{"'"}t have an account? </Text>
          <TouchableOpacity onPress={()=> router.push('/auth/sign-up' as any)}>
            <View style={{flexDirection:'row', alignItems:'center'}}>
              <Text style={{color: theme.text, fontWeight:'700'}}>Sign up</Text>
            </View>
          </TouchableOpacity>
        </View>
      </Container>
    </Screen>
  );
}

const styles = {
  input:{ backgroundColor:'#F2F4F7', borderRadius:14, padding:14, borderWidth:1, borderColor:'#EAECF0', marginBottom:6 }
} as const;
