import React, { useState } from 'react';
import CreateMovementToolbar from './CreateMovementToolbar';
import CreateMovementTable from './CreateMovementTable';
import { Box } from '@mui/material';
import CreateMovementRow from './CreateMovementRow';

const CreateMovement: React.FC = () => {
  const [rows, setRows] = useState<JSX.Element[]>([]);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const handleCreateRow = () => {
    setIsCreating(true);
    setRows([...rows, <CreateMovementRow key={rows.length} onSave={() => setIsCreating(false)} />]);
  };

  return (
    <Box sx={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <CreateMovementToolbar onCreate={handleCreateRow} isDisabled={isCreating} />
      <CreateMovementTable rows={rows} />
    </Box>
  );
};

export default CreateMovement;
