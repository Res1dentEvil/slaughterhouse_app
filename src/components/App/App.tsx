import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../../firebaseConfig';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../../features/authSlice';
import { doc, getDoc } from 'firebase/firestore';
import { RootState } from '../../store/store';
import Header from '../Header/Header';
import GoogleLogin from '../GoogleLogin/GoogleLogin';
import { Container, CircularProgress, Box } from '@mui/material';

import HomePage from '../pages/HomePage/HomePage';
import Departure from '../pages/Departure/Departure';
import Report1 from '../pages/Report1/Report1';
import Report2 from '../pages/Report2/Report2';
import Report3 from '../pages/Report3/Report3';
import AdminPanel from '../pages/AdminPanel/AdminPanel';
import NotFound from '../pages/NotFound/NotFound';
import './App.scss';
import InternalMovement from '../pages/InternalMovement/InternalMovement';
import CreateMovement from '../pages/CreateMovement/CreateMovement';

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
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUserState(currentUser);
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
      setLoading(false); // Завантаження завершено
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
      <div className="app__wrapper">
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
            <CircularProgress />
          </Box>
        ) : (
          <Routes>
            <Route path="/" element={user || userFromRedux ? <HomePage /> : <GoogleLogin />} />
            {/*<Route*/}
            {/*  path="/internal-movement"*/}
            {/*  element={user || userFromRedux ? <CreateMovement /> : <Navigate to="/" />}*/}
            {/*/>*/}
            <Route
              path="/create-movement"
              element={user || userFromRedux ? <CreateMovement /> : <Navigate to="/" />}
            />
            <Route
              path="/internal-movement"
              element={user || userFromRedux ? <InternalMovement /> : <Navigate to="/" />}
            />
            <Route
              path="/departure"
              element={user || userFromRedux ? <Departure /> : <Navigate to="/" />}
            />
            <Route
              path="/report1"
              element={user || userFromRedux ? <Report1 /> : <Navigate to="/" />}
            />
            <Route
              path="/report2"
              element={user || userFromRedux ? <Report2 /> : <Navigate to="/" />}
            />
            <Route
              path="/report3"
              element={user || userFromRedux ? <Report3 /> : <Navigate to="/" />}
            />
            <Route
              path="/admin"
              element={userRole === 'admin' ? <AdminPanel /> : <Navigate to="/" />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        )}
      </div>
    </Router>
  );
};

export default App;
