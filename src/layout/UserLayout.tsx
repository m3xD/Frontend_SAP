import React from 'react';
import { UserProvider } from '../contexts/UserContext';

interface UserLayoutProps {
  children: React.ReactNode;
}

const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {
  return <UserProvider>{children}</UserProvider>;
};

export default UserLayout;