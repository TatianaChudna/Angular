import {Pipe, PipeTransform} from '@angular/core';
import {DatePipe} from '@angular/common';

@Pipe({
  name: 'custom'
})
export class CustomPipe implements PipeTransform {
  public formatsDateTest: string[] = [
    'M/d/yy, h:mm a',
    ' MMM d, y, h:mm:ss a',
    ' EEEE, MMMM d, y, h:mm:ss a zzzz'
  ];

  transform(value: any, ...args: any[]): any {
    const datePipe = new DatePipe('en-US');
    // @ts-ignore
    value = datePipe.transform(value, this.formatsDateTest);
    return value;
  }
}
