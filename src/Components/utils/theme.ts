// theme.ts

// 1. import `extendTheme` function
import { extendTheme, type ThemeConfig } from '@chakra-ui/react'
import SharedData from '../../Service/SharedData'

const shared = SharedData.instance;

// 2. Add your color mode config
const config: ThemeConfig = {
  initialColorMode: shared.existsCached("theme-data") ? shared.getCached("theme-data") : "dark",
  useSystemColorMode: true,
}

// 3. extend the theme
const theme = extendTheme({ config })

export default theme