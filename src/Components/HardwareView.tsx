import { useEffect, useState } from "react";
import HardwareRenderer, {
  HardwareType,
  PinType,
} from "./utils/HardwareRenderer";

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
      name: "PC",
      pos: [20 * 10, 20 * 8],
      type: HardwareType.Block,
      tag: "test",
      pins: [
        {
          name: "out",
          value: 0,
          bits: 32,
          type: PinType.Output,
        },
        {
          name: "newPC",
          value: 0,
          bits: 1,
          type: PinType.Input,
        },
      ],
    });

    renderer.addComponent({
      name: "Data Memory",
      pos: [20 * 45, 20 * 1],
      type: HardwareType.Block,
      tag: "test",
      pins: [
        {
          name: "Address",
          value: 0,
          bits: 32,
          type: PinType.Input,
        },
        {
          name: "Write Data",
          value: 0,
          bits: 1,
          type: PinType.Input,
        },
        {
          name: "Dataout",
          value: 0,
          bits: 32,
          type: PinType.Output,
        },
      ],
    });

    renderer.addComponent({
      name: "Register Bank",
      pos: [20 * 86, 20 * 10],
      tag: "test",
      type: HardwareType.Block,
      pins: [
        {
          name: "Read Register 1",
          value: 0,
          bits: 5,
          type: PinType.Input,
        },
        {
          name: "Read Register 2",
          value: 0,
          bits: 5,
          type: PinType.Input,
        },
        {
          name: "Write Register",
          value: 0,
          bits: 5,
          type: PinType.Input,
        },
        {
          name: "Data 1",
          value: 0,
          bits: 1,
          type: PinType.Output,
        },
        {
          name: "Data 2",
          value: 0,
          bits: 1,
          type: PinType.Output,
        },
        {
          name: "Write Data",
          value: 0,
          bits: 1,
          type: PinType.Input,
        },
      ],
    });

    renderer.addComponent({
      name: "Mux1",
      pos: [20 * 50, 20 * 30],
      tag: "test",
      type: HardwareType.Mux,
      pins: [
        {
          name: "in1",
          type: PinType.Input,
          value: 0,
          bits: 32,
        },
        {
          name: "in2",
          type: PinType.Input,
          value: 0,
          bits: 32,
        },

        {
          name: "out",
          type: PinType.Output,
          value: 0,
          bits: 32,
        },
      ],
    });

    renderer.drawComponents();

    renderer.initializeMatrix(20, 20);
    renderer.checkCollision();

    // renderer.drawWire(
    //   renderer.components[0].pins[1],
    //   renderer.components[2].pins[0]
    // );

    // renderer.drawMatrix();

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
