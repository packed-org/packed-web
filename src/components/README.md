# 📁 components

Esta pasta abriga os **componentes de UI globais e reutilizáveis** (também conhecidos como *Design System* básico ou componentes atômicos).

## 📝 O que colocar aqui:
* **Componentes primitivos genéricos:** Botões, inputs, modais, tooltips, cards genéricos e elementos de layout base.
* **Componentes agnósticos:** Elementos que não possuem regras de negócio vinculadas — eles apenas recebem propriedades (`props`) e renderizam a UI.

> **Boa prática:** Se um componente for específico de uma tela ou regra de negócio (ex: `UserAvatarProfileCard`), ele deve pertencer à pasta `features/` correspondente.