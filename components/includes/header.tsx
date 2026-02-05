import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { storage } from '../../services/storage';
import customerProfileServices from '@/services/api/methods/profileService'; 

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
        if (userName && avatarUrl) {
          if (mounted) {
            setDisplayName(userName);
            setDisplayAvatar(avatarUrl);
          }
          return;
        }

        try {
          let userData: any = null;
          
          try {
            const response: any = await customerProfileServices.getAllProfiles();
            userData = response?.user ?? response?.data?.user;
          } catch (apiError) {
            console.warn("Header API fetch failed, falling back to storage", apiError);
          }

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

            if (userData.profile_image_url) {
              finalImage = userData.profile_image_url;
            } 
            else {
              const kycActions = userData.kyc?.raw_response?.actions;
              if (Array.isArray(kycActions)) {
                const digilocker = kycActions.find((a: any) => a.type === 'digilocker');
                const base64Img = digilocker?.details?.aadhaar?.image;
                
                if (base64Img) {
                  finalImage = `data:image/jpeg;base64,${base64Img}`;
                }
              }
            }
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