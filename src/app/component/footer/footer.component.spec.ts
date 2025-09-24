import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';
import { Router } from '@angular/router';

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  let router: MockRouter;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [{ provide: Router, useClass: MockRouter }],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to about route when About Us clicked (method)', () => {
    component.goToAboutUs();
    expect(router.navigate).toHaveBeenCalledWith(['/about']);
  });

  it('should navigate to about when list item clicked (DOM interaction)', () => {
    const aboutLi = fixture.nativeElement.querySelector('li.about-us');
    aboutLi.click();
    expect(router.navigate).toHaveBeenCalledWith(['/about']);
  });
});
