# ABC — Family Portfolio BI (MVP foundation)

Este repositório contém a base inicial da app web local-first para gestão de portfólio familiar.

## Estado atual
- ✅ PRD funcional em `docs/PRD-portfolio-familiar-BI.md`
- ✅ Protótipo funcional em frontend estático com:
  - unlock por password mestra
  - persistência local cifrada (Web Crypto + localStorage)
  - CRUD base: Owners, Accounts, Assets
  - registo de movimentos (subset MVP)
  - dashboard KPI simplificado
  - PWA base (manifest + service worker)

## Executar localmente
```bash
python3 -m http.server 8080
```
Depois abrir: `http://localhost:8080`.

## Documento de produto
- `docs/PRD-portfolio-familiar-BI.md`
