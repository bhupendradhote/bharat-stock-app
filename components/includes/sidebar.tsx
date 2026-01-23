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

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.85;

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
}

const USER_IMAGE = 'https://i.pravatar.cc/300';

const Sidebar: React.FC<SidebarProps> = ({ visible, onClose }) => {
  const router = useRouter();
  const { signOut } = useAuth(); // ✅ Get signOut function
  const [showModal, setShowModal] = useState(visible);
  
  const [userData, setUserData] = useState({
    name: 'User',
    role: 'Member',
    phone: '',
    email: '',
    status: 'Active'
  });
  
  const [loading, setLoading] = useState(false);

  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fetch User Data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await storage.getUser();
        if (user) {
          setUserData({
            name: user.name || user.full_name || 'User',
            role: user.role || 'Member',
            phone: user.phone || '',
            email: user.email || '',
            status: user.status || 'Active' 
          });
        }
      } catch (error) {
        console.log("Error fetching user data", error);
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
  }, [visible]);

  // ✅ Logout Function
  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Logout", 
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            // 1. Attempt API logout
            await authService.logout(); 
          } catch (error) {
            console.log("API logout failed, clearing local data anyway.");
          } finally {
            setLoading(false);
            onClose(); // Close sidebar first
            
            // 2. Call Context SignOut 
            // This updates global state -> RootLayout sees token is null -> Redirects to Welcome
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
              <View style={styles.avatarWrapper}>
                <Image
                  source={{ uri: USER_IMAGE }}
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

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Plan: </Text>
                  <Text style={styles.infoValue}>Free Tier</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.ctaButton}>
                <Text style={styles.ctaButtonText}>
                  View Market Calls
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footerSection}>
              <TouchableOpacity style={styles.menuItem}>
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

const AVATAR_SIZE = 96;

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
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
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