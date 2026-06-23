import React, { createContext, useContext, useEffect, useState } from "react";
import type { FirebaseAuthTypes } from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { subscribeToAuthState } from "@/services/authService";
import type { AppUser } from "@/utils/types";

interface AuthContextValue {
  firebaseUser: FirebaseAuthTypes.User | null;
  appUser: AppUser | null;
  initializing: boolean;
  isLoggedIn: boolean;
  isEmailVerified: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  firebaseUser: null,
  appUser: null,
  initializing: true,
  isLoggedIn: false,
  isEmailVerified: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = subscribeToAuthState((user) => {
      setFirebaseUser(user);
      if (initializing) setInitializing(false);
    });
    return unsubscribeAuth;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!firebaseUser) {
      setAppUser(null);
      return;
    }
    const unsubscribeDoc = firestore()
      .collection("users")
      .doc(firebaseUser.uid)
      .onSnapshot((snap) => {
        if (snap.exists) {
          setAppUser(snap.data() as AppUser);
        }
      });
    return unsubscribeDoc;
  }, [firebaseUser]);

  const value: AuthContextValue = {
    firebaseUser,
    appUser,
    initializing,
    isLoggedIn: !!firebaseUser,
    isEmailVerified: !!firebaseUser?.emailVerified,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
