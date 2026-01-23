import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';

const { width, height } = Dimensions.get('window');

const welcomeImageSource = require('../../../assets/images/welcome.png');

const WelcomePage = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.contentContainer}>
        <Image
          source={welcomeImageSource}
          style={styles.image}
          resizeMode="contain"
        />

        <Text style={styles.title}>
          Welcome to{'\n'}Bharat Stock Market{'\n'}Research
        </Text>

        <Text style={styles.subtitle}>
          Your Partner for smart investing.
        </Text>
      </View>

      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() => router.push('/pages/auth/loginRegister')}
        >
          <Text style={styles.buttonText}>Continue to Login</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  image: {
    width: width * 0.9,
    height: height * 0.45, // Adjusts height relative to screen size
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700', // Bold
    color: '#000',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666', // Grey text
    textAlign: 'center',
    fontWeight: '400',
  },
  footerContainer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 20 : 40,
  },
  button: {
    width: '100%',
    height: 56,
    backgroundColor: '#005BC1', // The specific blue from your design
    borderRadius: 30, // Pill shape
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#005BC1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4, // Android shadow
    marginBottom: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WelcomePage;