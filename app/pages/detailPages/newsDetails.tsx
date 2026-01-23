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
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';

const { width } = Dimensions.get('window');

// --- Types ---
interface NewsItem {
  id: number;
  title: string;
  meta: string;
  imageUrl: string;
}

// --- Mock Data for Recent News ---
const recentNewsData: NewsItem[] = [
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
];

export default function NewsDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Data from params or Fallback (Matches the image exactly)
  const article = {
    title: params.title || 'Fed rate cut charm may not cheer Asian equities this time.',
    date: params.meta || 'September 22, 2025 • 12.27AM IST',
    imageUrl: typeof params.imageUrl === 'string' ? params.imageUrl : 'https://images.unsplash.com/photo-1611974765270-ca1258634369?q=80&w=600&auto=format&fit=crop',
    body: `Lorem ipsum dolor sit amet consectetur. Quis mauris facilisi lectus sem massa semper quam consectetur. Vitae mattis consequat consequat hac. Aliquet libero fermentum sit cursus lacus donec etiam mollis. Feugiat donec tristique scelerisque ac tincidunt augue. Ac consectetur sem risus risus phasellus aliquam lorem orci feugiat. Vitae iaculis ac diam quis dignissim ipsum amet potenti blandit. Mus lectus diam ut volutpat lobortis accumsan velit. Vel eu in in quisque eu dictumst. In volutpat cras enim mattis enim vitae odio.\n\nAccumsan enim velit nunc facilisis lectus bibendum morbi sollicitudin ut. Faucibus quis cursus eget mi sem elementum lacus. Cursus potenti ut nec amet et. Commodo arcu potenti in lectus condimentum. Ullamcorper suscipit metus cursus lectus posuere a.`
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Hero Image Section */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: article.imageUrl }} style={styles.heroImage} />
          
          {/* Back Button Overlay */}
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Article Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.headline}>{article.title}</Text>
          <Text style={styles.dateLine}>{article.date}</Text>

          <Text style={styles.bodyText}>
            {article.body}
          </Text>
        </View>

        {/* Recent News Section */}
        <View style={styles.recentSection}>
          <Text style={styles.recentHeader}>Recent News</Text>
          
          <View style={styles.listContainer}>
            {recentNewsData.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.card} 
                activeOpacity={0.7}
                onPress={() => {
                   // Optional: Navigate to this article recursively
                   router.push({
                     pathname: '/pages/detailPages/newsDetails',
                     params: { ...item }
                   });
                }}
              >
                {/* Text Section */}
                <View style={styles.textContainer}>
                  <Text style={styles.cardTitle} numberOfLines={3}>
                    {item.title}
                  </Text>
                  <Text style={styles.cardMeta}>{item.meta}</Text>
                </View>

                {/* Thumbnail */}
                <Image 
                  source={{ uri: item.imageUrl }} 
                  style={styles.thumbnail}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  
  // --- Hero Section ---
  imageContainer: {
    width: '100%',
    height: 250,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backButton: {
    position: 'absolute',
    top: 20, 
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  // --- Article Body ---
  contentContainer: {
    padding: 20,
  },
  headline: {
    fontSize: 22,
    fontWeight: '500',
    color: '#000',
    marginBottom: 10,
    lineHeight: 28,
    textAlign: "center"
  },
  dateLine: {
    fontSize: 11,
    color: '#000000',
    fontWeight: '400',
    marginBottom: 20,
  },
  bodyText: {
    fontSize: 13,
    lineHeight: 21,
    color: '#000',
    textAlign: 'justify',
  },

  // --- Recent News ---
  recentSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  recentHeader: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
    textAlign: 'center', 
  },
  listContainer: {
  },
  
  card: {
    flexDirection: 'row',
    backgroundColor: '#0000000D', 
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
    justifyContent: 'space-between',
    minHeight: 80, 
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    lineHeight: 21,
    marginBottom: 28,
  },
  cardMeta: {
    fontSize: 10,
    color: '#555', 
    fontWeight: '400',
    marginTop: 'auto',
  },
  thumbnail: {
    width: 113,
    height: 113,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    resizeMode: 'cover',
  },
});