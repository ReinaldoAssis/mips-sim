import { Box, Flex, Heading, SimpleGrid } from "@chakra-ui/react";

export enum PinType {
  Input,
  Output,
}

export type Pin = {
  name: string;
  value: number;
  bits: number;
  type: PinType;
  pos?: number[];
};

export type HardwareProps = {
  pins: Array<Pin>;
  height?: number;
  width?: number;
  name?: string;
  pos?: number[];
};

export default function Hardware(props: HardwareProps) {
  const outputPins = props.pins.filter((pin) => pin.type === PinType.Output);
  const inputPins = props.pins.filter((pin) => pin.type === PinType.Input);

  return (
    <Box
      height={props.height ?? "fit-content"}
      width={props.width ?? "fit-content"}
      style={{
        outlineColor: "black",
        outlineStyle: "solid",
        padding: "8px",
        textAlign: "center",
        position: "relative",
        left: props.pos ? props.pos[0] : 0,
        top: props.pos ? props.pos[1] : 0,
      }}
    >
      <SimpleGrid columns={2} spacing={0}>
        <div style={{ textAlign: "left" }}>
          {inputPins.map((pin) => {
            return (
              <h3>
                {pin.name}
                <Box
                  height={2}
                  width={2}
                  style={{
                    backgroundColor: "black",
                    position: "relative",
                    left: "-14px",
                    top: "-14px",
                  }}
                />
              </h3>
            );
          })}
        </div>
        <div style={{ textAlign: "right", alignContent: "end" }}>
          {outputPins.map((pin) => {
            return (
              <Flex
                align={"center"}
                style={{ alignContent: "end", justifyContent: "flex-end" }}
              >
                <h3>{pin.name}</h3>
                <Box
                  height={2}
                  width={2}
                  style={{
                    backgroundColor: "black",
                    position: "relative",
                    left: "13px",
                  }}
                />
              </Flex>
            );
          })}
        </div>
      </SimpleGrid>

      <Heading size="md">{props.name}</Heading>
    </Box>
  );
}
