import React from 'react';
import Logo from '../../../assets/img/logo.png';
import './HomePage.scss';

const HomePage = () => {
  return (
    <div className="home-wrapper">
      <img src={Logo} alt="Logo" className="home-logo" />
    </div>
  );
};

export default HomePage;
