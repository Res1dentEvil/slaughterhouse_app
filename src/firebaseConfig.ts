import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Конфігурація Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyBvjZseHvptSjnm_BIp-R0rAEw6IxXKmDg',
  authDomain: 'slaughterhouse-app.firebaseapp.com',
  projectId: 'slaughterhouse-app',
  storageBucket: 'slaughterhouse-app.firebasestorage.app',
  messagingSenderId: '638090714975',
  appId: '1:638090714975:web:75c3df45b43cf9e85820ea',
  measurementId: 'G-M6NDL2GDV5',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Типізація для користувача
interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: string; // Роль користувача
}

// Функція для додавання користувача до Firestore
export const createUserInFirestore = async (user: User) => {
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      role: 'user', // за замовчуванням роль 'user'
    });
    console.log('Користувач успішно доданий до Firestore');
  } catch (error) {
    console.error('Помилка при додаванні користувача:', error);
  }
};

// Функція для зміни ролі користувача
export const updateUserRole = async (uid: string, role: string) => {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, { role }, { merge: true });
    console.log('Роль успішно оновлена');
  } catch (error) {
    console.error('Помилка при оновленні ролі користувача:', error);
  }
};
