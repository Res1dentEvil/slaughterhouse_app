import React, { useEffect, useState } from 'react';
import { Movement } from '../../types/types';
import MovementToolbar from './MovementToolbar';
import MovementTable from './MovementTable';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { Timestamp } from 'firebase/firestore';
import {
  Drawer,
  IconButton,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
} from '@mui/material';
import { Close } from '@mui/icons-material';

const InternalMovement: React.FC = () => {
  const [rows, setRows] = useState<Movement[]>([]);
  const [filters, setFilters] = useState({
    date: '',
    from: '',
    to: '',
    who: '',
    createdAt: '',
    updatedAt: '',
  });
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Movement | null>(null);
  const [editingRowId, setEditingRowId] = useState<string | null>(null); // Окремий стан для редагування

  const handleFilterChange = (field: string, value: string) =>
    setFilters((prev) => ({ ...prev, [field]: value }));

  const handleEditClick = (rowId: string) => {
    setEditingRowId(rowId === editingRowId ? null : rowId); // Перемикаємо стан редагування для вибраного рядка
  };

  const filteredRows = rows.filter((row) =>
    Object.entries(filters).every(([key, value]) =>
      value
        ? row[key as keyof Movement]?.toString().toLowerCase().includes(value.toLowerCase())
        : true
    )
  );

  const handleSaveChanges = () => {
    // Заглушка для збереження (можна реалізувати пізніше)
    setEditingRowId(null);
    setDrawerOpen(false);
  };

  const getAllMovements = async (): Promise<Movement[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, 'movements'));
      return querySnapshot.docs.map((doc) => ({
        id: doc.id, // Firestore генерує рядковий ID
        ...doc.data(),
      })) as Movement[];
    } catch (error) {
      console.error('Помилка при отриманні даних:', error);
      return [];
    }
  };

  // Функція для форматування дати
  const formatTimestamp = (timestamp: Timestamp | string | undefined): string => {
    if (!timestamp) return '—'; // Якщо значення немає

    if (typeof timestamp === 'string') return timestamp; // Якщо це вже рядок, повертаємо без змін

    return new Date(timestamp.seconds * 1000).toLocaleString(); // Якщо це Firestore Timestamp
  };

  useEffect(() => {
    const fetchMovements = async () => {
      const data = await getAllMovements();
      console.log('Отримані дані:', data);
      const formattedData = data.map((item) => ({
        ...item,
        createdAt: formatTimestamp(item.createdAt as Timestamp | string),
        updatedAt: formatTimestamp(item.updatedAt as Timestamp | string),
      }));

      setRows(formattedData);
    };

    fetchMovements();
  }, []);

  // console.log('selectedRowId ---------', selectedRowId);

  return (
    <Box sx={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <MovementToolbar
        selectedRowId={selectedRowId}
        // handleEditClick={() => handleEditClick(selectedRowId ?? 0)} // Вибираємо поточний рядок для редагування
        handleEditClick={() => handleEditClick(selectedRowId ?? '')}
        editingRowId={editingRowId}
      />
      <MovementTable
        rows={filteredRows}
        setRows={setRows}
        filters={filters}
        selectedRowId={selectedRowId}
        setSelectedRowId={setSelectedRowId}
        handleFilterChange={handleFilterChange}
        isEditingRow={(rowId) => editingRowId === rowId} // Перевіряємо, чи цей рядок редагується
        editingRowId={editingRowId} // Передаємо для блокування вибору інших рядків
        setEditingRowId={setEditingRowId}
      />
    </Box>
  );
};

export default InternalMovement;
