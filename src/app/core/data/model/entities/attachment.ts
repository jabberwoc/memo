export class Attachment {
  name: string;
  type: string;
  size: number;
  data: any;

  constructor(name: string, type: string, size: number, data?: any) {
    this.name = name;
    this.type = type;
    this.size = size;
    this.data = data;
  }
}
