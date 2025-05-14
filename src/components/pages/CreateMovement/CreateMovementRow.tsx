import React, { useEffect, useState } from 'react';
import { db } from '../../../firebaseConfig'; // Шлях до твого firebase.ts
import { collection, addDoc, Timestamp, updateDoc } from 'firebase/firestore';
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
  Tooltip,
  CircularProgress,
} from '@mui/material';

import { Close, Visibility, Edit, CheckCircle } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { Detail } from '../../../types/types';

interface Props {
  onSave: () => void;
  cleanRows: () => void;
}

const CreateMovementRow: React.FC<Props> = ({ onSave, cleanRows }) => {
  const userFromRedux = useSelector((state: RootState) => state.auth.user);
  const [loading, setLoading] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isCreating, setIsCreating] = useState<boolean>(true);

  const [date, setDate] = useState<string>('');
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [who, setWho] = useState<string>('');
  const [createdAt, setCreatedAt] = useState<string>('');
  const [updatedAt, setUpdatedAt] = useState<string>('');

  const [drawersDetails, setDrawersDetails] = useState<Detail[]>([]);
  // створимо окремий локальний стан для текстового введення
  const [weights, setWeights] = useState<string[]>([]);
  const [prices, setPrices] = useState<string[]>([]);

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

  const handleSaveChanges = async () => {
    setLoading(true); // Увімкнення прелоадера

    // Фільтрація порожніх деталей
    const filteredDetails = drawersDetails.filter(
      (detail) =>
        detail.quantity ||
        detail.weight ||
        detail.product ||
        detail.category ||
        detail.price ||
        detail.comment
    );

    try {
      // Збереження в Firestore
      const docRef = await addDoc(collection(db, 'movements'), {
        date,
        from,
        to,
        who,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        details: filteredDetails,
      });

      // Оновлюємо документ, додаючи правильний `id` відповідно Firestore
      await updateDoc(docRef, { id: docRef.id });
      console.log('Документ додано з ID:', docRef.id);

      // Закриття діалогу та очищення через 1сек щоб було видно завантаження
      setTimeout(() => {
        setDrawerOpen(false);
        setIsCreating(false);
        onSave();
        cleanRows();
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Помилка при збереженні в Firestore:', error);
      setLoading(false);
    }
  };

  const addNewRow = () => {
    setDrawersDetails([...drawersDetails, { product: '' }]);
  };

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
            <MenuItem value="Холодильник">Холодильник</MenuItem>
            <MenuItem value="Переробка">Переробка</MenuItem>
            <MenuItem value="Склад готової продукції (морозильна камера)">
              Склад готової продукції (морозильна камера)
            </MenuItem>
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
            <MenuItem value="Холодильник">Холодильник</MenuItem>
            <MenuItem value="Переробка">Переробка</MenuItem>
            <MenuItem value="Склад готової продукції (морозильна камера)">
              Склад готової продукції (морозильна камера)
            </MenuItem>
            <MenuItem value="Пайки">Пайки</MenuItem>
            <MenuItem value="Київ">Київ</MenuItem>
            <MenuItem value="Свєта">Свєта</MenuItem>
            <MenuItem value="Кінцевий споживач">Кінцевий споживач</MenuItem>
            <MenuItem value="Столова">Столова</MenuItem>
            <MenuItem value="Благодійно">Благодійно</MenuItem>
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
        <Box sx={{ width: '50vw', p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <h3>Деталі переміщення</h3>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <Close />
            </IconButton>
          </Box>
          <TableContainer>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
              <Box sx={{ mt: 2 }}>
                <Button onClick={addNewRow} variant="outlined" color="primary">
                  Додати рядок
                </Button>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Tooltip
                  title={
                    !date || !from || !to
                      ? "Заповніть всі обов'язкові поля: Дата, Звідки, Куди"
                      : ''
                  }
                  disableHoverListener={!!date && !!from && !!to} // Приховуємо tooltip, якщо все заповнено
                >
                  <span>
                    {/* Обгортка, щоб Tooltip працював з disabled кнопками */}
                    <Button
                      onClick={handleSaveChanges}
                      variant="contained"
                      color="primary"
                      disabled={!date || !from || !to}
                      sx={{ width: '148px', height: '40px' }}
                    >
                      {loading ? (
                        <Box
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                          height="50vh"
                        >
                          <CircularProgress size={25} sx={{ color: 'white' }} />
                        </Box>
                      ) : (
                        <span style={{ fontWeight: 'normal' }}>Зберегти зміни</span>
                      )}
                    </Button>
                  </span>
                </Tooltip>
              </Box>
            </div>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Кількість</TableCell>
                  <TableCell>Продукт*</TableCell>
                  <TableCell>Вага*</TableCell>
                  <TableCell>Категорія</TableCell>
                  <TableCell>Ціна</TableCell>
                  <TableCell>Вартість</TableCell>
                  <TableCell>Коментар</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {drawersDetails.map((detail, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        value={detail.quantity}
                        onChange={(e) => {
                          const updatedDetails = [...drawersDetails];
                          updatedDetails[index].quantity = parseInt(e.target.value) || 0;
                          setDrawersDetails(updatedDetails);
                        }}
                        size="small"
                        sx={{ width: '55px' }}
                      />
                    </TableCell>
                    <TableCell>
                      <FormControl>
                        <Select
                          value={detail.product}
                          onChange={(e) => {
                            const updatedDetails = [...drawersDetails];
                            updatedDetails[index].product = e.target.value;
                            setDrawersDetails(updatedDetails);
                          }}
                          size="small"
                          sx={{ width: '200px' }}
                        >
                          <MenuItem value="Жива вага">Жива вага</MenuItem>
                          <MenuItem value="Ділове">Ділове</MenuItem>
                          <MenuItem value="С/Б">С/Б</MenuItem>
                          <MenuItem value="Голова">Голова</MenuItem>
                          <MenuItem value="Печінка">Печінка</MenuItem>
                          <MenuItem value="СМ">СМ</MenuItem>
                          <MenuItem value="Молочні поросята">Молочні поросята</MenuItem>
                          <MenuItem value="Кістки">Кістки</MenuItem>
                          <MenuItem value="Відходи на утилізацію">Відходи на утилізацію</MenuItem>
                          <MenuItem value="Відходи маточник на утилізацію">
                            Відходи маточник на утилізацію
                          </MenuItem>
                          <MenuItem value="Шкварки">Шкварки</MenuItem>
                          <MenuItem value="Шпикачки">Шпикачки</MenuItem>
                          <MenuItem value="Паштет">Паштет</MenuItem>
                          <MenuItem value="Домашня ковбаса">Домашня ковбаса</MenuItem>
                          <MenuItem value="Ковбаски гриль">Ковбаски гриль</MenuItem>
                          <MenuItem value="Вуха">Вуха</MenuItem>
                          <MenuItem value="Ребро до пива">Ребро до пива</MenuItem>
                          <MenuItem value="Копчена ковбаса">Копчена ковбаса</MenuItem>
                          <MenuItem value="Копчене м'ясо">Копчене м&apos;ясо</MenuItem>
                          <MenuItem value="Млинці з сиром">Млинці з сиром</MenuItem>
                          <MenuItem value="Млинці з м'ясом">Млинці з м&apos;ясом</MenuItem>
                          <MenuItem value="Млинці з начинкою">Млинці з начинкою</MenuItem>
                          <MenuItem value="Млинці з маком">Млинці з маком</MenuItem>
                          <MenuItem value="Чебуреки">Чебуреки</MenuItem>
                          <MenuItem value="Пельмені">Пельмені</MenuItem>
                          <MenuItem value="Шкварки 5л">Шкварки 5л</MenuItem>
                          <MenuItem value="Сало кускове">Сало кускове</MenuItem>
                          <MenuItem value="Сало кручене">Сало кручене</MenuItem>
                          <MenuItem value="Сало на шкірі">Сало на шкірі</MenuItem>
                          <MenuItem value="Копчений биток">Копчений биток</MenuItem>
                          <MenuItem value="Копчене ребро">Копчене ребро</MenuItem>
                          <MenuItem value="Язик">Язик</MenuItem>
                          <MenuItem value="Голяшки">Голяшки</MenuItem>
                          <MenuItem value="Дрогобицька ковбаса">Дрогобицька ковбаса</MenuItem>
                          <MenuItem value="Фарш">Фарш</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={weights[index] ?? detail.weight?.toString() ?? ''}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          const updatedWeights = [...weights];
                          updatedWeights[index] = inputValue;
                          setWeights(updatedWeights);
                        }}
                        onBlur={() => {
                          const rawValue = weights[index]?.replace(',', '.');
                          const parsedWeight = parseFloat(rawValue || '');

                          const updatedDetails = [...drawersDetails];
                          if (updatedDetails[index]) {
                            updatedDetails[index].weight = isNaN(parsedWeight)
                              ? undefined
                              : parsedWeight;
                            updatedDetails[index].totalPrice = parseFloat(
                              (
                                (updatedDetails[index].weight || 0) *
                                (updatedDetails[index].price || 0)
                              ).toFixed(1)
                            );
                            setDrawersDetails(updatedDetails);
                          }
                        }}
                        size="small"
                        sx={{ width: '65px' }}
                        inputProps={{ inputMode: 'decimal' }} // показує числову клавіатуру з крапкою на мобільних
                      />
                    </TableCell>
                    <TableCell>
                      <FormControl>
                        <Select
                          value={detail.category}
                          onChange={(e) => {
                            const updatedDetails = [...drawersDetails];
                            updatedDetails[index].category = e.target.value;
                            setDrawersDetails(updatedDetails);
                          }}
                          size="small"
                          sx={{ width: '100px' }}
                        >
                          <MenuItem value="1">1</MenuItem>
                          <MenuItem value="2">2</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={prices[index] ?? detail.price?.toString() ?? ''}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          const updatedPrices = [...prices];
                          updatedPrices[index] = inputValue;
                          setPrices(updatedPrices);
                        }}
                        onBlur={() => {
                          const rawValue = prices[index]?.replace(',', '.');
                          const parsedPrice = parseFloat(rawValue || '');

                          const updatedDetails = [...drawersDetails];
                          const detail = updatedDetails[index];

                          if (detail) {
                            detail.price = isNaN(parsedPrice) ? undefined : parsedPrice;
                            detail.totalPrice = (detail.weight || 0) * (detail.price || 0);
                            setDrawersDetails(updatedDetails);
                          }
                        }}
                        size="small"
                        sx={{ width: '55px' }}
                        inputProps={{ inputMode: 'decimal' }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField value={detail.totalPrice} fullWidth size="small" disabled />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={detail.comment}
                        onChange={(e) => {
                          const updatedDetails = [...drawersDetails];
                          updatedDetails[index].comment = e.target.value;
                          setDrawersDetails(updatedDetails);
                        }}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Drawer>
    </TableRow>
  );
};

export default CreateMovementRow;
