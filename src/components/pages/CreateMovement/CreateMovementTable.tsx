import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

interface Props {
  rows: JSX.Element[];
}

const CreateMovementTable: React.FC<Props> = ({ rows }) => {
  return (
    <TableContainer
      component={Paper}
      sx={{
        width: '100%',
        padding: '0 20px',
        overflow: 'visible',
        boxShadow: '0px 0px 0px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell />

            <TableCell>Дата</TableCell>
            <TableCell>Звідки</TableCell>
            <TableCell>Куди</TableCell>
            <TableCell>Хто</TableCell>
            <TableCell>Коли створено</TableCell>
            <TableCell>Оновлено</TableCell>
            <TableCell>Дія</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{rows}</TableBody>
      </Table>
    </TableContainer>
  );
};

export default CreateMovementTable;
