import { Box, Flex, Heading, SimpleGrid } from "@chakra-ui/react";
import Hardware, { HardwareProps, PinType } from "./Hardware";

export default function HardwareRenderer() {
  const registerA: HardwareProps = {
    pins: [
      { name: "datain", value: 0, bits: 2, type: PinType.Input },
      { name: "dataout", value: 0, bits: 2, type: PinType.Output },
      { name: "shift", value: 0, bits: 2, type: PinType.Input },
      { name: "clk", value: 0, bits: 2, type: PinType.Input },
      { name: "reset", value: 0, bits: 2, type: PinType.Input },
    ],
    name: "Register A",
    pos: [100, 100],
  };

  const registerB: HardwareProps = {
    pins: [
      { name: "datain", value: 0, bits: 2, type: PinType.Input },
      { name: "d", value: 0, bits: 2, type: PinType.Output },
      { name: "shift", value: 0, bits: 2, type: PinType.Input },
      { name: "clk", value: 0, bits: 2, type: PinType.Input },
      { name: "reset", value: 0, bits: 2, type: PinType.Input },
    ],
    name: "Register B lets try a really long name",
    pos: [300, 100],
  };

  return (
    <Flex>
      {Hardware(registerA)}
      {Hardware(registerB)}
    </Flex>
  );
}
