import React, { useEffect, useState } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import customerProfileServices from '@/services/api/methods/profileService';

// --- Types ---
interface MenuItem {
  id: number;
  icon: any;
  text: string;
  type: 'ionic' | 'material' | 'fontAwesome';
  color?: string;
  route?: string;
}

const { width } = Dimensions.get('window');

const SettingsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  // --- Helper: Get Last 4 Digits ---
  const getLast4Chars = (str: string | null | undefined, type: 'pan' | 'aadhar') => {
    if (!str || typeof str !== 'string' || str.length < 4) {
      return type === 'pan' ? '----------' : '---- ---- ----';
    }
    
    const last4 = str.slice(-4);
    
    if (type === 'pan') {
      return `******${last4}`;
    } else {
      return `**** **** ${last4}`;
    }
  };

  const getKycData = (user: any) => {
    const kycActions = user?.kyc?.raw_response?.actions;
    if (Array.isArray(kycActions)) {
      const digilockerData = kycActions.find((a: any) => a.type === 'digilocker');
      return digilockerData?.details || {};
    }
    return {};
  };

  // --- Fetch Data ---
  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      try {
        const response: any = await customerProfileServices.getAllProfiles();
        
        if (mounted) {
          // Normalize API response structure
          const user = response?.user ?? response?.data?.user ?? {};
          setUserData(user);
        }
      } catch (err) {
        console.warn('Settings fetch error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      mounted = false;
    };
  }, []);

  // --- Data Formatting Helpers ---
  const getFormattedDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // --- Derived State ---
  const bsmrId = userData?.bsmr_id || '-';
  const userName = userData?.name || 'User';
  const userEmail = userData?.email || '-';
  const userPhone = userData?.phone || '-';
  const isEmailVerified = !!userData?.email_verified_at;

  const kycDetails = getKycData(userData);
  
  let profileImageSource = { uri: 'https://randomuser.me/api/portraits/men/32.jpg' };
  
  if (userData?.profile_image_url) {
    profileImageSource = { uri: userData.profile_image_url };
  } else if (kycDetails?.aadhaar?.profile_image_url) {
    const base64String = kycDetails.aadhaar.image;
    profileImageSource = { uri: `data:image/jpeg;base64,${base64String}` };
  }

  const panNumberRaw = userData?.pan_card || kycDetails?.pan?.id_number;
  const aadharNumberRaw = userData?.adhar_card || kycDetails?.aadhaar?.id_number;

  const panMasked = getLast4Chars(panNumberRaw, 'pan');
  const aadharMasked = getLast4Chars(aadharNumberRaw, 'aadhar');

  const subscription = userData?.subscription;
  const hasActivePlan = subscription?.status === 'active';
  const planName = userData?.plan?.name || (hasActivePlan ? 'Standard Plan' : 'No Active Plan'); 
  const validityStart = getFormattedDate(subscription?.start_date);
  const validityEnd = getFormattedDate(subscription?.end_date);

  const kycStatus = userData?.kyc?.status || 'pending';
  const isKycVerified = kycStatus === 'verified' || kycStatus === 'approved';

  const menuItems: MenuItem[] = [
    {
      id: 1,
      icon: 'card-outline',
      text: 'Payment & Invoices',
      type: 'ionic',
      route: '/pages/settingsInnerPages/paymentAndInvoices',
    },
    {
      id: 2,
      icon: 'file-text-o',
      text: 'KYC & Agreement',
      type: 'fontAwesome',
      route: '/pages/kyc/kycAgreement',
    },
    { id: 3,
      icon: 'help-circle-outline', 
      text: 'Support', 
      type: 'ionic',
      route: '/pages/support/SupportPage',
    },
    {
      id: 4,
      icon: 'delete-outline',
      text: 'Delete Account',
      type: 'material',
      color: '#FF3B30',
    },
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#005BC1" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.headerTitle}>Settings</Text>

        {/* --- Profile Section --- */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeaderRow}>
            <View style={styles.avatarWrapper}>
              <Image
                source={profileImageSource}
                style={styles.avatar}
                resizeMode="cover"
              />
              <Text style={styles.userName} numberOfLines={1}>
                {userName}
              </Text>
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
                <Text style={styles.label}>BSMR ID</Text>
                <Text style={styles.value}>{bsmrId}</Text>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.emailRow}>
                  <Text
                    style={[styles.value, styles.emailText]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {userEmail}
                  </Text>
                  <View
                    style={[
                      styles.verifiedBadge,
                      { backgroundColor: isEmailVerified ? '#DCFCE7' : '#FEE2E2' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.verifiedText,
                        { color: isEmailVerified ? '#16A34A' : '#EF4444' },
                      ]}
                    >
                      {isEmailVerified ? 'Verified' : 'Unverified'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Row 2 */}
            <View style={styles.infoRow}>
              <View style={styles.infoCol}>
                <Text style={styles.label}>Phone Number</Text>
                <Text style={styles.value}>{userPhone}</Text>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.label}>Pan Number</Text>
                <Text style={styles.value}>{panMasked}</Text>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.label}>Aadhar Number</Text>
                <Text style={styles.value}>{aadharMasked}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* --- Plan Section --- */}
        <View style={styles.planSection}>
          <View style={styles.planHeaderRow}>
            <Text style={styles.sectionHeading}>Current Plan</Text>
            <Text style={styles.planName}>{planName}</Text>
          </View>

          <View style={styles.planDetailRow}>
            <Text style={styles.planLabel}>Start Date</Text>
            <Text style={styles.planValue}>{validityStart}</Text>
          </View>
          <View style={styles.planDetailRow}>
            <Text style={styles.planLabel}>End Date</Text>
            <Text style={styles.planValue}>{validityEnd}</Text>
          </View>
          
          <View style={styles.planDetailRow}>
            <Text style={styles.planLabel}>KYC Status</Text>
            <Text style={isKycVerified ? styles.kycStatusGreen : styles.kycStatusRed}>
              {kycStatus.charAt(0).toUpperCase() + kycStatus.slice(1)}
            </Text>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionBtnBlue}
              onPress={() => router.push('/pages/settingsInnerPages/pricingPlans')}
            >
              <Text style={styles.actionBtnText}>Upgrade Plan</Text>
            </TouchableOpacity>

            <View style={{ width: 12 }} />

            {!isKycVerified && (
              <TouchableOpacity
                style={styles.actionBtnBlue}
                onPress={() => router.push('/pages/kyc/kycAgreement')}
              >
                <Text style={styles.actionBtnText}>Complete KYC</Text>
              </TouchableOpacity>
            )}
            
            {isKycVerified && (
               <TouchableOpacity
               style={[styles.actionBtnBlue, { backgroundColor: '#E5E7EB' }]}
               disabled={true}
             >
               <Text style={[styles.actionBtnText, {color: '#9CA3AF'}]}>KYC Completed</Text>
             </TouchableOpacity>
            )}
          </View>
        </View>

        {/* --- Menu Section --- */}
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

/* ================== STYLES ================== */
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
    flex: 1, 
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#eee',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6'
  },
  userName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000',
    maxWidth: width * 0.4, 
  },
  editBtn: {
    backgroundColor: '#005BC1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  editBtnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
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
    color: '#6B7280',
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
    marginRight: 6,
    maxWidth: '65%',
  },
  verifiedBadge: {
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '600',
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
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  planName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#005BC1',
  },
  planDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  planLabel: {
    fontSize: 13,
    color: '#000',
    fontWeight: '500',
  },
  planValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  kycStatusRed: {
    fontSize: 15,
    color: '#EF4444',
    fontWeight: '600',
  },
  kycStatusGreen: {
    fontSize: 15,
    color: '#16A34A',
    fontWeight: '600',
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
    fontWeight: '600',
  },

  menuSection: {
    marginTop: 5,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuIconContainer: {
    width: 30,
    alignItems: 'flex-start',
    marginRight: 8,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
});

export default SettingsPage;