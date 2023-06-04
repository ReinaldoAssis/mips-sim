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
  const [draw, setDraw] = useState<CanvasRenderingContext2D>();

  useEffect(() => {
    function handleResize() {
      let el = document.getElementById("canvas");
      if (el) {
        height = window.innerHeight - 40;
        width = el.clientWidth;
        setOffsetx((width != 0 ? width : 600) / 100);
        setOffsety((height != 0 ? height - 100 : 600) / 100);
        console.log(offsetx, offsety);
      }
    }

    if (document.getElementById("canvas")) {
      let ctx: CanvasRenderingContext2D =
        (document.getElementById("canvas") as HTMLCanvasElement).getContext(
          "2d"
        ) ?? new CanvasRenderingContext2D();

      ctx.canvas.width = window.innerWidth * 2;
      ctx.canvas.height = window.innerHeight * 2 - 40;
      ctx.strokeStyle = "black";
      ctx.fillStyle = "black";
      ctx.lineWidth = 7;

      setDraw(ctx);
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

  function drawPin(x: number, y: number, size: number) {
    if (draw == undefined) return;
    draw.fillRect(x - size / 2, y - size / 2, size, size);
  }

  function drawComponent(component: HardwareProps) {
    let x = component.pos[0];
    let y = component.pos[1];
    let w = 0;
    let h = 0;

    if (draw == undefined) return;

    draw.font = "40px Arial";
    draw.fillText(component.name ?? "Undefined", x, y - 10);
    w = draw.measureText(component.name ?? "Undefined").width + 10;
    h = 100;

    component.pins.forEach((pin) => {
      if (pin.type == PinType.Input) {
        draw.font = "20px Arial";
        let pinw = draw.measureText(pin.name).width + 15;
        drawPin(x - pinw, y, 15);
      } else {
      }
    });

    //draw.strokeRect(x, y, 100, 100);
    //draw.fillRect(x + 93, y + 40, 15, 15);
  }

  //draws the component
  components.forEach((component) => {
    drawComponent(component);
  });

  return (
    <canvas
      id="canvas"
      style={{ position: "relative", width: "100%", height: "100%" }}
    ></canvas>
  );
}
