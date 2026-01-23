import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// --- Types ---
interface MenuItem {
  id: number;
  icon: any; 
  text: string;
  type: 'ionic' | 'material' | 'fontAwesome';
  color?: string;
  route?: string; // Optional: handy for cleaner routing logic later
}

const { width } = Dimensions.get('window');

const SettingsPage = () => {
  const router = useRouter(); // Initialize Router

  const menuItems: MenuItem[] = [
    { 
      id: 1, 
      icon: 'card-outline', 
      text: 'Payment & Invoices', 
      type: 'ionic',
      route: '/pages/settingsInnerPages/paymentAndInvoices' // Added route path
    },
    { id: 2, icon: 'file-text-o', text: 'KYC & Agreement', type: 'fontAwesome', route: '/pages/kyc/kycAgreement' },
    { id: 3, icon: 'help-circle-outline', text: 'Support', type: 'ionic' },
    { id: 4, icon: 'delete-outline', text: 'Delete Account', type: 'material', color: '#FF3B30' },
  ];

  const renderIcon = (item: MenuItem) => {
    const iconColor = item.color || '#000';
    switch (item.type) {
      case 'ionic':
        return <Ionicons name={item.icon} size={22} color={iconColor} />;
      case 'material':
        return <MaterialIcons name={item.icon} size={24} color={iconColor} />;
      case 'fontAwesome':
        return <FontAwesome name={item.icon} size={20} color={iconColor} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.headerTitle}>Settings</Text>

        <View style={styles.profileSection}>
          <View style={styles.profileHeaderRow}>
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} 
                style={styles.avatar}
              />
              <Text style={styles.userName}>Bhupendra D</Text>
            </View>
            
              <TouchableOpacity 
                style={styles.editBtn} 
                onPress={() => router.push('/pages/profile/profileDetails')}
              >
                <Text style={styles.editBtnText}>Edit Profile</Text>
              </TouchableOpacity>
          </View>

          <View style={styles.infoGrid}>
            {/* Row 1 */}
            <View style={styles.infoRow}>
              <View style={styles.infoCol}>
                <Text style={styles.label}>User ID</Text>
                <Text style={styles.value}>0000000001</Text>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.emailRow}>
                  <Text style={[styles.value, styles.emailText]} numberOfLines={1} ellipsizeMode='tail'>
                    vasanthkumarv@gmail.com
                  </Text>
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Row 2 */}
            <View style={styles.infoRow}>
              <View style={styles.infoCol}>
                <Text style={styles.label}>Phone Number</Text>
                <Text style={styles.value}>+91 9876543210</Text>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.label}>Pan Number</Text>
                <Text style={styles.value}>******945N</Text>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.label}>Aadhar Number</Text>
                <Text style={styles.value}>**** **** 0923</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.planSection}>
          <View style={styles.planHeaderRow}>
            <Text style={styles.sectionHeading}>Current Plan</Text>
            <Text style={styles.planName}>None</Text>
          </View>

          <View style={styles.planDetailRow}>
            <Text style={styles.planLabel}>Validity</Text>
            <Text style={styles.planValue}>-</Text>
          </View>
          <View style={styles.planDetailRow}>
            <Text style={styles.planLabel}>Validity Till</Text>
            <Text style={styles.planValue}>-</Text>
          </View>
          <View style={styles.planDetailRow}>
            <Text style={styles.planLabel}>KYC Status</Text>
            <Text style={styles.kycStatusRed}>Not Completed</Text>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity 
              style={styles.actionBtnBlue}
              onPress={() => router.push('/pages/settingsInnerPages/pricingPlans')}
            >
              <Text style={styles.actionBtnText}>Upgrade Plan</Text>
            </TouchableOpacity>

            <View style={{ width: 12 }} /> 

            <TouchableOpacity 
              style={styles.actionBtnBlue}
            >
              <Text style={styles.actionBtnText}>Complete KYC</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => {
                if (item.route) {
                  router.push(item.route as any);
                } else {
                  console.log(`Clicked ${item.text}`);
                }
              }}
            >
              <View style={styles.menuIconContainer}>
                {renderIcon(item)}
              </View>
              <Text style={[styles.menuText, item.color ? { color: item.color } : {}]}>
                {item.text}
              </Text>
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
    paddingBottom: 20,
    paddingTop: 10,
  },
  
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 20,
  },

  profileSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#eee', 
    marginRight: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000',
    maxWidth: width * 0.45,
  },
  editBtn: {
    backgroundColor: '#005BC1', 
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  editBtnText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '400',
  },

  // --- Info Grid ---
  infoGrid: {
    marginTop: 0,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  infoCol: {
    flex: 1,
    paddingRight: 10,
  },
  label: {
    fontSize: 12,
    color: '#000',
    marginBottom: 4,
    fontWeight: '500',
  },
  value: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
  },
  
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  emailText: {
    marginRight: 0,
  },
  verifiedBadge: {
    backgroundColor: '#FFCCCC', // Light red bg
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  verifiedText: {
    color: '#FF0000',
    fontSize: 10,
    fontWeight: '400',
  },

  planSection: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  planHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 22,
    fontWeight: '500',
    color: '#000',
  },
  planName: {
    fontSize: 22,
    fontWeight: '500',
    color: '#000',
  },
  planDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  planLabel: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  planValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
  },
  kycStatusRed: {
    fontSize: 15,
    color: '#FF3B30',
    fontWeight: '500',
  },

  actionsRow: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 20,
  },
  actionBtnBlue: {
    flex: 1,
    backgroundColor: '#005BC1',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '400',
  },

  menuSection: {
    marginTop: 5,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  menuIconContainer: {
    width: 30,
    alignItems: 'flex-start',
    marginRight: 8,
  },
  menuText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#000',
  },
});

export default SettingsPage;