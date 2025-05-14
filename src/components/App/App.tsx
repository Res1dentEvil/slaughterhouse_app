import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import AdminPanel from '../pages/AdminPanel/AdminPanel';
import NotFound from '../pages/NotFound/NotFound';
import './App.scss';
import InternalMovement from '../pages/InternalMovement/InternalMovement';
import CreateMovement from '../pages/CreateMovement/CreateMovement';
import FridgeMovementTable from '../pages/Reports/ReportRemains/ReportRemains';
import ProtectedRoute from './ProtectedRoute';
import ReportRemains from '../pages/Reports/ReportRemains/ReportRemains';
import FridgeDailyReport from '../pages/DailyMovement/FridgeDailyReport/FridgeDailyReport';
import { FrozenStorageDailyReport } from '../pages/DailyMovement/FrozenStorageDailyReport/FrozenStorageDailyReport';
import SellingDailyReport from '../pages/DailyMovement/SellingDailyReport/SellingDailyReport';
import ReportTable from '../pages/Reports/SellingReport/SellingReport';

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
      setLoading(false);
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
            {/* Головна завжди доступна якщо є користувач */}
            <Route path="/" element={user ? <HomePage /> : <GoogleLogin />} />

            {/* Приклад: доступ лише для employee та admin */}
            <Route
              path="/create-movement"
              element={
                user ? (
                  <ProtectedRoute
                    element={<CreateMovement />}
                    allowedRoles={['employee', 'admin']}
                    userRole={userRole}
                  />
                ) : (
                  <Navigate to="/" />
                )
              }
            />

            <Route
              path="/internal-movement"
              element={
                user ? (
                  <ProtectedRoute
                    element={<InternalMovement />}
                    allowedRoles={['employee', 'admin']}
                    userRole={userRole}
                  />
                ) : (
                  <Navigate to="/" />
                )
              }
            />

            <Route
              path="/report1"
              element={
                user ? (
                  <ProtectedRoute
                    element={<ReportRemains />}
                    allowedRoles={['employee', 'admin']}
                    userRole={userRole}
                  />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/report2"
              element={
                user ? (
                  <ProtectedRoute
                    element={<ReportTable />}
                    allowedRoles={['employee', 'admin']}
                    userRole={userRole}
                  />
                ) : (
                  <Navigate to="/" />
                )
              }
            />

            <Route
              path="/daily-report1"
              element={
                user ? (
                  <ProtectedRoute
                    element={<FridgeDailyReport />}
                    allowedRoles={['employee', 'admin']}
                    userRole={userRole}
                  />
                ) : (
                  <Navigate to="/" />
                )
              }
            />

            <Route
              path="/daily-report2"
              element={
                user ? (
                  <ProtectedRoute
                    element={<FrozenStorageDailyReport />}
                    allowedRoles={['employee', 'admin']}
                    userRole={userRole}
                  />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/daily-report3"
              element={
                user ? (
                  <ProtectedRoute
                    element={<SellingDailyReport />}
                    allowedRoles={['employee', 'admin']}
                    userRole={userRole}
                  />
                ) : (
                  <Navigate to="/" />
                )
              }
            />

            {/* Доступ тільки для admin */}
            <Route
              path="/admin"
              element={
                user ? (
                  <ProtectedRoute
                    element={<AdminPanel />}
                    allowedRoles={['admin']}
                    userRole={userRole}
                  />
                ) : (
                  <Navigate to="/" />
                )
              }
            />

            {/* Для всіх інші сторінок */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        )}
      </div>
    </Router>
  );
};

export default App;
