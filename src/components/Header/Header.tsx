import Navbar from './Navbar/Navbar';
import styles from './Header.module.css';
import Link from 'next/link';
import {
  Box,
  Heading,
  IconButton,
  Span,
  Drawer,
  Portal,
  Flex
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
      px="2"
      className={styles.header}
    >
      <Flex alignItems="center">
        <Drawer.Root placement="start">
          <Drawer.Trigger asChild>
            <IconButton variant="ghost" size="md" display={{ md: 'none' }}>
              <HiMenu />
            </IconButton>
          </Drawer.Trigger>
          <Portal>
            <Drawer.Backdrop />
            <Drawer.Positioner>
              <Drawer.Content pt="4">
                <Drawer.Body>
                  <Drawer.CloseTrigger asChild>
                    <Navigation locale={locale} />
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
        <Box>
          <Heading textStyle="2xl" display="inline" mr="0.3rem" ml="2">
            <Link href="/">CashIT</Link>
          </Heading>
          <Span color="fg.muted" fontSize="sm">
            beta v0.4.0
          </Span>
        </Box>
      </Flex>
      <Navbar locale={locale} />
    </Box>
  );
};

export default Header;
