import React from 'react';
import { Box, Button } from '@mui/material';

interface Props {
  onCreate: () => void;
  isDisabled: boolean;
}

const CreateMovementToolbar: React.FC<Props> = ({ onCreate, isDisabled }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        p: 2,
        position: 'sticky',
        top: '0px',
        zIndex: 10,
        background: 'white',
        boxShadow: '0px 1px 0px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Button variant="contained" color="primary" onClick={onCreate} disabled={isDisabled}>
        Створити
      </Button>
    </Box>
  );
};

export default CreateMovementToolbar;
