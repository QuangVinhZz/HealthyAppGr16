import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Card, Container, PrimaryButton, Screen } from '../../components/Ui';
import { theme } from '../../theme';


export default function Nutrition(){
return (
<Screen>
<ScrollView>
<Container style={{paddingVertical:16}}>
<Text>You have consumed <Text style={{color: theme.primary, fontWeight:'900'}}>960 kcal</Text> today</Text>
<View style={{alignSelf:'center', marginVertical:16, width:220, height:220, borderRadius:110, borderWidth:16, borderColor: theme.primary, justifyContent:'center', alignItems:'center'}}>
<Text style={{fontSize:28, fontWeight:'900'}}>60%</Text>
<Text style={{color: theme.subtext}}>of 1300 kcal</Text>
</View>
{[
{label:'Fat', val:'80g', p:'40%'},
{label:'Protein', val:'160g', p:'56%'},
{label:'Carbs', val:'230g', p:'62%'}
].map((r,i)=> (
<Card key={i} style={{flexDirection:'row', justifyContent:'space-between', marginBottom:10}}>
<Text>{r.label}</Text>
<Text>{r.val} {r.p}</Text>
</Card>
))}
<PrimaryButton title="Add meals" onPress={()=>{}}/>
</Container>
</ScrollView>
</Screen>
);
}