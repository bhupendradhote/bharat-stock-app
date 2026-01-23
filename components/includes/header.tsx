import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router'; // ✅ Refreshes data on navigation
import { storage } from '../../services/storage'; 

interface HeaderProps {
  userName?: string; 
  avatarUrl?: string;
  onMenuPress?: () => void;
  onProfilePress?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  userName, 
  avatarUrl = "https://i.pravatar.cc/300",
  onMenuPress,
  onProfilePress
}) => {
  const [displayName, setDisplayName] = useState(userName || 'Welcome');

  useFocusEffect(
    useCallback(() => {
      const loadUser = async () => {
        if (userName) {
            setDisplayName(userName);
            return;
        }

        try {
          const user = await storage.getUser();
          
          if (user && user.name) {
            setDisplayName(user.name);
          } else if (user && user.full_name) {
            setDisplayName(user.full_name);
          } else {
            setDisplayName("User");
          }
        } catch (e) {
          console.error("Failed to load user header", e);
        }
      };

      loadUser();
    }, [userName]) 
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
            source={{ uri: avatarUrl }}
            style={styles.avatar}
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
  },
});

export default Header;