import { Injectable, signal, computed } from '@angular/core';
import { FORM_THEMES, FormTheme } from '../../themes';

@Injectable({
  providedIn: 'root'
})
export class FormStateService {
  // Static Data
  availableFields = [
    { type: 'text', label: 'Short Text', icon: 'short_text' },
    { type: 'textarea', label: 'Long Text', icon: 'notes' },
    { type: 'email', label: 'Email Address', icon: 'mail' },
    { type: 'password', label: 'Password', icon: 'password' },
    { type: 'number', label: 'Number', icon: '123' },
    { type: 'select', label: 'Dropdown', icon: 'arrow_drop_down_circle' },
    { type: 'checkbox', label: 'Checkbox', icon: 'check_box' },
    { type: 'radio', label: 'Radio Button', icon: 'radio_button_checked' },
    { type: 'toggle', label: 'Toggle Switch', icon: 'toggle_on' },
    { type: 'rating', label: 'Star Rating', icon: 'star' },
    { type: 'file', label: 'File Upload', icon: 'upload_file' },
    { type: 'date', label: 'Date Picker', icon: 'calendar_month' }
  ];

  themes = FORM_THEMES;
  layouts = ['Standard', 'Compact', 'Two-Column Grid'];

  // State Signals
  currentFormId = signal<string | null>(null);
  formName = signal<string>('Untitled Form');
  formFields = signal<any[]>([]);
  selectedFieldId = signal<string | null>(null);
  activeSidebarTab = signal<'theme' | 'field'>('theme');
  isPreviewMode = signal(false);
  showPasswords = signal<Record<string, boolean>>({});
  selectedTheme = signal<FormTheme>(FORM_THEMES[0]);
  selectedLayout = signal('Standard');

  // Computed
  selectedField = computed(() => {
    return this.formFields().find(f => f.id === this.selectedFieldId());
  });

  themeStyles = computed(() => {
    return this.selectedTheme().variables;
  });

  // Actions
  togglePreview() {
    this.isPreviewMode.update(v => !v);
  }

  togglePasswordVisibility(fieldId: string) {
    this.showPasswords.update(state => ({
      ...state,
      [fieldId]: !state[fieldId]
    }));
  }

  setTheme(themeId: string) {
    const theme = this.themes.find(t => t.id === themeId);
    if (theme) {
      this.selectedTheme.set(theme);
    }
  }

  setLayout(layout: string) {
    this.selectedLayout.set(layout);
  }

  selectField(fieldId: string) {
    this.selectedFieldId.set(fieldId);
    this.activeSidebarTab.set('field');
  }

  updateSelectedField(updates: any) {
    const fieldId = this.selectedFieldId();
    if (!fieldId) return;

    const currentFields = [...this.formFields()];
    const fieldIndex = currentFields.findIndex(f => f.id === fieldId);
    
    if (fieldIndex > -1) {
      currentFields[fieldIndex] = { ...currentFields[fieldIndex], ...updates };
      this.formFields.set(currentFields);
    }
  }

  deleteSelectedField() {
    const fieldId = this.selectedFieldId();
    if (!fieldId) return;

    const currentFields = this.formFields().filter(f => f.id !== fieldId);
    this.formFields.set(currentFields);
    this.selectedFieldId.set(null);
    this.activeSidebarTab.set('theme');
  }

  getSchema() {
    return {
      metadata: {
        formcraftVersion: '2.0',
        theme: this.selectedTheme().id,
        themeName: this.selectedTheme().name,
        layout: this.selectedLayout(),
        name: this.formName()
      },
      fields: this.formFields()
    };
  }

  loadSchema(schema: any, formId: string) {
    if (!schema) return;
    
    this.currentFormId.set(formId);
    this.formName.set(schema.metadata?.name || 'Untitled Form');
    this.formFields.set(schema.fields || []);
    this.selectedLayout.set(schema.metadata?.layout || 'Standard');
    
    if (schema.metadata?.theme) {
      this.setTheme(schema.metadata.theme);
    }
  }

  clearState() {
    this.currentFormId.set(null);
    this.formName.set('Untitled Form');
    this.formFields.set([]);
    this.selectedFieldId.set(null);
    this.selectedLayout.set('Standard');
    this.selectedTheme.set(FORM_THEMES[0]);
  }
}
