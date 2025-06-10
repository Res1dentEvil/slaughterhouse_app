import React, { useEffect, useState } from 'react';
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
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../../firebaseConfig';
import { Movement } from '../../../../types/types';

interface AggregatedData {
  slaughter: { quantity: number; weight: number };
  fridge: Record<string, number>;
  waste: number;
  wasteMother: number;
}

const fridgeProducts = ['Ділове', 'С/Б', 'Печінка', 'СМ', 'Голова', 'Кістки'];

const FridgeDailyReport: React.FC = () => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('.').map(Number);
    return new Date(year, month - 1, day);
  };

  const getPreviousMonthDates = () => {
    const now = new Date();
    const firstDayOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    setStartDate(formatDate(firstDayOfPreviousMonth));
    setEndDate(formatDate(lastDayOfPreviousMonth));
  };

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
    getPreviousMonthDates();
  }, []);

  const groupedData: Record<string, AggregatedData> = movements.reduce((acc, movement) => {
    const date = movement.date;
    if (!acc[date]) {
      acc[date] = {
        slaughter: { quantity: 0, weight: 0 },
        fridge: Object.fromEntries(fridgeProducts.map((p) => [p, 0])),
        waste: 0,
        wasteMother: 0,
      };
    }

    if (movement.to === 'Цех забою') {
      movement.details.forEach((d) => {
        acc[date].slaughter.quantity += d.quantity || 0;
        acc[date].slaughter.weight += d.weight || 0;
      });
    }

    if (movement.to === 'Холодильник') {
      movement.details.forEach((d) => {
        if (fridgeProducts.includes(d.product)) {
          acc[date].fridge[d.product] += d.weight || 0;
        }
      });
    }

    if (movement.to === 'Цех утилізації відходів') {
      movement.details.forEach((d) => {
        if (d.product === 'Відходи на утилізацію') {
          acc[date].waste += d.weight || 0;
        }
        if (d.product === 'Відходи маточник на утилізацію') {
          acc[date].wasteMother += d.weight || 0;
        }
      });
    }

    return acc;
  }, {} as Record<string, AggregatedData>);

  const filteredGroupedData = Object.entries(groupedData)
    .filter(([date]) => {
      const currentDate = parseDate(date);
      const start = parseDate(startDate);
      const end = parseDate(endDate);
      return currentDate >= start && currentDate <= end;
    })
    .sort(([a], [b]) => parseDate(a).getTime() - parseDate(b).getTime());

  // Обчислення загальних сум
  const total = filteredGroupedData.reduce(
    (acc, [, data]) => {
      acc.slaughter.quantity += data.slaughter.quantity;
      acc.slaughter.weight += data.slaughter.weight;
      fridgeProducts.forEach((p) => {
        acc.fridge[p] += data.fridge[p];
      });
      acc.waste += data.waste;
      acc.wasteMother += data.wasteMother;
      return acc;
    },
    {
      slaughter: { quantity: 0, weight: 0 },
      fridge: Object.fromEntries(fridgeProducts.map((p) => [p, 0])),
      waste: 0,
      wasteMother: 0,
    } as AggregatedData
  );

  // Суми для різниці
  const totalFridgeSum = fridgeProducts.reduce((sum, p) => sum + total.fridge[p], 0);
  const totalDifference = total.slaughter.weight - (totalFridgeSum + total.waste);

  return (
    <>
      <Box display="flex" gap={2} mb={2}>
        <input
          type="date"
          value={startDate.split('.').reverse().join('-')}
          onChange={(e) => setStartDate(e.target.value.split('-').reverse().join('.'))}
        />
        <input
          type="date"
          value={endDate.split('.').reverse().join('-')}
          onChange={(e) => setEndDate(e.target.value.split('-').reverse().join('.'))}
        />
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell align="center" sx={{ width: '5%' }}>
                  Дата
                </TableCell>
                <TableCell align="center" colSpan={2} sx={{ width: '10%' }}>
                  Цех забою
                </TableCell>
                <TableCell align="center" colSpan={fridgeProducts.length} sx={{ width: '60%' }}>
                  Холодильник
                </TableCell>
                <TableCell align="center" sx={{ width: '10%' }}>
                  Утилізації відходів
                </TableCell>
                <TableCell align="center" sx={{ width: '10%' }}>
                  Відходи маточник
                </TableCell>
                <TableCell align="center" sx={{ width: '10%' }}>
                  Різниця
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="center" sx={{ borderRight: '1px solid #E6E6E6' }} />
                <TableCell align="center">Голів</TableCell>
                <TableCell align="center" sx={{ borderRight: '1px solid #E6E6E6' }}>
                  Вага
                </TableCell>
                {fridgeProducts.map((p, i) => (
                  <TableCell
                    align="center"
                    key={p}
                    sx={i === fridgeProducts.length - 1 ? { borderRight: '1px solid #E6E6E6' } : {}}
                  >
                    {p}
                  </TableCell>
                ))}
                <TableCell align="center" sx={{ borderRight: '1px solid #E6E6E6' }} />
                <TableCell align="center" />
                <TableCell align="center" />
              </TableRow>
              {/* Рядок Всього */}
              <TableRow sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                <TableCell
                  align="center"
                  sx={{ borderRight: '1px solid #E6E6E6', fontWeight: 'bold' }}
                >
                  Всього
                </TableCell>
                <TableCell align="center">{total.slaughter.quantity}</TableCell>
                <TableCell align="center" sx={{ borderRight: '1px solid #E6E6E6' }}>
                  {total.slaughter.weight.toFixed(2)}
                </TableCell>
                {fridgeProducts.map((p, i) => (
                  <TableCell
                    align="center"
                    key={`total-${p}`}
                    sx={i === fridgeProducts.length - 1 ? { borderRight: '1px solid #E6E6E6' } : {}}
                  >
                    {total.fridge[p].toFixed(2)}
                  </TableCell>
                ))}
                <TableCell align="center" sx={{ borderRight: '1px solid #E6E6E6' }}>
                  {total.waste.toFixed(2)}
                </TableCell>
                <TableCell align="center">{total.wasteMother.toFixed(2)}</TableCell>
                <TableCell align="center">{totalDifference.toFixed(2)}</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredGroupedData.map(([date, data]) => {
                const fridgeSum = fridgeProducts.reduce((sum, p) => sum + data.fridge[p], 0);
                const difference = data.slaughter.weight - (fridgeSum + data.waste);

                return (
                  <TableRow key={date}>
                    <TableCell align="center" sx={{ borderRight: '1px solid #E6E6E6' }}>
                      {date}
                    </TableCell>
                    <TableCell align="center">{data.slaughter.quantity}</TableCell>
                    <TableCell align="center" sx={{ borderRight: '1px solid #E6E6E6' }}>
                      {data.slaughter.weight.toFixed(2)}
                    </TableCell>
                    {fridgeProducts.map((p, i) => (
                      <TableCell
                        align="center"
                        key={p}
                        sx={
                          i === fridgeProducts.length - 1
                            ? { borderRight: '1px solid #E6E6E6' }
                            : {}
                        }
                      >
                        {data.fridge[p].toFixed(2)}
                      </TableCell>
                    ))}
                    <TableCell align="center" sx={{ borderRight: '1px solid #E6E6E6' }}>
                      {data.waste.toFixed(2)}
                    </TableCell>
                    <TableCell align="center">{data.wasteMother.toFixed(2)}</TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        backgroundColor:
                          difference === 0 ? '#d0f0c0' : difference < 0 ? '#ffd6d6' : '#fff9c4',
                      }}
                    >
                      {difference.toFixed(2)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
};

export default FridgeDailyReport;
