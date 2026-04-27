import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { FormStateService } from './form-state.service';

export interface FormEntity {
  id: string;
  user_id: string;
  name: string;
  schema: any;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class FormApiService {
  private supabase = inject(SupabaseService);

  async saveForm(name: string, schema: any, formId?: string): Promise<FormEntity> {
    const user = this.supabase.currentUser();
    if (!user) throw new Error('User must be logged in to save a form.');

    const payload = {
      user_id: user.id,
      name,
      schema
    };

    if (formId) {
      // Update existing
      const { data, error } = await this.supabase.client
        .from('forms')
        .update(payload)
        .eq('id', formId)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } else {
      // Insert new
      const { data, error } = await this.supabase.client
        .from('forms')
        .insert(payload)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    }
  }

  async getMyForms(): Promise<FormEntity[]> {
    const { data, error } = await this.supabase.client
      .from('forms')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getFormById(id: string): Promise<FormEntity> {
    const { data, error } = await this.supabase.client
      .from('forms')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async deleteForm(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('forms')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
