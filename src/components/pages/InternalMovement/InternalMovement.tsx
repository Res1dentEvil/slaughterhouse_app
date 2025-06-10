import React, { useEffect, useState, useMemo } from 'react';
import { Movement } from '../../../types/types';
import MovementToolbar from './MovementToolbar';
import MovementTable from './MovementTable';
import { collection, getDocs, query, where, Timestamp, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
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
  const [editingRowId, setEditingRowId] = useState<string | null>(null);

  // Debounce hook прямо у файлі
  const useDebounce = <T,>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => setDebouncedValue(value), delay);
      return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
  };

  const debouncedFilters = useDebounce(filters, 1000);

  const handleEditClick = (rowId: string) => {
    setEditingRowId(rowId === editingRowId ? null : rowId);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) =>
      Object.entries(debouncedFilters).every(([key, value]) => {
        if (!value) return true;

        if (key === 'date' || key === 'createdAt' || key === 'updatedAt') {
          const parseDate = (dateStr: string) => {
            const [day, month, year] = dateStr.split('.').map(Number);
            return new Date(year, month - 1, day);
          };

          if (value.includes('..')) {
            const [start, end] = value.split('..').map((d) => d.trim());
            if (start && end) {
              const startDate = parseDate(start);
              const endDate = parseDate(end);
              const rowDate = parseDate(row[key as keyof Movement]?.toString() || '');
              return rowDate >= startDate && rowDate <= endDate;
            } else if (start) {
              const startDate = parseDate(start);
              const rowDate = parseDate(row[key as keyof Movement]?.toString() || '');
              return rowDate >= startDate;
            }
          }
        }

        return row[key as keyof Movement]?.toString().toLowerCase().includes(value.toLowerCase());
      })
    );
  }, [rows, debouncedFilters]);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Movements');
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
        id: doc.id,
        ...doc.data(),
      })) as Movement[];
    } catch (error) {
      console.error('Помилка при отриманні всіх даних:', error);
      return [];
    }
  };

  const getRecentMovements = async (): Promise<Movement[]> => {
    try {
      const now = new Date();
      const thirtyOneDaysAgo = new Date(now.setDate(now.getDate() - 31));
      const timestampLimit = Timestamp.fromDate(thirtyOneDaysAgo);

      const q = query(collection(db, 'movements'), where('createdAt', '>=', timestampLimit));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Movement[];
    } catch (error) {
      console.error('Помилка при отриманні останніх даних:', error);
      return [];
    }
  };

  const formatTimestamp = (timestamp: Timestamp | string | undefined): string => {
    if (!timestamp) return '—';
    if (typeof timestamp === 'string') return timestamp;
    return new Date(timestamp.seconds * 1000).toLocaleString();
  };

  const isAnyFilterActive = Object.entries(debouncedFilters).some(([key, value]) => {
    return key !== 'createdAt' && value !== '';
  });

  const fetchMovements = async () => {
    const data = isAnyFilterActive ? await getAllMovements() : await getRecentMovements();

    const formattedData = data.map((item) => ({
      ...item,
      updatedAt: formatTimestamp(item.updatedAt as Timestamp | string),
    }));

    setRows(formattedData);
  };

  useEffect(() => {
    fetchMovements();
  }, [debouncedFilters]);

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
        isEditingRow={(rowId) => editingRowId === rowId}
        editingRowId={editingRowId}
        setEditingRowId={setEditingRowId}
      />
    </Box>
  );
};

export default InternalMovement;
