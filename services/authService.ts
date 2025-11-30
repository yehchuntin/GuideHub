import { User, UserRole } from '../types';
import { auth, db } from '../firebaseConfig';
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const authService = {
  
  signInWithGoogle: async (): Promise<User> => {
    try {
      // Fix: Corrected typo 'constprovider' to 'const provider' and used it in signInWithPopup
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // Check if user exists in Firestore 'users' collection
      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      let appUser: User;

      if (userSnap.exists()) {
        // User exists, return data
        const data = userSnap.data();
        appUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: data.displayName || firebaseUser.displayName || 'User',
          photoURL: data.photoURL || firebaseUser.photoURL || '',
          role: data.role || UserRole.TRAVELER
        };
      } else {
        // New User -> Create basic profile in Firestore
        appUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'User',
          photoURL: firebaseUser.photoURL || '',
          role: UserRole.TRAVELER // Default role
        };
        
        // Save to DB
        await setDoc(userRef, {
          uid: appUser.uid,
          email: appUser.email,
          displayName: appUser.displayName,
          photoURL: appUser.photoURL,
          role: appUser.role,
          createdAt: new Date().toISOString()
        });
      }

      return appUser;

    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    await signOut(auth);
  }
};