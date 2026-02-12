import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, Stack as ExpoStack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import OtherPagesInc from '@/components/includes/otherPagesInc';
import announcementServices from '@/services/api/methods/announcementService';

interface AnnouncementDetail {
  id: string;
  title: string;
  date: string;
  tag: string; // From 'type' column
  content: string; // From 'content' column (summary)
  body: string; // From 'detail' column (long text)
}

export default function AnnouncementDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Extract ID safely
  const id = typeof params.id === 'string' ? params.id : undefined;

  const [announcement, setAnnouncement] = useState<AnnouncementDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('Invalid announcement ID');
      return;
    }

    const fetchAnnouncement = async () => {
      try {
        setLoading(true);
        const response = await announcementServices.getAnnouncementById(id);

        // Adjust based on your API response structure (e.g., response.data or response directly)
        const item = response?.data ?? response;

        const formatted: AnnouncementDetail = {
          id: String(item.id),
          title: item.title ?? 'Untitled',
          date: item.published_at 
            ? new Date(item.published_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              }) 
            : '',
          tag: item.type ?? 'General', // DB column 'type'
          content: item.content ?? '', // DB column 'content'
          body: item.detail ?? '', // DB column 'detail' (longtext)
        };

        setAnnouncement(formatted);
      } catch (err) {
        console.error('Error loading announcement:', err);
        setError('Failed to load the announcement details.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncement();
  }, [id]);

  return (
    <OtherPagesInc>
      <ExpoStack.Screen 
        options={{ 
          headerShown: false,
          title: 'Details' 
        }} 
      />



      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#005BC1" />
            <Text style={styles.loadingText}>Fetching details...</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Ionicons name="alert-circle-outline" size={48} color="#9CA3AF" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : announcement ? (
          <View style={styles.container}>
            {/* Tag Badge */}
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{announcement.tag.toUpperCase()}</Text>
            </View>

            <Text style={styles.title}>{announcement.title}</Text>
            
            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
              <Text style={styles.dateText}>{announcement.date}</Text>
            </View>

            <View style={styles.divider} />

            {/* Summary Box */}
            {announcement.content ? (
              <View style={styles.summaryBox}>
                <Text style={styles.summaryText}>{announcement.content}</Text>
              </View>
            ) : null}

            {/* Main Detailed Content */}
            <Text style={styles.bodyText}>
              {announcement.body}
            </Text>
          </View>
        ) : (
          <Text style={styles.errorText}>Announcement not found.</Text>
        )}
      </ScrollView>
    </OtherPagesInc>
  );
}

const styles = StyleSheet.create({


  scrollContent: {
    paddingBottom: 40,
  },
  container: {
    padding: 20,
  },
  center: {
    marginTop: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0369A1',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 32,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 20,
  },
  summaryBox: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#005BC1',
    marginBottom: 24,
  },
  summaryText: {
    fontSize: 15,
    fontStyle: 'italic',
    color: '#4B5563',
    lineHeight: 22,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 26,
    color: '#374151',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 16,
    color: '#ef4444',
    fontSize: 14,
  },
});