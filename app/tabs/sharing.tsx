import React from 'react';
import { ScrollView, Text } from 'react-native';
import { Card, Container, OutlineButton, PrimaryButton, Screen } from '../../components/Ui';


export default function Sharing(){
return (
<Screen>
<ScrollView>
<Container style={{paddingVertical:12}}>
<Text style={{fontSize:28, fontWeight:'800'}}>Sharing</Text>
<Card style={{marginTop:12}}>
<Text style={{fontWeight:'800'}}>Keep your health in check</Text>
<Text>Keep loved ones informed about your condition.</Text>
</Card>
<Card style={{marginTop:10}}>
<Text style={{fontWeight:'800'}}>Protect your privacy</Text>
<Text>Share key conclusions. Stop anytime.</Text>
</Card>
<Card style={{marginTop:10}}>
<Text style={{fontWeight:'800'}}>Notifications</Text>
<Text>Get notified of updates to shared dashboards.</Text>
</Card>


<PrimaryButton title="Start sharing" onPress={()=>{}} />
<OutlineButton title="Setting" onPress={()=>{}} />
</Container>
</ScrollView>
</Screen>
);
}