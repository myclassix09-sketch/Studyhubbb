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

// Verified platform administrator emails
const ADMIN_EMAILS = ['myclassix09@gmail.com', 'himanshu00@studyhub.edu'];

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
          const userEmail = currentUser.email?.toLowerCase() || '';
          const isDesignatedAdmin = ADMIN_EMAILS.some((adm) => adm.toLowerCase() === userEmail);

          if (isDesignatedAdmin) {
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
          const userEmail = currentUser.email?.toLowerCase() || '';
          setIsAdmin(ADMIN_EMAILS.some((adm) => adm.toLowerCase() === userEmail));
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const adminSignIn = async (emailOrId: string, pass: string) => {
    setAuthError(null);
    try {
      const trimmed = emailOrId.trim();
      let targetEmail = trimmed;
      if (!targetEmail.includes('@')) {
        targetEmail = `${targetEmail.toLowerCase()}@studyhub.edu`;
      } else {
        targetEmail = targetEmail.toLowerCase();
      }

      let signedInUser: User;
      try {
        const cred = await signInWithEmailAndPassword(auth, targetEmail, pass);
        signedInUser = cred.user;
      } catch (signInErr: unknown) {
        const errCode = (signInErr as { code?: string })?.code || '';
        const errMsg = signInErr instanceof Error ? signInErr.message : '';
        // If user does not exist in Firebase Auth yet and is a designated administrator, provision it
        const isDesignated = ADMIN_EMAILS.some((adm) => adm.toLowerCase() === targetEmail.toLowerCase());
        if (isDesignated && (errCode === 'auth/user-not-found' || errMsg.includes('user-not-found') || errCode === 'auth/invalid-credential')) {
          try {
            const newCred = await createUserWithEmailAndPassword(auth, targetEmail, pass);
            signedInUser = newCred.user;
          } catch {
            throw signInErr;
          }
        } else {
          throw signInErr;
        }
      }

      const userEmail = signedInUser.email?.toLowerCase() || '';
      let hasAdminPrivileges = ADMIN_EMAILS.some((adm) => adm.toLowerCase() === userEmail);

      if (!hasAdminPrivileges) {
        const adminDoc = await getDoc(doc(db, 'admins', signedInUser.uid));
        hasAdminPrivileges = adminDoc.exists();
      }

      if (hasAdminPrivileges) {
        // Guarantee Firestore admin record
        await setDoc(doc(db, 'admins', signedInUser.uid), {
          email: signedInUser.email,
          role: 'super_admin',
          updatedAt: new Date().toISOString()
        }, { merge: true }).catch(() => {});
        setIsAdmin(true);
      } else {
        await fbSignOut(auth);
        setIsAdmin(false);
        const deniedMsg = 'Access Denied: This account is not authorized as an administrator.';
        setAuthError(deniedMsg);
        throw new Error(deniedMsg);
      }
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

  const signInWithEmail = async (emailOrId: string, pass: string) => {
    setAuthError(null);
    try {
      const trimmed = emailOrId.trim();
      const targetEmail = trimmed.includes('@') ? trimmed : `${trimmed.toLowerCase()}@student.studyhub.edu`;
      await signInWithEmailAndPassword(auth, targetEmail, pass);
    } catch (err: unknown) {
      let message = 'Failed to sign in. Please check your credentials.';
      if (err instanceof Error && err.message.includes('user-not-found')) {
        message = 'No account found with this email or student ID.';
      } else if (err instanceof Error && err.message.includes('wrong-password')) {
        message = 'Incorrect password.';
      } else if (err instanceof Error && err.message.includes('invalid-credential')) {
        message = 'Invalid email/student ID or password.';
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
      // If admin signs up with password, provision admin document
      const isDesignated = ADMIN_EMAILS.some((adm) => adm.toLowerCase() === email.toLowerCase());
      if (isDesignated) {
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
