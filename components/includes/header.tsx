import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { storage } from '../../services/storage';
import customerProfileServices from '@/services/api/methods/profileService'; // Import your API service

interface HeaderProps {
  userName?: string;
  avatarUrl?: string;
  onMenuPress?: () => void;
  onProfilePress?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  userName,
  avatarUrl,
  onMenuPress,
  onProfilePress,
}) => {
  const [displayName, setDisplayName] = useState(userName || 'User');
  const [displayAvatar, setDisplayAvatar] = useState(avatarUrl || "https://i.pravatar.cc/300");

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      const loadUser = async () => {
        // 1. If props are passed, prioritize them (e.g. parent component controls state)
        if (userName && avatarUrl) {
          if (mounted) {
            setDisplayName(userName);
            setDisplayAvatar(avatarUrl);
          }
          return;
        }

        try {
          // 2. Fetch latest data from API to ensure we have the KYC image
          // (Storage might be stale or missing the deep KYC object)
          let userData: any = null;
          
          try {
            const response: any = await customerProfileServices.getAllProfiles();
            // Normalize response
            userData = response?.user ?? response?.data?.user;
          } catch (apiError) {
            console.warn("Header API fetch failed, falling back to storage", apiError);
          }

          // 3. Fallback to Storage if API failed
          if (!userData) {
            userData = await storage.getUser();
          }

          if (!mounted || !userData) return;

          // --- Set Name ---
          if (!userName) {
            const name = userData.name || userData.full_name || "User";
            setDisplayName(name);
          }

          // --- Set Image ---
          if (!avatarUrl) {
            let finalImage = "https://i.pravatar.cc/300";

            // Priority 1: Direct Image URL
            if (userData.image) {
              finalImage = userData.image;
            } 
            // Priority 2: KYC Base64 Image
            else {
              // Deep extraction safety check
              const kycActions = userData.kyc?.raw_response?.actions;
              if (Array.isArray(kycActions)) {
                const digilocker = kycActions.find((a: any) => a.type === 'digilocker');
                const base64Img = digilocker?.details?.aadhaar?.image;
                
                if (base64Img) {
                  // Ensure formatting is correct
                  finalImage = `data:image/jpeg;base64,${base64Img}`;
                }
              }
            }

            // Debugging: Uncomment if image still fails
            // console.log("Header Image Resolved To:", finalImage.substring(0, 50) + "...");
            
            setDisplayAvatar(finalImage);
          }

        } catch (e) {
          console.error("Failed to load user header data", e);
        }
      };

      loadUser();

      return () => {
        mounted = false;
      };
    }, [userName, avatarUrl])
  );

  return (
    <View style={styles.headerRow}>
      <View>
        <Text style={styles.welcome}>Welcome!</Text>
        <Text style={styles.username}>
          {displayName}
        </Text>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.iconBtn} onPress={onMenuPress}>
          <Feather name="menu" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.avatarBtn} onPress={onProfilePress}>
          <Image
            source={{ uri: displayAvatar }}
            style={styles.avatar}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingTop: 40,
  },
  welcome: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    marginRight: 15,
    padding: 5,
  },
  avatarBtn: {
    marginLeft: 5,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#f0f0f0', 
  },
});

export default Header;