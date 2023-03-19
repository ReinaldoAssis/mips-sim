export default class BinaryNumber {
  private _value: number = 0;
  private _length: number = 0;

  public constructor(size: number = 0) {
    this._length = size;
  }

  public get value(): number {
    return this._value;
  }

  public set value(v: number) {
    if (v > Math.pow(2, this._length) - 1)
      throw new Error(
        `[Hardware Descriptor] Value out of bounds in BinaryNumber!`
      );
    this._value = v;
  }

  public get length(): number {
    return this._length;
  }

  public set length(v: number) {
    this._length = v;
  }

  public toString(): string {
    return this._value.toString(2);
  }

  public toHex(): string {
    let hex = this._value.toString(16);
    return "0x" + (hex.length === 1 ? "0" + hex : hex);
  }

  public at(index: number): number {
    if (index >= this._length)
      throw new Error(
        `[Hardware Descriptor] Index out of bounds in BinaryNumber!`
      );
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

  public static fromBinaryString(value: string): BinaryNumber {
    let binary = new BinaryNumber(value.length);
    binary.value = Number.parseInt(value, 2);
    return binary;
  }

  public static fromHexString(value: string): BinaryNumber {
    let binary = new BinaryNumber(value.length * 4);
    binary.value = Number.parseInt(value, 16);
    return binary;
  }

  public sub(b: BinaryNumber): BinaryNumber {
    let result = new BinaryNumber();
    result.value = this.value - b.value;
    return result;
  }

  public add(b: BinaryNumber): BinaryNumber {
    let result = new BinaryNumber();
    result.value = this.value + b.value;
    return result;
  }

  public and(b: BinaryNumber): BinaryNumber {
    let result = new BinaryNumber();
    result.value = this.value & b.value;
    return result;
  }

  public or(b: BinaryNumber): BinaryNumber {
    let result = new BinaryNumber();
    result.value = this.value | b.value;
    return result;
  }

  public xor(b: BinaryNumber): BinaryNumber {
    let result = new BinaryNumber();
    result.value = this.value ^ b.value;
    return result;
  }
}
