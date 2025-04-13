import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

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
  const [openConfirm, setOpenConfirm] = useState(false);

  const handleOpenConfirm = () => setOpenConfirm(true);
  const handleCloseConfirm = () => setOpenConfirm(false);

  const confirmDelete = () => {
    handleDeleteMovement();
    handleCloseConfirm();
  };

  return (
    <Box
      sx={{
        display: 'flex',
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
        sx={{ marginLeft: 'auto' }}
      >
        Редагувати обраний рядок
      </Button>

      <Button
        variant="contained"
        color="primary"
        onClick={handleOpenConfirm}
        disabled={selectedRowId === null}
      >
        Видалити
      </Button>

      <Button variant="contained" color="primary" onClick={exportToExcel}>
        Завантажити Excel
      </Button>

      {/* Підтвердження */}
      <Dialog open={openConfirm} onClose={handleCloseConfirm}>
        <DialogTitle>Підтвердження видалення</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Ви впевнені, що хочете видалити цей запис? Цю дію не можна скасувати.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm} color="primary">
            Скасувати
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Видалити
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MovementToolbar;
