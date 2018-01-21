import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WatchListFormComponent } from './watch-list-form.component';

describe('WatchListFormComponent', () => {
  let component: WatchListFormComponent;
  let fixture: ComponentFixture<WatchListFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WatchListFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WatchListFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
