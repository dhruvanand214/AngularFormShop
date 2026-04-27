import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BuilderComponent } from './builder.component';
import { FormStateService } from '../../core/services/form-state.service';
import { FormApiService } from '../../core/services/form-api.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { signal } from '@angular/core';
import { of } from 'rxjs';

describe('BuilderComponent', () => {
  let component: BuilderComponent;
  let fixture: ComponentFixture<BuilderComponent>;
  let mockState: any;
  let mockApi: any;
  let mockSupabase: any;

  beforeEach(async () => {
    mockState = new FormStateService();
    mockApi = {
      getFormById: vi.fn(),
      saveForm: vi.fn()
    };
    mockSupabase = {
      currentUser: signal({ id: '1' })
    };

    await TestBed.configureTestingModule({
      imports: [BuilderComponent],
      providers: [
        { provide: FormStateService, useValue: mockState },
        { provide: FormApiService, useValue: mockApi },
        { provide: SupabaseService, useValue: mockSupabase },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => null } },
            paramMap: of({ get: () => null })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create dynamic form controls based on fields', async () => {
    mockState.formFields.set([
      { id: 'f1', type: 'text', label: 'Field 1', required: true },
      { id: 'f2', type: 'email', label: 'Field 2' }
    ]);

    // Give effects a chance to run
    await fixture.whenStable();

    expect(component.dynamicForm.contains('f1')).toBe(true);
    expect(component.dynamicForm.contains('f2')).toBe(true);
    expect(component.dynamicForm.get('f1')?.validator).toBeDefined();
  });

  it('should add options to select fields', () => {
    const field = { id: 'f1', type: 'select', options: [] };
    component.addOption(field);
    expect(field.options.length).toBe(1);
  });

  it('should handle saving a new form', async () => {
    const mockSavedForm = { id: 'new-uuid', name: 'Saved Form' };
    mockApi.saveForm.mockResolvedValue(mockSavedForm);

    // Mock window.prompt
    vi.spyOn(window, 'prompt').mockReturnValue('My New Form');

    await component.saveForm();

    expect(mockApi.saveForm).toHaveBeenCalled();
    expect(mockState.currentFormId()).toBe('new-uuid');
    expect(component.saveSuccess()).toBe(true);
  });
});
