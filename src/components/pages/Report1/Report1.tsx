import React, { useEffect, useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  CircularProgress,
} from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

export interface Detail {
  quantity?: number;
  weight?: number;
  product: string;
  category?: string;
  price?: number;
  totalPrice?: number;
  comment?: string;
}

export interface Movement {
  id: string;
  date: string; // dd.mm.yyyy
  from: string;
  to: string;
  who: string;
  createdAt: string;
  updatedAt: string;
  details: Detail[];
}

interface ProductStats {
  product: string;
  opening: number;
  incoming: number;
  outgoing: number;
  closing: number;
}

const INTERESTED_PRODUCTS = ['Ділове', 'С/Б', 'Голова', 'Печінка', 'СМ', 'Кістки'];

const parseDate = (dateStr: string): Date => {
  // Перевірка на формат yyyy-mm-dd (від TextField type="date")
  if (dateStr.includes('-')) {
    const [year, month, day] = dateStr.split('-');
    return new Date(+year, +month - 1, +day);
  }

  // Інакше очікується формат dd.mm.yyyy
  const [day, month, year] = dateStr.split('.');
  return new Date(+year, +month - 1, +day);
};

const FridgeMovements: React.FC = () => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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

  const calculateStats = (location: string, onlyInterested: boolean): ProductStats[] => {
    const start = parseDate(startDate || '31.12.2024');
    const end = endDate ? new Date(endDate) : new Date();

    const map = new Map<string, ProductStats>();

    movements.forEach((m) => {
      if (m.from === location && m.to === location) return;

      const date = parseDate(m.date);
      const isBeforePeriod = date < start;
      const isInPeriod = date >= start && date <= end;

      const isArrival = m.to === location;
      const isDeparture = m.from === location;

      if (!isArrival && !isDeparture) return;

      m.details.forEach((d) => {
        const { product, weight = 0 } = d;

        // Особливий випадок: Голяшки вибувають з Холодильника
        if (
          location === 'Холодильник' &&
          isDeparture &&
          ['Голяшки', 'Сало кускове', 'Сало на шкірі'].includes(product)
        ) {
          // Віднімаємо вагу певних продуктів від "Ділове"
          const targetProduct = 'Ділове';
          if (onlyInterested && !INTERESTED_PRODUCTS.includes(targetProduct)) return;

          if (!map.has(targetProduct)) {
            map.set(targetProduct, {
              product: targetProduct,
              opening: 0,
              incoming: 0,
              outgoing: 0,
              closing: 0,
            });
          }

          const stats = map.get(targetProduct)!;

          if (isBeforePeriod) {
            stats.opening -= weight;
          } else if (isInPeriod) {
            stats.outgoing += weight;
          }

          return; // Не додаємо сам продукт в таблицю
        }
        // Особливий випадок: Язик вибуває з Холодильника => знімаємо з "Голова"
        if (location === 'Холодильник' && isDeparture && product === 'Язик') {
          const targetProduct = 'Голова';
          if (onlyInterested && !INTERESTED_PRODUCTS.includes(targetProduct)) return;

          if (!map.has(targetProduct)) {
            map.set(targetProduct, {
              product: targetProduct,
              opening: 0,
              incoming: 0,
              outgoing: 0,
              closing: 0,
            });
          }

          const stats = map.get(targetProduct)!;

          if (isBeforePeriod) {
            stats.opening -= weight;
          } else if (isInPeriod) {
            stats.outgoing += weight;
          }

          return; // Не додаємо "Язик" у таблицю
        }
        // Стандартна обробка
        if (onlyInterested && !INTERESTED_PRODUCTS.includes(product)) return;

        if (!map.has(product)) {
          map.set(product, {
            product,
            opening: 0,
            incoming: 0,
            outgoing: 0,
            closing: 0,
          });
        }

        const stats = map.get(product)!;

        if (isBeforePeriod) {
          if (isArrival) stats.opening += weight;
          if (isDeparture) stats.opening -= weight;
        } else if (isInPeriod) {
          if (isArrival) stats.incoming += weight;
          if (isDeparture) stats.outgoing += weight;
        }
      });
    });

    map.forEach((stats) => {
      stats.closing = stats.opening + stats.incoming - stats.outgoing;
    });

    return Array.from(map.values()).sort((a, b) => b.closing - a.closing);
  };

  const fridgeStats = useMemo(
    () => calculateStats('Холодильник', true),
    [movements, startDate, endDate]
  );

  const freezerStats = useMemo(
    () => calculateStats('Склад готової продукції (морозильна камера)', false),
    [movements, startDate, endDate]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 24 }}>
      <h2 style={{ marginBottom: '30px' }}>Огляд залишків</h2>

      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <TextField
          label="Початок періоду"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <TextField
          label="Кінець періоду"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper} style={{ maxWidth: '1000px' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Продукт</TableCell>
                <TableCell>На початок (кг)</TableCell>
                <TableCell>Прибуття (кг)</TableCell>
                <TableCell>Вибуття (кг)</TableCell>
                <TableCell>На кінець (кг)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell colSpan={5} style={{ fontWeight: 'bold', background: '#f0f0f0' }}>
                  Холодильник
                </TableCell>
              </TableRow>
              {fridgeStats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Немає даних
                  </TableCell>
                </TableRow>
              ) : (
                fridgeStats.map((p) => (
                  <TableRow key={'fridge-' + p.product}>
                    <TableCell>{p.product}</TableCell>
                    <TableCell>{p.opening.toFixed(2)}</TableCell>
                    <TableCell>{p.incoming.toFixed(2)}</TableCell>
                    <TableCell>{p.outgoing.toFixed(2)}</TableCell>
                    <TableCell>{p.closing.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              )}

              <TableRow>
                <TableCell colSpan={5} style={{ fontWeight: 'bold', background: '#f0f0f0' }}>
                  Склад готової продукції (морозильна камера)
                </TableCell>
              </TableRow>
              {freezerStats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Немає даних
                  </TableCell>
                </TableRow>
              ) : (
                freezerStats.map((p) => (
                  <TableRow key={'freezer-' + p.product}>
                    <TableCell>{p.product}</TableCell>
                    <TableCell>{p.opening.toFixed(2)}</TableCell>
                    <TableCell>{p.incoming.toFixed(2)}</TableCell>
                    <TableCell>{p.outgoing.toFixed(2)}</TableCell>
                    <TableCell>{p.closing.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default FridgeMovements;
