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
} from '@mui/material';
import { Movement } from '../../types/types';
import MovementRow from './MovementRow';

interface Props {
  rows: Movement[];
  filters: Record<string, string>;
  selectedRowId: number | null;
  setSelectedRowId: (id: number | null) => void;
  handleFilterChange: (field: string, value: string) => void;
  handleRowClick: (row: Movement) => void;
  isEditingRow: (rowId: number) => boolean; // Додано новий проп
  editingRowId: number | null;
}

const MovementTable: React.FC<Props> = ({
  rows,
  filters,
  selectedRowId,
  setSelectedRowId,
  handleFilterChange,
  handleRowClick,
  isEditingRow,
  editingRowId,
}) => {
  return (
    <TableContainer
      component={Paper}
      sx={{ width: '100%', padding: '0 20px', overflow: 'visible' }}
    >
      {/*<Table stickyHeader>*/}
      <Table>
        <TableHead>
          <TableRow>
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
                ) : (
                  <TextField
                    size="small"
                    fullWidth
                    value={filters[field]}
                    onChange={(e) => handleFilterChange(field, e.target.value)}
                  />
                )}
              </TableCell>
            ))}
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <MovementRow
              key={row.id}
              row={row}
              selectedRowId={selectedRowId}
              setSelectedRowId={setSelectedRowId}
              handleRowClick={handleRowClick}
              index={index}
              isEditingRow={isEditingRow} // Передаємо проп isEditingRow
              editingRowId={editingRowId} // Передаємо для блокування вибору інших рядків
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MovementTable;
