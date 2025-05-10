import { Flex } from '@chakra-ui/react';
import Link, { LinkProps } from 'next/link';
import { AnchorHTMLAttributes } from 'react';

const NavigationLink = ({
  children,
  ...rest
}: LinkProps & AnchorHTMLAttributes<HTMLAnchorElement>) => {
  return (
    <Link {...rest}>
      <Flex
        p="1.5"
        borderRadius="md"
        _hover={{ bg: 'bg.muted' }}
        fontSize="md"
        alignItems="center"
        gap="1"
      >
        {children}
      </Flex>
    </Link>
  );
};

export default NavigationLink;
