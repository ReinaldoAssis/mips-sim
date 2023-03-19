import BinaryNumber from "./BinaryNumber";

class Register {
  private _data: BinaryNumber = new BinaryNumber();
  public size: number = 1;

  public constructor(size: number = 1) {
    this.size = size;
    this._data = new BinaryNumber();
  }

  // @param value: BinaryNumber - A number in binary to be set in the register
  // @throws Error - If the size of the array is not equal to the size of the register
  // @returns void
  public setValue(value: BinaryNumber): void {
    if (value.length != this.size)
      throw new Error(`[Hardware Descriptor] Incompatible data size in register of size ${this.size}!
            \n\tExpected: ${this.size}; Received: ${value.length}`);

    this._data = value;
  }

  // @returns Array<number> - Array of numbers in the register
  public getValue(): BinaryNumber {
    return this._data;
  }

  // Shift the register to the left
  public shiftLeft(): void {
    this._data.shiftLeft();
  }

  // Shift the register to the right
  public shiftRight(): void {
    this._data.shiftRight();
  }
}

type addr = {
  address: number;
  value: number; //value of the address in binary
};

class Memory {
  private _data: Array<addr> = new Array<addr>(0);
  private _bytes: number = 1024;

  public constructor(bytes: number = 1024) {
    this._bytes = bytes;
  }

  // @param address: number - Address to read from
  // @returns number - Value at the address
  public at(address: number): number {
    //checks if the address is out of bounds
    if (address >= this._bytes)
      throw new Error(`[Hardware Memory] Address out of bounds!`);

    let value = this._data.find((addr) => addr.address == address);

    //checks if the address is already in the memory
    if (value == undefined) {
      this._data.push({ address: address, value: 0 }); //if not, it adds the address to the memory
      return 0;
    }

    return value.value; //if the address is already in the memory, returns the value
  }

  public write(address: addr) {
    let value = this._data.find((addr) => addr.address == address.address);

    //checks if the address is already in the memory
    if (value == undefined) {
      this._data.push(address); //if not, it adds the address to the memory
      return;
    }

    //if the address is already in the memory, it updates the value
    this._data[this._data.indexOf(value)] = address;
  }
}

class Multiplexer {
  public inputs: Array<BinaryNumber> = new Array<BinaryNumber>();
  public output: BinaryNumber = new BinaryNumber();
  private _selector: number = 0;
  private _size: number = 0;

  public constructor(size: number = 0) {
    this._size = size;
    this.inputs = new Array<BinaryNumber>(size);
  }

  get selector(): number {
    return this._selector;
  }

  // @param value: number - Selector value
  // @throws Error - If the selector value is out of bounds
  set selector(value: number) {
    if (value >= this._size)
      throw new Error(`[Hardware Multiplexer] Selector out of bounds!`);
    this._selector = value;
    this.output = this.inputs[value];
  }
}

class Clock {
  private _frequency: number = 0;
  private _interval: number = 0;
  private _onTick: Function = () => {};
  private _intervalId: number = 0;

  public constructor(frequency: number = 0, onTick: Function = () => {}) {
    this._frequency = frequency;
    this._interval = 1 / frequency;
    this._onTick = onTick;
  }

  public start(): void {
    this._intervalId = setInterval(this._onTick, this._interval);
  }

  public stop(): void {
    clearInterval(this._intervalId);
  }
}

class ALU {
  private _A: BinaryNumber = new BinaryNumber();
  private _B: BinaryNumber = new BinaryNumber();
  private _size: number = 32;

  private _output: BinaryNumber = new BinaryNumber();
  private _carry: boolean = false;
  // does it need overflow flag?
  private _zero: boolean = false;
  private _negative: boolean = false;

  public constructor(
    A: BinaryNumber = new BinaryNumber("0"),
    B: BinaryNumber = new BinaryNumber("0"),
    size: number = 32
  ) {
    this._A = A;
    this._B = B;
    this._size = size; //Todo: size checks
  }

  // public logic(operation: string): void {
  //   switch (operation) {
  //   }
  // }

  get A(): BinaryNumber {
    return this._A;
  }

  set A(value: BinaryNumber) {
    this._A = value;
  }

  get B(): BinaryNumber {
    return this._B;
  }

  set B(value: BinaryNumber) {
    this._B = value;
  }

  get output(): BinaryNumber {
    return this._output;
  }

  get carry(): boolean {
    return this._carry;
  }

  get zero(): boolean {
    return this._zero;
  }

  get negative(): boolean {
    return this._negative;
  }

  public add(): void {
    this._output = this._A.add(this._B);
    this._carry = this._output.value > 255;
    this._zero = this._output.value == 0;
    this._negative = this._output.value < 0;
  }

  public sub(): void {
    this._output = this._A.sub(this._B);
    this._carry = this._output.value < 0;
    this._zero = this._output.value == 0;
    this._negative = this._output.value < 0;
  }

  public and(): void {
    this._output = this._A.and(this._B);
    this._carry = false;
    this._zero = this._output.value == 0;
    this._negative = this._output.value < 0;
  }

  public or(): void {
    this._output = this._A.or(this._B);
    this._carry = false;
    this._zero = this._output.value == 0;
    this._negative = this._output.value < 0;
  }

  public xor(): void {
    this._output = this._A.xor(this._B);
    this._carry = false;
    this._zero = this._output.value == 0;
    this._negative = this._output.value < 0;
  }

  public not(): void {
    this._output.value = ~this._A.value;
    this._carry = false;
    this._zero = this._output.value == 0;
    this._negative = this._output.value < 0;
  }

  public shiftLeft(): void {
    this._output.value = this._A.value << 1;
    this._carry = this._output.value > 255;
    this._zero = this._output.value == 0;
    this._negative = this._output.value < 0;
  }

  public shiftRight(): void {
    this._output.value = this._A.value >> 1;
    this._carry = this._output.value < 0;
    this._zero = this._output.value == 0;
    this._negative = this._output.value < 0;
  }
}

export { Register, Memory, Multiplexer, Clock };
