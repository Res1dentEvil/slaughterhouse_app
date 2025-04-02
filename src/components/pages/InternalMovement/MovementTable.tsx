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
              rows={rows}
              setRows={setRows}
              selectedRowId={selectedRowId}
              setSelectedRowId={setSelectedRowId}
              index={index}
              isEditingRow={isEditingRow} // Передаємо проп isEditingRow
              editingRowId={editingRowId} // Передаємо для блокування вибору інших рядків
              setEditingRowId={setEditingRowId}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MovementTable;
