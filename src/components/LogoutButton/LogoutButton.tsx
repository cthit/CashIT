'use client';

import { signOut } from 'next-auth/react';
import { HiOutlineLogout } from 'react-icons/hi';
import { IconButton } from '@chakra-ui/react';

const LogoutButton = () => {
  return (
    <IconButton variant="ghost" size="md" onClick={() => signOut()}>
      <HiOutlineLogout />
    </IconButton>
  );
};

export default LogoutButton;
