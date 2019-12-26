import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-child',
  templateUrl: './child.component.html',
  styleUrls: ['./child.component.scss']
})
export class ChildComponent implements OnInit {
  @Input() value: number;
  @Output() changeNumber = new EventEmitter<number>();
  public count = 1;

  public decrease() {
    this.value--;
    this.changeNumber.emit(this.value);
  }
  constructor() { }

  ngOnInit() {
  }

}
