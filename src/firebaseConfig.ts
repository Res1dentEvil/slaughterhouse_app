import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Конфігурація Firebase
const firebaseConfig = {};

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
