import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router'; // 1. Import useRouter

// --- Types ---
interface NewsItem {
  id: number;
  title: string;
  meta: string;
  imageUrl: string;
}

// --- Mock Data ---
const newsData: NewsItem[] = [
  {
    id: 1,
    title: 'Earnings growth might remain sluggish for next two years.',
    meta: 'September 22, 2025 • 12.27AM IST',
    imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=300&auto=format&fit=crop', 
  },
  {
    id: 2,
    title: 'Mid-sized food chain hit the market as PE appetite surges.',
    meta: '4 MIN READ',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=300&auto=format&fit=crop', 
  },
  {
    id: 3,
    title: 'Fed rate cut charm may not cheer Asian equities this time.',
    meta: '4 MIN READ',
    imageUrl: 'https://images.unsplash.com/photo-1611974765270-ca1258634369?q=80&w=300&auto=format&fit=crop', 
  },
  {
    id: 4,
    title: 'Tata Sons director urges Tata International to focus on profit.',
    meta: '4 MIN READ',
    imageUrl: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=300&auto=format&fit=crop', 
  },
  {
    id: 5,
    title: 'Gold prices hit all-time high amidst global market uncertainty.',
    meta: '6 MIN READ',
    imageUrl: 'https://images.unsplash.com/photo-1610375461246-d5de5a1a8d20?q=80&w=300&auto=format&fit=crop', 
  },
  {
    id: 6,
    title: 'Real Estate: Why tier-2 cities are seeing a sudden boom.',
    meta: '2 MIN READ',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=300&auto=format&fit=crop', 
  },
  {
    id: 7,
    title: 'EV Sector Outlook: New battery tech could change everything.',
    meta: 'September 20, 2025 • 4.30PM IST',
    imageUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=300&auto=format&fit=crop', 
  },
  {
    id: 8,
    title: 'Startups face funding winter as investors tighten purse strings.',
    meta: '5 MIN READ',
    imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=300&auto=format&fit=crop', 
  },
];

const NewsPage = () => {
  const router = useRouter(); // 2. Initialize Router

  return (
    <SafeAreaView style={styles.container}>
      {/* Status Bar config for clean look */}
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.headerTitle}>Latest News</Text>

        <View style={styles.listContainer}>
          {newsData.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.card} 
              activeOpacity={0.7}
              // 3. Navigation Logic
              onPress={() => {
                router.push({
                  pathname: '/pages/detailPages/newsDetails',
                  params: {
                    id: item.id,
                    title: item.title,
                    meta: item.meta,
                    imageUrl: item.imageUrl,
                  }
                });
              }}
            >
              {/* Text Section */}
              <View style={styles.textContainer}>
                <Text style={styles.title} numberOfLines={3}>
                  {item.title}
                </Text>
                <Text style={styles.meta}>{item.meta}</Text>
              </View>

              {/* Image Section */}
              <Image 
                source={{ uri: item.imageUrl }} 
                style={styles.thumbnail}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  listContainer: {
    paddingHorizontal: 15,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#0000000D', 
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
    justifyContent: 'space-between',
    minHeight: 90, 
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    lineHeight: 22,
    marginBottom: 25,
  },
  meta: {
    fontSize: 10,
    color: '#000', 
    fontWeight: '400',
    marginTop: 'auto',
  },
  thumbnail: {
    width: 113,
    height: 113,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    resizeMode: 'cover',
  },
});

export default NewsPage;