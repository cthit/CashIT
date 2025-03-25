import Navbar from './Navbar/Navbar';
import styles from './Header.module.css';
import Link from 'next/link';
import { Box, Container, Heading, Span } from '@chakra-ui/react';

const Header = ({ locale }: { locale: string }) => {
  return (
    <Box bg="bg.panel">
      <Container className={styles.header}>
        <div>
        <Heading textStyle="2xl" display="inline" mr="0.3rem">
          <Link href="/">CashIT</Link>
        </Heading>
        <Span color="fg.muted" fontSize="sm">beta v0.3.0</Span></div>
        <Navbar locale={locale} />
      </Container>
    </Box>
  );
};

export default Header;
