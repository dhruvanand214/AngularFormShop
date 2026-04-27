import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { FormStateService } from './form-state.service';
import { FORM_THEMES } from '../../themes';

describe('FormStateService', () => {
  let service: FormStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FormStateService]
    });
    service = TestBed.inject(FormStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have a default form name', () => {
    expect(service.formName()).toBe('Untitled Form');
  });

  it('should add a field and select it', () => {
    const fieldId = 'test_id';
    service.formFields.set([{ id: fieldId, type: 'text', label: 'Test Label' }]);
    service.selectField(fieldId);

    expect(service.selectedFieldId()).toBe(fieldId);
    expect(service.selectedField()?.label).toBe('Test Label');
  });

  it('should delete a selected field', () => {
    const fieldId = 'test_id';
    service.formFields.set([{ id: fieldId, type: 'text', label: 'Test Label' }]);
    service.selectField(fieldId);
    
    service.deleteSelectedField();
    
    expect(service.formFields().length).toBe(0);
    expect(service.selectedFieldId()).toBe(null);
  });

  it('should load schema correctly', () => {
    const mockSchema = {
      metadata: {
        name: 'New Form',
        theme: 'glass-dark',
        layout: 'Compact'
      },
      fields: [{ id: 'f1', type: 'email', label: 'Email' }]
    };

    service.loadSchema(mockSchema, 'uuid-123');

    expect(service.formName()).toBe('New Form');
    expect(service.currentFormId()).toBe('uuid-123');
    expect(service.selectedLayout()).toBe('Compact');
    expect(service.selectedTheme().id).toBe('glass-dark');
  });

  it('should clear state on logout', () => {
    service.formName.set('Dirty State');
    service.currentFormId.set('old-id');
    
    service.clearState();
    
    expect(service.formName()).toBe('Untitled Form');
    expect(service.currentFormId()).toBe(null);
    expect(service.formFields().length).toBe(0);
  });
});
