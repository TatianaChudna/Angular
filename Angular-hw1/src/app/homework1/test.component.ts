import { Component, OnInit } from '@angular/core';
import {fromEvent} from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    const coordinates = fromEvent<MouseEvent>(document, 'mousemove');
    coordinates.subscribe(event => {
      document.querySelector('h1').innerText = `X: ${event.clientX}, Y: ${event.clientY}`;
    });

    const input = document.getElementById('text');
    const keyup = fromEvent(input, 'keyup');
    keyup.pipe(
      map((i: any) => i.currentTarget.value),
      debounceTime(1000)
    )
      .subscribe(event => {
        document.querySelector('h2').innerText = `Entered text: ${event}`;
      });
  }
}
