import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'text' })
export class TextPipe implements PipeTransform {
  transform(value: string): any {
    if (value) {
      const parser = new DOMParser();
      const dom = parser.parseFromString(value, 'text/html');
      const textContent = dom.body.textContent;
      let hasImage = false;
      if (/<img/.test(textContent)) {
        hasImage = true;
      }
      const result = dom.body.textContent
        .substring(0, 50)
        .replace(/\s/g, ' ')
        .trim();
      return result;
    }
  }
}
