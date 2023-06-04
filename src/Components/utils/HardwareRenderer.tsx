import { Box, Flex, Heading, SimpleGrid } from "@chakra-ui/react";
import React from "react";
import { useEffect, useRef, useState } from "react";
import Hardware, { HardwareProps, PinType } from "./Hardware";
import mips from "../../Hardware/SIS Mips/SIS MIPS.svg";

type Point = {
  x: number;
  y: number;
  occupied: boolean;
};

export default function HardwareRenderer() {
  let components: Array<HardwareProps> = new Array<HardwareProps>();
  let height = 0;
  let width = 0;

  const [offsetx, setOffsetx] = useState(0);
  const [offsety, setOffsety] = useState(0);

  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({} as any), []);

  useEffect(() => {
    function handleResize() {
      let el = document.getElementById("canvas");
      if (el) {
        height = window.innerHeight - 40;
        width = el.clientWidth;
        setOffsetx((width != 0 ? width : 600) / 100);
        setOffsety((height != 0 ? height - 100 : 600) / 100);
        //console.log(height, width);
        console.log(offsetx, offsety);
      }
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  let matrix: Array<Point> = new Array<Point>();

  //initializes matrix
  for (let i = 0; i < 100; i++)
    for (let j = 0; j < 100; j++)
      matrix.push({ x: i * offsetx, y: j * offsety, occupied: false });

  const registerA: HardwareProps = {
    pins: [
      { name: "datain", value: 0, bits: 2, type: PinType.Input },
      { name: "dataout", value: 0, bits: 2, type: PinType.Output },
      { name: "shift", value: 0, bits: 2, type: PinType.Input },
      { name: "clk", value: 0, bits: 2, type: PinType.Input },
      { name: "reset", value: 0, bits: 2, type: PinType.Input },
    ],
    name: "Register A",
    pos: [500, 300],
    tag: "hardware1",
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
    pos: [800, 300],
    tag: "hardware2",
  };

  components.push(registerA);
  components.push(registerB);

  function computeMask() {
    if (offsetx == 0 || offsety == 0) {
      console.log("offsetx or offsety is 0");
      return;
    }

    components.forEach((component) => {
      let bounds = document
        .getElementById(component.tag)
        ?.getBoundingClientRect();

      //console.log("bounds, tag", bounds, component.tag);

      let x = bounds?.x ?? 0 / offsetx;
      let y = bounds?.y ?? 0 / offsety;

      let elwidth = bounds ? bounds.width / offsetx : 0;
      let elheight = bounds ? bounds.height / offsety : 0;

      elwidth = Math.round(elwidth);
      elheight = Math.round(elheight);
      x = Math.round(x);
      y = Math.round(y);

      console.log(x, y, elwidth, elheight);

      for (let i = x; i < x + width; i++)
        for (let j = y; j < y + height; j++)
          matrix[i + j * 100].occupied = true;
    });
  }

  //computeMask();
  //forceUpdate();

  return (
    <div id="canvas">
      <Flex>
        {/* {components.map((component) => {
          return <Hardware {...component} key={component.tag}></Hardware>;
        })} */}

        <img src={mips} style={{ width: "50%" }}></img>
      </Flex>

      {/* {matrix.map((p) => {
        return (
          <Box
            style={{
              position: "absolute",
              left: p.x + 300,
              top: p.y + 100,
              width: 3,
              height: 3,
              backgroundColor: p.occupied ? "red" : "black",
            }}
            key={p.x + p.y + Math.random() * 100}
          ></Box>
        );
      })} */}
    </div>
  );
}
