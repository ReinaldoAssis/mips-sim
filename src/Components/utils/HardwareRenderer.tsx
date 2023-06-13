export enum PinType {
  Input,
  Output,
}

export enum HardwareType {
  Block,
  Mux,
  Adder,
}

export type HardwareProps = {
  pins: Array<Pin>;
  height?: number;
  width?: number;
  name?: string;
  pos: number[];
  tag: string;
  type: HardwareType;
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
  visited: boolean;
  f: number;
  g: number;
  parent?: Point | undefined;
};

function manhattan(a: Point, b: Point): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function backtrace(node: Point): Array<Point> {
  let path: Array<Point> = [node];
  while (node.parent) {
    node = node.parent;
    path.push(node);
  }
  return path.reverse();
}

export class Heap<T> {
  private _heap: Array<T> = [];
  private _comparator: (a: T, b: T) => boolean;

  constructor(comparator: (a: T, b: T) => boolean) {
    this._comparator = comparator;
  }

  public push(element: T): void {
    this._heap.push(element);
    this._bubbleUp(this._heap.length - 1);
  }

  public peek(): T | undefined {
    return this._heap[0];
  }

  public pop(): T {
    const poppedElement = this._heap[0];
    const bottom = this._heap.pop();

    if (bottom === undefined || this._heap.length === 0) {
      return poppedElement;
    }

    this._heap[0] = bottom;
    this._bubbleDown(0);

    return poppedElement;
  }

  public updateItem(item: T): void {
    const index = this._heap.indexOf(item);
    this._bubbleUp(index);
    this._bubbleDown(index);
  }

  public isEmpty(): boolean {
    return this._heap.length === 0;
  }

  private swap(i: number, j: number): void {
    const temp = this._heap[i];
    this._heap[i] = this._heap[j];
    this._heap[j] = temp;
  }

  private _parent(index: number): number {
    if (index < 0) return -1;
    return Math.floor((index - 1) / 2);
  }

  private _leftChild(index: number): number {
    return Math.floor((2 * index + 1) / 2);
  }

  private _rightChild(index: number): number {
    return Math.floor((2 * index + 2) / 2);
  }

  private _bubbleUp(index: number): void {
    let parent = this._parent(index);
    if (
      parent >= 0 &&
      this._comparator(this._heap[index], this._heap[parent])
    ) {
      this.swap(index, parent);
      this._bubbleUp(parent);
    }
  }

  private _bubbleDown(index: number): void {
    let smallest = index;
    let left = this._leftChild(index);
    let right = this._rightChild(index);
    if (
      left < this._heap.length &&
      this._comparator(this._heap[left], this._heap[smallest])
    ) {
      smallest = left;
    }

    if (
      right < this._heap.length &&
      this._comparator(this._heap[right], this._heap[smallest])
    ) {
      smallest = right;
    }

    if (smallest !== index) {
      this.swap(index, smallest);
      this._bubbleDown(smallest);
    }
  }
}

//singleton class
export default class HardwareRenderer {
  private static _instance: HardwareRenderer;
  public draw: CanvasRenderingContext2D | undefined;
  public components: Array<HardwareProps> = [];
  public matrix: Array<Array<Point>> = [];
  public matrixXoffset: number = 20;
  public matrixYoffset: number = 20;
  public scale: number = 0.7;

  public static get instance(): HardwareRenderer {
    if (!HardwareRenderer._instance) {
      HardwareRenderer._instance = new HardwareRenderer();
    }

    return HardwareRenderer._instance;
  }

  public setCanvas(ctx: CanvasRenderingContext2D) {
    this.draw = ctx;
  }

  /*
    * Updates the matrix tiles to occupied if a component is on top of it
    @returns void
  */
  public checkCollision() {
    this.components.forEach((component) => {
      let width = component.width ?? 0;
      let height = component.height ?? 0;

      let cx = component.pos[0];
      let cy = component.pos[1];

      if (this.draw == undefined) return false;

      this.matrix.forEach((row) => {
        row.forEach((point) => {
          //OBS: cx + 5 is a quick fix to make pins walkable in a* pathfinding
          if (
            point.x >= cx &&
            point.x <= cx + width + 10 &&
            point.y >= cy &&
            point.y <= cy + height
          ) {
            point.occupied = true;
          }
        });
      });
    });
  }

  /*
    * Initializes the matrix with the canvas width and height
    @returns void
  */
  public initializeMatrix(
    xOffset: number = this.matrixXoffset,
    yOffset: number = this.matrixYoffset
  ) {
    let height = this.draw?.canvas.height ?? 0;
    let width = this.draw?.canvas.width ?? 0;

    this.matrixXoffset = xOffset;
    this.matrixYoffset = yOffset;

    this.matrix = [];

    for (let x = 0; x < width; x += this.matrixXoffset) {
      let row: Array<Point> = [];
      for (let y = 0; y < height; y += this.matrixYoffset) {
        row.push({
          x: x,
          y: y,
          occupied: false,
          visited: false,
          f: 999999,
          g: 0,
        });
      }
      this.matrix.push(row);
    }
  }

  /*
    * Draws the matrix tiles on the canvas  
    @returns void
  */
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

  /*
    * Draws all the registered components on the canvas 
    @returns void
  */
  public drawComponents() {
    this.components.forEach((component) => {
      if (component.type == HardwareType.Block) this.drawComponent(component);
      else if (component.type == HardwareType.Mux) this.drawMux(component);
    });
  }

  /*
    * Adds a component to the list of components to be drawn
    @param component - The component to be added
    @returns void
  */
  public addComponent(component: HardwareProps) {
    this.components.push(component);
  }

  /*
    * Updates the canvas reference from the document
    @param doc - The document to be used as reference
    @returns void
  */
  public setCanvasFromDoc(doc: Document) {
    if (doc.getElementById("canvas")) {
      let ctx: CanvasRenderingContext2D =
        (doc.getElementById("canvas") as HTMLCanvasElement).getContext("2d") ??
        new CanvasRenderingContext2D();

      ctx.canvas.width = window.innerWidth * 2;
      ctx.canvas.height = window.innerHeight * 2 - 40;
      ctx.strokeStyle = "black";
      ctx.fillStyle = "black";
      ctx.lineWidth = 7; //* this.scale;

      this.setCanvas(ctx);
    }
  }

  /*
    * Draws a component's pin on the canvas
    @param x - The x position of the pin
    @param y - The y position of the pin
    @param size - The size of the pin
    @returns void
  */
  public drawPin(x: number, y: number, size: number) {
    if (this.draw == undefined) return;
    this.draw.fillRect(x - size / 2, y - size / 2, size, size);
  }

  /*
    * Gets the widest pin width from a list of pins given a font
    @param pins - The list of pins to be checked
    @param font - The font to be used
    @returns The width of the widest pin
  */
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

  /*
    * Gets the width of a title given a font
    @param title - The title to be checked
    @param font - The font to be used
    @returns The width of the title
  */
  public getTitleWidth(title: string, font: string): number {
    if (this.draw == undefined) return 0;

    this.draw.font = font;
    return this.draw.measureText(title).width;
  }

  /*
    * Filters a list of pins by type
    @param pins - The list of pins to be filtered
    @param type - The type of pin to be filtered
    @returns The filtered list of pins
  */
  public filterPins(pins: Array<Pin>, type: PinType): Array<Pin> {
    return pins.filter((pin) => pin.type == type);
  }

  /*
    * Gets the euclidian distance between two points
    @param x1 - The x position of the first point
    @param y1 - The y position of the first point
    @param x2 - The x position of the second point
    @param y2 - The y position of the second point
    @returns The euclidian distance between the two points
  */
  private euclidian(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
  }

  /*
    * Gets the closest tile from the matrix to a pin   
    @param pin - The pin to be checked
    @returns The closest tile to the pin 
  */
  private getsPinClosestTile(pin: Pin): Point {
    if (pin.pos == undefined)
      return { x: -1, y: -1, occupied: false, visited: false, f: -1, g: -1 };
    let x = pin.pos[0];
    let y = pin.pos[1];

    let closest: Array<Point> = [];
    this.matrix.forEach((row) => {
      row.forEach((point) => {
        if (this.euclidian(point.x, point.y, x, y) < 20) {
          //&& !point.occupied
          closest.push(point);
        }
      });
    });

    closest.sort((p) => this.euclidian(p.x, p.y, x, y));
    closest[0].occupied = false;

    return closest[0];
  }

  private getTileNeighbors(tile: Point): Array<Point> {
    let neighbors: Array<Point> = [];

    let i = tile.x / this.matrixXoffset;
    let j = tile.y / this.matrixYoffset;

    if (this.matrix[i][j - 1].occupied == false)
      neighbors.push(this.matrix[i][j - 1]);

    if (this.matrix[i][j + 1].occupied == false)
      neighbors.push(this.matrix[i][j + 1]);

    if (this.matrix[i - 1][j].occupied == false)
      neighbors.push(this.matrix[i - 1][j]);

    if (this.matrix[i + 1][j].occupied == false)
      neighbors.push(this.matrix[i + 1][j]);

    return neighbors;
  }

  public aStarPathFiding(a: Point, b: Point): Array<Point> {
    //A* pathfinding
    let weight = 5;

    let openSet: Heap<Point> = new Heap<Point>((a, b) => a.f < b.f);
    a.f = 0;
    a.g = 0;

    openSet.push(a);
    a.visited = true;

    while (openSet.isEmpty() == false) {
      let node = openSet.pop(); //gets the node with the lowest f value
      node.visited = true;

      if (node === b) {
        //return backtrace
        return backtrace(node);
      }

      let neighbors = this.getTileNeighbors(node);
      for (let i = 0; i < neighbors.length; i++) {
        let neighbor = neighbors[i];

        if (neighbor.visited) continue;

        // get the distance between current node and the neighbor
        // and calculate the next g score

        let ng = node.g + 1; // 1 is the distance between two nodes (1 tile) since diagonal movement is not allowed

        if (!neighbor.visited || ng < neighbor.g) {
          neighbor.g = ng;
          neighbor.f = ng + weight * manhattan(neighbor, b);
          neighbor.parent = node;

          if (!neighbor.visited) {
            neighbor.visited = true;
            openSet.push(neighbor);
          } else {
            // the neighbor can be reached with smaller cost.
            // Since its f value has been updated, we have to
            // update its position in the open list
            openSet.updateItem(neighbor);
          }
        }
      }
    }

    return [];
  }

  public drawWire(pinA: Pin, pinB: Pin) {
    if (this.draw == undefined) return;

    let a: Point = this.getsPinClosestTile(pinA);
    let b: Point = this.getsPinClosestTile(pinB);

    let path: Array<Point> = this.aStarPathFiding(a, b);

    this.draw.strokeStyle = "black";
    this.draw.beginPath();

    path.forEach((point, index) => {
      if (this.draw == undefined) return;

      if (index == 0) this.draw.moveTo(point.x, point.y);
      else this.draw.lineTo(point.x, point.y);
    });

    this.draw.stroke();
  }

  /*
    * Gets what the height of a component has to be given a list of pins and a pin offset
    @param pins - The list of pins to be checked
    @param pinYoffset - The offset of the pins
    @returns The height of the component
  */
  public getAutoHeight(pins: Array<Pin>, pinYoffset: number): number {
    let p: Array<Pin> =
      this.filterPins(pins, PinType.Input).length >
      this.filterPins(pins, PinType.Output).length
        ? this.filterPins(pins, PinType.Input)
        : this.filterPins(pins, PinType.Output);

    return p.length * pinYoffset + 150;
  }

  /*
    * Draws a component on the canvas
    @param component - The component to be drawn
    @returns void    
  */
  public drawComponent(component: HardwareProps) {
    if (this.draw == undefined) return;

    let inputPins = this.filterPins(component.pins, PinType.Input);
    let outputPins = this.filterPins(component.pins, PinType.Output);

    let titleWidth = this.getTitleWidth(component.name ?? "", this.bigText);
    let widestInput = this.getWidestPinWidth(inputPins, this.shortText);
    let widestOutput = this.getWidestPinWidth(outputPins, this.shortText);

    let widest = Math.max(widestInput, widestOutput);

    titleWidth = Math.min(titleWidth, widest * 4 - 30);

    let x = component.pos[0];
    let y = component.pos[1];

    //draw pins
    let pinSize = 20 * this.scale;
    let pinYoffset = 80 * this.scale;

    let height = this.getAutoHeight(component.pins, pinYoffset);

    //draw box
    this.draw.strokeStyle = "black";
    this.draw.strokeRect(x, y, widest * 4, height);
    component.width = widest * 4;
    component.height = height;

    //draw title
    this.draw.font = this.bigText;
    this.draw.fillText(
      component.name ?? "",
      x + (widest * 4 - titleWidth) / 2,
      y + height - 50,
      titleWidth
    );
    this.draw.font = this.shortText;

    //draw input pins
    inputPins.forEach((pin, index) => {
      if (this.draw == undefined) return;

      this.drawPin(x, y + pinYoffset + index * pinYoffset, pinSize);
      this.draw.fillText(
        pin.name,
        x + pinSize * 2,
        y + pinYoffset + 10 + index * pinYoffset
      );

      //updates the pin position
      pin.pos = [x - pinSize / 2, y + pinYoffset + index * pinYoffset];
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

      //updates the pin position
      pin.pos = [
        x + widest * 4 - pinSize / 2,
        y + pinYoffset + index * pinYoffset,
      ];
    });
  }

  private get shortText(): string {
    return `${40 * this.scale}px Arial`;
  }

  private get bigText(): string {
    return `bold ${55 * this.scale}px Arial`;
  }

  public drawMux(props: HardwareProps) {
    if (this.draw == undefined) return;

    let inputPins = this.filterPins(props.pins, PinType.Input);
    let outputPins = this.filterPins(props.pins, PinType.Output);

    let height = inputPins.length * 40 * this.scale + 50;

    this.draw.strokeStyle = "black";
    this.draw.beginPath();
    this.draw.roundRect(props.pos[0], props.pos[1], 50, height, 50);
    this.draw.stroke();

    this.draw.font = this.shortText;

    let inputOffset = 40 * this.scale;

    function margin(length: number, offset: number): number {
      return (height - (length - 1) * offset) / 2;
    }

    inputPins.forEach((pin, index) => {
      if (this.draw == undefined) return;

      this.drawPin(
        props.pos[0],
        props.pos[1] +
          margin(inputPins.length, inputOffset) +
          index * inputOffset,
        20 * this.scale
      );
    });

    let outputOffset = height / (outputPins.length + 1);

    outputPins.forEach((pin, index) => {
      if (this.draw == undefined) return;

      this.drawPin(
        props.pos[0] + 50,
        props.pos[1] +
          +margin(outputPins.length, outputOffset) +
          index * outputOffset * this.scale,
        20 * this.scale
      );
    });
  }
}
