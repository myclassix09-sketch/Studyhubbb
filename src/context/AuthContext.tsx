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
  adminId: string | null;
  loading: boolean;
  authError: string | null;
  setAuthError: (err: string | null) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  loginAsAdmin: (adminIdInput: string, passwordInput: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendResetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PRIMARY_ADMIN_EMAIL = 'myclassix09@gmail.com';
const DEDICATED_ADMIN_ID = 'Himanshu00';
const DEDICATED_ADMIN_EMAIL = 'himanshu00@studyhub.edu';
const DEDICATED_ADMIN_PASS = 'S@tudyhubb';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('studyhub_admin_session') === DEDICATED_ADMIN_ID;
  });
  const [adminId, setAdminId] = useState<string | null>(() => {
    return localStorage.getItem('studyhub_admin_session');
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      const savedAdminSession = localStorage.getItem('studyhub_admin_session');

      if (currentUser) {
        try {
          const userEmail = currentUser.email?.toLowerCase();
          if (
            userEmail === PRIMARY_ADMIN_EMAIL.toLowerCase() ||
            userEmail === DEDICATED_ADMIN_EMAIL.toLowerCase() ||
            savedAdminSession === DEDICATED_ADMIN_ID
          ) {
            setIsAdmin(true);
            setAdminId(savedAdminSession || DEDICATED_ADMIN_ID);
            // Ensure admin document exists in firestore
            const adminDocRef = doc(db, 'admins', currentUser.uid);
            await setDoc(adminDocRef, {
              email: currentUser.email,
              adminId: DEDICATED_ADMIN_ID,
              role: 'super_admin',
              updatedAt: new Date().toISOString()
            }, { merge: true }).catch(() => {});
          } else {
            const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
            if (adminDoc.exists()) {
              setIsAdmin(true);
              setAdminId(adminDoc.data()?.adminId || 'Admin');
            } else if (savedAdminSession !== DEDICATED_ADMIN_ID) {
              setIsAdmin(false);
              setAdminId(null);
            }
          }
        } catch {
          if (savedAdminSession === DEDICATED_ADMIN_ID) {
            setIsAdmin(true);
            setAdminId(DEDICATED_ADMIN_ID);
          }
        }
      } else {
        if (savedAdminSession === DEDICATED_ADMIN_ID) {
          setIsAdmin(true);
          setAdminId(DEDICATED_ADMIN_ID);
        } else {
          setIsAdmin(false);
          setAdminId(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginAsAdmin = async (adminIdInput: string, passwordInput: string) => {
    setAuthError(null);
    const cleanedId = adminIdInput.trim();

    // Check credentials:
    // Admin ID must be Himanshu00 and password must be S@tudyhubb
    const isIdMatch =
      cleanedId.toLowerCase() === DEDICATED_ADMIN_ID.toLowerCase() ||
      cleanedId.toLowerCase() === DEDICATED_ADMIN_EMAIL.toLowerCase() ||
      cleanedId.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();

    const isPassMatch = passwordInput === DEDICATED_ADMIN_PASS;

    if (!isIdMatch || !isPassMatch) {
      const err = 'Invalid Administrator ID or Password. Please check your credentials.';
      setAuthError(err);
      throw new Error(err);
    }

    // Set secure local admin session
    localStorage.setItem('studyhub_admin_session', DEDICATED_ADMIN_ID);
    setIsAdmin(true);
    setAdminId(DEDICATED_ADMIN_ID);

    // Synchronize with Firebase Auth to provide authenticated Firestore operations
    try {
      try {
        await signInWithEmailAndPassword(auth, DEDICATED_ADMIN_EMAIL, DEDICATED_ADMIN_PASS);
      } catch (signInErr: any) {
        if (
          signInErr?.message?.includes('user-not-found') ||
          signInErr?.code === 'auth/user-not-found' ||
          signInErr?.code === 'auth/invalid-credential'
        ) {
          // Provision dedicated admin account in Firebase Auth
          const cred = await createUserWithEmailAndPassword(
            auth,
            DEDICATED_ADMIN_EMAIL,
            DEDICATED_ADMIN_PASS
          );
          await updateProfile(cred.user, { displayName: 'Himanshu (Admin)' });
          await setDoc(doc(db, 'admins', cred.user.uid), {
            email: DEDICATED_ADMIN_EMAIL,
            adminId: DEDICATED_ADMIN_ID,
            role: 'super_admin',
            createdAt: new Date().toISOString()
          }, { merge: true });
        }
      }
    } catch (fbErr) {
      console.warn('Firebase user sync completed or deferred:', fbErr);
    }
  };

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google sign in failed';
      setAuthError(message);
      throw err;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      if (name.trim()) {
        await updateProfile(userCredential.user, { displayName: name.trim() });
      }
      if (
        email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase() ||
        email.toLowerCase() === DEDICATED_ADMIN_EMAIL.toLowerCase()
      ) {
        await setDoc(doc(db, 'admins', userCredential.user.uid), {
          email,
          adminId: DEDICATED_ADMIN_ID,
          role: 'super_admin',
          createdAt: new Date().toISOString()
        }, { merge: true });
        setIsAdmin(true);
        setAdminId(DEDICATED_ADMIN_ID);
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
    localStorage.removeItem('studyhub_admin_session');
    setIsAdmin(false);
    setAdminId(null);
    try {
      await fbSignOut(auth);
    } catch (err) {
      console.error('Error signing out', err);
    }
  };

  const sendResetPassword = async (email: string) => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email);
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
        adminId,
        loading,
        authError,
        setAuthError,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        loginAsAdmin,
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
