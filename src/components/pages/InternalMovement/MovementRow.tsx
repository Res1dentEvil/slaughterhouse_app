import React, { useState } from 'react';
import {
  TableRow,
  TableCell,
  IconButton,
  TextField,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { Movement } from '../../types/types';

interface Props {
  row: Movement;
  selectedRowId: string | null;
  setSelectedRowId: (id: string | null) => void;
  handleRowClick: (row: Movement) => void;
  index: number;
  isEditingRow: (rowId: string) => boolean;
  editingRowId: string | null;
}

const MovementRow: React.FC<Props> = ({
  row,
  selectedRowId,
  setSelectedRowId,
  handleRowClick,
  index,
  isEditingRow,
  editingRowId,
}) => {
  const [editedRow, setEditedRow] = useState<Movement>(row);

  // Функція для обробки зміни текстових полів
  const handleTextFieldChange = (field: keyof Movement, value: string) => {
    setEditedRow((prevRow) => ({
      ...prevRow,
      [field]: value,
    }));
  };

  const handleRowSelection = (e: React.MouseEvent) => {
    // Перевіряємо, чи не редагується рядок перед вибором
    if (!isEditingRow(row.id)) {
      setSelectedRowId(row.id);
    }
    e.stopPropagation();
  };

  // console.log('row:', row.createdAt);

  return (
    <TableRow
      onClick={() => {
        if (!editingRowId) setSelectedRowId(row.id); // Блокування вибору іншого рядка при редагуванні
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
            value={editedRow.date} // Відстежуємо значення через state
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
          <FormControl fullWidth>
            <InputLabel>From</InputLabel>
            <Select
              value={editedRow.from} // Відстежуємо значення через state
              onChange={(e) => handleTextFieldChange('from', e.target.value)}
              size="small"
            >
              <MenuItem value="Location 1">Location 1</MenuItem>
              <MenuItem value="Location 2">Location 2</MenuItem>
            </Select>
          </FormControl>
        ) : (
          row.from
        )}
      </TableCell>
      <TableCell>
        {isEditingRow(row.id) ? (
          <FormControl fullWidth>
            <InputLabel>To</InputLabel>
            <Select
              value={editedRow.to} // Відстежуємо значення через state
              onChange={(e) => handleTextFieldChange('to', e.target.value)}
              size="small"
            >
              <MenuItem value="Location A">Location A</MenuItem>
              <MenuItem value="Location B">Location B</MenuItem>
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
    </TableRow>
  );
};

export default MovementRow;
