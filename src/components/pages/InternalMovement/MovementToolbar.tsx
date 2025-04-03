import React from 'react';
import { Box, Button } from '@mui/material';

interface Props {
  selectedRowId: string | null;
  handleEditClick: () => void;
  editingRowId: string | null;
  handleDeleteMovement: () => void;
  exportToExcel: () => void;
}

const MovementToolbar: React.FC<Props> = ({
  selectedRowId,
  handleEditClick,
  editingRowId,
  handleDeleteMovement,
  exportToExcel,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        // justifyContent: 'center',
        gap: '35px',
        p: 2,
        position: 'sticky',
        top: '0px',
        zIndex: 10,
        background: 'white',
      }}
    >
      <Button
        variant="contained"
        color="primary"
        onClick={handleEditClick}
        disabled={selectedRowId === null || !!editingRowId}
      >
        Редагувати обраний рядок
      </Button>

      <Button
        variant="contained"
        color="primary"
        onClick={handleDeleteMovement}
        disabled={selectedRowId === null}
      >
        Видалити
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={exportToExcel}
        sx={{ marginLeft: 'auto' }}
      >
        Завантажити Excel
      </Button>
    </Box>
  );
};

export default MovementToolbar;
