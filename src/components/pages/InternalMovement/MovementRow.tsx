import React, { useState } from 'react';
import { Detail } from '../../types/types';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import {
  TableRow,
  TableCell,
  IconButton,
  TextField,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  Box,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  Button,
  Drawer,
  Snackbar,
  Alert,
} from '@mui/material';
import { Close, Visibility } from '@mui/icons-material';
import { Movement } from '../../types/types';
import firebase from 'firebase/compat';
// import Timestamp = firebase.firestore.Timestamp;

interface Props {
  row: Movement;
  rows: Movement[];
  setRows: (rows: Movement[]) => void;
  selectedRowId: string | null;
  setSelectedRowId: (id: string | null) => void;
  index: number;
  isEditingRow: (rowId: string) => boolean;
  editingRowId: string | null;
  setEditingRowId: (id: string | null) => void;
}

const MovementRow: React.FC<Props> = ({
  row,
  rows,
  setRows,
  selectedRowId,
  setSelectedRowId,
  index,
  isEditingRow,
  editingRowId,
  setEditingRowId,
}) => {
  const [editedRow, setEditedRow] = useState<Movement>(row);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Movement | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Функція для обробки зміни текстових полів
  const handleTextFieldChange = (field: keyof Movement, value: string) => {
    setEditedRow((prevRow) => ({
      ...prevRow,
      [field]: value,
    }));
  };

  const handleDetailChange = (index: number, field: keyof Detail, value: string | number) => {
    setEditedRow((prev) => ({
      ...prev,
      details: prev.details.map((detail, i) =>
        i === index ? { ...detail, [field]: value } : detail
      ),
    }));
  };

  const handleRowClick = (row: Movement) => {
    setSelectedRow(row);
    setDrawerOpen(true);
  };

  const updateMovement = async (editedRow: Movement) => {
    if (!editedRow.id) return; // Перевірка, чи є ID
    try {
      const movementRef = doc(db, 'movements', editedRow.id);

      const docSnap = await getDoc(movementRef);
      if (!docSnap.exists()) {
        console.error('Документ не існує, оновлення неможливе.');
        return;
      }

      await updateDoc(movementRef, {
        ...editedRow,
        updatedAt: serverTimestamp(),
      });

      // Оновлення локального списку
      setRows(rows.map((m) => (m.id === editedRow.id ? { ...m, ...editedRow } : m)));

      console.log('Документ оновлено!', editedRow);
      setDrawerOpen(false);
      setEditingRowId(null);
      setOpenSnackbar(true);
    } catch (error) {
      console.error('Помилка оновлення документа:', error);
    }
  };

  return (
    <TableRow
      onClick={(e) => {
        e.stopPropagation();
        if (!editingRowId) {
          setSelectedRowId(row.id);
          console.log(row);
        } // Блокування вибору іншого рядка при редагуванні
      }}
      sx={{
        backgroundColor:
          selectedRowId === row.id ? '#e0f7fa' : index % 2 === 0 ? '#f5f5f5' : 'white',
        cursor: 'pointer',
      }}
    >
      <TableCell>
        {selectedRowId === row.id ? (
          <input
            type="radio"
            checked={selectedRowId === row.id}
            onChange={() => setSelectedRowId(row.id)}
            onClick={(e) => e.stopPropagation()}
          />
        ) : null}
      </TableCell>
      <TableCell></TableCell>
      <TableCell>
        {isEditingRow(row.id) ? (
          <TextField
            value={editedRow.date}
            onChange={(e) => handleTextFieldChange('date', e.target.value)} // Обробляємо зміну
            fullWidth
            size="small"
          />
        ) : (
          row.date
        )}
      </TableCell>
      <TableCell>
        {isEditingRow(row.id) ? (
          <FormControl>
            <Select
              value={editedRow.from} // Відстежуємо значення через state
              onChange={(e) => handleTextFieldChange('from', e.target.value)}
              size="small"
              sx={{ width: '200px' }}
            >
              <MenuItem value="Насташка">Насташка</MenuItem>
              <MenuItem value="Іванівка">Іванівка</MenuItem>
              <MenuItem value="Колодисте">Колодисте</MenuItem>
              <MenuItem value="Цех забою">Цех забою</MenuItem>
              <MenuItem value="Холодильник і Переробка">Холодильник і Переробка</MenuItem>
              <MenuItem value="Склад готової продукції (морозильна камера)">
                Склад готової продукції (морозильна камера)
              </MenuItem>
            </Select>
          </FormControl>
        ) : (
          row.from
        )}
      </TableCell>
      <TableCell>
        {isEditingRow(row.id) ? (
          <FormControl>
            <Select
              value={editedRow.to} // Відстежуємо значення через state
              onChange={(e) => handleTextFieldChange('to', e.target.value)}
              size="small"
              sx={{ width: '200px' }}
            >
              <MenuItem value="Цех забою">Цех забою</MenuItem>
              <MenuItem value="Цех утилізації відходів">Цех утилізації відходів</MenuItem>
              <MenuItem value="Холодильник і Переробка">Холодильник і Переробка</MenuItem>
              <MenuItem value="Склад готової продукції (морозильна камера)">
                Склад готової продукції (морозильна камера)
              </MenuItem>
              <MenuItem value="Вибуття">Вибуття</MenuItem>
            </Select>
          </FormControl>
        ) : (
          row.to
        )}
      </TableCell>
      <TableCell>{row.who}</TableCell>
      <TableCell>{row.createdAt}</TableCell>
      <TableCell>{row.updatedAt}</TableCell>
      <TableCell>
        {selectedRowId === row.id ? (
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handleRowClick(row);
            }}
          >
            <Visibility />
          </IconButton>
        ) : null}
      </TableCell>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ width: '40%' }}
      >
        {selectedRow && (
          <Box sx={{ width: '40vw', p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <h3>Деталі переміщення</h3>
              <IconButton onClick={() => setDrawerOpen(false)}>
                <Close />
              </IconButton>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Кількість</TableCell>
                    <TableCell>Вага</TableCell>
                    <TableCell>Продукт</TableCell>
                    <TableCell>Категорія</TableCell>
                    <TableCell>Ціна</TableCell>
                    <TableCell>Вартість</TableCell>
                    <TableCell>Коментар</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {editedRow.details.map((detail, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {editingRowId ? (
                          <TextField
                            value={detail.quantity}
                            onChange={(e) =>
                              handleDetailChange(index, 'quantity', Number(e.target.value))
                            }
                            fullWidth
                            size="small"
                          />
                        ) : (
                          detail.quantity
                        )}
                      </TableCell>
                      <TableCell>
                        {editingRowId ? (
                          <TextField
                            value={detail.weight}
                            onChange={(e) => {
                              handleDetailChange(index, 'weight', Number(e.target.value));
                              handleDetailChange(
                                index,
                                'totalPrice',
                                (detail.price ?? 0) * (detail.weight ?? 0)
                              );
                            }}
                            fullWidth
                            size="small"
                          />
                        ) : (
                          detail.weight
                        )}
                      </TableCell>
                      <TableCell>
                        {editingRowId ? (
                          <FormControl fullWidth>
                            <Select
                              value={detail.product || ''}
                              onChange={(e) => handleDetailChange(index, 'product', e.target.value)}
                              size="small"
                            >
                              <MenuItem value="Тварина">Тварина</MenuItem>
                              <MenuItem value="Кістки">Кістки</MenuItem>
                              <MenuItem value="Відходи на утилізацію">
                                Відходи на утилізацію
                              </MenuItem>
                              <MenuItem value="Молочні поросята">Молочні поросята</MenuItem>
                              <MenuItem value="Ділове">Ділове</MenuItem>
                              <MenuItem value="С/Б">С/Б</MenuItem>
                              <MenuItem value="Голова">Голова</MenuItem>
                              <MenuItem value="Печінка">Печінка</MenuItem>
                              <MenuItem value="СМ">СМ</MenuItem>
                              <MenuItem value="Шкварки">Шкварки</MenuItem>
                              <MenuItem value="Шпикачки">Шпикачки</MenuItem>
                              <MenuItem value="Паштет">Паштет</MenuItem>
                              <MenuItem value="Ковбаски гриль">Ковбаски гриль</MenuItem>
                              <MenuItem value="Вуха">Вуха</MenuItem>
                              <MenuItem value="Ковбаса">Ковбаса</MenuItem>
                              <MenuItem value="Ребро до пива">Ребро до пива</MenuItem>
                              <MenuItem value="Копчена ковбаса">Копчена ковбаса</MenuItem>
                              <MenuItem value="Копчене м'ясо">Копчене м&apos;ясо</MenuItem>
                              <MenuItem value="Млинці з сиром">Млинці з сиром</MenuItem>
                              <MenuItem value="Млинці з м'ясом">Млинці з м&apos;ясом</MenuItem>
                              <MenuItem value="Чебуреки">Чебуреки</MenuItem>
                              <MenuItem value="Пельмені">Пельмені</MenuItem>
                              <MenuItem value="Шкварки 5л">Шкварки 5л</MenuItem>
                              <MenuItem value="Сало кускове">Сало кускове</MenuItem>
                              <MenuItem value="Сало кручене">Сало кручене</MenuItem>
                              <MenuItem value="Сало на шкірі">Сало на шкірі</MenuItem>
                              <MenuItem value="Домашня ковбаса">Домашня ковбаса</MenuItem>
                              <MenuItem value="Копчений биток">Копчений биток</MenuItem>
                              <MenuItem value="Копчене ребро">Копчене ребро</MenuItem>
                              <MenuItem value="Язик">Язик</MenuItem>
                              <MenuItem value="Голяшки">Голяшки</MenuItem>
                              <MenuItem value="Дрогобицька ковбаса">Дрогобицька ковбаса</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          detail.product
                        )}
                      </TableCell>
                      <TableCell>
                        {editingRowId ? (
                          <FormControl fullWidth>
                            <Select
                              value={detail.category || ''}
                              onChange={(e) =>
                                handleDetailChange(index, 'category', e.target.value)
                              }
                              size="small"
                            >
                              <MenuItem value="1">1</MenuItem>
                              <MenuItem value="2">2</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          detail.category
                        )}
                      </TableCell>
                      <TableCell>
                        {editingRowId ? (
                          <TextField
                            value={detail.price}
                            onChange={(e) => {
                              handleDetailChange(index, 'price', Number(e.target.value));
                              handleDetailChange(
                                index,
                                'totalPrice',
                                (detail.price ?? 0) * (detail.weight ?? 0)
                              );
                            }}
                            fullWidth
                            size="small"
                          />
                        ) : (
                          detail.price
                        )}
                      </TableCell>
                      <TableCell>
                        {editingRowId ? (
                          <TextField value={detail.totalPrice} fullWidth size="small" disabled />
                        ) : (
                          detail.totalPrice
                        )}
                      </TableCell>
                      <TableCell>
                        {editingRowId ? (
                          <TextField
                            value={detail.comment}
                            onChange={(e) => {
                              handleDetailChange(index, 'comment', e.target.value);
                            }}
                            fullWidth
                            size="small"
                          />
                        ) : (
                          detail.comment
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {editingRowId && (
              <Box sx={{ mt: 2 }}>
                <Button
                  onClick={() => updateMovement(editedRow)}
                  variant="contained"
                  color="primary"
                >
                  Зберегти зміни
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Drawer>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setOpenSnackbar(false)}>
          Зміни збережено!
        </Alert>
      </Snackbar>
    </TableRow>
  );
};

export default MovementRow;
