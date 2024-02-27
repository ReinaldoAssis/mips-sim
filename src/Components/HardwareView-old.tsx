import { useEffect, useState } from "react";
import HardwareRenderer, {
  HardwareType,
  PinType,
} from "./utils/HardwareRenderer";

export default function HardwareView_old() {
  let height = 0;
  let width = 0;

  const [offsetx, setOffsetx] = useState(0);
  const [offsety, setOffsety] = useState(0);

  const [rendered, setRendered] = useState(false);

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

    handleRender();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function handleRender() {
    //if (rendered) return;
    setRendered(true);

    renderer.addComponent({
      name: "PC",
      pos: [20 * 10, 20 * 30],
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
      pos: [20 * 45, 20 * 30],
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
      pos: [20 * 100, 20 * 30],
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
      pos: [20 * 90, 20 * 35.5],
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

    renderer.addComponent({
      name: "Adder1",
      pos: [20 * 50, 20 * 50],
      tag: "test",
      type: HardwareType.Adder,
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

    renderer.addComponent({
      name: "Sign extend",
      pos: [20 * 90, 20 * 70],
      tag: "test",
      type: HardwareType.Rounder,
      pins: [
        {
          name: "in",
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

    renderer.scale = 1;
    renderer.drawComponents();

    renderer.initializeMatrix(20 * renderer.scale, 20 * renderer.scale);
    renderer.checkCollision();

    let wire2 = renderer.connect(
      "data memory",
      "register bank",
      "dataout",
      "read register 1"
    );

    console.log("wire2", wire2);

    let wire3 = renderer.branch(
      wire2,
      "register bank",
      "read register 2",
      3,
      [0, 1]
    );

    let wire4 = renderer.branch(wire2, "sign extend", "in", 0);
    renderer.branch(wire3, "mux1", "in1", 1);
    renderer.branch(wire4, "mux1", "in2", 0);
    renderer.connect("mux1", "register bank", "out", "write register");

    renderer.connect("PC", "data memory", "out", "address");

    // renderer.drawMatrix();
  }

  return (
    <canvas
      id="canvas"
      style={{ position: "relative", width: "100%", height: "100%" }}
    ></canvas>
  );
}
