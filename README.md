# PD Hours Control

Documentação do desafio técnico da PD Soluções para controle de horas por squad.

## Visão Geral

O projeto foi desenvolvido em duas aplicações:

- `server/`: API REST em C# com arquitetura em camadas (API, Application, Domain, Infra.Data).
- `client/PDHours/`: frontend em Angular para visualização e cadastro de dados.

O sistema permite:

- Cadastro de `Squads`;
- Cadastro de `Employees` vinculados a uma squad;
- Cadastro de `Reports` de horas por colaborador;
- Consulta de horas por membro em um período;
- Consulta de total de horas da squad;

## Tecnologias Utilizadas

#### Backend

- .NET `10.0` (`net10.0`)
- ASP.NET Core Web API
- Entity Framework Core `10.0.3`
- Npgsql EF Core Provider `10.0.0`
- Swagger (Swashbuckle `6.6.2`)
- OData (`Microsoft.AspNetCore.OData` `9.4.1`)

#### Frontend

- Angular `21.2`
- TypeScript `5.9`
- SCSS
- Angular Material/CDK
- RxJS `7.8`

#### Banco de Dados

- PostgreSQL v18

## Requisitos do Desafio e Cobertura

Requisitos do PDF `PD Hours.pdf`:

1. Módulo de Employees (`id`, `name`, `estimatedHours`, `squadId`)  
2. Módulo de Squads (`id`, `name`)  
3. Módulo de Reports (`id`, `description`, `employeeId`, `spentHours`, `createdAt`)  
4. Rotas para cadastro de Employee, Squad e Report  
5. Rota de horas gastas por membro em período  
6. Rota de total de horas por squad em período  
7. Rota de média diária por squad em período  
8. Front baseado no protótipo Figma  

Cobertura implementada:

- Cadastros de `Squad`, `Employee` e `Report`: **implementado**
- Validação de chave estrangeira (`squadId` existente e `employeeId` existente): **implementado**
- `createdAt` automático no report (banco): **implementado** (`Created_At` com `CURRENT_TIMESTAMP`)
- Horas por membro no período: **implementado**
- Total de horas da squad: **implementado** (rota atual sem filtro de período)
- Média diária da squad no período: **implementado**
- Front com telas principais de listagem/detalhes/cadastro: **implementado**

## Estrutura do Projeto

```text
PDHours/
  client/PDHours/                 # Angular
  server/                         # .NET 10
    PDHours.API/                  # Controllers, Program, Swagger
    PDHours.Application/          # DTOs, Services, Interfaces
    PDHours.Domain/               # Entidades de domínio
    PDHours.Infra.Data/           # EF Core, DbContext, Repositories, Migrations
```

## Como Rodar o Projeto

#### Pré-requisitos

- .NET SDK 10 instalado
- Node.js + npm
- PostgreSQL rodando localmente

#### 1) Configurar banco de dados

Connection string padrão em `server/PDHours.API/appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Username=<USER>;Password=<PASSWORD>;Database=PDHours"
  }
}
```

Ajuste usuário/senha conforme seu ambiente.

#### 2) Aplicar migrations

No diretório raiz:

```bash
dotnet ef database update --project server/PDHours.Infra.Data --startup-project server/PDHours.API
```

#### 3) Subir a API

```bash
dotnet run --project server/PDHours.API
```

API local:

- `https://localhost:7185`
- Swagger: `https://localhost:7185/swagger`

#### 4) Subir o frontend

Em outro terminal:

```bash
cd client/PDHours
npm install
npm start
```

Frontend local:

- `http://localhost:4200`

## Frontend (Telas)

Rotas da aplicação Angular:

- `/EmployeeDataView`: listagem de colaboradores + cadastro de colaborador e squad
- `/Squad/DataView`: listagem de squads + cadastro de squad
- `/Squad/Details/:id`: detalhes da squad, total de horas, média diária e última atividade por membro

Integração principal (service):

- Base URL API: `https://localhost:7185`
- Arquivo: `client/PDHours/src/app/core/services/data-view.service.ts`

Uso de OData no front:

- O frontend usa OData na consulta de reports (filtro e ordenação) para evitar criação de endpoint dedicado quando não é viável ampliar a API.
- Esse modelo permite transferir para o frontend a responsabilidade de filtragem em cenários de tela que exigem composição dinâmica de dados.
- Exemplo atual: busca do último report por colaborador usando `/Report?$filter=...&$orderby=...`.

## Documentação das APIs

Base URL local: `https://localhost:7185`

## Employees

### POST `/Employee`

Cria um colaborador.

Request:

```json
{
  "name": "Joao",
  "estimateHours": 8,
  "squadId": 1
}
```

Respostas:

- `201 Created`
- `400 BadRequest` (ex.: squad não existe)

### GET `/EmployeeDataView`

Lista colaboradores com os campos de tabela na aba de Usuários.

Resposta exemplo:

```json
[
  {
    "name": "Joao",
    "estimateHours": 8,
    "squadId": 1
  }
]
```

## Squads

### POST `/Squad`

Cria uma squad.

Request:

```json
{
  "name": "Plataforma"
}
```

Respostas:

- `201 Created`
- `422 UnprocessableEntity` (nome não informado)

### GET `/Squad/DataView`

Lista squads com os campos de tabela na aba de Squads.

Resposta exemplo:

```json
[
  {
    "id": 1,
    "name": "Plataforma"
  }
]
```

### GET `/Squad/{id}`

Retorna detalhes da squad pelo ID.

### GET `/Squad/MemberDetails?id={squadId}&startDate={yyyy-MM-dd}&endDate={yyyy-MM-dd}`

Retorna horas totais por membro da squad no período.

Resposta exemplo:

```json
[
  {
    "employeeId": 5,
    "name": "Joao",
    "totalHours": 24
  }
]
```

### GET `/Squad/MemberReportsTotalHours?id={squadId}`

Retorna total de horas da squad.

Resposta exemplo:

```json
{
  "squadId": 1,
  "totalHours": 80
}
```

### GET `/Squad/DailyAverage?id={squadId}&startDate={yyyy-MM-dd}&endDate={yyyy-MM-dd}`

Retorna média diária de horas da squad no período.

Resposta exemplo:

```json
{
  "squadId": 1,
  "name": "Plataforma",
  "averageHoursPerDay": 6.67
}
```

## Reports

### POST `/Report`

Cria report de atividade.

Request:

```json
{
  "description": "Implementação da tela de squads",
  "employeeId": 5,
  "spentHours": 6
}
```

Respostas:

- `201 Created`
- `400 BadRequest` (employee inexistente)

Observação: o campo de data é preenchido automaticamente no banco (`Created_At`).

### GET `/Report`

Lista reports (com suporte OData para filtros/ordenação).

Exemplo:

```http
GET /Report?$filter=EmployeeId eq 5&$orderby=Created_At desc
```

### GET `/Report/LastByEmployee/{employeeId}`

Retorna o último report do colaborador.

Observação arquitetural:

- No backend, esta rota existe apenas para variar as opções de implementação no teste técnico.
- A preferência técnica do projeto foi usar OData para consulta de reports, principalmente para expor conhecimento em filtros e ordenação dinâmica.
- A existência dela depende da definição de responsabilidades estabelecida pelos arquitetos (centralizar regra no backend vs manter parte da filtragem no frontend).
- No projeto atual, as duas abordagens estão disponíveis.

Resposta exemplo:

```json
{
  "description": "Implementação da tela de squads",
  "createdAt": "2026-03-06T14:30:00Z"
}
```

## Observações Importantes

- O backend está configurado com CORS para `http://localhost:4200` e `https://localhost:4200`.
- A API expõe Swagger em ambiente de desenvolvimento.
- O campo no domínio/DB para data do report está como `Created_At`.
- A rota `MemberReportsTotalHours` retorna total geral da squad.

## Entregáveis do Desafio

Atendendo aos requisitos:

- README com instruções de execução: **este arquivo**
- Documentação de rotas: **Swagger (`/swagger`) + seção de APIs acima**
- Repositório GitHub/GitLab: **a ser informado no envio**
- Acesso ao banco: **via string de conexão local e migrations**
