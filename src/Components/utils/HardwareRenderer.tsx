export enum PinType {
  Input,
  Output,
}

export type HardwareProps = {
  pins: Array<Pin>;
  height?: number;
  width?: number;
  name?: string;
  pos: number[];
  tag: string;
};

export type Pin = {
  name: string;
  value: number;
  bits: number;
  type: PinType;
  pos?: number[];
};

type Point = {
  x: number;
  y: number;
  occupied: boolean;
};

//singleton class
export default class HardwareRenderer {
  private static _instance: HardwareRenderer;
  public draw: CanvasRenderingContext2D | undefined;
  public components: Array<HardwareProps> = [];

  public static get instance(): HardwareRenderer {
    if (!HardwareRenderer._instance) {
      HardwareRenderer._instance = new HardwareRenderer();
    }

    return HardwareRenderer._instance;
  }

  public setCanvas(ctx: CanvasRenderingContext2D) {
    this.draw = ctx;
  }

  public drawComponents() {
    this.components.forEach((component) => {
      this.drawComponent(component);
    });
  }

  public addComponent(component: HardwareProps) {
    this.components.push(component);
  }

  public setCanvasFromDoc(doc: Document) {
    if (doc.getElementById("canvas")) {
      let ctx: CanvasRenderingContext2D =
        (doc.getElementById("canvas") as HTMLCanvasElement).getContext("2d") ??
        new CanvasRenderingContext2D();

      ctx.canvas.width = window.innerWidth * 2;
      ctx.canvas.height = window.innerHeight * 2 - 40;
      ctx.strokeStyle = "black";
      ctx.fillStyle = "black";
      ctx.lineWidth = 7;

      this.setCanvas(ctx);
    }
  }

  public drawPin(x: number, y: number, size: number) {
    if (this.draw == undefined) return;
    this.draw.fillRect(x - size / 2, y - size / 2, size, size);
  }

  public drawComponent(component: HardwareProps) {
    let x = component.pos[0];
    let y = component.pos[1];
    let w = 0;
    let h = 0;

    if (this.draw == undefined) return;
    this.draw.font = "bold 40px Arial";

    //gets the width of the component name
    w = this.draw.measureText(component.name ?? "Undefined").width + 10;
    h = 100;

    //offsets for the pins
    let xoffset = 0;
    let yoffset = 60;

    component.pins.forEach((pin, i) => {
      if (this.draw == undefined) return;

      this.draw.font = "40px Arial";
      xoffset = Math.max(xoffset, this.draw.measureText(pin.name).width) + 10;
    });

    let l = component.pins.length;

    //draws the component box
    this.draw.strokeRect(
      x - (xoffset + 216) / 2,
      y - yoffset * 2,
      w + xoffset + 216,
      h + yoffset * l
    );

    //draws the component name
    this.draw.font = "bold 40px Arial";
    this.draw.fillText(component.name ?? "Undefined", x, y - 60 + yoffset * l);

    let i = -1;
    let j = -1;
    component.pins.forEach((pin) => {
      if (pin.type == PinType.Input) {
        if (this.draw == undefined) return;

        i++;
        this.draw.font = "40px Arial";
        this.draw.fillText(pin.name, x - xoffset, y + i * yoffset);
        this.drawPin(x - (xoffset + 216) / 2, y - 12 + i * yoffset, 20);
      } else {
        if (this.draw == undefined) return;

        j++;
        this.draw.font = "40px Arial";
        let pinwidth = this.draw.measureText(pin.name).width;
        this.draw.fillText(
          pin.name,
          x - pinwidth + w + xoffset,
          y + j * yoffset
        );
        this.drawPin(x + w + xoffset, y - 12 + j * yoffset, 20);
      }
    });
  }
}
