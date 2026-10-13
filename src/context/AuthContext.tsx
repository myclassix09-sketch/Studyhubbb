import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase/config';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  authError: string | null;
  setAuthError: (err: string | null) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  adminSignIn: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendResetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Primary verified platform administrator email
const PRIMARY_ADMIN_EMAIL = 'myclassix09@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const userEmail = currentUser.email?.toLowerCase();
          if (userEmail === PRIMARY_ADMIN_EMAIL.toLowerCase()) {
            setIsAdmin(true);
            // Ensure admin authorization document exists in firestore
            const adminDocRef = doc(db, 'admins', currentUser.uid);
            await setDoc(adminDocRef, {
              email: currentUser.email,
              role: 'super_admin',
              updatedAt: new Date().toISOString()
            }, { merge: true }).catch(() => {});
          } else {
            // Check verified admins collection in Firestore
            const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
            setIsAdmin(adminDoc.exists());
          }
        } catch (err) {
          console.warn('Admin authorization verification notice:', err);
          setIsAdmin(currentUser.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase());
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const adminSignIn = async (email: string, pass: string) => {
    setAuthError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const signedInUser = cred.user;
      const userEmail = signedInUser.email?.toLowerCase();

      // Check if primary admin or exists in admins collection
      let hasAdminPrivileges = userEmail === PRIMARY_ADMIN_EMAIL.toLowerCase();

      if (!hasAdminPrivileges) {
        const adminDoc = await getDoc(doc(db, 'admins', signedInUser.uid));
        hasAdminPrivileges = adminDoc.exists();
      } else {
        // Guarantee Firestore admin record for primary admin
        await setDoc(doc(db, 'admins', signedInUser.uid), {
          email: signedInUser.email,
          role: 'super_admin',
          updatedAt: new Date().toISOString()
        }, { merge: true }).catch(() => {});
      }

      if (!hasAdminPrivileges) {
        // Not an authorized admin
        await fbSignOut(auth);
        setIsAdmin(false);
        const deniedMsg = 'Access Denied: This account is not authorized as an administrator.';
        setAuthError(deniedMsg);
        throw new Error(deniedMsg);
      }

      setIsAdmin(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Admin authentication failed.';
      setAuthError(message);
      throw new Error(message);
    }
  };

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      let message = err instanceof Error ? err.message : 'Google sign in failed';
      if (err instanceof Error && err.message.includes('unauthorized-domain')) {
        message = 'Please add your GitHub Pages domain to Firebase Console > Authentication > Settings > Authorized Domains.';
      }
      setAuthError(message);
      throw new Error(message);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
    } catch (err: unknown) {
      let message = 'Failed to sign in. Please check your credentials.';
      if (err instanceof Error && err.message.includes('user-not-found')) {
        message = 'No account found with this email.';
      } else if (err instanceof Error && err.message.includes('wrong-password')) {
        message = 'Incorrect password.';
      } else if (err instanceof Error && err.message.includes('invalid-credential')) {
        message = 'Invalid email or password.';
      }
      setAuthError(message);
      throw new Error(message);
    }
  };

  const signUpWithEmail = async (name: string, email: string, pass: string) => {
    setAuthError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (name.trim()) {
        await updateProfile(userCredential.user, { displayName: name.trim() });
      }
      // If primary admin signs up with password, provision admin document
      if (email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase()) {
        await setDoc(doc(db, 'admins', userCredential.user.uid), {
          email,
          role: 'super_admin',
          createdAt: new Date().toISOString()
        }, { merge: true });
        setIsAdmin(true);
      }
    } catch (err: unknown) {
      let message = 'Failed to create account.';
      if (err instanceof Error && err.message.includes('email-already-in-use')) {
        message = 'An account with this email already exists.';
      } else if (err instanceof Error && err.message.includes('weak-password')) {
        message = 'Password should be at least 6 characters.';
      }
      setAuthError(message);
      throw new Error(message);
    }
  };

  const signOut = async () => {
    setIsAdmin(false);
    try {
      await fbSignOut(auth);
    } catch (err) {
      console.error('Error signing out', err);
    }
  };

  const sendResetPassword = async (email: string) => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send password reset email.';
      setAuthError(message);
      throw new Error(message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        authError,
        setAuthError,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        adminSignIn,
        signOut,
        sendResetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
