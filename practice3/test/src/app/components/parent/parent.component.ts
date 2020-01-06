import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-parent',
  templateUrl: './parent.component.html',
  styleUrls: ['./parent.component.scss']
})
export class ParentComponent implements OnInit {
  public number = 0;
  public addNumber() {
    this.number++;
  }
  constructor() { }

  ngOnInit() {
  }

}
