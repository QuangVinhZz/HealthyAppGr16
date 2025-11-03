import React, { ReactNode } from 'react';
import { Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { theme } from '../theme';


export function Screen({ children }:{children:ReactNode}){
return <View style={{flex:1, backgroundColor: theme.bg}}>{children}</View>;
}


export function Container({ children, style }:{children:ReactNode; style?:ViewStyle}){
return <View style={[{paddingHorizontal:16, paddingTop:15, marginTop:25}, style]}>{children}</View>;
}


export function H1({children}:{children:ReactNode}){
return <Text style={{fontSize:28, fontWeight:'800', color: theme.text}}>{children}</Text>;
}
export function H2({children}:{children:ReactNode}){
return <Text style={{fontSize:20, fontWeight:'800', color: theme.text}}>{children}</Text>;
}
export function P({children, muted}:{children:ReactNode; muted?:boolean}){
return <Text style={{fontSize:14, color: muted? theme.subtext : theme.text}}>{children}</Text>;
}


export function PrimaryButton({title, onPress}:{title:string; onPress:()=>void}){
return (
<TouchableOpacity onPress={onPress} style={{
backgroundColor: theme.primary,
paddingVertical:16, borderRadius:28, alignItems:'center'
}}>
<Text style={{color:'#fff', fontWeight:'700'}}>{title}</Text>
</TouchableOpacity>
);
}


export function OutlineButton({title, onPress}:{title:string; onPress:()=>void}){
return (
<TouchableOpacity onPress={onPress} style={{
borderWidth:1, borderColor: theme.border, backgroundColor:'#fff',
paddingVertical:14, borderRadius:28, alignItems:'center'
}}>
<Text style={{color: theme.text, fontWeight:'700'}}>{title}</Text>
</TouchableOpacity>
);
}


export function Card({children, style}:{children:ReactNode; style?:ViewStyle}){
return (
<View style={[{backgroundColor:'#fff', borderRadius:16, borderWidth:1, borderColor: theme.border, padding:14}, style]}>
{children}
</View>
);
}