import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Card, Container, Screen } from '../../components/Ui';
import { theme } from '../../theme';


export default function Sleep(){
return (
<Screen>
<ScrollView>
<Container style={{paddingVertical:16}}>
<Text>Your average time of sleep a day is <Text style={{color: theme.primary, fontWeight:'900'}}>7h 31 min</Text></Text>
<View style={{flexDirection:'row', justifyContent:'space-between', marginTop:12}}>
{Array.from({length:7}).map((_,i)=> (
<View key={i} style={{width:32, height:140, borderRadius:12, backgroundColor:'#EEF2F7', justifyContent:'flex-end'}}>
<View style={{height: 60 + (i%3)*18, backgroundColor: theme.primary, borderBottomLeftRadius:12, borderBottomRightRadius:12}}/>
</View>
))}
</View>
<View style={{flexDirection:'row', marginTop:16}}>
<Card style={{flex:1, marginRight:8}}><Text>🌟 Sleep rate 82%</Text></Card>
<Card style={{flex:1, marginLeft:8}}><Text>😴 Deepsleep 1h 3min</Text></Card>
</View>
<Text style={{marginTop:16}}>Set your schedule</Text>
<View style={{flexDirection:'row', marginTop:8}}>
<Card style={{flex:1, marginRight:8, backgroundColor:'#FFE6E0'}}><Text>🕙 Bedtime\n22:00 pm</Text></Card>
<Card style={{flex:1, marginLeft:8, backgroundColor:'#FFE9C7'}}><Text>⏰ Wake up\n07:30 am</Text></Card>
</View>
</Container>
</ScrollView>
</Screen>
);
}