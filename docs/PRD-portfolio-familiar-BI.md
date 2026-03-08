# PRD — App de Gestão de Portfólio Familiar com foco em BI

## 1) Resumo executivo
Aplicação web (experiência semelhante a app) para gestão manual de portfólio familiar, com forte foco em Business Intelligence, visualização moderna e privacidade.

- **Sem integração automática com brokers/APIs** no MVP.
- Input por **formulários** e **importação de CSV/XLSX**.
- Prioridades: custo recorrente ~zero, segurança forte, simplicidade, qualidade visual e base de dados robusta para evolução.

## 2) Objetivo do produto
Ser o ponto central de confiança para acompanhar património investido familiar com histórico e análise.

Necessidades-chave:
1. Valor atual do património.
2. Total investido ao longo do tempo.
3. Ganhos/perdas absolutos e percentuais.
4. Concentração por owner, conta, classe, moeda, estratégia e período.
5. Dashboards/gráficos de apoio à decisão.
6. Inserção/correção de dados simples e rápida.

## 3) Visão do produto
Cockpit financeiro pessoal/familiar, premium, privado e orientado a insights.

## 4) Perfis de utilizador
- **Principal:** responsável financeiro da família.
- **Secundário:** utilizadores autorizados para consulta (edição numa fase futura).

## 5) Princípios orientadores
1. Privacidade por defeito.
2. Manual-first.
3. BI-first.
4. Simplicidade operacional.
5. Design premium e limpo.
6. Escalabilidade funcional.

## 6) Objetivos e métricas
### Utilizador
- Centralizar portfólio.
- Visibilidade histórica.
- Análise de alocação/performance/income.
- Reduzir tempo de atualização.
- Substituir Excel disperso.

### Produto
- Base de dados financeira fiável.
- Dashboards legíveis.
- Atualização recorrente simples.
- Segurança e privacidade.

### Indicadores de sucesso
- Novo movimento em <30s.
- Import spreadsheet em <3 min.
- Estado do portfólio entendido em <15s após login.
- Zero perda de dados em uso normal.
- Zero exposição sem autenticação válida.

## 7) Âmbito funcional do MVP
1. **Autenticação:** password mestra, sessão protegida, auto-lock por inatividade.
2. **Estrutura base:** CRUD owners, accounts, assets e classificações.
3. **Movimentos:** compra, venda, depósito, levantamento, dividendo, juro, fee, ajuste.
4. **Preços:** inserção manual, atualização em lote, histórico.
5. **Importação:** CSV/XLSX, mapeamento, validação, erros por linha, confirmação explícita.
6. **Dashboards:** executivo, evolução, alocação, posições, movimentos, performance, income.
7. **Backup/restore:** exportação/importação de backup e restauro.

## 8) Fora de âmbito do MVP
- Integrações com brokers.
- Preços automáticos.
- Colaboração real-time.
- Apps nativas iOS/Android.
- Fiscalidade avançada.
- Alertas push/email.
- Rebalanceamento automático.

## 9) Requisitos funcionais detalhados
### 9.1 Entidades nucleares
- Owner
- Account
- Asset
- Transaction
- PriceHistory
- FXRate (já no modelo técnico, mesmo opcional em UI)

### 9.2 Gestão de ativos
Campos mínimos: nome, ticker/identificador, ISIN, tipo, moeda, categoria estratégica, conta opcional, notas, estado (ativo/arquivado).

Regras:
- Edição de metadados a qualquer momento.
- Bloqueio de duplicados exatos por combinação configurável.
- Ativo pode existir sem preço histórico.

### 9.3 Gestão de movimentos
Campos mínimos: data, tipo, owner, account, asset (quando aplicável), quantidade, preço unitário, total, moeda, fee, notas, referência externa (opcional).

Regras:
- Venda não pode exceder quantidade disponível (sem short no MVP).
- Compras/vendas atualizam posição.
- Dividendos/juros alimentam income.
- Fees associadas ao movimento ou separadas.
- Movimentos editáveis/anuláveis.

### 9.4 Gestão de preços
Regras:
- Máximo 1 preço por ativo+data+moeda.
- Aviso ao substituir preço existente.
- Valor histórico usa último preço válido até à data.

### 9.5 Importação
Capacidades: upload, pré-visualização, mapeamento, validação, erros/avisos visuais, confirmação, relatório final.

Validações mínimas:
- Datas/numéricos válidos.
- Owners/accounts/assets em falta sinalizados.
- Opção para criação automática de entidades em falta.
- Prevenção de duplicados por alta confiança.

### 9.6 Dashboard (BI-first)
KPIs topo:
- Valor total atual.
- Investido acumulado.
- Ganho/perda total.
- Rentabilidade total (%).
- Cash disponível.
- Income acumulado.

Widgets:
- Evolução temporal.
- Investido vs atual.
- Alocação por classe.
- Alocação por owner.
- Alocação por conta.
- Top posições.
- Maiores ganhos/perdas.
- Income mensal.

Interação:
- Widgets clicáveis para drill-down.
- Filtros por owner, conta, ativo, categoria, moeda e período.

## 10) Design e UX
- Interface limpa, moderna e premium.
- Forte hierarquia visual.
- Componentes: KPI cards, line/bar/donut, tabelas com filtros, drawer/modal, stepper de importação, empty states, toasts.
- Navegação: sidebar desktop, menu mobile, header com filtros e pesquisa.

## 11) Segurança
Obrigatório:
- Dados cifrados antes de persistência local.
- Password mestra no primeiro acesso.
- Sessão com lock/unlock.
- Timeout configurável.
- Lock manual.
- Backups cifrados.
- Sem logs com dados financeiros em claro.
- Sem envio desnecessário a terceiros.

## 12) Arquitetura técnica
- PWA local-first.
- Frontend estático + IndexedDB cifrada.
- Sem backend no MVP.
- Schema versionado e migrações.

## 13) Modelo de dados conceptual
Entidades com timestamps `createdAt/updatedAt`:
- Owner(id, name, type, notes)
- Account(id, name, institution, type, baseCurrency, owner relation, notes)
- Asset(id, name, ticker, isin, assetType, currency, strategyCategory, riskCategory, tags, notes, isArchived)
- Transaction(id, date, type, ownerId, accountId, assetId, quantity, unitPrice, grossAmount, feeAmount, netAmount, currency, notes, externalRef)
- PriceHistory(id, assetId, date, price, currency, sourceType, notes)
- FXRate(id, fromCurrency, toCurrency, date, rate)

## 14) Regras de cálculo analítico
- Posição atual = soma algébrica de quantidades por ativo.
- Valor atual = quantidade atual × último preço válido até à data.
- Income = dividendos + juros.
- Ganho/perda e rentabilidade com definição explícita e transparente no MVP.

## 15) Reporting e exportação
MVP obrigatório:
- Export posições (CSV).
- Export movimentos (CSV).
- Export backup completo cifrado.

## 16) Acessibilidade e performance
- Contraste, tipografia legível, foco visível, navegação por teclado.
- Navegação fluida, filtros rápidos, import sem congelamentos, tabelas eficientes.

## 17) Observabilidade e manutenção
- Código modular.
- Separação UI/domínio/persistência.
- Testes críticos de cálculos/import/backup/lock.
- Documentação mínima de arquitetura e dados.

## 18) Backlog recomendado
- Epic 1: segurança e fundações.
- Epic 2: CRUD base.
- Epic 3: movimentos.
- Epic 4: preços.
- Epic 5: dashboard BI.
- Epic 6: importação.
- Epic 7: backup/exportação.

## 19) Critérios de aceitação de alto nível
1. Estrutura de portfólio criada sem apoio externo.
2. Registo manual de movimentos/preços funcional.
3. Importação com validação clara.
4. Dashboard com valor total, evolução, alocação e performance básica.
5. Dados protegidos por unlock válido.
6. Design moderno e orientado a BI.

## 20) Riscos e mitigação
Riscos: métricas ambíguas, modelo fraco para histórico, importação frágil, UI bonita sem utilidade analítica, falhas backup/restore, escopo excessivo.

Mitigação: fechar fórmulas cedo, modelo transaction-based, dry-run de importação, priorizar utilidade analítica e testar backup/restore.

## 21) Evolução futura
Fase 2: multiutilizador, sync, benchmarks, objetivos, alertas, rebalanceamento sugerido, PDF, métricas avançadas.

Fase 3: integrações de preços opcionais, automações, módulo fiscal, simulações de planeamento.
