import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../../firebaseConfig';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../../features/authSlice';
import { doc, getDoc } from 'firebase/firestore';
import { RootState } from '../../store/store';
import Header from '../Header/Header';
import AdminPanel from '../AdminPanel';
import GoogleLogin from '../GoogleLogin/GoogleLogin';
import { Container } from '@mui/material';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

const App: React.FC = () => {
  const dispatch = useDispatch();
  const userFromRedux = useSelector((state: RootState) => state.auth.user);
  const [user, setUserState] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUserState(currentUser);
      if (currentUser) {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUserRole(userData?.role || 'user');

          dispatch(
            setUser({
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: userData?.displayName,
              photoURL: userData?.photoURL,
              role: userData?.role,
            })
          );
        }
      }
    });
    return () => unsubscribe();
  }, [dispatch]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      dispatch(setUser(null));
      setUserState(null);
      setUserRole('');
    } catch (error) {
      console.error('Помилка при виході з системи:', error);
    }
  };

  return (
    <Router>
      <Header user={userFromRedux || user} onSignOut={handleSignOut} />
      <Container sx={{ mt: 4 }}>
        {user || userFromRedux ? userRole === 'admin' && <AdminPanel /> : <GoogleLogin />}
      </Container>
    </Router>
  );
};

export default App;
