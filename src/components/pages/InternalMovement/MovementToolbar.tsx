import React from 'react';
import { Box, Button } from '@mui/material';

interface Props {
  selectedRowId: string | null;
  handleEditClick: () => void;
}

const MovementToolbar: React.FC<Props> = ({ selectedRowId, handleEditClick }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        p: 2,
        position: 'sticky',
        top: '0px',
        zIndex: 100,
        background: 'white',
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Button
        variant="contained"
        color="primary"
        onClick={handleEditClick}
        disabled={selectedRowId === null}
      >
        Редагувати
      </Button>
    </Box>
  );
};

export default MovementToolbar;
