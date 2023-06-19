import * as React from "react";
import { ChakraProvider, theme } from "@chakra-ui/react";

import SidebarWithHeader from "./Components/Sidebar";
import SimulatorView from "./Components/SimulatorView";

export const App = () => (
  <ChakraProvider theme={theme}>
    <SidebarWithHeader>
      <SimulatorView />
      <h1>test</h1>
    </SidebarWithHeader>
  </ChakraProvider>
);
