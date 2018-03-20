import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GatewayEditorComponent } from './gateway-editor.component';

describe('GatewayEditorComponent', () => {
  let component: GatewayEditorComponent;
  let fixture: ComponentFixture<GatewayEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GatewayEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GatewayEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
