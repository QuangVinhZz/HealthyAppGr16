import React, { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TextInput, View } from 'react-native';
import { Card, Container, Screen } from '../../components/Ui';
import { api } from '../../lib/api';
import { theme } from '../../theme';


export default function Explore(){
const [list, setList] = useState<any[]>([]);
useEffect(()=>{ api.articles.list().then(setList).catch(()=>{}); },[]);
return (
<Screen>
<ScrollView>
<Container style={{paddingVertical:12}}>
<TextInput placeholder="Search topic" style={{backgroundColor:'#F2F4F7', borderRadius:24, padding:12}}/>
<Text style={{marginTop:12, fontWeight:'800'}}>For you</Text>
<View style={{flexDirection:'row', marginTop:8}}>
{['Nutrition','Sports','Running'].map((t,i)=> (
<Card key={i} style={{marginRight:8}}><Text>{t}</Text></Card>
))}
</View>
<Text style={{marginTop:16, fontWeight:'800'}}>Newest blogs</Text>
{list.map(a=> (
<Card key={a.id} style={{marginTop:10, padding:0, overflow:'hidden'}}>
<Image source={{uri: a.thumbnail || 'https://picsum.photos/seed/a/600/400'}} style={{width:'100%', height:160}}/>
<View style={{padding:12}}>
<Text style={{fontWeight:'800'}}>{a.title}</Text>
<Text style={{color: theme.subtext}}>{a.excerpt}</Text>
</View>
</Card>
))}
</Container>
</ScrollView>
</Screen>
);
}