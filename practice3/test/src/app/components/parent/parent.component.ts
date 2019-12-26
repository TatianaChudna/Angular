import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-parent',
  templateUrl: './parent.component.html',
  styleUrls: ['./parent.component.scss']
})
export class ParentComponent implements OnInit {
  currentItem = 'Television';
  items = ['item1', 'item2', 'item3', 'item4'];

  addItem(newItem: string) {
    this.items.push(newItem);
  }
  // public number = 0;
  //
  // public addNumber() {
  //   this.number++;
  // }
  constructor() { }

  ngOnInit() {
  }

}
