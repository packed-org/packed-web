# 📁 @types

Esta pasta armazena todas as **tipagens globais** e interfaces TypeScript que são compartilhadas por diferentes módulos do aplicativo.

## 📝 O que colocar aqui:
* **Interfaces e Tipos globais:** Entidades de domínio (ex: `User`, `Product`, `ApiResponse`).
* **Declarações de módulos (`.d.ts`):** Sobrescritas de tipos de bibliotecas de terceiros ou extensões de arquivos estáticos (ex: SVG, CSS modules).

> **Boa prática:** Tipos que pertencem exclusivamente a uma única feature devem ficar dentro da própria pasta da feature (`src/features/[nome]/types.ts`), e não aqui.