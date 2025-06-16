// src/services/firestore.ts
import { db } from "../firebase/config";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { User } from "firebase/auth";

// Interface pour les données utilisateur
export interface UserData {
  uid: string;
  email: string | null;
  phoneNumber: string | null;
  displayName?: string;
  role?: 'client' | 'driver' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

// Collection utilisateurs
const USERS_COLLECTION = "users";

/**
 * Crée ou met à jour un utilisateur dans Firestore après inscription/connexion
 */
export const createOrUpdateUser = async (user: User): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, user.uid);
    const userSnap = await getDoc(userRef);

    const now = new Date();

    if (!userSnap.exists()) {
      // Créer un nouvel utilisateur
      const userData: UserData = {
        uid: user.uid,
        email: user.email,
        phoneNumber: user.phoneNumber,
        // Utiliser une valeur par défaut si displayName est undefined
        displayName: user.displayName || user.email?.split('@')[0] || "Utilisateur",
        role: 'client', // Par défaut, nouvel utilisateur est un client
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(userRef, userData);
      console.log("Nouvel utilisateur créé dans Firestore:", user.uid);
    } else {
      // Mettre à jour l'utilisateur existant
      const updateData: Partial<UserData> = {
        email: user.email,
        phoneNumber: user.phoneNumber,
        updatedAt: now,
      };
      
      // N'ajouter displayName que s'il n'est pas undefined
      if (user.displayName) {
        updateData.displayName = user.displayName;
      }
      
      await updateDoc(userRef, updateData);
      console.log("Utilisateur mis à jour dans Firestore:", user.uid);
    }
  } catch (error) {
    console.error(
      "Erreur lors de la création/mise à jour de l'utilisateur dans Firestore:",
      error
    );
    throw error;
  }
};

/**
 * Récupère les données d'un utilisateur depuis Firestore
 */
export const getUserData = async (uid: string): Promise<UserData | null> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      // Convertir les Timestamps Firestore en objets Date JavaScript
      const data = userSnap.data();
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as UserData;
    } else {
      console.log("Aucun utilisateur trouvé avec cet ID:", uid);
      return null;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des données utilisateur:", error);
    throw error;
  }
};

/**
 * Définit ou met à jour le rôle d'un utilisateur
 */
export const updateUserRole = async (uid: string, role: 'client' | 'driver' | 'admin'): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userRef, { role });
    console.log(`Rôle de l'utilisateur ${uid} mis à jour: ${role}`);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du rôle utilisateur:", error);
    throw error;
  }
};
