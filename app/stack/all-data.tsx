import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Card, Container, Screen } from '../../components/Ui';
import { theme } from '../../theme';


const Row = ({title, value, color}:{title:string; value:string; color:string})=> (
<Card style={{flexDirection:'row', alignItems:'center', marginBottom:10}}>
<View style={{width:36, height:36, borderRadius:10, backgroundColor: color, marginRight:12}}/>
<Text style={{flex:1, fontWeight:'700'}}>{title}</Text>
<Text style={{color: theme.subtext}}>{value}</Text>
</Card>
);
export default function AllData(){
return (
<Screen>
<ScrollView>
<Container style={{paddingVertical:12}}>
<Row title="Double Support Time" value="29.7 %" color={'#05C0DF'} />
<Row title="Steps" value="11,875 steps" color={'#1CB4F0'} />
<Row title="Cycle tracking" value="08 April" color={'#E9A3AC'} />
<Row title="Sleep" value="7 h 31 min" color={'#1CB4F0'} />
<Row title="Heart" value="68 BPM" color={'#FF6B6B'} />
<Row title="Burned calories" value="850 kcal" color={'#D4741E'} />
<Row title="Body mass index" value="18,69 BMI" color={'#7C3AED'} />
</Container>
</ScrollView>
</Screen>
);
}