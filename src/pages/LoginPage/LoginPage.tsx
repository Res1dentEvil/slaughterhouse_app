import React from 'react';
import GoogleLogo from '../../assets/img/google.png';
import './LoginPage.scss';

interface ILoginPageProps {
  login: () => void;
}

const LoginPage = ({ login }: ILoginPageProps) => {
  return (
    <div className="login-page">
      <h2 className="login-page__h2">The Last Kingdom</h2>
      <button className="btn_google" onClick={() => login()}>
        Sign in with Google
        <img src={GoogleLogo} alt="GoogleLogo" width="27px" />
      </button>
      <div className="login-img"></div>
    </div>
  );
};

export default LoginPage;
