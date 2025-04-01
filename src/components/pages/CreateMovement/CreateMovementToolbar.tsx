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
        justifyContent: 'center',
        p: 2,
        position: 'sticky',
        top: '0px',
        zIndex: 10,
        background: 'white',
        boxShadow: 'none',
      }}
    >
      <Button
        variant="contained"
        color="primary"
        onClick={onCreate}
        disabled={isDisabled}
        sx={{ width: '150px' }}
      >
        Створити
      </Button>
    </Box>
  );
};

export default CreateMovementToolbar;
