import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";

const Logout: React.FC = () => {
  const handleLogout = async () => {
    await signOut(auth);
  };

  return <button onClick={handleLogout}>Вийти</button>;
};

export default Logout;
