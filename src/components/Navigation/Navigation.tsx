import { Flex } from '@chakra-ui/react';
import NavigationLink from './NavigationLink/NavigationLink';

const Navigation = () => {
  return (
    <Flex gap="0.25rem" direction="column">
      <NavigationLink href="/">Home</NavigationLink>
      <NavigationLink href="/bank-accounts">Bank Accounts</NavigationLink>
    </Flex>
  );
};

export default Navigation;
