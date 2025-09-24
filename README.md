# Lista de Tarefas (To-Do List)

Este é um projeto de lista de tarefas desenvolvido com [Next.js](https://nextjs.org), uma aplicação web moderna para gerenciamento de tarefas diárias.

## Sobre o Projeto

Esta aplicação permite que usuários criem, editem, marquem como concluídas e excluam tarefas de forma intuitiva. Foi desenvolvida utilizando React e Next.js para proporcionar uma experiência rápida e responsiva.

### Funcionalidades
- ✅ Adicionar novas tarefas
- ✅ Marcar tarefas como concluídas
- ✅ Editar tarefas existentes
- ✅ Excluir tarefas
- ✅ Interface limpa e responsiva

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- npm, yarn, pnpm ou bun (gerenciador de pacotes)

## Como Executar o Projeto

### Primeira vez rodando o projeto:

1. **Clone o repositório ou faça download dos arquivos**

2. **Instale as dependências:**
```bash
npm install
# ou
yarn install
# ou
pnpm install
# ou
bun install
```

3. **Execute o servidor de desenvolvimento:**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. **Abra o navegador:**
   Acesse [http://localhost:3000](http://localhost:3000) para visualizar a aplicação.

## Estrutura do Projeto

```
to_do/
├── src/
│   └── app/
│       ├── page.js        # Página principal da aplicação
│       ├── layout.js      # Layout base
│       └── globals.css    # Estilos globais
├── public/                # Arquivos públicos (imagens, etc.)
├── package.json          # Dependências do projeto
└── README.md            # Este arquivo
```

## Tecnologias Utilizadas

- **Next.js 15** - Framework React para produção
- **React 19** - Biblioteca JavaScript para construção de interfaces
- **CSS Modules** - Para estilização componentizada
- **JavaScript** - Linguagem de programação principal

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria a versão de produção
- `npm run start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter para verificar o código

## Contribuindo

Sinta-se à vontade para contribuir com melhorias para este projeto!

## Licença

Este projeto está sob licença MIT.
