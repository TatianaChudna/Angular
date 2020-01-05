import {Directive, ElementRef, HostListener} from '@angular/core';

@Directive({
  selector: '[appErrors]'
})

export class ErrorsDirective {

  constructor(private el: ElementRef) {
    this.addWrapper();
  }

  @HostListener('keyup') keyup(eventData: Event) {
    this.validation();
  }

  public addWrapper() {
    const element = this.el.nativeElement;
    const parent = element.parentNode;
    const wrapper = document.createElement('div');
    const errorContainer = document.createElement('p');

    errorContainer.classList.add('error');
    parent.replaceChild(wrapper, element);
    wrapper.appendChild(element);
    wrapper.appendChild(errorContainer);
  }

  public validation() {
    const showError = document.querySelector('.error');
    const element = this.el.nativeElement;

    if (element.value.length > 5) {
      showError.textContent = 'Length should be no more than 5 characters!';
      element.style.border = '2px solid red';
    } else {
      showError.textContent = '';
      element.style.border = '1px solid black';
    }
  }
}
