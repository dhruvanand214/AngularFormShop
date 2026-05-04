import { Component, inject, ChangeDetectionStrategy, OnInit, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormStateService } from '../../core/services/form-state.service';
import { FormApiService } from '../../core/services/form-api.service';
import { environment } from '../../../environments/environment';

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
  formApi = inject(FormApiService);
  route = inject(ActivatedRoute);
  copied = signal(false);

  private _activeTab = 'json';
  cachedCode: string = '';

  get activeTab() { return this._activeTab; }

  ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      const id = params.get('id');
      if (id) {
        try {
          const form = await this.formApi.getFormById(id);
          this.state.loadSchema(form.schema, form.id);
          this.cachedCode = this.getCode(this._activeTab);
        } catch (err) {
          console.error('Failed to load form in export view', err);
        }
      } else {
        this.cachedCode = this.getCode(this._activeTab);
      }
    });
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

  getSchemaString() {
    return JSON.stringify(this.state.getSchema(), null, 2);
  }

  getCode(tabId: string): string {
    const schema = this.getSchemaString();
    const formId = this.state.currentFormId();

    switch (tabId) {
      case 'json':
        return schema;

      case 'html':
        if (formId) {
          return `<!-- 1. Include FormCraft Renderer -->
<script src="https://cdn.jsdelivr.net/npm/formcraft-renderer@1.1.0/src/renderer.js"></script>

<!-- 2. Add render target -->
<div id="formcraft-root"></div>

<script>
  // Cloud Mode: Just provide the formId. We handle fetching and security.
  FormCraft.render({
    target: '#formcraft-root',
    formId: '${formId}',
    onSubmit: (data) => console.log('Submitted:', data)
  });
</script>`;
        }
        return `<!-- 1. Include FormCraft Renderer -->
<script src="https://cdn.jsdelivr.net/npm/formcraft-renderer@1.1.0/src/renderer.js"></script>

<div id="formcraft-root"></div>

<script>
  const schema = ${schema};

  FormCraft.render({
    target: '#formcraft-root',
    schema,
    onSubmit: (data) => console.log('Submitted:', data)
  });
</script>`;

      case 'angular':
        if (formId) {
          return `// npm install formcraft-renderer
import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import FormCraft from 'formcraft-renderer';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  template: '<div #formRoot></div>'
})
export class DynamicFormComponent implements AfterViewInit {
  @ViewChild('formRoot') formRoot!: ElementRef;

  ngAfterViewInit() {
    // Cloud Mode: Pass formId to fetch directly from FormCraft Cloud
    FormCraft.render({
      target: this.formRoot.nativeElement,
      formId: '${formId}',
      onSubmit: (data: any) => console.log(data)
    });
  }
}`;
        }
        return `npm install formcraft-renderer
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
      onSubmit: (data: any) => console.log(data)
    });
  }
}`;

      case 'react':
        if (formId) {
          return `// npm install formcraft-renderer
import { useEffect, useRef } from 'react';
import FormCraft from 'formcraft-renderer';

export default function DynamicForm() {
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (formRef.current) {
      // Cloud Mode: No more manual fetching!
      FormCraft.render({
        target: formRef.current,
        formId: '${formId}',
        onSubmit: (data) => console.log(data)
      });
    }
  }, []);

  return <div ref={formRef} />;
}`;
        }
        return `npm install formcraft-renderer
        import { useEffect, useRef } from 'react';
import FormCraft from 'formcraft-renderer';

const schema = ${schema};

export default function FormRenderer() {
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (formRef.current) {
      FormCraft.render({
        target: formRef.current,
        schema,
        onSubmit: (data) => console.log(data)
      });
    }
  }, []);

  return <div ref={formRef} />;
}`;

      case 'vue':
        if (formId) {
          return `<!-- npm install formcraft-renderer -->
<template>
  <div ref="formRoot"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import FormCraft from 'formcraft-renderer';

const formRoot = ref(null);

onMounted(() => {
  if (formRoot.value) {
    // Cloud Mode: Seamless integration
    FormCraft.render({
      target: formRoot.value,
      formId: '${formId}',
      onSubmit: (data) => console.log(data)
    });
  }
});
</script>`;
        }
        return `<!-- npm install formcraft-renderer -->
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
      schema,
      onSubmit: (data) => console.log(data)
    });
  }
});
</script>`;


      case 'flutter':
        return `// Flutter Integration
// Add to pubspec.yaml: http: ^1.1.0

import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

// Option 1: Static JSON (Fastest)
// Option 2: Cloud API (Fetch latest)

class FormCraftRenderer extends StatefulWidget {
  final String? formId;
  const FormCraftRenderer({this.formId});

  @override
  _FormCraftRendererState createState() => _FormCraftRendererState();
}

class _FormCraftRendererState extends State<FormCraftRenderer> {
  Map<String, dynamic>? schema;
  bool loading = true;

  @override
  void initState() {
    super.initState();
    if (widget.formId != null) loadFromCloud();
  }

  Future<void> loadFromCloud() async {
    final res = await http.get(
      Uri.parse('https://etqpyppoysnvpmlkhmok.supabase.co/rest/v1/forms?id=eq.\${widget.formId}&select=schema'),
      headers: {'apikey': 'YOUR_KEY'}
    );
    setState(() {
      schema = jsonDecode(res.body)[0]['schema'];
      loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (loading) return Center(child: CircularProgressIndicator());
    return ListView(
      children: schema!['fields'].map((f) => Text(f['label'])).toList(),
    );
  }
}`;

      case 'reactnative':
        return `// React Native Integration
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

export default function FormCraftCloud({ formId }) {
  const [schema, setSchema] = useState(null);

  useEffect(() => {
    fetch(\`https://etqpyppoysnvpmlkhmok.supabase.co/rest/v1/forms?id=eq.\${formId}&select=schema\`, {
      headers: { 'apikey': 'YOUR_KEY' }
    })
    .then(r => r.json())
    .then(data => setSchema(data[0].schema));
  }, [formId]);

  if (!schema) return <ActivityIndicator />;

  return (
    <View>
      {schema.fields.map(f => <Text key={f.id}>{f.label}</Text>)}
    </View>
  );
}`;

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
