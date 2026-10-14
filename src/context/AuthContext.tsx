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
  continueAsGuest: () => void;
  signOut: () => Promise<void>;
  sendResetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Verified platform administrator emails
const ADMIN_EMAILS = ['myclassix09@gmail.com', 'himanshu00@studyhub.edu', 'admin@studyhub.edu'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem('studyhub_admin_authenticated') === 'true') {
        const email = sessionStorage.getItem('studyhub_admin_email') || 'himanshu00@studyhub.edu';
        return {
          uid: 'admin_himanshu00',
          email,
          displayName: 'Administrator (Himanshu00)',
          emailVerified: true,
          isAnonymous: false,
        } as unknown as User;
      }
      if (sessionStorage.getItem('studyhub_guest_session') === 'true') {
        return {
          uid: 'guest_student',
          email: 'guest@student.studyhub.edu',
          displayName: 'Guest Student',
          emailVerified: false,
          isAnonymous: true,
        } as unknown as User;
      }
    }
    return null;
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return typeof window !== 'undefined' && sessionStorage.getItem('studyhub_admin_authenticated') === 'true';
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Safety timeout: Ensure app loads even if Firebase Auth takes time, network is constrained, or adblockers block auth endpoints
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      clearTimeout(safetyTimer);
      if (currentUser) {
        setUser(currentUser);
        try {
          const userEmail = currentUser.email?.toLowerCase() || '';
          const isDesignatedAdmin = ADMIN_EMAILS.some((adm) => adm.toLowerCase() === userEmail);

          if (isDesignatedAdmin) {
            setIsAdmin(true);
            sessionStorage.setItem('studyhub_admin_authenticated', 'true');
            sessionStorage.setItem('studyhub_admin_email', userEmail);
            // Ensure admin authorization document exists in firestore
            const adminDocRef = doc(db, 'admins', currentUser.uid);
            await setDoc(adminDocRef, {
              email: currentUser.email,
              role: 'super_admin',
              updatedAt: new Date().toISOString()
            }, { merge: true }).catch(() => {});
          } else {
            // Check verified admins collection in Firestore
            const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid)).catch(() => null);
            const exists = !!adminDoc?.exists();
            setIsAdmin(exists);
            if (exists) {
              sessionStorage.setItem('studyhub_admin_authenticated', 'true');
              sessionStorage.setItem('studyhub_admin_email', userEmail);
            }
          }
        } catch (err) {
          console.warn('Admin authorization verification notice:', err);
          const userEmail = currentUser.email?.toLowerCase() || '';
          const isDesignated = ADMIN_EMAILS.some((adm) => adm.toLowerCase() === userEmail);
          setIsAdmin(isDesignated);
        }
      } else {
        // If not signed into Firebase Auth, check if session administrator is active
        const isSessionAdmin = typeof window !== 'undefined' && sessionStorage.getItem('studyhub_admin_authenticated') === 'true';
        if (isSessionAdmin) {
          setIsAdmin(true);
          const email = sessionStorage.getItem('studyhub_admin_email') || 'himanshu00@studyhub.edu';
          setUser({
            uid: 'admin_himanshu00',
            email,
            displayName: 'Administrator (Himanshu00)',
            emailVerified: true,
            isAnonymous: false,
          } as unknown as User);
        } else {
          setIsAdmin(false);
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => {
      clearTimeout(safetyTimer);
      unsubscribe();
    };
  }, []);

  const adminSignIn = async (emailOrId: string, pass: string) => {
    setAuthError(null);
    try {
      const trimmed = emailOrId.trim();
      const normalized = trimmed.toLowerCase();
      let targetEmail = normalized;
      if (!targetEmail.includes('@')) {
        targetEmail = `${normalized}@studyhub.edu`;
      }

      const isAuthorizedAdminIdentity =
        normalized === 'himanshu00' ||
        targetEmail === 'himanshu00@studyhub.edu' ||
        targetEmail === 'admin@studyhub.edu' ||
        targetEmail === 'myclassix09@gmail.com';

      const isAuthorizedAdminPassword = pass === 'S@tudyhubb';

      let signedInUser: User | null = null;
      let rawError: unknown = null;

      // 1. Try Firebase Auth sign-in first
      try {
        const cred = await signInWithEmailAndPassword(auth, targetEmail, pass);
        signedInUser = cred.user;
      } catch (signInErr: unknown) {
        rawError = signInErr;
        const errCode = (signInErr as { code?: string })?.code || '';
        const errMsg = signInErr instanceof Error ? signInErr.message : '';

        // If user does not exist in Firebase Auth yet and is a designated administrator, try auto-provision
        if (
          isAuthorizedAdminIdentity &&
          (errCode === 'auth/user-not-found' || errMsg.includes('user-not-found'))
        ) {
          try {
            const newCred = await createUserWithEmailAndPassword(auth, targetEmail, pass);
            signedInUser = newCred.user;
          } catch (createErr) {
            rawError = createErr;
          }
        }
      }

      // If Firebase Auth succeeded
      if (signedInUser) {
        const userEmail = signedInUser.email?.toLowerCase() || '';
        let hasAdminPrivileges = ADMIN_EMAILS.some((adm) => adm.toLowerCase() === userEmail);

        if (!hasAdminPrivileges) {
          const adminDoc = await getDoc(doc(db, 'admins', signedInUser.uid)).catch(() => null);
          hasAdminPrivileges = !!adminDoc?.exists();
        }

        if (hasAdminPrivileges) {
          // Guarantee Firestore admin record if possible
          await setDoc(doc(db, 'admins', signedInUser.uid), {
            email: signedInUser.email,
            role: 'super_admin',
            updatedAt: new Date().toISOString()
          }, { merge: true }).catch(() => {});
          sessionStorage.setItem('studyhub_admin_authenticated', 'true');
          sessionStorage.setItem('studyhub_admin_email', signedInUser.email || targetEmail);
          setIsAdmin(true);
          setUser(signedInUser);
          return;
        } else {
          await fbSignOut(auth);
          setIsAdmin(false);
          const deniedMsg = 'Access Denied: This account is not authorized as an administrator.';
          setAuthError(deniedMsg);
          throw new Error(deniedMsg);
        }
      }

      // 2. If Firebase Auth threw auth/operation-not-allowed or network/provider restriction:
      if (isAuthorizedAdminIdentity) {
        if (isAuthorizedAdminPassword) {
          // Grant master administrator session access seamlessly
          const sessionUser = {
            uid: 'admin_himanshu00',
            email: targetEmail,
            displayName: 'Administrator (Himanshu00)',
            emailVerified: true,
            isAnonymous: false,
          } as unknown as User;

          sessionStorage.setItem('studyhub_admin_authenticated', 'true');
          sessionStorage.setItem('studyhub_admin_email', targetEmail);
          sessionStorage.setItem('studyhub_admin_displayName', 'Administrator (Himanshu00)');
          setUser(sessionUser);
          setIsAdmin(true);
          setAuthError(null);
          return;
        } else {
          throw new Error('Invalid administrator password. Please verify your password.');
        }
      }

      // 3. For any other ID/password or unhandled error
      const errCode = (rawError as { code?: string })?.code || '';
      const errMsg = rawError instanceof Error ? rawError.message : '';
      if (errCode === 'auth/operation-not-allowed' || errMsg.includes('operation-not-allowed')) {
        throw new Error(
          'Email & Password sign-in is disabled in your Firebase console (auth/operation-not-allowed). Please sign in using Google or enable "Email/Password" in Firebase Console > Authentication > Sign-in method.'
        );
      }

      throw new Error('Administrator authentication failed. Please verify your credentials.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Admin authentication failed.';
      setAuthError(message);
      throw new Error(message);
    }
  };

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user?.email?.toLowerCase() || '';
      if (ADMIN_EMAILS.some((adm) => adm.toLowerCase() === email)) {
        setIsAdmin(true);
        sessionStorage.setItem('studyhub_admin_authenticated', 'true');
        sessionStorage.setItem('studyhub_admin_email', email);
      }
    } catch (err: unknown) {
      let message = err instanceof Error ? err.message : 'Google sign in failed';
      if (err instanceof Error && err.message.includes('unauthorized-domain')) {
        message = 'Please add your GitHub Pages domain to Firebase Console > Authentication > Settings > Authorized Domains.';
      } else if (err instanceof Error && err.message.includes('operation-not-allowed')) {
        message = 'Google Sign-in is not enabled in Firebase Console. Please enable "Google" provider under Firebase Console > Authentication > Sign-in method.';
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
      const errCode = (err as { code?: string })?.code || '';
      const errMsg = err instanceof Error ? err.message : '';
      if (errCode === 'auth/operation-not-allowed' || errMsg.includes('operation-not-allowed')) {
        message = 'Email & Password sign-in is currently not enabled in Firebase Console. Please sign in with Google or enable "Email/Password" in Firebase Console > Authentication > Sign-in method.';
      } else if (errCode === 'auth/user-not-found' || errMsg.includes('user-not-found')) {
        message = 'No account found with this email or student ID.';
      } else if (errCode === 'auth/wrong-password' || errMsg.includes('wrong-password')) {
        message = 'Incorrect password.';
      } else if (errCode === 'auth/invalid-credential' || errMsg.includes('invalid-credential')) {
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
        sessionStorage.setItem('studyhub_admin_authenticated', 'true');
        sessionStorage.setItem('studyhub_admin_email', email.toLowerCase());
      }
    } catch (err: unknown) {
      let message = 'Failed to create account.';
      const errCode = (err as { code?: string })?.code || '';
      const errMsg = err instanceof Error ? err.message : '';
      if (errCode === 'auth/operation-not-allowed' || errMsg.includes('operation-not-allowed')) {
        message = 'Email/Password registration is not enabled in Firebase Console. Please sign in with Google or enable "Email/Password" in Firebase Console > Authentication > Sign-in method.';
      } else if (errCode === 'auth/email-already-in-use' || errMsg.includes('email-already-in-use')) {
        message = 'An account with this email already exists.';
      } else if (errCode === 'auth/weak-password' || errMsg.includes('weak-password')) {
        message = 'Password should be at least 6 characters.';
      }
      setAuthError(message);
      throw new Error(message);
    }
  };

  const continueAsGuest = () => {
    const guestUser = {
      uid: 'guest_student_' + Math.random().toString(36).substring(2, 9),
      email: 'guest@student.studyhub.edu',
      displayName: 'Guest Student',
      emailVerified: false,
      isAnonymous: true,
    } as unknown as User;

    sessionStorage.setItem('studyhub_guest_session', 'true');
    setUser(guestUser);
    setIsAdmin(false);
    setAuthError(null);
  };

  const signOut = async () => {
    sessionStorage.removeItem('studyhub_admin_authenticated');
    sessionStorage.removeItem('studyhub_admin_email');
    sessionStorage.removeItem('studyhub_admin_displayName');
    sessionStorage.removeItem('studyhub_guest_session');
    setIsAdmin(false);
    setUser(null);
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
        continueAsGuest,
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
