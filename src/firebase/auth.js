// =============================================================================
// Firebase Authentication Service
// Provides email/password authentication via Firebase Auth SDK.
// All operations communicate over HTTPS/TLS (encrypted in transit).
//
// Security Checklist Coverage:
//   Item 1: Authentication mechanism identified → Firebase Auth (Email/Password)
//   Item 3: Data encryption in transit → All Firebase SDK calls use HTTPS/TLS
// =============================================================================

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup
} from "firebase/auth";
import { auth } from "./config";

/**
 * Sign in or register with Google OAuth via popup.
 * Firebase handles the entire OAuth 2.0 flow.
 * Returns the user credential on success.
 */
export async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    return await signInWithPopup(auth, provider);
}


/**
 * Register a new user with Firebase Authentication.
 * Firebase Auth handles password hashing (bcrypt/scrypt) server-side.
 * Communication is encrypted via HTTPS/TLS.
 *
 * @param {string} email - User email
 * @param {string} password - User password (min 6 chars, enforced by Firebase)
 * @param {string} displayName - User display name
 * @returns {Promise<object>} Firebase UserCredential
 */
export async function registerUser(email, password, displayName) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Set the display name on the Firebase Auth profile
    await updateProfile(userCredential.user, { displayName });

    return userCredential;
}

/**
 * Sign in an existing user with Firebase Authentication.
 * Firebase validates credentials server-side and returns a signed JWT token.
 * All communication is encrypted via HTTPS/TLS.
 *
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} Firebase UserCredential
 */
export async function loginUser(email, password) {
    return await signInWithEmailAndPassword(auth, email, password);
}

/**
 * Sign out the current user.
 * Invalidates the Firebase Auth session token.
 *
 * @returns {Promise<void>}
 */
export async function logoutUser() {
    return await signOut(auth);
}

/**
 * Subscribe to authentication state changes.
 * Firebase Auth manages JWT tokens, refresh tokens, and session persistence.
 *
 * @param {function} callback - Called with (user) on auth state change
 * @returns {function} Unsubscribe function
 */
export function onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
}
