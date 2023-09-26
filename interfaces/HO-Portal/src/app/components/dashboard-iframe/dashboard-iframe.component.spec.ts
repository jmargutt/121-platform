import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardIframeComponent } from './dashboard-iframe.component';

@Component({
  standalone: true,
  imports: [DashboardIframeComponent],
  template: '<app-dashboard-iframe [url]="testUrl"></app-dashboard-iframe>',
})
class TestHostComponent {
  public testUrl: string;
}

const safeFallbackUrl = 'about:blank';

describe('DashboardIframeComponent', () => {
  let component: DashboardIframeComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let testHost: TestHostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DashboardIframeComponent, TestHostComponent],
    });
    fixture = TestBed.createComponent(TestHostComponent);
    testHost = fixture.componentInstance;
    component = fixture.debugElement.children[0].componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(testHost).toBeTruthy();
  });

  xit('should allow Power BI dasboard', () => {
    // Arrange
    const testUrl = 'https://app.powerbi.com/view?id=example123';

    // Act
    testHost.testUrl = testUrl;
    fixture.detectChanges();

    // Assert
    expect(component.safeUrl).toBe(testUrl);
  });

  xit('should NOT allow malicous URLs', () => {
    // Arrange
    const testUrls = [
      'http://app.powerbi.com/view?id=example123insecure',
      'https://evil.example.com/phishing/attack.exe',
      'javascript:window.alert("XSS")',
    ];

    // Act
    testUrls.forEach((url) => {
      testHost.testUrl = url;
      fixture.detectChanges();

      // Assert
      expect(component.safeUrl).toBe(safeFallbackUrl);
    });
  });
});
