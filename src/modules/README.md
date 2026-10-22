# 📁 modules

Esta pasta contém os **módulos de domínio da aplicação** (Domain-Driven Architecture). Cada subpasta aqui representa uma funcionalidade ou fluxo completo do PACKED.

## 📂 Módulos Atuais:
* **`auth/`**: Autenticação e gestão de conta (Splash, Login, Cadastro, Perfil).
* **`trips/`**: Gestão e planejamento de viagens (Listagem, Nova viagem).
* **`packing/`**: Organização e recomendações de bagagem (Checklist da mala, Insights).

## 📝 Estrutura Interna Recomendada para um Módulo:
```text
src/modules/nome-do-modulo/
├── components/    # Componentes exclusivos do módulo
├── hooks/         # Hooks com regras de negócio do módulo
├── pages/         # Telas/Páginas acessadas pelas rotas
├── services/      # Chamadas de API específicas do módulo
├── types/         # Tipagens específicas do módulo
└── index.ts       # Ponto de exportação pública do módulo