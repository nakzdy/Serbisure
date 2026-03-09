import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./config";

/**
 * Saves or updates a user profile in Firestore.
 * @param {string} uid - The Firebase Auth UID.
 * @param {object} profileData - The data to save (role, skills, etc).
 */
export async function setUserProfile(uid, profileData) {
    try {
        const userRef = doc(db, "users", uid);
        await setDoc(userRef, profileData, { merge: true });
        return { success: true };
    } catch (error) {
        console.error("Error saving user profile:", error);
        return { success: false, error };
    }
}

/**
 * Tries to fetch a user profile from Firestore.
 * @param {string} uid - The Firebase Auth UID.
 * @returns {Promise<object|null>} The profile data or null.
 */
export async function getUserProfile(uid) {
    try {
        const userRef = doc(db, "users", uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
            return docSnap.data();
        }
        return null;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }
}
