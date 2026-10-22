### 5. `src/platform/README.md`
```markdown
# 📁 platform

Esta é a **camada de abstração de plataforma**. O objetivo desta pasta é isolar códigos específicos de ambiente (Web PWA, Desktop App, ou Capacitor Mobile) para que o restante da aplicação não precise lidar com condicionais de plataforma.

## 📂 Subpastas:
* **`capacitor/`**: Configurações, plugins nativos (câmera, haptics, status bar) e inicializações do app mobile.
* **`pwa/`**: Lógica de registro de Service Worker, detecção de modo offline/online e prompts de instalação.
* **`storage/`**: Adaptador unificado de armazenamento (alterna dinamicamente entre `localStorage` na Web e `Capacitor Preferences` no Mobile).