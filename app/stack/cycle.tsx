import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Card, Container, Screen } from '../../components/Ui';
import { theme } from '../../theme';


export default function Cycle(){
return (
<Screen>
<ScrollView>
<Container style={{paddingVertical:16}}>
<View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:12}}>
{['M','T','W','T','F','S','S'].map((d,i)=> (
<View key={i} style={{alignItems:'center'}}>
<Text style={{color: theme.subtext}}>{d}</Text>
<View style={{marginTop:8, width:36, height:36, borderRadius:18, backgroundColor: i===5? theme.primary : '#F2F4F7'}}/>
</View>
))}
</View>
<Card style={{alignItems:'center'}}>
<Text>Period in</Text>
<Text style={{fontSize:28, fontWeight:'900', color: theme.primary}}>12 days</Text>
<Text style={{color: theme.subtext}}>Low chance of getting pregnant</Text>
</Card>
<Text style={{marginTop:16, fontWeight:'800'}}>How are you feeling today?</Text>
<View style={{flexDirection:'row', marginTop:8}}>
<Card style={{flex:1, marginRight:8}}><Text>Share your symptoms</Text></Card>
<Card style={{flex:1, marginLeft:8}}><Text>Daily insights</Text></Card>
</View>
</Container>
</ScrollView>
</Screen>
);
}