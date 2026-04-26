import { Component, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { NgStyle } from '@angular/common';
import { FormStateService } from '../../core/services/form-state.service';

@Component({
  selector: 'app-builder',
  imports: [RouterLink, DragDropModule, ReactiveFormsModule, NgStyle],
  templateUrl: './builder.component.html'
})
export class BuilderComponent {
  state = inject(FormStateService);
  private fb = inject(FormBuilder);
  dynamicForm: FormGroup = this.fb.group({});

  constructor() {
    effect(() => {
      const fields = this.state.formFields();
      Object.keys(this.dynamicForm.controls).forEach(key => {
        this.dynamicForm.removeControl(key);
      });
      fields.forEach(field => {
        const validators = [];
        if (field.required) validators.push(Validators.required);
        if (field.minLength) validators.push(Validators.minLength(field.minLength));
        if (field.maxLength) validators.push(Validators.maxLength(field.maxLength));
        if (field.type === 'email') validators.push(Validators.email);
        this.dynamicForm.addControl(field.id, this.fb.control('', validators));
      });
    });
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
}
