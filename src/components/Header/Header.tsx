import Navbar from './Navbar/Navbar';
import styles from './Header.module.css';
import Link from 'next/link';
import {
  Box,
  Heading,
  IconButton,
  Span,
  Drawer,
  Portal
} from '@chakra-ui/react';
import { HiMenu, HiX } from 'react-icons/hi';
import Navigation from '../Navigation/Navigation';

const Header = ({ locale }: { locale: string }) => {
  return (
    <Box
      bg="bg.panel"
      borderBottomWidth="1px"
      borderColor="border.emphasized"
      height="4rem"
      className={styles.header}
    >
      <div>
        <Drawer.Root placement="start">
          <Drawer.Trigger asChild>
            <IconButton variant="ghost" size="sm">
              <HiMenu />
            </IconButton>
          </Drawer.Trigger>
          <Portal>
            <Drawer.Backdrop />
            <Drawer.Positioner>
              <Drawer.Content pt="4">
                <Drawer.Body>
                  <Drawer.CloseTrigger asChild>
                    <Navigation />
                  </Drawer.CloseTrigger>
                </Drawer.Body>

                <Drawer.CloseTrigger asChild>
                  <IconButton variant="ghost" size="sm">
                    <HiX />
                  </IconButton>
                </Drawer.CloseTrigger>
              </Drawer.Content>
            </Drawer.Positioner>
          </Portal>
        </Drawer.Root>
        <Heading textStyle="2xl" display="inline" mr="0.3rem">
          <Link href="/">CashIT</Link>
        </Heading>
        <Span color="fg.muted" fontSize="sm">
          beta v0.4.0
        </Span>
      </div>
      <Navbar locale={locale} />
    </Box>
  );
};

export default Header;
