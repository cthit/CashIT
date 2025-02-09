'use client';

import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger
} from '@/components/ui/menu';
import { Span } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

const LanguageSwitcher = ({ locale }: { locale: string }) => {
  const router = useRouter();

  const switchLocale = (toSv: boolean) => {
    const currentPathname = window.location.pathname + window.location.search;
    if (currentPathname.startsWith('/en') && toSv) {
      router.push(currentPathname.replace(`/en`, `/sv`));
    } else if (!currentPathname.startsWith('/en') && !toSv) {
      router.push(`/en${currentPathname}`);
    }
  };

  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <Span cursor="pointer">
          {locale === 'en' ? 'EN' : 'SV'} <Span fontSize="xs">▼</Span>
        </Span>
      </MenuTrigger>
      <MenuContent>
        <MenuItem onClick={() => switchLocale(false)} value="en">
          English
        </MenuItem>
        <MenuItem onClick={() => switchLocale(true)} value="sv">
          Swedish
        </MenuItem>
      </MenuContent>
    </MenuRoot>
  );
};

export default LanguageSwitcher;
