import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
  Modal,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { authService } from '../../services/api/methods/authService';
import { storage } from '../../services/storage';
import { useAuth } from '@/app/context/AuthContext';
import customerProfileServices from '@/services/api/methods/profileService'; 

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.85;
const AVATAR_SIZE = 96;
const DEFAULT_IMAGE = 'https://i.pravatar.cc/300';

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ visible, onClose }) => {
  const router = useRouter();
  const { signOut } = useAuth();
  const [showModal, setShowModal] = useState(visible);
  
  const [userData, setUserData] = useState({
    name: 'User',
    role: 'Member',
    phone: '',
    email: '',
    status: 'Active',
    plan: 'Free Tier' // Added plan field
  });

  const [profileImage, setProfileImage] = useState(DEFAULT_IMAGE);
  const [loading, setLoading] = useState(false);

  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // --- Fetch User Data ---
  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      try {
        let user: any = null;

        // 1. Try fetching fresh data from API
        try {
          const response: any = await customerProfileServices.getAllProfiles();
          user = response?.user ?? response?.data?.user;
        } catch (apiError) {
          console.warn("Sidebar API fetch failed, falling back to storage", apiError);
        }

        // 2. Fallback to storage if API failed or returned null
        if (!user) {
          user = await storage.getUser();
        }

        if (mounted && user) {
          // --- Determine Plan Name ---
          // Check for explicit plan name, or derive from subscription status
          const hasActiveSubscription = user.subscription?.status === 'active';
          const planName = user.plan?.name || (hasActiveSubscription ? 'Standard Plan' : 'Free Tier');

          // --- Set User Details ---
          setUserData({
            name: user.name || user.full_name || 'User',
            role: user.role || 'Member', 
            phone: user.phone || '',
            email: user.email || '',
            status: user.status || 'Active',
            plan: planName // Set dynamic plan
          });

          // --- Extract Profile Image ---
          let finalImage = DEFAULT_IMAGE;

          if (user.profile_image_url) {
            finalImage = user.profile_image_url;
          } 
          else {
            const kycActions = user.kyc?.raw_response?.actions;
            if (Array.isArray(kycActions)) {
              const digilocker = kycActions.find((a: any) => a.type === 'digilocker');
              const base64Img = digilocker?.details?.aadhaar?.image;
              
              if (base64Img) {
                finalImage = `data:image/jpeg;base64,${base64Img}`;
              }
            }
          }
          setProfileImage(finalImage);
        }
      } catch (error) {
        console.log("Error fetching user data in Sidebar", error);
      }
    };

    if (visible) {
      fetchUser();
      setShowModal(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setShowModal(false));
    }

    return () => {
      mounted = false;
    };
  }, [visible]);

  // --- Logout Function ---
  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Logout", 
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            await authService.logout(); 
          } catch (error) {
            console.log("API logout failed, clearing local data anyway.");
          } finally {
            setLoading(false);
            onClose(); 
            await signOut(); 
          }
        }
      }
    ]);
  };

  if (!showModal) return null;

  return (
    <Modal
      transparent
      visible={showModal}
      onRequestClose={onClose}
      animationType="none"
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.sidebarContainer,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <View style={styles.contentContainer}>
            <View style={styles.profileSection}>
              {/* Profile Image */}
              <View style={styles.avatarWrapper}>
                <Image
                  source={{ uri: profileImage }}
                  style={styles.avatar}
                  resizeMode="cover"
                />
              </View>

              <Text style={styles.welcomeText}>
                Welcome! {userData.name}
              </Text>

              {/* User Details */}
              <View style={styles.detailsContainer}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Role: </Text>
                  <Text style={[styles.infoValue, { textTransform: 'capitalize' }]}>{userData.role}</Text>
                </View>

                {userData.phone ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Phone: </Text>
                    <Text style={styles.infoValue}>{userData.phone}</Text>
                  </View>
                ) : null}

                {userData.email ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Email: </Text>
                    <Text style={[styles.infoValue, { fontSize: 13, flex: 1 }]} numberOfLines={1}>
                      {userData.email}
                    </Text>
                  </View>
                ) : null}

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Status: </Text>
                  <Text style={styles.statusValue}>{userData.status}</Text>
                </View>

                {/* Dynamic Plan Name */}
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Plan: </Text>
                  <Text style={styles.infoValue}>{userData.plan}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.ctaButton} onPress={() => {
                  router.push('../(tabs)/market-calls'); 
              }}>
                <Text style={styles.ctaButtonText}>
                  View Market Calls
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footerSection}>
              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => {
                  onClose();
                  router.push('../(tabs)/settings');
                }}
              >
                <Feather name="settings" size={20} color="#888" />
                <Text style={styles.menuText}>Settings</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={handleLogout}
                disabled={loading}
              >
                {loading ? (
                    <ActivityIndicator size="small" color="#ef4444" style={{ marginRight: 10 }} />
                ) : (
                    <Feather name="log-out" size={20} color="#ef4444" />
                )}
                <Text style={[styles.menuText, styles.logout]}>
                  {loading ? "Logging out..." : "Logout"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1, 
    justifyContent: 'flex-start',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  sidebarContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    height: '100%', 
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 10,
  },
  avatarWrapper: {
    width: AVATAR_SIZE + 6,
    height: AVATAR_SIZE + 6,
    borderRadius: (AVATAR_SIZE + 6) / 2,
    borderWidth: 2,
    borderColor: '#005BC1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    backgroundColor: '#fff',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: '#f0f0f0',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000',
  },
  detailsContainer: {
    width: '100%',
    paddingHorizontal: 10,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginRight: 6,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '700',
  },
  ctaButton: {
    marginTop: 24,
    backgroundColor: '#005BC1',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
  },
  ctaButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  footerSection: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#888',
    fontWeight: '500',
  },
  logout: {
    color: '#ef4444',
  },
});

export default Sidebar;