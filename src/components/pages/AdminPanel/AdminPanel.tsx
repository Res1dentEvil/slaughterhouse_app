import React, { useState, useEffect } from 'react';
import { db } from '../../../firebaseConfig';
import { doc, getDocs, collection, updateDoc } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { setDoc } from 'firebase/firestore';
import {
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  IconButton,
} from '@mui/material';
import { Edit } from '@mui/icons-material';
import FixCreatedAtButton from './FixCreatedAtButton';

// Типізація для користувача
interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: string | undefined;
}

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>({});
  const [loadingButton, setLoadingButton] = useState<Record<string, boolean>>({});
  const [snackOpen, setSnackOpen] = useState<boolean>(false);
  const [snackMessage, setSnackMessage] = useState<string>('');

  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [calculating, setCalculating] = useState(false);
  const [movementsSizeGB, setMovementsSizeGB] = useState<number | null>(null);
  const [movementsCount, setMovementsCount] = useState<number | null>(null);

  const [duplicating, setDuplicating] = useState(false);

  //створити бекап
  const duplicateMovementsCollection = async () => {
    setDuplicating(true);
    try {
      const movementsSnapshot = await getDocs(collection(db, 'movements'));
      const backupRef = collection(db, 'movements_backup');

      for (const docSnap of movementsSnapshot.docs) {
        await setDoc(doc(backupRef, docSnap.id), docSnap.data());
      }

      setSnackMessage('Колекцію успішно продубльовано!');
      setSnackOpen(true);
    } catch (error) {
      console.error('Помилка дублювання колекції:', error);
      setSnackMessage('Сталася помилка під час дублювання!');
      setSnackOpen(true);
    } finally {
      setDuplicating(false);
    }
  };

  //вирахувати використане місце
  const calculateMovementsSize = async () => {
    setCalculating(true);
    setMovementsSizeGB(null);
    setMovementsCount(null);

    try {
      const snapshot = await getDocs(collection(db, 'movements'));
      let totalBytes = 0;
      const docs = snapshot.docs;

      docs.forEach((doc) => {
        const data = doc.data();
        const jsonString = JSON.stringify(data);
        totalBytes += new TextEncoder().encode(jsonString).length;
      });

      const sizeInGB = totalBytes / (1024 * 1024 * 1024);
      setMovementsCount(docs.length);
      setMovementsSizeGB(Number(sizeInGB.toFixed(5)));
    } catch (error) {
      console.error('Помилка при розрахунку обсягу переміщень:', error);
      setSnackMessage('Помилка при розрахунку обсягу переміщень!');
      setSnackOpen(true);
    } finally {
      setCalculating(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersList: User[] = [];
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        usersList.push({
          displayName: data.displayName,
          email: data.email,
          photoURL: data.photoURL,
          role: data.role || 'user',
          uid: doc.id,
        });
      });
      setUsers(usersList);
    } catch (error) {
      console.error('Помилка при завантаженні користувачів:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    setLoadingButton((prev) => ({ ...prev, [userId]: true }));
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        role: newRole,
      });
      setSnackMessage('Роль успішно оновлена!');
      setSnackOpen(true);
      fetchUsers();
    } catch (error) {
      console.error('Помилка при оновленні ролі користувача:', error);
      setSnackMessage('Сталася помилка при оновленні ролі!');
      setSnackOpen(true);
    } finally {
      setLoadingButton((prev) => ({ ...prev, [userId]: false }));
    }
  };

  useEffect(() => {
    if (currentUser && currentUser!.role === 'admin') {
      fetchUsers();
    }
  }, [currentUser]);

  const handleRoleChange = (userId: string, newRole: string) => {
    setSelectedRoles((prev) => ({
      ...prev,
      [userId]: newRole,
    }));
  };

  return (
    <div className="flex justify-center p-4">
      <div className="w-full" style={{ maxWidth: '1200px' }}>
        <h2 className="text-2xl font-semibold text-center mb-6">Адмін панель</h2>
        {loading ? (
          <div className="flex justify-center">
            <CircularProgress />
          </div>
        ) : (
          <TableContainer className="mb-6">
            <Table sx={{ width: '100%', fontSize: '15px', tableLayout: 'fixed' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: '15px' }}>Імя</TableCell>
                  <TableCell sx={{ fontSize: '15px' }}>Email</TableCell>
                  <TableCell sx={{ fontSize: '15px' }}>Роль</TableCell>
                  <TableCell sx={{ fontSize: '15px' }}>Змінити роль</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.uid} sx={{ height: '30px' }}>
                    <TableCell sx={{ fontSize: '15px' }}>
                      {user.displayName || 'Невідомо'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '15px' }}>{user.email}</TableCell>
                    <TableCell sx={{ fontSize: '15px' }}>{user.role}</TableCell>
                    <TableCell>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <FormControl sx={{ width: '380px' }} size="small">
                          <InputLabel>Роль</InputLabel>
                          <Select
                            value={selectedRoles[user.uid] || user.role || 'user'}
                            label="Роль"
                            onChange={(e) => handleRoleChange(user.uid, e.target.value)}
                            sx={{
                              fontSize: '14px',
                            }}
                          >
                            <MenuItem value="user">User</MenuItem>
                            <MenuItem value="employee">Employee</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                          </Select>
                        </FormControl>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() =>
                            updateUserRole(user.uid, selectedRoles[user.uid] || user.role || 'user')
                          }
                          disabled={loadingButton[user.uid]}
                          sx={{
                            fontSize: '12px',
                            height: '35px',
                            width: '290px',
                            padding: '6px 12px',
                            marginLeft: '10px',
                          }}
                        >
                          {loadingButton[user.uid] ? 'Змінюється...' : 'Змінити роль'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Snackbar для повідомлень */}
        <Snackbar
          open={snackOpen}
          autoHideDuration={2000} // Тривалість 2 секунди
          onClose={() => setSnackOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // Розміщуємо зверху по центру
        >
          <Alert onClose={() => setSnackOpen(false)} severity="success" sx={{ width: '100%' }}>
            {snackMessage}
          </Alert>
        </Snackbar>
      </div>

      <div className="flex flex-col items-center gap-4 mb-6" style={{ marginLeft: '20px' }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={calculateMovementsSize}
          disabled={calculating}
          sx={{ width: '300px', fontSize: '14px', marginTop: '30px', marginBottom: '20px' }}
        >
          {calculating ? 'Розрахунок...' : 'Розрахувати обсяг Storage'}
        </Button>

        {calculating && <CircularProgress />}

        {movementsSizeGB !== null && movementsCount !== null && (
          <div className="text-center">
            <p>
              Кількість записів: <strong>{movementsCount}</strong>
            </p>
            <p>
              Загальний обсяг: <strong>{movementsSizeGB} GB</strong>
            </p>

            {movementsCount > 0 && (
              <p>
                Орієнтовно можна додати ще:{' '}
                <strong>
                  {Math.floor(
                    (1 - movementsSizeGB) / (movementsSizeGB / movementsCount)
                  ).toLocaleString()}
                </strong>{' '}
                записів
              </p>
            )}
          </div>
        )}

        <Button
          variant="contained"
          color="success"
          onClick={duplicateMovementsCollection}
          disabled={duplicating}
          sx={{
            width: '300px',
            fontSize: '14px',
            marginTop: '30px',
            marginBottom: '20px',
            marginLeft: '20px',
          }}
        >
          {duplicating ? 'Дублювання...' : 'Зробити бекап колекції'}
        </Button>
        {/*<FixCreatedAtButton />*/}
      </div>
    </div>
  );
};

export default AdminPanel;
