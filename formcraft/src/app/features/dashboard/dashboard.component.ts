import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormApiService, FormEntity } from '../../core/services/form-api.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { FormStateService } from '../../core/services/form-state.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private formApi = inject(FormApiService);
  private supabase = inject(SupabaseService);
  private router = inject(Router);
  private state = inject(FormStateService);

  forms = signal<FormEntity[]>([]);
  loading = signal(true);
  user = this.supabase.currentUser;

  async ngOnInit() {
    if (!this.user()) {
      this.router.navigate(['/auth']);
      return;
    }
    console.log("-->", this.user()?.user_metadata?.['name']);
    await this.loadForms();
  }

  async loadForms() {
    try {
      this.loading.set(true);
      const data = await this.formApi.getMyForms();
      this.forms.set(data);
    } catch (err) {
      console.error('Failed to load forms', err);
    } finally {
      this.loading.set(false);
    }
  }

  async logout() {
    this.state.clearState();
    await this.supabase.signOut();
    this.router.navigate(['/auth']);
  }

  editForm(form: FormEntity) {
    // Navigate to builder with ID - the builder component will handle loading the state
    this.router.navigate(['/builder', form.id]);
  }

  createNew() {
    // Clear state for a fresh form
    this.state.clearState();
    this.router.navigate(['/builder']);
  }

  async deleteForm(id: string) {
    if (!confirm('Are you sure you want to delete this form?')) return;

    try {
      await this.formApi.deleteForm(id);
      await this.loadForms();
    } catch (err) {
      console.error('Delete failed', err);
    }
  }
}
