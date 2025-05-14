import React, { useEffect, useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  TextField,
  Box,
  Button,
} from '@mui/material';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export interface Movement {
  id: string;
  date: string;
  from: string;
  to: string;
  who: string;
  createdAt: string;
  updatedAt: string;
  details: Detail[];
}

export interface Detail {
  quantity?: number;
  weight?: number;
  product: string;
  category?: string;
  price?: number;
  totalPrice?: number;
  comment?: string;
}

const TARGET_CATEGORIES = ['Кінцевий споживач', 'Благодійно', 'Столова', 'Свєта', 'Київ'];

const parseDate = (dateStr: string) => {
  const [day, month, year] = dateStr.split('.').map(Number);
  return new Date(year, month - 1, day);
};

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

const ReportTable: React.FC = () => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        const db = getFirestore();
        const snapshot = await getDocs(collection(db, 'movements'));
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Movement[];
        setMovements(data);
      } catch (error) {
        console.error('Помилка при завантаженні даних:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovements();
  }, []);

  const filteredMovements = useMemo(() => {
    return movements.filter((mov) => {
      if (!TARGET_CATEGORIES.includes(mov.to)) return false;
      const movDate = parseDate(mov.date);
      const fromOk = dateFrom ? movDate >= new Date(dateFrom) : true;
      const toOk = dateTo ? movDate <= new Date(dateTo) : true;
      return fromOk && toOk;
    });
  }, [movements, dateFrom, dateTo]);

  const aggregated = useMemo(() => {
    const result: Record<string, Record<string, { weight: number; revenue: number }>> = {};
    const productMap = new Map<string, number>();

    filteredMovements.forEach((mov) => {
      mov.details.forEach((detail) => {
        const product = capitalize(detail.product.trim().toLowerCase());
        const weight = detail.weight ?? 0;
        const revenue = detail.totalPrice ?? 0;

        if (!result[product]) {
          result[product] = {};
          TARGET_CATEGORIES.forEach((cat) => {
            result[product][cat] = { weight: 0, revenue: 0 };
          });
        }

        result[product][mov.to].weight += weight;
        result[product][mov.to].revenue += revenue;

        productMap.set(product, (productMap.get(product) ?? 0) + weight);
      });
    });

    const sortedProducts = Array.from(productMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([product]) => product);

    return { result, products: sortedProducts };
  }, [filteredMovements]);

  const totalRow = useMemo(() => {
    const totals: Record<string, { weight: number; revenue: number }> = {};
    TARGET_CATEGORIES.forEach((cat) => {
      totals[cat] = { weight: 0, revenue: 0 };
    });

    let totalWeight = 0;
    let totalRevenue = 0;

    aggregated.products.forEach((product) => {
      TARGET_CATEGORIES.forEach((cat) => {
        totals[cat].weight += aggregated.result[product][cat].weight;
        totals[cat].revenue += aggregated.result[product][cat].revenue;
      });
    });

    TARGET_CATEGORIES.forEach((cat) => {
      totalWeight += totals[cat].weight;
      totalRevenue += totals[cat].revenue;
    });

    return { totals, totalWeight, totalRevenue };
  }, [aggregated]);

  const handleExport = () => {
    const data: Record<string, string | number>[] = [];

    aggregated.products.forEach((product) => {
      const row: Record<string, string | number> = { Продукція: product };
      let totalWeight = 0;
      let totalRevenue = 0;

      TARGET_CATEGORIES.forEach((cat) => {
        const w = aggregated.result[product][cat].weight;
        const r = aggregated.result[product][cat].revenue;
        row[`${cat} Вага`] = w;
        row[`${cat} Виручка`] = r;
        totalWeight += w;
        totalRevenue += r;
      });

      row['Сума Вага'] = totalWeight;
      row['Сума Виручка'] = totalRevenue;
      data.push(row);
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Звіт');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'звіт_по_реалізації.xlsx');
  };

  if (loading) {
    return (
      <Typography align="center" sx={{ mt: 4 }}>
        <CircularProgress />
        <br />
        Завантаження звіту...
      </Typography>
    );
  }

  return (
    <Box sx={{ mx: '25px' }}>
      <Typography variant="h6" sx={{ m: 2 }}>
        Звіт по реалізації
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, mx: 2 }}>
        <TextField
          label="Дата з"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <TextField
          label="Дата до"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
        <Button variant="contained" onClick={handleExport} sx={{ marginLeft: 'auto' }}>
          Експорт у Excel
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell rowSpan={2} sx={{ width: '15%', borderRight: '1px solid #ddd' }}>
                <strong>Продукція</strong>
              </TableCell>
              {TARGET_CATEGORIES.map((cat, index) => (
                <TableCell
                  key={cat}
                  colSpan={2}
                  align="center"
                  sx={index < TARGET_CATEGORIES.length ? { borderRight: '1px solid #ddd' } : {}}
                >
                  <strong>{cat}</strong>
                </TableCell>
              ))}
              <TableCell colSpan={2} align="center">
                <strong>Сума</strong>
              </TableCell>
            </TableRow>
            <TableRow>
              {TARGET_CATEGORIES.map((cat, index) => (
                <React.Fragment key={`${cat}-sub`}>
                  <TableCell align="right">Вага</TableCell>
                  <TableCell
                    align="right"
                    sx={index < TARGET_CATEGORIES.length ? { borderRight: '1px solid #ddd' } : {}}
                  >
                    Виручка
                  </TableCell>
                </React.Fragment>
              ))}
              <TableCell align="right">Вага</TableCell>
              <TableCell align="right">Виручка</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {aggregated.products.map((product) => {
              const row = aggregated.result[product];
              const totalWeight = TARGET_CATEGORIES.reduce((sum, cat) => sum + row[cat].weight, 0);
              const totalRevenue = TARGET_CATEGORIES.reduce(
                (sum, cat) => sum + row[cat].revenue,
                0
              );
              return (
                <TableRow key={product}>
                  <TableCell sx={{ borderRight: '1px solid #ddd' }}>{product}</TableCell>
                  {TARGET_CATEGORIES.map((cat, index) => (
                    <React.Fragment key={cat}>
                      <TableCell align="right">{row[cat].weight.toFixed(2)}</TableCell>
                      <TableCell
                        align="right"
                        sx={
                          index < TARGET_CATEGORIES.length ? { borderRight: '1px solid #ddd' } : {}
                        }
                      >
                        {row[cat].revenue.toFixed(2)}
                      </TableCell>
                    </React.Fragment>
                  ))}
                  <TableCell align="right">
                    <strong>{totalWeight.toFixed(2)}</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>{totalRevenue.toFixed(2)}</strong>
                  </TableCell>
                </TableRow>
              );
            })}

            {/* ПІДСУМКИ */}
            <TableRow>
              <TableCell sx={{ borderRight: '1px solid #ddd' }}>
                <strong>Усього</strong>
              </TableCell>
              {TARGET_CATEGORIES.map((cat, index) => (
                <React.Fragment key={`total-${cat}`}>
                  <TableCell align="right">
                    <strong>{totalRow.totals[cat].weight.toFixed(2)}</strong>
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={index < TARGET_CATEGORIES.length ? { borderRight: '1px solid #ddd' } : {}}
                  >
                    <strong>{totalRow.totals[cat].revenue.toFixed(2)}</strong>
                  </TableCell>
                </React.Fragment>
              ))}
              <TableCell align="right">
                <strong>{totalRow.totalWeight.toFixed(2)}</strong>
              </TableCell>
              <TableCell align="right">
                <strong>{totalRow.totalRevenue.toFixed(2)}</strong>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ReportTable;
