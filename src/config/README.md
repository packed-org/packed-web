# 📁 config

Esta pasta centraliza todas as **configurações globais, constantes e mapeamentos de ambiente** da aplicação.

## 📝 O que colocar aqui:
* **Variáveis de Ambiente:** Exportações tratadas do `import.meta.env` (ex: `env.ts` com validação usando Zod/TypeScript).
* **Constantes Globais:** Valores fixos da aplicação (ex: nomes de chaves de storage, limites de upload, URLs base).
* **Configurações de Bibliotecas:** Início/setup de bibliotecas estáticas que não dependem do ciclo de vida do React.

> **Boa prática:** Evite colocar segredos hardcoded aqui. Use o arquivo `.env` para dados sensíveis e apenas mapeie as variáveis nesta pasta.