import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { theme } from '../../theme';


export default function TabsLayout(){
return (
<Tabs screenOptions={{
headerShown:false,
tabBarActiveTintColor: theme.primary,
}}>
<Tabs.Screen name="home" options={{
title:'Overview', tabBarIcon:({color,size})=> <Ionicons name="home" color={color} size={size}/>
}}/>
<Tabs.Screen name="explore" options={{
title:'Explore', tabBarIcon:({color,size})=> <Ionicons name="compass" color={color} size={size}/>
}}/>
<Tabs.Screen name="sharing" options={{
title:'Sharing', tabBarIcon:({color,size})=> <Ionicons name="share-social" color={color} size={size}/>
}}/>
<Tabs.Screen name="account" options={{
title:'Account', tabBarIcon:({color,size})=> <Ionicons name="person" color={color} size={size}/>
}}/>
</Tabs>
);
}