import React, { useState } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig'; // онови шлях за потребою
import { Button, Typography, Box, CircularProgress } from '@mui/material';

const ReplaceCreatedAtButton: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const replaceCreatedAt = async () => {
    setIsRunning(true);
    setProcessedCount(0);
    setSuccessCount(0);

    try {
      const snapshot = await getDocs(collection(db, 'movements'));
      const docs = snapshot.docs;
      setTotalCount(docs.length);

      for (let i = 0; i < docs.length; i++) {
        const document = docs[i];
        const id = document.id;

        try {
          await updateDoc(doc(db, 'movements', id), {
            createdAt: '********',
          });
          setSuccessCount((prev) => prev + 1);
        } catch (error) {
          console.error(`❌ Помилка при оновленні ${id}:`, error);
        }

        setProcessedCount((prev) => prev + 1);
        await sleep(50); // щоб не перевантажувати сервер
      }

      console.log('✅ Завершено заміну createdAt');
    } catch (error) {
      console.error('❌ Помилка при обробці документів:', error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Button variant="contained" color="primary" onClick={replaceCreatedAt} disabled={isRunning}>
        {isRunning ? 'Оновлення...' : 'Замінити createdAt на ********'}
      </Button>

      {isRunning && (
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={24} />
          <Typography>
            Оброблено {processedCount} з {totalCount}
          </Typography>
        </Box>
      )}

      {!isRunning && processedCount > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography>
            ✅ Успішно оновлено: {successCount} з {processedCount}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ReplaceCreatedAtButton;
