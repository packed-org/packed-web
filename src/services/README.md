# 📁 services

Esta pasta armazena os **clientes de comunicação externa e infraestrutura** da aplicação.

## 📝 O que colocar aqui:
* **Instâncias de API:** Configuração global do cliente HTTP (Axios ou `fetch` customizado com interceptadores de token e tratamento de erros).
* **Serviços globais:** Integrações com SDKs externos (Firebase, Supabase, WebSockets globais).

> **Boa prática:** Regras de negócio de requisições específicas de telas devem ficar nos `services/` dentro de suas respectivas `features/`.