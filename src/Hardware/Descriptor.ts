export default class Register {
  private _data: Array<number> = new Array<number>();
  public size: number = 1;

  public constructor(size: number = 1) {
    this.size = size;
    this._data = new Array<number>(size);
  }

  // @param value: Array<number> - Array of numbers to be set in the register
  // @throws Error - If the size of the array is not equal to the size of the register
  // @returns void
  public setValue(value: Array<number>): void {
    if (value.length != this.size)
      throw new Error(`[Hardware Descriptor] Incompatible data size in register of size ${this.size}!
            \n\tExpected: ${this.size}; Received: ${value.length}`);

    this._data = value;
  }

  // @returns Array<number> - Array of numbers in the register
  public getValue(): Array<number> {
    return this._data;
  }

  // Shift the register to the left
  public shiftLeft(): void {
    this._data.unshift(0);
    this._data.pop();
  }

  // Shift the register to the right
  public shiftRight(): void {
    this._data.push(0);
    this._data.shift();
  }
}

type addr = {
  address: number;
  value: number;
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
