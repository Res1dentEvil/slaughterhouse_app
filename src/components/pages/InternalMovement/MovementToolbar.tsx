import React from 'react';
import { Box, Button } from '@mui/material';

interface Props {
  selectedRowId: string | null;
  handleEditClick: () => void;
  editingRowId: string | null;
}

const MovementToolbar: React.FC<Props> = ({ selectedRowId, handleEditClick, editingRowId }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        // justifyContent: 'center',
        p: 2,
        position: 'sticky',
        top: '0px',
        zIndex: 10,
        background: 'white',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
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
    </Box>
  );
};

export default MovementToolbar;
