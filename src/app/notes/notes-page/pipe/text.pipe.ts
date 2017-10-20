import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'text' })
export class TextPipe implements PipeTransform {
  transform(value: string): any {
    if (value) {
      const parser = new DOMParser();
      const dom = parser.parseFromString(value, 'text/html');
      return dom.body.textContent;
    }

    return '...';
  }
}
