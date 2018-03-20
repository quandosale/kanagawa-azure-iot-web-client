import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaSlidePopupComponent } from './ma-slide-popup.component';

describe('MaSlidePopupComponent', () => {
  let component: MaSlidePopupComponent;
  let fixture: ComponentFixture<MaSlidePopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaSlidePopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaSlidePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
