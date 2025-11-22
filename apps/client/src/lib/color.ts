export class Color {
  className: string;
  color: string;

  constructor(className: string, color: string) {
    this.className = className;
    this.color = color;
  }

  getClassName() {
    return this.className;
  }

  getColor() {
    return this.color;
  }
}
