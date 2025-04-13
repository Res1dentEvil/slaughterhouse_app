import React from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Button } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google'; // Іконка Google
import './GoogleLogin.scss';

const GoogleLogin: React.FC = () => {
  const signInWithGoogle = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: 'user',
        });
      }

      console.log('Користувач успішно авторизувався', user);
    } catch (error) {
      console.error('Помилка авторизації через Google:', error);
    }
  };

  return (
    <div className="google-btn_page">
      <Button
        variant="contained"
        startIcon={<GoogleIcon />} // Додаємо іконку
        onClick={signInWithGoogle}
        sx={{
          backgroundColor: '#263238',
          color: 'white',
          fontSize: '16px',
          fontWeight: 'normal',
          padding: '10px 20px',
          marginTop: '250px',
          textTransform: 'none',
          '&:hover': {
            backgroundColor: '#354953',
          },
        }}
      >
        Login with Google
      </Button>
    </div>
  );
};

export default GoogleLogin;
