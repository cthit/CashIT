import Navbar from './Navbar/Navbar';
import styles from './Header.module.css';
import Link from 'next/link';
import { Box, Heading, IconButton, Span, Flex } from '@chakra-ui/react';
import { HiMenu, HiX } from 'react-icons/hi';
import Navigation from '../Navigation/Navigation';
import SessionService from '@/services/sessionService';
import {
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerRoot,
  DrawerTrigger
} from '../ui/drawer';

const Header = async ({
  locale,
  orgId
}: {
  locale: string;
  orgId?: number;
}) => {
  const user = await SessionService.getUser();
  const orgPrefix = orgId !== undefined ? `/org/${orgId}` : '/';

  return (
    <Box
      bg="bg.panel"
      borderBottomWidth="1px"
      borderColor="border.emphasized"
      height="4rem"
      px="2"
      className={styles.header}
    >
      <Flex alignItems="center">
        {user && (
          <DrawerRoot placement="start">
            <DrawerTrigger asChild>
              <IconButton variant="ghost" size="md" display={{ md: 'none' }}>
                <HiMenu />
              </IconButton>
            </DrawerTrigger>
            <DrawerBackdrop />
            <DrawerContent pt="4">
              <DrawerBody>
                <Navigation locale={locale} orgId={orgId} inDrawer={true} />
              </DrawerBody>

              <DrawerCloseTrigger asChild>
                <IconButton variant="ghost" size="sm">
                  <HiX />
                </IconButton>
              </DrawerCloseTrigger>
            </DrawerContent>
          </DrawerRoot>
        )}
        <Box>
          <Heading textStyle="2xl" display="inline" mr="0.3rem" ml="2">
            <Link href={orgPrefix}>CashIT</Link>
          </Heading>
          <Span color="fg.muted" fontSize="sm">
            beta v0.6.0
          </Span>
        </Box>
      </Flex>
      <Navbar locale={locale} />
    </Box>
  );
};

export default Header;
