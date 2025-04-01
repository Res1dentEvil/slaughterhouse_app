import React, { useState } from 'react';
import { AppBar, Toolbar, Button, Box, Avatar, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import Logo from '../../assets/img/logo.png';
import './Header.scss';

interface HeaderProps {
  user: {
    displayName: string | null;
    photoURL: string | null;
  } | null;
  onSignOut: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onSignOut }) => {
  const [menuOpen, setMenuOpen] = useState<{ [key: string]: boolean }>({});

  const toggleMenu = (menu: string, isOpen: boolean) => {
    setMenuOpen((prev) => ({ ...prev, [menu]: isOpen }));
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#263238' }}>
      <Toolbar className="header-toolbar">
        <Box className="header-left">
          <img src={Logo} alt="Logo" className="header-logo" />
          {user && (
            <Box className="header-menu">
              {['movement', 'reports', 'admin'].map((menu) => (
                <Box
                  key={menu}
                  className="menu-item"
                  onMouseEnter={() => toggleMenu(menu, true)}
                  onMouseLeave={() => toggleMenu(menu, false)}
                >
                  <button className="menu-button">
                    {menu === 'movement'
                      ? 'Переміщення'
                      : menu === 'reports'
                      ? 'Звіти'
                      : 'Панель Адміністратора'}
                  </button>
                  {menuOpen[menu] && (
                    <Box className="dropdown-menu">
                      {menu === 'movement' && (
                        <>
                          <Link to="/create-movement" className="dropdown-item">
                            Створити переміщення
                          </Link>
                          <Link to="/internal-movement" className="dropdown-item">
                            Переглянути переміщення
                          </Link>
                          <Link to="/departure" className="dropdown-item">
                            Вибуття
                          </Link>
                        </>
                      )}
                      {menu === 'reports' && (
                        <>
                          <Link to="/report1" className="dropdown-item">
                            Огляд залишків
                          </Link>
                          <Link to="/report2" className="dropdown-item">
                            Звіт 2
                          </Link>
                          <Link to="/report3" className="dropdown-item">
                            Звіт 3
                          </Link>
                        </>
                      )}
                      {menu === 'admin' && (
                        <Link to="/admin" className="dropdown-item">
                          Панель Адміністратора
                        </Link>
                      )}
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Box>
        {user && (
          <Box className="header-user">
            <Typography>{user.displayName}</Typography>
            <Avatar src={user.photoURL || ''} className="user-avatar" />
            <Button color="inherit" onClick={onSignOut}>
              Вийти
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
