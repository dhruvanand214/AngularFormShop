import { Component, inject, ChangeDetectionStrategy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormStateService } from '../../core/services/form-state.service';

// Syntax highlight utilities (basic)
const hl = (code: string) => code;

@Component({
  selector: 'app-export',
  imports: [RouterLink],
  templateUrl: './export.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportComponent implements OnInit {
  state = inject(FormStateService);
  copied = signal(false);

  private _activeTab = 'json';
  cachedCode: string = '';

  get activeTab() { return this._activeTab; }

  ngOnInit() {
    // Populate the cache on first load so the JSON tab is immediately ready
    this.cachedCode = this.getCode('json');
  }

  setTab(tabId: string) {
    this._activeTab = tabId;
    this.cachedCode = this.getCode(tabId);
  }

  get requiredCount() {
    return this.state.formFields().filter(f => f.required).length;
  }

  tabs = [
    { id: 'json', label: 'JSON Schema', icon: 'data_object' },
    { id: 'html', label: 'HTML / Vanilla JS', icon: 'html' },
    { id: 'angular', label: 'Angular', icon: 'code' },
    { id: 'react', label: 'React / Next.js', icon: 'code_blocks' },
    { id: 'vue', label: 'Vue.js', icon: 'code_blocks' },
    { id: 'flutter', label: 'Flutter', icon: 'phone_android' },
    { id: 'reactnative', label: 'React Native', icon: 'smartphone' },
  ];

  getSchema() {
    return {
      metadata: {
        formcraftVersion: '2.0',
        theme: this.state.selectedTheme().id,
        themeName: this.state.selectedTheme().name,
        layout: this.state.selectedLayout(),
      },
      fields: this.state.formFields().map(f => ({
        id: f.id,
        type: f.type,
        label: f.label,
        placeholder: f.placeholder || null,
        validation: {
          required: f.required || false,
          minLength: f.minLength || null,
          maxLength: f.maxLength || null,
          ...(f.type === 'email' ? { pattern: 'email' } : {}),
        }
      }))
    };
  }

  getSchemaString() {
    return JSON.stringify(this.getSchema(), null, 2);
  }

  getCode(tabId: string): string {
    const schema = this.getSchemaString();
    const fields = this.state.formFields();

    switch (tabId) {
      case 'json':
        return schema;

      case 'html':
        return `<!-- 1. Include FormCraft Renderer from jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/formcraft-renderer@1.0.1/src/renderer.js"></script>

<!-- 2. Add the render target element -->
<div id="formcraft-root"></div>

<!-- 3. Render the form -->
<script>
  const schema = ${schema};

  FormCraft.render({
    target: '#formcraft-root',
    schema: schema,
    onSubmit: (data) => {
      console.log('Form submitted:', data);
      // fetch('/api/submit', { method: 'POST', body: JSON.stringify(data) });
    }
  });
</script>`;

      case 'angular':
        return `// 1. Install the FormCraft Renderer
// npm install formcraft-renderer

// 2. Create a form-renderer.component.ts
import { Component, ElementRef, ViewChild, AfterViewInit, Input } from '@angular/core';
import FormCraft from 'formcraft-renderer';

@Component({
  selector: 'app-form-renderer',
  standalone: true,
  template: '<div #formRoot></div>'
})
export class FormRendererComponent implements AfterViewInit {
  @ViewChild('formRoot') formRoot!: ElementRef;
  @Input() schema: any = ${schema};

  ngAfterViewInit() {
    FormCraft.render({
      target: this.formRoot.nativeElement,
      schema: this.schema,
      onSubmit: (data: any) => {
        console.log('Form submitted:', data);
      }
    });
  }
}`;

      case 'react':
        return `// 1. Install the FormCraft Renderer
// npm install formcraft-renderer

// 2. Create FormRenderer.tsx
import { useEffect, useRef } from 'react';
import FormCraft from 'formcraft-renderer';

const schema = ${schema};

export default function FormRenderer() {
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (formRef.current) {
      FormCraft.render({
        target: formRef.current,
        schema: schema,
        onSubmit: (data: any) => {
          console.log('Form submitted:', data);
          // fetch('/api/submit', { method: 'POST', body: JSON.stringify(data) });
        }
      });
    }
  }, []);

  return <div ref={formRef} />;
}`;

      case 'vue':
        return `<!-- FormRenderer.vue -->
<!-- 1. Install the FormCraft Renderer -->
<!-- npm install formcraft-renderer -->

<template>
  <div ref="formRoot"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import FormCraft from 'formcraft-renderer';

const formRoot = ref(null);
const schema = ${schema};

onMounted(() => {
  if (formRoot.value) {
    FormCraft.render({
      target: formRoot.value,
      schema: schema,
      onSubmit: (data: any) => {
        console.log('Form submitted:', data);
        // fetch('/api/submit', { method: 'POST', body: JSON.stringify(data) });
      }
    });
  }
});
</script>`;

      case 'flutter':
        return `// Flutter Integration Guide
// Add to pubspec.yaml: http: ^1.0.0

import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

// 1. Paste the JSON schema as a Dart string
const String schemaJson = \'\'\'
${schema}
\'\'\';

// 2. Parse the schema
final schema = jsonDecode(schemaJson);
final fields = schema['fields'] as List;

// 3. Build the form widget
class FormCraftRenderer extends StatefulWidget {
  const FormCraftRenderer({super.key});
  @override
  State<FormCraftRenderer> createState() => _FormCraftRendererState();
}

class _FormCraftRendererState extends State<FormCraftRenderer> {
  final _formKey = GlobalKey<FormState>();
  final _controllers = <String, TextEditingController>{};

  @override
  void initState() {
    super.initState();
    for (final field in fields) {
      _controllers[field['id']] = TextEditingController();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            ...fields.map((field) {
              final validation = field['validation'] as Map;
              return Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: TextFormField(
                  controller: _controllers[field['id']],
                  obscureText: field['type'] == 'password',
                  keyboardType: field['type'] == 'email'
                      ? TextInputType.emailAddress
                      : field['type'] == 'number'
                          ? TextInputType.number
                          : TextInputType.text,
                  decoration: InputDecoration(
                    labelText: field['label'] + (validation['required'] == true ? ' *' : ''),
                    hintText: field['placeholder'] as String?,
                    border: const OutlineInputBorder(),
                  ),
                  validator: (value) {
                    if (validation['required'] == true && (value == null || value.isEmpty)) {
                      return '\${field['label']} is required.';
                    }
                    if (validation['minLength'] != null && value!.length < validation['minLength']) {
                      return 'Minimum \${validation['minLength']} characters.';
                    }
                    if (validation['maxLength'] != null && value!.length > validation['maxLength']) {
                      return 'Maximum \${validation['maxLength']} characters.';
                    }
                    return null;
                  },
                ),
              );
            }).toList(),
            ElevatedButton(
              onPressed: () {
                if (_formKey.currentState!.validate()) {
                  final data = Map.fromEntries(
                    _controllers.entries.map((e) => MapEntry(e.key, e.value.text))
                  );
                  print('Submitted: \$data');
                  // http.post(Uri.parse('/api/submit'), body: jsonEncode(data));
                }
              },
              child: const Text('Submit'),
            ),
          ],
        ),
      ),
    );
  }
}`;

      case 'reactnative':
        return `// React Native Integration
// Install: npm install react-hook-form

import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';

const schema = ${schema};

export default function FormCraftRenderer() {
  const { control, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data: any) => {
    Alert.alert('Success', JSON.stringify(data));
    // fetch('https://your-api.com/submit', { method: 'POST', body: JSON.stringify(data) });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {schema.fields.map((field: any) => (
        <View key={field.id} style={styles.fieldWrapper}>
          <Text style={styles.label}>
            {field.label}{field.validation.required ? ' *' : ''}
          </Text>
          <Controller
            control={control}
            name={field.id}
            rules={{
              required: field.validation.required ? 'This field is required' : false,
              minLength: field.validation.minLength
                ? { value: field.validation.minLength, message: \`Min \${field.validation.minLength} chars\` }
                : undefined,
              maxLength: field.validation.maxLength
                ? { value: field.validation.maxLength, message: \`Max \${field.validation.maxLength} chars\` }
                : undefined,
              pattern: field.validation.pattern === 'email'
                ? { value: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/, message: 'Invalid email' }
                : undefined,
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors[field.id] && styles.inputError]}
                onChangeText={onChange}
                value={value}
                placeholder={field.placeholder ?? ''}
                secureTextEntry={field.type === 'password'}
                keyboardType={field.type === 'email' ? 'email-address' : field.type === 'number' ? 'numeric' : 'default'}
              />
            )}
          />
          {errors[field.id] && (
            <Text style={styles.error}>{(errors[field.id] as any).message}</Text>
          )}
        </View>
      ))}
      <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  fieldWrapper: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 14, fontSize: 14 },
  inputError: { borderColor: '#ef4444' },
  error: { color: '#ef4444', fontSize: 12 },
  button: { backgroundColor: '#6366f1', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});`;

      default:
        return '';
    }
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.cachedCode).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 5000);
    });
  }
}
