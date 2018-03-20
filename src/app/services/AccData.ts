export class AccData {
  public x: number;
  public y: number;
  public z: number;
  public e: number;
  constructor(_e: number, _x: number, _y: number, _z: number) {
    this.e = _e;
    this.x = _x;
    this.y = _y;
    this.z = _z;
  }
}
export class AFSet {
  public start: number;
  public end: number;
  constructor(start: number, end: number) {
    this.start = start;
    this.end = end;
  }
}
