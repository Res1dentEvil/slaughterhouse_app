import { FC, useEffect, useMemo, useState } from 'react';
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
} from '@mui/material';
import { db } from '../../../../firebaseConfig';
import { Movement } from '../../../../types/types';
import { collection, getDocs } from 'firebase/firestore';

export const FrozenStorageDailyReport: FC = () => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const { start, end } = getFirstAndLastDayOfPreviousMonth();
  const [startDate, setStartDate] = useState<string>(start);
  const [endDate, setEndDate] = useState<string>(end);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'movements'));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Movement[];
        setMovements(data);
      } catch (error) {
        console.error('Помилка при завантаженні:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getFilteredMovements = useMemo(() => {
    if (!startDate && !endDate) return movements;

    return movements.filter((movement) => {
      const movementDate = parseDate(movement.date);
      if (!startDate && endDate) {
        const end = parseDateInput(endDate);
        const start = new Date(end);
        start.setDate(start.getDate() - 31);
        return movementDate >= start && movementDate <= end;
      }
      if (startDate && !endDate) {
        const start = parseDateInput(startDate);
        const end = new Date(start);
        end.setDate(end.getDate() + 31);
        return movementDate >= start && movementDate <= end;
      }
      if (startDate && endDate) {
        const start = parseDateInput(startDate);
        const end = parseDateInput(endDate);
        return movementDate >= start && movementDate <= end;
      }
      return true;
    });
  }, [movements, startDate, endDate]);

  const filteredMovements = useMemo(
    () =>
      getFilteredMovements.filter(
        (movement) => movement.to === 'Склад готової продукції (морозильна камера)'
      ),
    [getFilteredMovements]
  );

  const dataByDate = useMemo(() => {
    const map = new Map<string, Record<string, number>>();
    filteredMovements.forEach((movement) => {
      const date = movement.date;
      if (!map.has(date)) {
        map.set(date, {});
      }
      movement.details.forEach((detail) => {
        const product = detail.product;
        const weight = detail.weight || 0;
        map.get(date)![product] = (map.get(date)![product] || 0) + weight;
      });
    });
    return map;
  }, [filteredMovements]);

  const allProducts = useMemo(() => {
    const productsSet = new Set<string>();
    filteredMovements.forEach((movement) => {
      movement.details.forEach((detail) => {
        productsSet.add(detail.product);
      });
    });
    return Array.from(productsSet);
  }, [filteredMovements]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 50 }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <>
      <Box display="flex" gap={2} mb={2}>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Дата</TableCell>
              {allProducts.map((product) => (
                <TableCell key={product} sx={{ fontWeight: 'bold' }} align="right">
                  {product}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from(dataByDate.entries())
              .sort(([dateA], [dateB]) => parseDate(dateA).getTime() - parseDate(dateB).getTime())
              .map(([date, products]) => (
                <TableRow key={date}>
                  <TableCell sx={{ textAlign: 'center' }}>{date}</TableCell>
                  {allProducts.map((product) => (
                    <TableCell key={product} align="right">
                      {products[product] ? products[product].toFixed(2) : ''}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {dataByDate.size === 0 && (
        <div style={{ textAlign: 'center', marginTop: 20 }}>Немає даних за попередній місяць</div>
      )}
    </>
  );
};

// ========== УТИЛІТИ ==========

const getFirstAndLastDayOfPreviousMonth = () => {
  const now = new Date();
  const firstDayPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastDayPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  return {
    start: formatDateForInputDateObject(firstDayPrevMonth),
    end: formatDateForInputDateObject(lastDayPrevMonth),
  };
};

const formatDateForInputDateObject = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateInput = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const parseDate = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split('.').map(Number);
  return new Date(year, month - 1, day);
};
