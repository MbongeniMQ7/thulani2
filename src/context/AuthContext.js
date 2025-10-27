import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsAuthenticated(!!firebaseUser);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const getCurrentUser = () => {
    return auth.currentUser;
  };

  const getUserEmail = () => {
    return user?.email || auth.currentUser?.email;
  };

  const getUserName = () => {
    return user?.displayName || auth.currentUser?.displayName || 
           user?.email?.split('@')[0] || auth.currentUser?.email?.split('@')[0] || 'User';
  };

  const getUserId = () => {
    return user?.uid || auth.currentUser?.uid;
  };

  const isUserAuthenticated = () => {
    return isAuthenticated && (user || auth.currentUser);
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    getCurrentUser,
    getUserEmail,
    getUserName,
    getUserId,
    isUserAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;