export default class BinaryNumber {
  private _value: number = 0;
  private _length: number = 0;

  public constructor(value: string | number = "0") {
    if (typeof value == "number") value = value + "";
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
    let v = this._value < 0 ? this._value >>> 0 : this._value;

    if (v.toString(2).length > pad) {
      console.log("Number too large: " + v + " pad: " + pad);
      return v.toString(2).slice(-pad);
    }
    return v.toString(2).padStart(pad, "0");
  }

  public toHex(pad: number = this._length / 4): string {
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

  public shiftLeft(n: number): BinaryNumber {
    this._value = BinaryNumber.parse("0b"+this.getBinaryValue() + "0".repeat(n)).value;
    return this;
  }

  public shiftRight(n:number): BinaryNumber {
    let bin = this.getBinaryValue();
    if(bin.length <= n) return new BinaryNumber(0);
    bin = bin.slice(0, bin.length - n);
    this._value = BinaryNumber.parse("0b"+bin).value;
    return this;
  }

  public static shiftLeft(a: number | BinaryNumber, n: number | BinaryNumber): BinaryNumber {
    if (typeof a != "number") a = a.value;
    if (typeof n != "number") n = n.value;

    return new BinaryNumber(a).shiftLeft(n);
  }

  public static shiftRight(a: number | BinaryNumber, n: number | BinaryNumber): BinaryNumber {
    if (typeof a != "number") a = a.value;
    if (typeof n != "number") n = n.value;
    return new BinaryNumber(a).shiftRight(n);
  }

  public slice(start: number, end: number, pad:number=32): BinaryNumber {
    let binary = new BinaryNumber("0b"+this.getBinaryValue(pad).slice(start, end));
    return binary;
  }

  public static parse(value: string | number, signed = false): BinaryNumber {
    let binary = new BinaryNumber();
    if (typeof value == "number") value = value + "";
    if (value.startsWith("0x")) {
      binary.value = Number.parseInt(value.substring(2), 16);
      return binary;
    } else if (value.startsWith("0b")) {
      if (!signed) binary.value = Number.parseInt(value.substring(2), 2);
      else {
        let v = value.substring(2);
        if (v[0] == "1") {
          let flipped = "";
          for (let i = 0; i < v.length; i++) {
            flipped += v[i] == "1" ? "0" : "1";
          }
          binary.value = Number.parseInt(flipped, 2) + 1;
          binary.value *= -1;
        } else {
          binary.value = Number.parseInt(v, 2);
        }
      }

      return binary;
    }

    binary.value = Number.parseInt(value);

    return binary;
  }

  public static add(a: number, b: number): BinaryNumber {
    return new BinaryNumber((a + b).toString());
  }

  public static sub(a: number, b: number): BinaryNumber {
    return new BinaryNumber((a - b).toString());
  }

  public static and(a: number, b: number): BinaryNumber {
    return new BinaryNumber((a & b).toString());
  }

  public static or(a: number, b: number): BinaryNumber {
    return new BinaryNumber((a | b).toString());
  }

  public static not(a: number): BinaryNumber {
    return new BinaryNumber((~a).toString());
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

  public subNumber(b: number): BinaryNumber {
    this._value -= b;
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
