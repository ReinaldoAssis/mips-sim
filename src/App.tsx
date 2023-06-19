import * as React from "react";
import { ChakraProvider, theme } from "@chakra-ui/react";

import SidebarWithHeader from "./Components/Sidebar";
import SimulatorView from "./Components/pages/SimulatorView";
import InstructionSetPage from "./Components/pages/InstructionSet";

export const App = () => (
  <ChakraProvider theme={theme}>
    <SidebarWithHeader>
      <SimulatorView />
      <InstructionSetPage />
    </SidebarWithHeader>
  </ChakraProvider>
);
