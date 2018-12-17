export class Attachment {
  name: string;
  type: string;
  stub?: boolean;
  size?: number;
  data?: any;
  digest?: string;

  constructor(obj: Attachment = {} as Attachment) {
    const { name, type, stub = false, size, data, digest } = obj;

    this.name = name;
    this.type = type;
    this.size = size;
    this.data = data;
    this.stub = stub;
    this.digest = digest;
  }
}
