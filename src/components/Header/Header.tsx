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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = (menu: string, isOpen: boolean) => {
    setMenuOpen((prev) => ({ ...prev, [menu]: isOpen }));
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
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
                        </>
                      )}
                      {menu === 'reports' && (
                        <>
                          <Link to="/report1" className="dropdown-item">
                            Огляд залишків
                          </Link>
                          <Link to="/report2" className="dropdown-item">
                            Щоденний рух
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
        {/*<Button className="menu-toggle" onClick={toggleMobileMenu}>*/}
        {/*  ☰*/}
        {/*</Button>*/}
      </Toolbar>
      {/*{isMobileMenuOpen && (*/}
      {/*  <Box className="mobile-menu">*/}
      {/*    {['movement', 'reports', 'admin'].map((menu) => (*/}
      {/*      <Box key={menu} className="menu-item" onClick={() => setIsMobileMenuOpen(false)}>*/}
      {/*        <Link to={`/${menu}`} className="menu-item-link">*/}
      {/*          {menu === 'movement'*/}
      {/*            ? 'Переміщення'*/}
      {/*            : menu === 'reports'*/}
      {/*            ? 'Звіти'*/}
      {/*            : 'Панель Адміністратора'}*/}
      {/*        </Link>*/}
      {/*      </Box>*/}
      {/*    ))}*/}
      {/*  </Box>*/}
      {/*)}*/}
    </AppBar>
  );
};

export default Header;
