import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Box,
  Button,
  Select,
  MenuItem,
} from '@mui/material';
import { Movement } from '../../../types/types';
import MovementRow from './MovementRow';

interface Props {
  rows: Movement[];
  setRows: (rows: Movement[]) => void;
  filters: Record<string, string>;
  selectedRowId: string | null;
  setSelectedRowId: (id: string | null) => void;
  handleFilterChange: (field: string, value: string) => void;
  isEditingRow: (rowId: string) => boolean; // Додано новий проп
  editingRowId: string | null;
  setEditingRowId: (id: string | null) => void;
}

const MovementTable: React.FC<Props> = ({
  rows,
  setRows,
  filters,
  selectedRowId,
  setSelectedRowId,
  handleFilterChange,
  isEditingRow,
  editingRowId,
  setEditingRowId,
}) => {
  return (
    <TableContainer
      component={Paper}
      sx={{
        width: '100%',
        padding: '0 20px',
        overflow: 'visible',
        boxShadow: 'none',
      }}
    >
      {/*<Table stickyHeader>*/}
      <Table>
        <TableHead>
          <TableRow sx={{ background: '#EDEDED' }}>
            <TableCell />
            <TableCell></TableCell>
            <TableCell>Дата</TableCell>
            <TableCell>Звідки</TableCell>
            <TableCell>Куди</TableCell>
            <TableCell>Хто</TableCell>
            <TableCell>Коли створено</TableCell>
            <TableCell>Оновлено</TableCell>
            <TableCell>Дія</TableCell>
          </TableRow>
          <TableRow>
            <TableCell />
            {['status', 'date', 'from', 'to', 'who', 'createdAt', 'updatedAt'].map((field) => (
              <TableCell key={field}>
                {field === 'status' ? (
                  <Box sx={{ height: 40 }} />
                ) : field === 'from' ? (
                  <Select
                    size="small"
                    fullWidth
                    value={filters[field] || ''}
                    onChange={(e) => handleFilterChange(field, e.target.value)}
                    displayEmpty
                    sx={{ width: '240px' }}
                  >
                    <MenuItem value="">Усі</MenuItem>
                    <MenuItem value="Насташка">Насташка</MenuItem>
                    <MenuItem value="Іванівка">Іванівка</MenuItem>
                    <MenuItem value="Колодисте">Колодисте</MenuItem>
                    <MenuItem value="Цех забою">Цех забою</MenuItem>
                    <MenuItem value="Холодильник">Холодильник</MenuItem>
                    <MenuItem value="Переробка">Переробка</MenuItem>
                    <MenuItem value="Склад готової продукції (морозильна камера)">
                      Склад готової продукції (морозильна камера)
                    </MenuItem>
                  </Select>
                ) : field === 'to' ? (
                  <Select
                    size="small"
                    fullWidth
                    value={filters[field] || ''}
                    onChange={(e) => handleFilterChange(field, e.target.value)}
                    displayEmpty
                    sx={{ width: '240px' }}
                  >
                    <MenuItem value="">Усі</MenuItem>
                    <MenuItem value="Цех забою">Цех забою</MenuItem>
                    <MenuItem value="Цех утилізації відходів">Цех утилізації відходів</MenuItem>
                    <MenuItem value="Холодильник">Холодильник</MenuItem>
                    <MenuItem value="Переробка">Переробка</MenuItem>
                    <MenuItem value="Склад готової продукції (морозильна камера)">
                      Склад готової продукції (морозильна камера)
                    </MenuItem>
                    <MenuItem value="Пайки">Пайки</MenuItem>
                    <MenuItem value="Київ">Київ</MenuItem>
                    <MenuItem value="Свєта">Свєта</MenuItem>
                    <MenuItem value="Кінцевий споживач">Кінцевий споживач</MenuItem>
                    <MenuItem value="Столова">Столова</MenuItem>
                    <MenuItem value="Благодійно">Благодійно</MenuItem>
                  </Select>
                ) : (
                  <TextField
                    size="small"
                    fullWidth
                    value={filters[field] || ''}
                    onChange={(e) => handleFilterChange(field, e.target.value)}
                  />
                )}
              </TableCell>
            ))}
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {[...rows]
            .sort((a, b) => {
              const parseDate = (str: string) => {
                const [day, month, year] = str.split('.');
                return new Date(+year, +month - 1, +day);
              };
              return parseDate(b.date).getTime() - parseDate(a.date).getTime();
            })
            .map((row, index) => (
              <MovementRow
                key={row.id}
                row={row}
                rows={rows}
                setRows={setRows}
                selectedRowId={selectedRowId}
                setSelectedRowId={setSelectedRowId}
                index={index}
                isEditingRow={isEditingRow}
                editingRowId={editingRowId}
                setEditingRowId={setEditingRowId}
              />
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MovementTable;
