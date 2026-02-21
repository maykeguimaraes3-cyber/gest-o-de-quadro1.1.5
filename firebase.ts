import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { AppConfig } from './types';

const firebaseConfig = {
  apiKey: "sua-api-key",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Função de sincronização real
export const syncWithCloud = async (cloudSyncId: string, data: any) => {
  try {
    await setDoc(doc(db, "configs", cloudSyncId), data);
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

export const loadFromCloud = async (cloudSyncId: string) => {
  try {
    const docRef = doc(db, "configs", cloudSyncId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    }
    return { success: false, error: "Configuração não encontrada" };
  } catch (error) {
    return { success: false, error };
  }
};
