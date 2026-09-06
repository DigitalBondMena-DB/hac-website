import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RamadanLoaderComponent } from './ramadan-loader.component';

describe('RamadanLoaderComponent', () => {
  let component: RamadanLoaderComponent;
  let fixture: ComponentFixture<RamadanLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RamadanLoaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RamadanLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
