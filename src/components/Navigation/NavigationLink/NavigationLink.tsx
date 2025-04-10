import { Box } from '@chakra-ui/react';
import Link, { LinkProps } from 'next/link';
import { AnchorHTMLAttributes } from 'react';

const NavigationLink = ({
  children,
  ...rest
}: LinkProps & AnchorHTMLAttributes<HTMLAnchorElement>) => {
  return (
    <Link {...rest}>
      <Box
        width="100%"
        p="1.5"
        borderRadius="md"
        _hover={{ bg: 'bg.muted' }}
        fontSize="md"
      >
        {children}
      </Box>
    </Link>
  );
};

export default NavigationLink;
