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
  public matrix: Array<Array<Point>> = [];
  public matrixXoffset: number = 20;
  public matrixYoffset: number = 20;

  public static get instance(): HardwareRenderer {
    if (!HardwareRenderer._instance) {
      HardwareRenderer._instance = new HardwareRenderer();
    }

    return HardwareRenderer._instance;
  }

  public setCanvas(ctx: CanvasRenderingContext2D) {
    this.draw = ctx;
  }

  public checkCollision() {
    this.components.forEach((component) => {
      let width = component.width ?? 0;
      let height = component.height ?? 0;

      let cx = component.pos[0];
      let cy = component.pos[1];

      if (this.draw == undefined) return false;

      this.matrix.forEach((row) => {
        row.forEach((point) => {
          if (
            point.x >= cx &&
            point.x <= cx + width &&
            point.y >= cy &&
            point.y <= cy + height
          ) {
            point.occupied = true;
          }
        });
      });
    });
  }

  public initializeMatrix() {
    let height = this.draw?.canvas.height ?? 0;
    let width = this.draw?.canvas.width ?? 0;

    this.matrix = [];

    for (let x = 0; x < width; x += this.matrixXoffset) {
      let row: Array<Point> = [];
      for (let y = 0; y < height; y += this.matrixYoffset) {
        row.push({ x: x, y: y, occupied: false });
      }
      this.matrix.push(row);
    }
  }

  public drawMatrix() {
    this.matrix.forEach((row) => {
      row.forEach((point) => {
        if (this.draw == undefined) return;
        if (point.occupied) this.draw.fillStyle = "red";
        else this.draw.fillStyle = "green";
        this.draw.fillRect(point.x - 7 / 2, point.y - 7 / 2, 7, 7);
      });
    });
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

  public getWidestPinWidth(pins: Array<Pin>, font: string): number {
    let max = "";
    if (this.draw == undefined) return 0;

    this.draw.font = font;

    pins.forEach((pin) => {
      if (pin.name.length > max.length) {
        max = pin.name;
      }
    });

    return this.draw.measureText(max).width;
  }

  public getTitleWidth(title: string, font: string): number {
    if (this.draw == undefined) return 0;

    this.draw.font = font;
    return this.draw.measureText(title).width;
  }

  public filterPins(pins: Array<Pin>, type: PinType): Array<Pin> {
    return pins.filter((pin) => pin.type == type);
  }

  public getAutoHeight(pins: Array<Pin>, pinYoffset: number): number {
    let p: Array<Pin> =
      this.filterPins(pins, PinType.Input).length >
      this.filterPins(pins, PinType.Output).length
        ? this.filterPins(pins, PinType.Input)
        : this.filterPins(pins, PinType.Output);

    return p.length * pinYoffset + 150;
  }

  public drawComponent(component: HardwareProps) {
    if (this.draw == undefined) return;

    let inputPins = this.filterPins(component.pins, PinType.Input);
    let outputPins = this.filterPins(component.pins, PinType.Output);

    let titleWidth = this.getTitleWidth(
      component.name ?? "",
      "bold 55px Arial"
    );
    let widestInput = this.getWidestPinWidth(inputPins, "40px Arial");
    let widestOutput = this.getWidestPinWidth(outputPins, "40px Arial");

    let widest = Math.max(widestInput, widestOutput);

    titleWidth = Math.min(titleWidth, widest * 4 - 30);

    let x = component.pos[0];
    let y = component.pos[1];

    //draw pins
    let pinSize = 20;
    let pinYoffset = 40;

    let height = this.getAutoHeight(component.pins, pinYoffset);

    //draw box
    this.draw.strokeStyle = "black";
    this.draw.strokeRect(x, y, widest * 4, height);
    component.width = widest * 4;
    component.height = height;

    //draw title
    this.draw.font = "bold 50px Arial";
    this.draw.fillText(
      component.name ?? "",
      x + (widest * 4 - titleWidth) / 2,
      y + height - 50,
      titleWidth
    );
    this.draw.font = "40px Arial";

    //draw input pins
    inputPins.forEach((pin, index) => {
      if (this.draw == undefined) return;

      this.drawPin(x, y + pinYoffset + index * pinYoffset, pinSize);
      this.draw.fillText(
        pin.name,
        x + pinSize * 2,
        y + pinYoffset + 10 + index * pinYoffset
      );
    });

    //draw output pins
    outputPins.forEach((pin, index) => {
      if (this.draw == undefined) return;

      this.drawPin(
        x + widest * 4,
        y + pinYoffset + index * pinYoffset,
        pinSize
      );
      this.draw.fillText(
        pin.name,
        x + widest * 4 - pinSize * 2 - this.draw.measureText(pin.name).width,
        y + pinYoffset + 10 + index * pinYoffset
      );
    });
  }
}
