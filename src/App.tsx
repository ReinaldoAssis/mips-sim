import * as React from "react";
import { ChakraProvider, theme, useToast } from "@chakra-ui/react";

import SidebarWithHeader from "./Components/Sidebar";
import SimulatorView from "./Components/pages/Simulator View/SimulatorView";
import InstructionSetPage from "./Components/pages/InstructionSet/InstructionSet";
import Logger from "./Service/Logger";

export function App()
{

  const toast = useToast();
  const log = Logger.instance;

  const [interval, setIntervalID] = React.useState<NodeJS.Timeout | null>(null);

  const handleKeyPress = React.useCallback((event: KeyboardEvent) => {
    if(event.key == "F8") checkAppDebugs();
  }, []);

  React.useEffect(() => {
    // attach the event listener
    document.addEventListener('keydown', handleKeyPress);

    // remove the event listener
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  function checkAppErrors()
  {
    if(log.appErrors.length > 0)
    {
      toast({
        title: "App Error",
        description: log.popAppError(),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }

  function checkAppDebugs()
  {
    if(log.appInternalMessages.length > 0)
    {
      toast({
        title: "App Debug",
        description: log.popAppInternalMessage(),
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    }
  }

  React.useEffect(() => {
    if(interval == null) setIntervalID(setInterval(() => {
      checkAppErrors();
      //checkAppDebugs();
    }, 1000));
  }, []);

  return (<ChakraProvider theme={theme}>
    <SidebarWithHeader>
      <SimulatorView />
      <InstructionSetPage />
    </SidebarWithHeader>
  </ChakraProvider>)
}