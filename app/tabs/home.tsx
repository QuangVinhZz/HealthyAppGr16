import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Card, Container, H1, H2, Screen } from '../../components/Ui';
import { api } from '../../lib/api';
import { theme } from '../../theme';


const Tile = ({title, value, color}:{title:string; value:string; color:string})=> (
<View style={{flex:1, backgroundColor: color, borderRadius:18, padding:14, marginRight:12}}>
<Text style={{color:'#fff', fontWeight:'800', fontSize:16}}>{title}</Text>
<Text style={{color:'#fff', fontWeight:'900', fontSize:22, marginTop:18}}>{value}</Text>
</View>
);


export default function Home(){
const [metrics, setMetrics] = useState<any[]>([]);
useEffect(()=>{ api.metrics.list().then(setMetrics).catch(()=>{}); },[]);
const last = metrics?.[metrics.length-1] || {steps:11857, sleep:7.5, heartRate:68, calories:960};


return (
<Screen>
<ScrollView contentContainerStyle={{paddingBottom:28}}>
<Container style={{paddingTop:12}}>
<View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
<Image source={{uri:'https://picsum.photos/seed/logo/64/64'}} style={{width:28, height:28, borderRadius:6}}/>
<Image source={{uri:'https://i.pravatar.cc/100?img=12'}} style={{width:36, height:36, borderRadius:18}}/>
</View>
<Text style={{color: theme.subtext, marginTop:8}}>TUES 11 JUL</Text>
<H1>Overview</H1>


<Card style={{marginTop:12, backgroundColor:'#E9FBFF'}}>
<View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
<View style={{flex:1, paddingRight:12}}>
<Text style={{fontWeight:'800'}}>Health Score</Text>
<Text style={{color: theme.subtext, marginTop:8}}>Based on your overview health tracking, your score is 78 and consider good..</Text>
<Text style={{color: theme.primary, marginTop:8}}>Tell me more ›</Text>
</View>
<View style={{width:64, height:64, borderRadius:16, backgroundColor: theme.primary, alignItems:'center', justifyContent:'center'}}>
<Text style={{color:'#fff', fontWeight:'900', fontSize:22}}>78</Text>
</View>
</View>
</Card>


<View style={{flexDirection:'row', justifyContent:'space-between', marginTop:18, alignItems:'center'}}>
<H2>Highlights</H2>
<Link href={'../stack/all-data' as any} asChild>
<TouchableOpacity><Text style={{color: theme.subtext}}>View more ›</Text></TouchableOpacity>
</Link>
</View>


<View style={{flexDirection:'row', marginTop:10}}>
<Link href={'../stack/steps' as any} asChild>
<TouchableOpacity style={{flex:1}}>
<Tile title="Steps" value={`${last.steps}`} color={'#05C0DF'} />
</TouchableOpacity>
</Link>
<View style={{width:12}}/>
<Link href={'../stack/cycle' as any} asChild>
<TouchableOpacity style={{flex:1}}>
<Tile title="Cycle tracking" value={`12 days\nbefore period`} color={'#E9A3AC'} />
</TouchableOpacity>
</Link>
<View style={{width:12}}/>
<Link href={'../stack/sleeps' as any} asChild>
<TouchableOpacity style={{flex:1}}>
<Tile title="Sleep" value={`12 days\nbefore period`} color={'#E9A3AC'} />
</TouchableOpacity>
</Link>
</View>

</Container>
</ScrollView>
</Screen>
);
}