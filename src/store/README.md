# 📁 store

Esta pasta gerencia o **estado global** da aplicação (utilizando ferramentas como Zustand, Redux Toolkit ou Context API).

## 📝 O que colocar aqui:
* **Estados globais compartilhados:** Dados do usuário autenticado, tema da aplicação (Dark/Light mode), idioma, ou estados globais de UI que afetam múltiplas telas.

> **Boa prática:** Prefira manter estados locais dentro dos componentes ou hooks da feature sempre que o dado não precisar ser acessado globalmente.