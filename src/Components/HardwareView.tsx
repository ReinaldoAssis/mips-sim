import { useEffect, useState } from "react";
import HardwareRenderer, { PinType } from "./utils/HardwareRenderer";

export default function HardwareView() {
  let height = 0;
  let width = 0;

  const [offsetx, setOffsetx] = useState(0);
  const [offsety, setOffsety] = useState(0);
  const [draw, setDraw] = useState<CanvasRenderingContext2D>();
  let renderer: HardwareRenderer = new HardwareRenderer();

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

    renderer.setCanvasFromDoc(document);

    renderer.addComponent({
      name: "RegisterAAAAAAAAA",
      pos: [20 * 10, 20 * 8],
      tag: "test",
      pins: [
        {
          name: "clk",
          value: 0,
          bits: 1,
          type: PinType.Input,
        },
        {
          name: "clr",
          value: 0,
          bits: 1,
          type: PinType.Input,
        },
        {
          name: "dataout",
          value: 0,
          bits: 1,
          type: PinType.Output,
        },
        {
          name: "enable",
          value: 0,
          bits: 1,
          type: PinType.Input,
        },
      ],
    });

    renderer.addComponent({
      name: "Register with a really long name",
      pos: [20 * 80, 20 * 8],
      tag: "test",
      pins: [
        {
          name: "clk",
          value: 0,
          bits: 1,
          type: PinType.Input,
        },
        {
          name: "clr",
          value: 0,
          bits: 1,
          type: PinType.Input,
        },
        {
          name: "dataout",
          value: 0,
          bits: 1,
          type: PinType.Output,
        },
        {
          name: "carry",
          value: 0,
          bits: 1,
          type: PinType.Output,
        },
        {
          name: "output",
          value: 0,
          bits: 1,
          type: PinType.Output,
        },
        {
          name: "zero",
          value: 0,
          bits: 1,
          type: PinType.Output,
        },
        {
          name: "beq",
          value: 0,
          bits: 1,
          type: PinType.Output,
        },
        {
          name: "overflow",
          value: 0,
          bits: 1,
          type: PinType.Output,
        },
        {
          name: "enable",
          value: 0,
          bits: 1,
          type: PinType.Input,
        },
      ],
    });

    renderer.drawComponents();

    renderer.initializeMatrix();
    renderer.checkCollision();
    renderer.drawMatrix();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <canvas
      id="canvas"
      style={{ position: "relative", width: "100%", height: "100%" }}
    ></canvas>
  );
}
