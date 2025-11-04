import { Link, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Card, Container, H1, H2, Screen } from '../../components/Ui';
import { api } from '../../lib/api';
import { theme } from '../../theme';


const Tile = ({
  title, value, color, icon, subtitle, onPress,
}:{
  title:string; value:string; color:string; icon?:string; subtitle?:string; onPress?:()=>void;
}) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.9}
    style={{
      width: '48%',               // 2 cột
      backgroundColor: color,
      borderRadius: 24,
      padding: 16,
      minHeight: 150,
      marginBottom: 14,
      overflow: 'hidden',
      elevation: 2,               // shadow Android
      shadowColor: '#000',        // shadow iOS
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    }}>
    {icon ? (
      <Image source={{ uri: icon }}
             style={{ width: 36, height: 36, position: 'absolute', right: 14, top: 14, tintColor: '#fff', opacity: 0.95 }}/>
    ) : null}

    <Text style={{ color:'#fff', fontWeight:'800', fontSize:16 }}>{title}</Text>
    <Text style={{ color:'#fff', fontWeight:'900', fontSize:28, marginTop:14, lineHeight:30 }}>{value}</Text>
    {!!subtitle && (
      <Text style={{ color:'rgba(255,255,255,0.85)', marginTop:10, fontSize:12 }}>
        {subtitle}
      </Text>
    )}
  </TouchableOpacity>
);

// helper format số
const nf = (n:number)=> n.toLocaleString();

// gom số liệu 7 ngày gần nhất từ metrics
function summarizeWeek(list:any[]){
  const last7 = Array.isArray(list) ? list.slice(-7) : [];
  const steps = last7.reduce((s,x)=> s + (x.steps||0), 0);
  const sleepMin = Math.round(last7.reduce((s,x)=> s + ((x.sleep||0)*60), 0)); // phút
  // nếu bạn chưa có workout/water trong data → để số giả lập
  const workoutMin = last7.reduce((s)=> s + 405, 0); // ~6h45 tổng tuần (ví dụ)
  const waterMl = last7.reduce((s)=> s + 1523, 0);   // ~10,6 lít tổng tuần (ví dụ)

  return { steps, workoutMin, waterMl, sleepMin };
}

const ReportCard = ({icon, title, value}:{icon:string; title:string; value:string}) => (
  <View
    style={{
      width:'48%',
      backgroundColor:'#fff',
      borderRadius:22,
      padding:16,
      marginBottom:14,
      borderWidth:1,
      borderColor:'#EFF1F4',
      shadowColor:'#000',
      shadowOpacity:0.05,
      shadowRadius:6,
      shadowOffset:{width:0,height:3},
      elevation:1
    }}>
    <View style={{flexDirection:'row', alignItems:'center', marginBottom:8}}>
      <Text style={{fontSize:18, marginRight:6}}>{icon}</Text>
      <Text style={{color: theme.subtext, fontWeight:'700'}}>{title}</Text>
    </View>
    <Text style={{fontSize:28, fontWeight:'900', color:'#3B3F45'}}>{value}</Text>
  </View>
);

type Article = {
  id: string;
  title: string;
  excerpt?: string;
  image: string;      // trong healthyApp mình dùng field `image`
  category?: string;
  votes?: number;
};

const CARD_WIDTH = 260;
const CARD_HEIGHT = 360;

const BlogCard = ({ item, onPress }: { item: Article; onPress?: () => void }) => (
  <TouchableOpacity
    activeOpacity={0.9}
    onPress={onPress}
    style={{
      width: CARD_WIDTH,
      minHeight: CARD_HEIGHT,
      backgroundColor: '#fff',
      borderRadius: 24,
      padding: 14,
      marginRight: 14,
      borderWidth: 1,
      borderColor: '#EFF1F4',
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
      justifyContent: 'flex-start',
    }}
  >
    {/* Ảnh cố định tỉ lệ và cao đều */}
    <Image
      source={{ uri: item.image }}
      style={{
        width: '100%',
        height: 160,
        borderRadius: 18,
        resizeMode: 'cover',
      }}
    />

    {/* Category */}
    {!!item.category && (
      <Text
        style={{
          color: theme.subtext,
          marginTop: 12,
          fontWeight: '600',
          fontSize: 14,
        }}
      >
        {item.category}
      </Text>
    )}

    {/* Tiêu đề giới hạn dòng */}
    <Text
      numberOfLines={3}
      style={{
        fontSize: 18,
        fontWeight: '900',
        marginTop: 6,
        lineHeight: 24,
        color: '#1F2937',
      }}
    >
      {item.title}
    </Text>

    {/* Thanh vote + link */}
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 'auto', // ép phần dưới cùng cố định
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#E6FBFF',
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 16,
        }}
      >
        <Text style={{ fontSize: 14 }}>👍</Text>
        <Text
          style={{
            color: theme.primary,
            marginLeft: 6,
            fontWeight: '700',
          }}
        >
          {(item.votes ?? 0)} votes
        </Text>
      </View>

      <Text style={{ color: theme.subtext }}>Tell me more ›</Text>
    </View>
  </TouchableOpacity>
);


export default function Home(){
const [metrics, setMetrics] = useState<any[]>([]);
const [now, setNow] = useState<Date>(new Date());
const router = useRouter();
const { width } = Dimensions.get('window');
const CARD_W = Math.min(280, width - 48);   // card ~280 hoặc trừ lề
const GAP = 14;

useEffect(()=>{ api.metrics.list().then(setMetrics).catch(()=>{}); },[]);

// keep current time updated (updates every minute) so date label refreshes in real-time
useEffect(() => {
	const t = setInterval(() => setNow(new Date()), 60_000);
	return () => clearInterval(t);
}, []);

const last = metrics?.[metrics.length-1] || {steps:11857, sleep:7.5, heartRate:68, calories:960};

const [articles, setArticles] = useState<Article[]>([]);

useEffect(()=>{
  api.articles.list().then(setArticles).catch(()=>{});
},[]);

return (
<Screen>
<ScrollView contentContainerStyle={{paddingBottom:28}}>
<Container style={{paddingTop:12}}>
<View>
  <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
    <Image source={{uri:'https://picsum.photos/seed/logo/64/64'}} style={{width:28, height:28, borderRadius:6}}/>
    <View style={{position:'relative'}}>
      <Image source={{uri:'https://i.pravatar.cc/100?img=12'}} style={{width:36, height:36, borderRadius:18}}/>
      <View style={{position:'absolute', right:0, bottom:0, width:12, height:12, borderRadius:6, backgroundColor:'#22C55E', borderWidth:2, borderColor:'#fff'}} />
    </View>
  </View>

  <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginTop:12}}>
    <View style={{flexDirection:'row', alignItems:'center'}}>
      <Image source={{uri:'https://img.icons8.com/ios/50/000000/sun--v1.png'}} style={{width:14, height:14, marginRight:8, tintColor: theme.subtext}} />
      <Text style={{color: theme.subtext}}>{`${now.toLocaleDateString('en-US',{weekday:'short'}).toUpperCase()} ${now.getDate()} ${now.toLocaleDateString('en-US',{month:'short'}).toUpperCase()}`}</Text>
    </View>
    <TouchableOpacity onPress={()=>{router.push('/stack/all-data' as any)}} style={{borderWidth:1.5, borderColor: theme.text, paddingHorizontal:12, paddingVertical:6, borderRadius:20, alignItems:'center', justifyContent:'center', flexDirection:'row'}}>
      <Image source={{uri:'https://cdn-icons-png.flaticon.com/128/3064/3064889.png'}} style={{width:16, height:16, marginRight:8}} />
      <Text style={{color: theme.text, fontWeight:'700'}}>All data</Text>
    </TouchableOpacity>
  </View>

  <View style={{marginTop:8}}>
    <H1>Overview</H1>
  </View>
</View>

<Card style={{marginTop:12, backgroundColor:'#E9FBFF', padding:18}}>
  <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
    <View style={{flex:1, paddingRight:12}}>
      <Text style={{fontWeight:'800', fontSize:18}}>Health Score</Text>
      <Text style={{color: theme.subtext, marginTop:8}}>Based on your overview health tracking, your score is 78 and consider good..</Text>
      <Text style={{color: theme.primary, marginTop:8}}>Tell me more ›</Text>
    </View>

    {/* purple badge */}
    <View style={{width:72, height:90, alignItems:'center', justifyContent:'flex-start'}}>
      <View style={{width:72, height:64, backgroundColor: theme.primary, borderTopLeftRadius:12, borderTopRightRadius:12, alignItems:'center', justifyContent:'center'}}>
        <Text style={{color:'#fff', fontWeight:'900', fontSize:22}}>78</Text>
      </View>
      <View style={{width:0, height:0, borderLeftWidth:18, borderRightWidth:18, borderTopWidth:26, borderLeftColor:'transparent', borderRightColor:'transparent', borderTopColor: theme.primary}} />
    </View>
  </View>
</Card>


<View style={{flexDirection:'row', justifyContent:'space-between', marginTop:18, alignItems:'center'}}>
  <H2>Highlights</H2>
  <Link href="/stack/all-data" asChild>
    <TouchableOpacity><Text style={{color: theme.subtext}}>View more ›</Text></TouchableOpacity>
  </Link>
</View>

{/* Grid 2 cột */}
<View style={{flexDirection:'row', flexWrap:'wrap', justifyContent:'space-between', marginTop:10}}>
  <Tile
    title="Steps"
    value={`${last.steps.toLocaleString()}`}
    color="#05C0DF"
    icon="https://img.icons8.com/ios-filled/50/ffffff/running.png"
    subtitle="updated 15 min ago"
    onPress={()=> router.push('/stack/steps' as any)}
  />
  <Tile
    title="Cycle tracking"
    value={`12 days\nbefore period`}
    color="#E9A3AC"
    icon="https://cdn-icons-png.flaticon.com/128/2370/2370264.png"
    subtitle="updated 30m ago"
    onPress={()=> router.push('/stack/cycle' as any)}
  />
  <Tile
    title="Sleep"
    value={`7 h 31 min`}
    color="#0E5A9C"  // xanh đậm
    icon="https://cdn-icons-png.flaticon.com/128/14285/14285932.png"
    subtitle="updated a day ago"
    onPress={()=> router.push('/stack/sleeps' as any)}
  />
  <Tile
    title="Nutrition"
    value={`960 kcal`}
    color="#D4741E"  // cam
    icon="https://img.icons8.com/ios-filled/50/ffffff/porridge.png"
    subtitle="updated 5 min ago"
    onPress={()=> router.push('/stack/nutrition' as any)}
  />
</View>

{/* ---- This week report ---- */}
<View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginTop:8}}>
  <H2>This week report</H2>
  <TouchableOpacity><Text style={{color: theme.subtext}}>View more ›</Text></TouchableOpacity>
</View>

{(() => {
  const { steps, workoutMin, waterMl, sleepMin } = summarizeWeek(metrics);
  const hhmm = (min:number)=>{
    const h = Math.floor(min/60), m = min%60;
    return `${h}h ${m}min`;
  };

  return (
    <View style={{flexDirection:'row', flexWrap:'wrap', justifyContent:'space-between', marginTop:10}}>
      <ReportCard icon="🦶" title="Steps"   value={nf(steps)} />
      <ReportCard icon="💪" title="Workout" value={hhmm(workoutMin)} />
      <ReportCard icon="💧" title="Water"   value={`${nf(waterMl)} ml`} />
      <ReportCard icon="😴" title="Sleep"   value={hhmm(sleepMin)} />
    </View>
  );
})()}

{/* ---- Blogs ---- */}
<View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginTop:14}}>
  <H2>Blogs</H2>
  <TouchableOpacity><Text style={{color: theme.subtext}}>View more ›</Text></TouchableOpacity>
</View>

<FlatList
  data={articles}
  horizontal
  keyExtractor={(it)=> String(it.id)}
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={{ paddingVertical: 10 }}
  renderItem={({item}) => (
    <View style={{ width: CARD_W, marginRight: GAP }}>
      <BlogCard item={item} onPress={()=>{ /* điều hướng chi tiết */ }} />
    </View>
  )}
  snapToInterval={CARD_W + GAP}
  decelerationRate="fast"
  snapToAlignment="start"
/>

</Container>
</ScrollView>
</Screen>
);
}