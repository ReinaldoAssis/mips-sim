import * as React from "react";
import {
  ChakraProvider,
  Box,
  Text,
  Link,
  VStack,
  Code,
  Grid,
  theme,
} from "@chakra-ui/react";
import { ColorModeSwitcher } from "./ColorModeSwitcher";
import { Logo } from "./Logo";
import SidebarWithHeader from "./Components/Sidebar";
import Editor from "@monaco-editor/react";
import AssemblyEditor from "./Components/AssemblyEditor";

export const App = () => (
  <ChakraProvider theme={theme}>
    <SidebarWithHeader>
      <AssemblyEditor />
    </SidebarWithHeader>
  </ChakraProvider>
);
