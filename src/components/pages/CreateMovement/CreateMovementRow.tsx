import React, { useEffect, useState } from 'react';
import {
  TableRow,
  TableCell,
  IconButton,
  TextField,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  Box,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  Button,
  Drawer,
} from '@mui/material';

import { Close, Visibility, Edit, CheckCircle } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';

interface Props {
  onSave: () => void;
}

const CreateMovementRow: React.FC<Props> = ({ onSave }) => {
  const userFromRedux = useSelector((state: RootState) => state.auth.user);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isCreating, setIsCreating] = useState<boolean>(true);

  const [date, setDate] = useState<string>('');
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [who, setWho] = useState<string>('');
  const [createdAt, setCreatedAt] = useState<string>('');
  const [updatedAt, setUpdatedAt] = useState<string>('');

  const [drawerQuantity, setDrawerQuantity] = useState<number | ''>('');
  const [drawerWeight, setDrawerWeight] = useState<number | ''>('');
  const [drawerProduct, setDrawerProduct] = useState<string>('');
  const [drawerCategory, setDrawerCategory] = useState<string>('');
  const [drawerPrice, setDrawerPrice] = useState<number | ''>('');
  const [drawerTotalPrice, setDrawerTotalPrice] = useState<number | ''>('');
  const [drawerComment, setDrawerComment] = useState<string>('');

  const today = new Date();
  const formattedDate = `${today.getDate().toString().padStart(2, '0')}.${(today.getMonth() + 1)
    .toString()
    .padStart(2, '0')}.${today.getFullYear()}`;

  useEffect(() => {
    if (userFromRedux?.displayName) {
      setWho(userFromRedux.displayName);
    }
    setCreatedAt(formattedDate);
    setUpdatedAt(formattedDate);
  }, [userFromRedux]);

  const handleSaveChanges = () => {
    // Заглушка для збереження (можна реалізувати пізніше)
    console.log({
      id: Date.now(),
      date: date,
      from: from,
      to: to,
      who: who,
      createdAt: createdAt,
      updatedAt: updatedAt,
      details: [
        {
          quantity: drawerQuantity,
          weight: drawerWeight,
          product: drawerProduct,
          category: drawerCategory,
          price: drawerPrice,
          totalPrice: drawerTotalPrice,
          comment: drawerComment,
        },
      ],
    });

    setIsCreating(false);
    setDrawerOpen(false);
    onSave();
  };

  useEffect(() => {
    if (drawerPrice && drawerWeight) {
      setDrawerTotalPrice(drawerPrice * drawerWeight);
    } else {
      setDrawerTotalPrice('');
    }
  }, [drawerPrice, drawerWeight]);

  const handleRowClick = () => {
    setDrawerOpen(true);
  };

  return (
    <TableRow>
      <TableCell>
        {isCreating ? (
          <IconButton>
            <Edit sx={{ color: 'red' }} />
          </IconButton>
        ) : (
          <IconButton>
            <CheckCircle sx={{ color: 'green' }} />
          </IconButton>
        )}
      </TableCell>
      <TableCell>
        <TextField
          type="date"
          value={date ? date.split('.').reverse().join('-') : ''} // Перетворюємо дд.мм.рр в рррр-мм-дд для input type="date"
          onChange={(e) => {
            const formattedDate = e.target.value.split('-').reverse().join('.'); // Перетворюємо назад в дд.мм.рр
            setDate(formattedDate);
          }}
          size="small"
        />
      </TableCell>
      <TableCell>
        <FormControl>
          <Select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            size="small"
            sx={{ width: '200px' }}
          >
            <MenuItem value="Насташка">Насташка</MenuItem>
            <MenuItem value="Іванівка">Іванівка</MenuItem>
            <MenuItem value="Колодисте">Колодисте</MenuItem>
            <MenuItem value="Цех забою">Цех забою</MenuItem>
            {/*<MenuItem value="Цех утилізації відходів">Цех утилізації відходів</MenuItem>*/}
            <MenuItem value="Холодильник і Переробка">Холодильник і Переробка</MenuItem>
            <MenuItem value="Склад готової продукції (морозильна камера)">
              Склад готової продукції (морозильна камера)
            </MenuItem>
            {/*<MenuItem value="Вибуття">Вибуття</MenuItem>*/}
          </Select>
        </FormControl>
      </TableCell>
      <TableCell>
        <FormControl>
          <Select
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
            }}
            size="small"
            sx={{ width: '200px' }}
          >
            <MenuItem value="Цех забою">Цех забою</MenuItem>
            <MenuItem value="Цех утилізації відходів">Цех утилізації відходів</MenuItem>
            <MenuItem value="Холодильник і Переробка">Холодильник і Переробка</MenuItem>
            <MenuItem value="Склад готової продукції (морозильна камера)">
              Склад готової продукції (морозильна камера)
            </MenuItem>
            <MenuItem value="Вибуття">Вибуття</MenuItem>
          </Select>
        </FormControl>
      </TableCell>
      <TableCell>
        <TextField value={who} size="small" disabled />
      </TableCell>
      <TableCell>
        <TextField value={createdAt} size="small" disabled />
      </TableCell>
      <TableCell>
        <TextField value={updatedAt} size="small" disabled />
      </TableCell>
      <TableCell>
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            handleRowClick();
          }}
        >
          <Visibility />
        </IconButton>
      </TableCell>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ width: '45%' }}
      >
        <Box sx={{ width: '45vw', p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <h3>Деталі переміщення</h3>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <Close />
            </IconButton>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Кількість</TableCell>
                  <TableCell>Вага</TableCell>
                  <TableCell>Продукт</TableCell>
                  <TableCell>Категорія</TableCell>
                  <TableCell>Ціна</TableCell>
                  <TableCell>Вартість</TableCell>
                  <TableCell>Коментар</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <TextField
                      value={drawerQuantity}
                      onChange={(e) => {
                        const value = e.target.value;
                        setDrawerQuantity(value === '' ? '' : parseInt(value) || 0);
                      }}
                      size="small"
                      sx={{ width: '70px' }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={drawerWeight}
                      onChange={(e) => {
                        const value = e.target.value;
                        setDrawerWeight(value === '' ? '' : parseInt(value) || 0);
                      }}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <FormControl>
                      <Select
                        value={drawerProduct}
                        onChange={(e) => setDrawerProduct(e.target.value)}
                        size="small"
                        sx={{ width: '200px' }}
                      >
                        <MenuItem value="Тварина">Тварина</MenuItem>
                        <MenuItem value="Кістки">Кістки</MenuItem>
                        <MenuItem value="Відходи на утилізацію">Відходи на утилізацію</MenuItem>
                        <MenuItem value="Молочні поросята">Молочні поросята</MenuItem>
                        <MenuItem value="Ділове">Ділове</MenuItem>
                        <MenuItem value="С/Б">С/Б</MenuItem>
                        <MenuItem value="Голова">Голова</MenuItem>
                        <MenuItem value="Печінка">Печінка</MenuItem>
                        <MenuItem value="СМ">СМ</MenuItem>
                        <MenuItem value="Шкварки">Шкварки</MenuItem>
                        <MenuItem value="Шпикачки">Шпикачки</MenuItem>
                        <MenuItem value="Паштет">Паштет</MenuItem>
                        <MenuItem value="Ковбаски гриль">Ковбаски гриль</MenuItem>
                        <MenuItem value="Вуха">Вуха</MenuItem>
                        <MenuItem value="Ковбаса">Ковбаса</MenuItem>
                        <MenuItem value="Ребро до пива">Ребро до пива</MenuItem>
                        <MenuItem value="Копчена ковбаса">Копчена ковбаса</MenuItem>
                        <MenuItem value="Копчене м'ясо">Копчене м&apos;ясо</MenuItem>
                        <MenuItem value="Млинці з сиром">Млинці з сиром</MenuItem>
                        <MenuItem value="Млинці з м'ясом">Млинці з м&apos;ясом</MenuItem>
                        <MenuItem value="Чебуреки">Чебуреки</MenuItem>
                        <MenuItem value="Пельмені">Пельмені</MenuItem>
                        <MenuItem value="Шкварки 5л">Шкварки 5л</MenuItem>
                        <MenuItem value="Сало кускове">Сало кускове</MenuItem>
                        <MenuItem value="Сало кручене">Сало кручене</MenuItem>
                        <MenuItem value="Сало на шкірі">Сало на шкірі</MenuItem>
                        <MenuItem value="Домашня ковбаса">Домашня ковбаса</MenuItem>
                        <MenuItem value="Копчений биток">Копчений биток</MenuItem>
                        <MenuItem value="Копчене ребро">Копчене ребро</MenuItem>
                        <MenuItem value="Язик">Язик</MenuItem>
                        <MenuItem value="Голяшки">Голяшки</MenuItem>
                        <MenuItem value="Дрогобицька ковбаса">Дрогобицька ковбаса</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <FormControl>
                      <Select
                        value={drawerCategory}
                        onChange={(e) => {
                          setDrawerCategory(e.target.value);
                        }}
                        size="small"
                        sx={{ width: '100px' }}
                      >
                        <MenuItem value="Category 1">Category 1</MenuItem>
                        <MenuItem value="Category 2">Category 2</MenuItem>
                        <MenuItem value="Category 3">Category 3</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={drawerPrice}
                      onChange={(e) => setDrawerPrice(Number(e.target.value) || '')}
                      fullWidth
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField value={drawerTotalPrice} fullWidth size="small" disabled />
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={drawerComment}
                      onChange={(e) => {
                        setDrawerComment(e.target.value);
                      }}
                      fullWidth
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 2 }}>
            <Button onClick={handleSaveChanges} variant="contained" color="primary">
              Зберегти зміни
            </Button>
          </Box>
        </Box>
      </Drawer>
    </TableRow>
  );
};

export default CreateMovementRow;
