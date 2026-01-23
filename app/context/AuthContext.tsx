import React, { createContext, useContext, useEffect, useState } from 'react';
import { storage } from '../../services/storage'; // Adjust path to your storage file

type AuthContextType = {
  userToken: string | null;
  isLoading: boolean;
  signIn: (token: string, userData: any) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  userToken: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check login status when app starts
  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await storage.getToken();
        if (token) {
          setUserToken(token);
        }
      } catch (e) {
        console.error('Failed to load token', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);

  // Call this when user logs in successfully
  const signIn = async (token: string, userData: any) => {
    await storage.saveToken(token);
    await storage.saveUser(userData);
    setUserToken(token); // ⚡ Updates Global State -> Triggers Redirect
  };

  const signOut = async () => {
    await storage.clearAll();
    setUserToken(null); // ⚡ Updates Global State -> Triggers Redirect
  };

  return (
    <AuthContext.Provider value={{ userToken, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}