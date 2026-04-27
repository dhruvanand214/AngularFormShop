import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthComponent } from './auth.component';
import { SupabaseService } from '../../core/services/supabase.service';
import { FormStateService } from '../../core/services/form-state.service';
import { signal } from '@angular/core';

describe('AuthComponent', () => {
  let component: AuthComponent;
  let fixture: ComponentFixture<AuthComponent>;
  let mockSupabase: any;
  let mockRouter: any;
  let mockState: any;

  beforeEach(async () => {
    mockSupabase = {
      currentUser: signal(null),
      signInWithEmail: vi.fn(),
      signUpWithEmail: vi.fn(),
      signOut: vi.fn()
    };

    mockRouter = {
      navigate: vi.fn()
    };

    mockState = {
      clearState: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, AuthComponent],
      providers: [
        { provide: SupabaseService, useValue: mockSupabase },
        { provide: Router, useValue: mockRouter },
        { provide: FormStateService, useValue: mockState }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize with an invalid form', () => {
    expect(component.authForm.valid).toBe(false);
  });

  it('should validate email format', () => {
    const email = component.authForm.get('email');
    email?.setValue('invalid-email');
    expect(email?.hasError('email')).toBe(true);
    
    email?.setValue('test@example.com');
    expect(email?.hasError('email')).toBe(false);
  });

  it('should enforce strong password rules', () => {
    const password = component.authForm.get('password');
    
    // Missing uppercase
    password?.setValue('password123!');
    expect(password?.hasError('weakPassword')).toBe(true);
    
    // Missing special char
    password?.setValue('Password123');
    expect(password?.hasError('weakPassword')).toBe(true);
    
    // Strong password
    password?.setValue('Pass123!');
    expect(password?.valid).toBe(true);
  });

  it('should call clearState when continuing as guest', () => {
    component.continueAsGuest();
    expect(mockState.clearState).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/builder']);
  });

  it('should toggle between login and signup modes', () => {
    expect(component.isLogin()).toBe(false);
    component.toggleMode();
    expect(component.isLogin()).toBe(true);
  });
});
