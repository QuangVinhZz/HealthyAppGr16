import { useRouter } from 'expo-router';
import React from 'react';
import { ImageBackground, Text, View } from 'react-native';
import { Container, OutlineButton, Screen } from '../../components/Ui';
import { theme } from '../../theme';


export default function Launch(){
const router = useRouter();
return (
<Screen>
<ImageBackground source={{uri:'https://m.media-amazon.com/images/I/61s+K9KasXL._AC_UF1000,1000_QL80_.jpg'}} style={{flex:1}}>
{/* bottom cyan curve */}
<View style={{position:'absolute', bottom:0, left:-120, width:520, height:350, borderTopLeftRadius:520, borderTopRightRadius:520, backgroundColor: theme.primary}} />
</ImageBackground>
<Container style={{position:'absolute', bottom:40, width:'100%'}}>
<View style={{width:52, height:52, borderRadius:26, backgroundColor:'#fff', alignItems:'center', justifyContent:'center', marginBottom:12}}>
<View style={{width:28, height:28, borderRadius:14, backgroundColor: theme.primary}}/>
</View>
<Text style={{fontSize:28, fontWeight:'800', color:'#fff', marginBottom:30}}>Lets start your health {"\n"} journey today with us!</Text>
				<View style={{backgroundColor:'#fff', borderRadius:28, padding:6}}>
					<OutlineButton title="Continue" onPress={()=> router.push('/auth/sign-in' as any)} />
				</View>
</Container>
</Screen>
);
}