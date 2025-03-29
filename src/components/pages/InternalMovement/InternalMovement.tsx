import React, { useState } from 'react';
import { Movement } from '../../types/types';
import { initialData } from '../../utils/mockData';
import MovementToolbar from './MovementToolbar';
import MovementTable from './MovementTable';
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
  const [rows, setRows] = useState<Movement[]>(initialData);
  const [filters, setFilters] = useState({
    date: '',
    from: '',
    to: '',
    who: '',
    createdAt: '',
    updatedAt: '',
  });
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Movement | null>(null);
  const [editingRowId, setEditingRowId] = useState<number | null>(null); // Окремий стан для редагування

  const handleFilterChange = (field: string, value: string) =>
    setFilters((prev) => ({ ...prev, [field]: value }));

  const handleRowClick = (row: Movement) => {
    setSelectedRow(row);
    setDrawerOpen(true);
  };

  const handleEditClick = (rowId: number) => {
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

  return (
    <Box sx={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <MovementToolbar
        selectedRowId={selectedRowId}
        handleEditClick={() => handleEditClick(selectedRowId ?? 0)} // Вибираємо поточний рядок для редагування
      />
      <MovementTable
        rows={filteredRows}
        filters={filters}
        selectedRowId={selectedRowId}
        setSelectedRowId={setSelectedRowId}
        handleFilterChange={handleFilterChange}
        handleRowClick={handleRowClick}
        isEditingRow={(rowId) => editingRowId === rowId} // Перевіряємо, чи цей рядок редагується
        editingRowId={editingRowId} // Передаємо для блокування вибору інших рядків
      />
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
                  {selectedRow.details.map((detail, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {editingRowId ? (
                          <TextField defaultValue={detail.quantity} fullWidth size="small" />
                        ) : (
                          detail.quantity
                        )}
                      </TableCell>
                      <TableCell>
                        {editingRowId ? (
                          <TextField defaultValue={detail.weight} fullWidth size="small" />
                        ) : (
                          detail.weight
                        )}
                      </TableCell>
                      <TableCell>
                        {editingRowId ? (
                          <TextField defaultValue={detail.product} fullWidth size="small" />
                        ) : (
                          detail.product
                        )}
                      </TableCell>
                      <TableCell>
                        {editingRowId ? (
                          <FormControl fullWidth>
                            <InputLabel>Категорія</InputLabel>
                            <Select defaultValue={detail.category || ''} size="small">
                              <MenuItem value="Category 1">Category 1</MenuItem>
                              <MenuItem value="Category 2">Category 2</MenuItem>
                              <MenuItem value="Category 3">Category 3</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          detail.category
                        )}
                      </TableCell>
                      <TableCell>
                        {editingRowId ? (
                          <TextField defaultValue={detail.price} fullWidth size="small" />
                        ) : (
                          detail.price
                        )}
                      </TableCell>
                      <TableCell>
                        {editingRowId ? (
                          <TextField
                            defaultValue={detail.totalPrice}
                            fullWidth
                            size="small"
                            disabled
                          />
                        ) : (
                          detail.totalPrice
                        )}
                      </TableCell>
                      <TableCell>
                        {editingRowId ? (
                          <TextField defaultValue={detail.comment} fullWidth size="small" />
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
                <Button onClick={handleSaveChanges} variant="contained" color="primary">
                  Зберегти зміни
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Drawer>
    </Box>
  );
};

export default InternalMovement;
