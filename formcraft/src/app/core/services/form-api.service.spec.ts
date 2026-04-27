import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FormApiService } from './form-api.service';
import { SupabaseService } from './supabase.service';
import { signal } from '@angular/core';

describe('FormApiService', () => {
  let service: FormApiService;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      currentUser: signal({ id: 'user-123' }),
      client: {
        from: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis()
      }
    };

    TestBed.configureTestingModule({
      providers: [
        FormApiService,
        { provide: SupabaseService, useValue: mockSupabase }
      ]
    });
    service = TestBed.inject(FormApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should throw error if user is not logged in when saving', async () => {
    mockSupabase.currentUser.set(null);
    await expect(service.saveForm('Test', {})).rejects.toThrow('User must be logged in to save a form.');
  });

  it('should call update when formId is provided', async () => {
    const payload = { name: 'Test', schema: {} };
    
    mockSupabase.client.single.mockResolvedValue({ data: { id: '1' }, error: null });

    await service.saveForm('Test', {}, 'form-123');

    expect(mockSupabase.client.from).toHaveBeenCalledWith('forms');
    expect(mockSupabase.client.update).toHaveBeenCalled();
    expect(mockSupabase.client.eq).toHaveBeenCalledWith('id', 'form-123');
  });

  it('should call insert when formId is NOT provided', async () => {
    mockSupabase.client.single.mockResolvedValue({ data: { id: 'new-id' }, error: null });

    await service.saveForm('New Form', {});

    expect(mockSupabase.client.from).toHaveBeenCalledWith('forms');
    expect(mockSupabase.client.insert).toHaveBeenCalled();
  });

  it('should fetch user forms', async () => {
    const mockForms = [{ id: '1', name: 'Form 1' }];
    mockSupabase.client.order.mockResolvedValue({ data: mockForms, error: null });

    const result = await service.getMyForms();

    expect(result).toEqual(mockForms);
    expect(mockSupabase.client.order).toHaveBeenCalledWith('updated_at', { ascending: false });
  });
});
