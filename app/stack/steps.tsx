import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Card, Container, Screen } from '../../components/Ui';
import { theme } from '../../theme';


export default function Steps(){
return (
<Screen>
<ScrollView>
<Container style={{paddingVertical:16}}>
<Text style={{textAlign:'center', color: theme.subtext}}>You have achieved</Text>
<Text style={{textAlign:'center'}}><Text style={{color: theme.primary, fontWeight:'900'}}>80%</Text> of your goal today</Text>
<View style={{alignSelf:'center', marginVertical:16, width:200, height:200, borderRadius:100, borderWidth:18, borderColor: theme.primary, justifyContent:'center', alignItems:'center'}}>
<Text style={{fontSize:28, fontWeight:'900'}}>11,857</Text>
<Text style={{color: theme.subtext}}>Steps out of 18k</Text>
</View>
<View style={{flexDirection:'row', justifyContent:'space-between', marginVertical:12}}>
<Card style={{flex:1, alignItems:'center', marginRight:8}}><Text>850 kcal</Text></Card>
<Card style={{flex:1, alignItems:'center', marginLeft:8}}><Text>5 km</Text></Card>
</View>
<Card>
<View style={{height:180, borderRadius:16, backgroundColor: theme.primary, alignItems:'center', justifyContent:'center'}}>
<Text style={{color:'#fff'}}>Chart (Today / Weekly / Monthly)</Text>
</View>
</Card>
</Container>
</ScrollView>
</Screen>
);
}