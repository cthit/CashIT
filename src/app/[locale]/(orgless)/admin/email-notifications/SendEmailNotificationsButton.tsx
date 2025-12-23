'use client';

import { HiRefresh } from 'react-icons/hi';
import { Button } from '@chakra-ui/react';
import { sendEmailNotificationsManually } from '@/actions/notifications';

const SendEmailNotificationsButton = () => {
  return (
    <Button
      colorPalette="cyan"
      onClick={() => sendEmailNotificationsManually()}
    >
      <HiRefresh /> Send Email Notifications
    </Button>
  );
};

export default SendEmailNotificationsButton;
