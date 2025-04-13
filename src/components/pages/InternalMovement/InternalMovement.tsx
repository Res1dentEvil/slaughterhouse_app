import React, { useEffect, useState } from 'react';
import { Movement } from '../../../types/types';
import MovementToolbar from './MovementToolbar';
import MovementTable from './MovementTable';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { Timestamp } from 'firebase/firestore';
import { doc, deleteDoc } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Box } from '@mui/material';

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
  const [editingRowId, setEditingRowId] = useState<string | null>(null); // Окремий стан для редагування

  const handleEditClick = (rowId: string) => {
    setEditingRowId(rowId === editingRowId ? null : rowId); // Перемикаємо стан редагування для вибраного рядка
  };

  const handleFilterChange = (field: string, value: string) => {
    if (field === 'date' || field === 'createdAt' || field === 'updatedAt') {
      setFilters((prev) => ({
        ...prev,
        [field]: value, // Зберігаємо рядок фільтра, щоб потім правильно обробити
      }));
    } else {
      setFilters((prev) => ({ ...prev, [field]: value }));
    }
  };

  const filteredRows = rows.filter((row) =>
    Object.entries(filters).every(([key, value]) => {
      if (!value) return true; // Якщо фільтр порожній, не застосовуємо його

      if (key === 'date' || key === 'createdAt' || key === 'updatedAt') {
        // Перетворюємо дату в форматі "дд.мм.рррр" у Date
        const parseDate = (dateStr: string) => {
          const [day, month, year] = dateStr.split('.').map(Number);
          return new Date(year, month - 1, day); // month - 1, бо JS рахує з 0
        };

        if (value.includes('..')) {
          const [start, end] = value.split('..').map((d) => d.trim());

          if (start && end) {
            // Фільтр в діапазоні
            const startDate = parseDate(start);
            const endDate = parseDate(end);
            const rowDate = parseDate(row[key as keyof Movement]?.toString() || '');

            return rowDate >= startDate && rowDate <= endDate;
          } else if (start) {
            // Фільтр "від дати"
            const startDate = parseDate(start);
            const rowDate = parseDate(row[key as keyof Movement]?.toString() || '');

            return rowDate >= startDate;
          }
        }
      }

      return row[key as keyof Movement]?.toString().toLowerCase().includes(value.toLowerCase());
    })
  );

  // Функція експорту
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Movements');

    // Генерація файлу
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    saveAs(data, 'movements.xlsx');
    console.log('movements.xlsx');
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

  const fetchMovements = async () => {
    const data = await getAllMovements();
    // console.log('Отримані дані:', data);
    const formattedData = data.map((item) => ({
      ...item,
      createdAt: formatTimestamp(item.createdAt as Timestamp | string),
      updatedAt: formatTimestamp(item.updatedAt as Timestamp | string),
    }));

    setRows(formattedData);
  };
  useEffect(() => {
    fetchMovements();
  }, []);

  const handleDeleteMovement = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'movements', id));
      fetchMovements();
      console.log('Документ видалено:', id);
    } catch (error) {
      console.error('Помилка видалення:', error);
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <MovementToolbar
        selectedRowId={selectedRowId}
        handleEditClick={() => handleEditClick(selectedRowId ?? '')}
        editingRowId={editingRowId}
        handleDeleteMovement={() => handleDeleteMovement(selectedRowId ?? '')}
        exportToExcel={exportToExcel}
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
