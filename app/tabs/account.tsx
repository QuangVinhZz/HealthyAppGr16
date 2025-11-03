// =====================
// app/(tabs)/account.tsx  (Account Page)
// =====================
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Image, Text, View } from 'react-native';
import { Card, Container, PrimaryButton, Screen } from '../../components/Ui';
import { theme } from '../../theme';

export default function Account(){
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Log out', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: () => router.replace('/auth/launch') }
    ]);
  };

  return (
    <Screen>
      <Container style={{paddingVertical:16}}>
        <Text style={{fontSize:28, fontWeight:'800'}}>Account</Text>

        <Card style={{alignItems:'center', marginTop:24}}>
          <Image source={{uri:'https://i.pravatar.cc/150?img=12'}} style={{width:100, height:100, borderRadius:50, marginBottom:12}}/>
          <Text style={{fontSize:20, fontWeight:'700'}}>Lê Nguyễn Quang Vinh</Text>
          <Text style={{color: theme.subtext}}>DHKTPM18B • 22717161</Text>
        </Card>

        <Card style={{marginTop:16}}>
          <Text style={{fontWeight:'700'}}>Email</Text>
          <Text style={{color: theme.subtext}}>vinh@example.com</Text>
        </Card>

        <Card style={{marginTop:10}}>
          <Text style={{fontWeight:'700'}}>Username</Text>
          <Text style={{color: theme.subtext}}>lequangvinh</Text>
        </Card>

        <View style={{marginTop:32}}>
          <PrimaryButton title="Log Out" onPress={handleLogout} />
        </View>
      </Container>
    </Screen>
  );
}
