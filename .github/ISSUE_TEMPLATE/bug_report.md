---
name: Relatório de Bug
about: Relatar um erro ou comportamento inesperado no sistema
title: '[BUG] Descrição curta do problema'
labels: 'fix'
assignees: ''
---

## 🐛 Descrição do Bug
Uma descrição clara e concisa sobre qual é o problema (ex: a rota de login está retornando 500 quando o email não tem o '@').

## 🔄 Passos para Reproduzir
Passos exatos para reproduzir o comportamento:
1. Fazer uma requisição `POST` para a rota `/api/v1/...`
2. Enviar o seguinte payload (JSON): `{ ... }`
3. Observar o erro retornado.

## ✅ Comportamento Esperado
O que o sistema deveria ter feito ou qual status HTTP deveria ter retornado (ex: deveria retornar `400 Bad Request` com a mensagem de validação).

## ❌ Comportamento Atual
O que aconteceu de errado no lugar do esperado.

## 📸 Evidências (Logs, Payloads ou Prints)
Cole aqui os logs de erro do terminal, o corpo da resposta da API ou capturas de tela que ajudem a diagnosticar a falha.

## 🖥️ Ambiente e Contexto
- **Repositório:** packed-api
- **Branch/Versão:** [ex: main, feature/auth]
- **Sistema Operacional:** [ex: Windows 11, Ubuntu 22.04]
