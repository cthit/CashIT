"use client"

import dynamic from 'next/dynamic';
import { defaultSystem } from "@chakra-ui/react"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"

const ChakraProvider = dynamic(
  () => import('@chakra-ui/react').then((e) => e.ChakraProvider),
  {
    ssr: false
  }
);


export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={defaultSystem}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  )
}
