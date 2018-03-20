import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';

declare var $: any;

@Component({
  selector: 'ma-slide-popup',
  templateUrl: './ma-slide-popup.component.html',
  styleUrls: ['./ma-slide-popup.component.scss']
})
export class MaSlidePopupComponent implements OnInit {
  @Input() open = false;
  @Input() eleId;
  @Input() width = '600px';
  @Input() title;
  @Output() close = new EventEmitter();

  DURATION: number = 300;

  constructor() { }

  ngOnInit() {
    $(`${this.popupSelector()}`).hide();
    $(`${this.popupSelector()} .ma-overlay`).fadeOut(this.DURATION);
    $(`${this.popupSelector()} .ma-slide-popup-content`).css('right', '-' + this.width);

    $('#sidebar-wrapper').resize(() => {
      console.log('sidebar wrapper resized');
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (typeof changes.open != undefined && this.open != undefined) {
      if (this.open) this.showPopup();
      if (!this.open) this.hidePopup();
    }
  }

  onClose(val) {
    this.close.emit(val);
  }

  showPopup() {
    $(`${this.popupSelector()}`).show();
    $(`${this.popupSelector()} .ma-overlay`).fadeIn(this.DURATION);
    $(`${this.popupSelector()} .ma-slide-popup-content`).css('right', '0px');
  }

  hidePopup() {
    $(`${this.popupSelector()} .ma-overlay`).fadeOut(this.DURATION);
    $(`${this.popupSelector()} .ma-slide-popup-content`).css('right', '-' + this.width);
    setTimeout(() => {
      $(`${this.popupSelector()}`).hide();
    }, this.DURATION);
  }

  popupSelector() {
    if(this.eleId) return `ma-slide-popup[eleid='${this.eleId}']`;
    return 'ma-slide-popup';
  }
}
