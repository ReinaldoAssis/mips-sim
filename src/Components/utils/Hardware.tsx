import { Box, Flex, Heading, SimpleGrid } from "@chakra-ui/react";
import React from "react";
import { useEffect, useRef } from "react";

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
  pos: number[];
  tag: string;
};

export default class Hardware extends React.Component<HardwareProps> {
  render() {
    let outputPins = this.props.pins.filter(
      (pin) => pin.type === PinType.Output
    );
    let inputPins = this.props.pins.filter((pin) => pin.type === PinType.Input);
    return (
      <Box
        height={this.props.height ?? "fit-content"}
        width={this.props.width ?? "fit-content"}
        id={this.props.tag}
        style={{
          outlineColor: "black",
          outlineStyle: "solid",
          padding: "8px",
          textAlign: "center",
          position: "absolute",
          left: this.props.pos ? this.props.pos[0] : 0,
          top: this.props.pos ? this.props.pos[1] : 0,
        }}
      >
        <SimpleGrid columns={2} spacing={0}>
          <div style={{ textAlign: "left" }}>
            {inputPins.map((pin) => {
              return (
                <h3
                  key={
                    pin.name.length * pin.bits + pin.type == PinType.Input
                      ? 1
                      : 0
                  }
                >
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
                  key={
                    pin.name.length * pin.bits + pin.type == PinType.Input
                      ? 1
                      : 0
                  }
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

        <Heading size="md">{this.props.name}</Heading>
      </Box>
    );
  }
}
