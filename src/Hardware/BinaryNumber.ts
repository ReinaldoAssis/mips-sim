export default class BinaryNumber {
  private _value: number = 0;
  private _length: number = 0;

  public constructor(value: string = "0") {
    if (value == "0") {
      this._value = 0;
      this._length = 1;
    } else {
      this._value = BinaryNumber.parse(value).value;
      this._length = this._value.toString(2).length;
    }
  }

  public get value(): number {
    return this._value;
  }

  public set value(v: number) {
    // if (v > Math.pow(2, this._length) - 1)
    //   throw new Error(
    //     `[Hardware Descriptor] Value out of bounds in BinaryNumber!`
    //   );
    this._value = v;
  }

  public get length(): number {
    this._length = this._value.toString(2).length;
    return this._length;
  }

  public set length(v: number) {
    this._length = v;
  }

  public getBinaryValue(pad: number = this._length): string {
    return this._value.toString(2).padStart(pad, "0");
  }

  public toHex(pad: number = this._length): string {
    let hex = this._value.toString(16);
    return "0x" + hex.padStart(pad, "0");
  }

  public at(index: number): number {
    // if (index >= this._length)
    //   throw new Error(
    //     `[Hardware Descriptor] Index out of bounds in BinaryNumber!`
    //   );
    return (this._value >> index) & 1;
  }

  public shiftLeft(): number {
    this._value = this._value << 1;
    return this._value;
  }

  public shiftRight(): number {
    this._value = this._value >> 1;
    return this._value;
  }

  public static parse(value: string): BinaryNumber {
    let binary = new BinaryNumber();
    if (value.startsWith("0x")) {
      binary.value = Number.parseInt(value.substring(2), 16);
      return binary;
    } else if (value.startsWith("0b")) {
      binary.value = Number.parseInt(value.substring(2), 2);
      return binary;
    }

    binary.value = Number.parseInt(value);
    return binary;
  }

  public sub(b: BinaryNumber): BinaryNumber {
    this._value -= b.value;
    return this;
  }

  public add(b: BinaryNumber): BinaryNumber {
    this._value += b.value;
    return this;
  }

  public addNumber(b: number): BinaryNumber {
    this._value += b;
    return this;
  }

  public and(b: BinaryNumber): BinaryNumber {
    this._value = this._value & b.value;
    return this;
  }

  public or(b: BinaryNumber): BinaryNumber {
    this._value = this.value | b.value;
    return this;
  }

  public xor(b: BinaryNumber): BinaryNumber {
    this._value = this.value ^ b.value;
    return this;
  }
}
