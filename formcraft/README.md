# ✨ FormCraft: The Ethereal Form Architect

![FormCraft Banner](public/banner.png)

**FormCraft** is a premium, high-performance SaaS platform for building stunning, dynamic forms with zero code. Designed with a focus on **Glassmorphism** and **User Experience**, FormCraft allows you to drag, drop, and deploy production-ready forms in seconds.

---

## 🚀 Key Features

- 💎 **Ethereal UI**: Beautifully crafted glassmorphism components with over 20+ premium themes.
- 🏗️ **Drag & Drop Builder**: Intuitively build complex forms with a real-time reactive preview.
- ☁️ **Cloud Sync**: Powered by **Supabase**, your forms are saved instantly and accessible from anywhere.
- 🔐 **Secure by Design**: Built-in strong password validation and Row Level Security (RLS).
- 📦 **Universal Renderer**: A zero-dependency Vanilla JS SDK to embed your forms on *any* website (React, Vue, Angular, or plain HTML).
- 📊 **Developer Friendly**: Export clean JSON schemas or framework-specific code snippets.

---

## 🛠️ Tech Stack

- **Frontend**: Angular 21 (Signals, Standalone Components, Reactive Forms)
- **Styling**: Tailwind CSS + Custom Vanilla CSS Variables
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Testing**: Vitest + JSDOM
- **Build System**: Angular Application Builder (Vite-based)

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/formcraft.git
   cd formcraft
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Setup Environment:
   Create `src/environments/environment.ts` and add your Supabase credentials:
   ```typescript
   export const environment = {
     production: false,
     supabaseUrl: 'YOUR_SUPABASE_URL',
     supabaseKey: 'YOUR_SUPABASE_ANON_KEY'
   };
   ```
4. Run the development server:
   ```bash
   npm start
   ```

---

## 🧩 The Renderer SDK

Want to use your FormCraft forms on another site? Use our standalone renderer:

```html
<!-- Include the SDK -->
<script src="https://cdn.jsdelivr.net/gh/your-username/formcraft-renderer@latest/src/renderer.js"></script>

<!-- Render your form -->
<div id="form-root"></div>
<script>
  FormCraft.render({
    target: '#form-root',
    formId: 'your-form-uuid',
    onSubmit: (data) => console.log('Form Submitted:', data)
  });
</script>
```

---

## 🧪 Testing

We take stability seriously. Run the comprehensive test suite with:
```bash
npm test
```

---

## 📜 License
Distributed under the **MIT License**. See `LICENSE` for more information.

## 🤝 Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

---

Developed with ❤️ by [Dhruv Anand](https://github.com/dhruvanand214)
