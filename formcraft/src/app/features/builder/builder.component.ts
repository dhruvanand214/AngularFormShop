import { Component, effect, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { NgStyle } from '@angular/common';
import { FormStateService } from '../../core/services/form-state.service';
import { FormApiService } from '../../core/services/form-api.service';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-builder',
  imports: [RouterLink, DragDropModule, ReactiveFormsModule, NgStyle],
  templateUrl: './builder.component.html'
})
export class BuilderComponent implements OnInit {
  state = inject(FormStateService);
  formApi = inject(FormApiService);
  supabase = inject(SupabaseService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  dynamicForm: FormGroup = this.fb.group({});

  isSaving = signal(false);
  saveSuccess = signal(false);

  constructor() {
    effect(() => {
      const fields = this.state.formFields();
      Object.keys(this.dynamicForm.controls).forEach(key => {
        this.dynamicForm.removeControl(key);
      });
      fields.forEach(field => {
        const validators = [];
        if (field.required) validators.push(Validators.required);

        const minLen = field.minLength ?? (field.type === 'password' ? 6 : null);
        const maxLen = field.maxLength ?? (field.type === 'password' ? 15 : null);

        if (minLen) validators.push(Validators.minLength(minLen));
        if (maxLen) validators.push(Validators.maxLength(maxLen));
        if (field.type === 'email') validators.push(Validators.email);

        if (field.type === 'number') {
          if (field.minValue != null) validators.push(Validators.min(field.minValue));
          if (field.maxValue != null) validators.push(Validators.max(field.maxValue));
        }

        if (field.type === 'password' && field.passwordStrength === 'strong') {
          validators.push((control: any) => {
            const v = control.value as string;
            if (!v) return null;
            if (!/[A-Z]/.test(v)) return { weakPassword: 'Must include an uppercase letter.' };
            if (!/[a-z]/.test(v)) return { weakPassword: 'Must include a lowercase letter.' };
            if (!/[!@#$%^&*(),.?":{}|<>_\-=+[\]\\;\'\/`~]/.test(v)) return { weakPassword: 'Must include a special character.' };
            return null;
          });
        }

        this.dynamicForm.addControl(field.id, this.fb.control('', validators));
      });
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      const id = params.get('id');
      if (id) {
        try {
          const form = await this.formApi.getFormById(id);
          this.state.loadSchema(form.schema, form.id);
        } catch (err) {
          console.error('Failed to load form', err);
        }
      }
    });
  }

  addOption(field: any) {
    const options = [...(field.options || [])];
    options.push({ label: `Option ${options.length + 1}`, value: `option_${options.length + 1}` });
    this.state.updateSelectedField({ options });
  }

  removeOption(field: any, index: number) {
    const options = [...(field.options || [])];
    options.splice(index, 1);
    this.state.updateSelectedField({ options });
  }

  updateOptionLabel(field: any, index: number, newLabel: string) {
    const options = [...(field.options || [])];
    options[index] = { ...options[index], label: newLabel, value: newLabel.toLowerCase().replace(/\s+/g, '_') };
    this.state.updateSelectedField({ options });
  }

  getFieldError(fieldId: string, fieldType: string, fieldLabel: string): string | null {
    const ctrl = this.dynamicForm.get(fieldId);
    if (!ctrl || !ctrl.touched || ctrl.valid) return null;
    if (ctrl.hasError('required')) return `${fieldLabel} is required.`;
    if (ctrl.hasError('email')) return 'Please enter a valid email address (e.g. you@example.com).';
    if (ctrl.hasError('min')) return `Value must be at least ${ctrl.getError('min').min}.`;
    if (ctrl.hasError('max')) return `Value must be at most ${ctrl.getError('max').max}.`;
    if (ctrl.hasError('minlength')) {
      const min = ctrl.getError('minlength').requiredLength;
      return `Minimum ${min} characters required.`;
    }
    if (ctrl.hasError('maxlength')) {
      const max = ctrl.getError('maxlength').requiredLength;
      return `Maximum ${max} characters allowed.`;
    }
    if (ctrl.hasError('weakPassword')) return ctrl.getError('weakPassword');
    return null;
  }


  onThemeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.state.setTheme(target.value);
  }

  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const rawItem = event.previousContainer.data[event.previousIndex];
      const newField = { 
        ...rawItem, 
        id: 'field_' + Date.now().toString(),
        placeholder: `Enter ${rawItem.label.toLowerCase()}...`,
        required: false,
        minLength: null,
        maxLength: null
      };

      const currentFields = [...this.state.formFields()];
      currentFields.splice(event.currentIndex, 0, newField);
      this.state.formFields.set(currentFields);
      
      this.state.selectField(newField.id);
    }
  }

  async saveForm() {
    if (!this.supabase.currentUser()) {
      this.router.navigate(['/auth']);
      return;
    }

    this.isSaving.set(true);
    try {
      const schema = this.state.getSchema();
      
      const formName = prompt('Enter a name for your form:', this.state.formName()) || this.state.formName();
      this.state.formName.set(formName);

      const savedForm = await this.formApi.saveForm(formName, schema, this.state.currentFormId() || undefined);
      const isNew = !this.state.currentFormId();

      this.state.currentFormId.set(savedForm.id);
      
      if (isNew) {
        this.router.navigate(['/builder', savedForm.id]);
      }
      
      this.saveSuccess.set(true);
      setTimeout(() => this.saveSuccess.set(false), 3000);
    } catch (err) {
      console.error('Failed to save form', err);
      alert('Failed to save form. Check console for details.');
    } finally {
      this.isSaving.set(false);
    }
  }
}
