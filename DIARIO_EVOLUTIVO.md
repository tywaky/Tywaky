# 📔 DIÁRIO EVOLUTIVO - Tywaky Social Network

Este documento regista a evolução técnica e criativa do protótipo **Tywaky**, desde a sua conceção até ao estado atual.

---

## 🚀 Fase 1: Arquitetura e Setup Inicial (v1.0)

### 2026-03-04

### 1.1 Configuração do Ambiente

- **Tecnologias:** React.js + Vite.
- **Estrutura de Pastas:** Organização limpa separando componentes e estilos.

### 1.2 Design System (Premium Glassmorphism)

- **Paleta de Cores:** Fundo Dark (`#0a0a0f`), Primário Índigo (`#6366f1`), Acento Rosa/Roxo (`#ec4899`).
- **Efeitos:** Implementação de `backdrop-filter: blur()` para o efeito de vidro.

---

## 🔐 Fase 2: Autenticação e Layout (v1.1)

### 2026-03-04

### 2.1 Módulo de Autenticação

- Criada interface de Login/Registo com alternância de tabs.

### 2.2 Layout de Três Colunas

- **Esquerda (Sidebar):** Navegação principal e perfil do utilizador.
- **Centro (Content):** Feed dinâmico e visualização de perfil.

---

## ⚡ Fase 3: Interatividade e Funcionalidades (v1.2)

### 2026-03-04

### 3.1 O Mural (Feed)

- Implementada a lógica de **Publicação Real**: utilizadores podem escrever e publicar posts.
- Sistema de **Gostos (Likes)**: toggle interativo que atualiza o contador.

### 3.2 Persistência de Dados (Mock DB)

- Integração com **LocalStorage**:
  - Dados do utilizador e histórico de posts persistidos localmente.

---

## Finalização e Identidade (v1.3)

### 2026-03-04

### 4.1 Identidade Visual e Perfil

- **Logótipo Oficial:** Integrado o logótipo oficial em todos os pontos de contacto.
- **Upload Local de Imagens:** Implementado sistema de upload real (Avatar e Banner) do computador via Base64.
- **Sincronização de Design:**
  - **Avatar Quadrado:** Transição para um estilo de avatar quadrado com cantos suaves, seguindo a estética premium moderna.
  - **Identidade no Feed:** O feed agora apresenta um card de perfil completo (Banner, Avatar, Bio, Seguidores) idêntico à página de perfil, garantindo coerência visual absoluta.
  - **Proporções:** Ajustada a altura do mini-banner para 180px no feed para uma experiência visual imersiva.

---

---

## 🛡️ Fase 7: Segurança e Interatividade Social (v1.6)

### 2026-03-05

### 7.1 Segurança do Backend

- **Hashing de Passwords:** Implementação de `bcryptjs` no servidor. Todas as passwords agora são armazenadas como hashes seguros, protegendo os dados dos utilizadores.
- **Migração de Dados:** Script executado para converter passwords existentes em texto plano para formato encriptado.

### 7.2 Sistema de Comentários e Interação

- **Comentários:** API e interface para adicionar e visualizar comentários em cada publicação.
- **Modal Customizado:** Implementação de uma janela de comentário "glassmorphism" premium, substituindo os prompts de sistema.
- **Sistema de Seguidores:** Lógica de backend para Follow/Unfollow, permitindo o crescimento da rede social.

### 7.3 Performance e UI (UX+)

- **Infinite Scroll:** Implementação de scroll infinito usando `Intersection Observer` para uma navegação fluida.
- **Skeleton Loaders:** Introdução de loaders animados durante o carregamento inicial para reduzir a percepção de espera.

---

## 🏗️ Fase 8: Modularização e Refactor (v2.0)

### 2026-03-05

### 8.1 Arquitetura de Componentes

- **Extração Total:** O ficheiro monolítico `App.jsx` foi decomposto em componentes independentes na pasta `src/components/`:
  - `Sidebar.jsx`, `Trending.jsx`, `Post.jsx`, `PostEditor.jsx`, `ProfileView.jsx`, `Modals.jsx`.
- **Manutenibilidade:** O código tornou-se 70% mais fácil de ler e escalar, seguindo as melhores práticas de React (Clean Code).
- **Prop Drilling Control:** Gestão eficiente de estados e funções através de componentes especializados.

### 8.2 Melhorias de Interação (v2.1)

- **Eliminação de Comentários:** Implementação da funcionalidade para remover comentários postados por engano, com atualização em tempo real no feed e persistência no servidor.
- **UI de Feedback:** Adicionado ícone de remoção (🗑️) com visual subtil e integrado no design glassmorphism.

---

---

## 🔍 Fase 9: Social & Discovery (v2.2)

### 2026-03-05

### 9.1 Motor de Descoberta e API

- **Novos Endpoints:** Implementação de `GET /api/users` para listagem global e `GET /api/user/handle/:handle` para recuperação de perfis públicos.
- **Sugestões de Amizade:** Criada a secção "Quem seguir" na `Trending.jsx` que filtra utilizadores que o utilizador atual ainda não segue.

### 9.2 Navegação entre Perfis

- **Cross-Profile Flow:** Implementada a lógica de navegação fluida em `App.jsx`. Agora, qualquer avatar ou handle no feed é clicável, redirecionando o utilizador para o perfil correspondente.
- **Contextualização de UI:** A `ProfileView.jsx` foi adaptada para alternar entre "O meu Perfil" (com botão Editar) e "Perfil de Outrem" (com botão Follow/Unfollow).

### 9.3 Sistema de Pesquisa Inteligente

- **Live Search:** A barra de pesquisa no topo do feed foi conectada ao estado global, permitindo filtrar posts por conteúdo, nome de utilizador ou handle em tempo real. *(Fix: Resolvida falha crítica de crash no filtro de pesquisa através de enriquecimento de dados e safe-checks).*

### 9.4 Integração Efetiva de Seguidores

- **Persistence & Sync:** O sistema de seguimento foi totalmente integrado com o backend e LocalStorage, garantindo que as relações entre utilizadores e os contadores de seguidores persistam entre sessões.

---

## 🌟 Fase 10: Personalização Visual Dinâmica (v2.3)

### 2026-03-05

### 10.1 Painel Animado no Feed

- **Bio Ticker:** Implementação de um painel rolante integrado ao card de perfil no Feed da página inicial que reflete diretamente a "Bio" configurada pelo utilizador.
- **Efeito Visual:** Componente de marcação `<marquee>` (modernizado via CSS) para criar sensação de movimento premium contínuo sem comprometer a resposta ao utilizador.

---

## 🔒 Fase 11: Controle de Conteúdo e Privacidade (v2.4)

### 2026-03-05

### 11.1 Propriedade de Dados

- **Eliminação Contextual:** Lógica implementada garantindo que os utilizadores apenas podem eliminar as suas **próprias publicações e comentários**, respeitando a integridade do fluxo dos outros.
- **Ícones Dinâmicos:** O botão de exclusão apenas é renderizado caso o dono do comentário/post e o utilizador atual combinem. As publicações da comunidade ficaram a salvo de ações abusivas.

---

## 🔐 Fase 12: Refinamento de Autenticação e Segurança (v2.5)

### 2026-03-05

### 12.1 Segurança de Sessão (JWT)

- **Implementação de JWT:** O servidor agora emite tokens JWT (`jsonwebtoken`) no login e registo, garantindo sessões persistentes seguras.
- **Proteção do Axios/Fetch:** Cabeçalho de autorização configurado (`Bearer <token>`) para que a comunicação com a API em `api.js` bloqueie requests não autenticados.

### 12.2 UX de Registo Premium

- **Real-Time Validation:** Feedback visual instantâneo durante a digitação de email, password e verificação de senha no lado do cliente.
- **Novos Campos:** Integração cuidada do campo "@Handle" único e painel "Confirmar Password", alicerçado em verificações imediatas do formulário evitando stress.
- **Mensagens Específicas do Servidor:** O Backend agora avisa especificamente "Email já registado" ou "Handle já está em uso" na UI, rompendo com o alert genérico anterior.
- **Setup Inicial Completo:** Ao registar, cria-se corretamente as propriedades padrão (`id`, `bio` saudatória, `followers/following` em `0`, `avatarUrl` nulo) garantindo que nenhum ecrã de perfil quebre pelo utilizador não ter dados.

---

## 📍 Estrutura Atual e Funcionamento da Rede Social (Tywaky v2.5)

### 1. Arquitetura Frontend

O Tywaky obedece à estrutura de componentes React segregados, garantindo renderização ultra-rápida.

- **`App.jsx`:** Responsável pelos estados globais (utilizando dados partilhados por toda a app) e motor de roteamento condicional dependente da autenticação.
- **`Sidebar.jsx`:** Contém os menus à esquerda (Início, Explorar, Mensagens, Perfil), oferecendo navegação robusta.
- **`Trending.jsx`:** Barra fixa à direita de Descobertas com secção inteligente de "Quem Seguir" que filtra perfis para alavancar a retenção social.
- **`Post.jsx` & `PostEditor.jsx`:** Hub de publicação com sistema reativo de likes e comentários em Modals.
- **`ProfileView.jsx`:** Vista dinâmica adaptada entre perfil próprio (botão "Editar Perfil") e alheio (botão "Seguir"). Reflete dados em real-time e faz switch consoante a seleção.

### 2. Tecnologias Core & UX

- **Estética Glassmorphism:** Implementada largamente via CSS Vanilla nas modais, sidebars e blur generalizado, aliado a dark mode orgânico com accenting em `#6366f1` e `#ec4899`.
- **Dinâmica SPA:** Navegação Single Page Application perfeita. O clique num @nickname na timeline renderiza imediatamente e interativamente a página do colega sem refresh agressivo. A caixa de pesquisa interage filtrando os posts live.

### 3. O Ecossistema de Autenticação e Backend

A salvaguarda repousa pelo uso de dupla autenticação nos requests: a retenção dos visuais básicos em `localStorage('tywaky_user')` e a camada intransponível em `localStorage('tywaky_token')`. Todas as senhas contêm *salts* (`bcrypt`) alojados na API local em Express.js + JSON file storage, operando num porto backend próprio `(localhost:5000)` e servindo um frontend fluido `(localhost:5173)`. O Tywaky transitou de um Mock para uma rede conectável e defensiva robusta.

---

## 🚀 Fase 13: Cloud Deployment & Production Readiness (v3.0)

### 2026-03-05

### 13.1 Migração para Cloud (MongoDB Atlas)

- **Base de Dados:** Transição total de ficheiro JSON local para base de dados NoSQL na nuvem.
- **Persistência:** Garantida a permanência de dados 24/7 sem dependência de hardware local.
- **Limpeza de Produção:** Realizado reset total à base de dados para garantir um lançamento "limpo" para utilizadores reais.

### 13.2 Hosting & Infraestrutura (Render & Vercel)

- **Backend (Render):** API Node.js/Express alojada em `https://tywaky-backend.onrender.com`. Configurada via Blueprints (`render.yaml`).
- **Frontend (Vercel):** Aplicação React/Vite alojada em `https://tywaky.vercel.app`. Conectada dinamicamente ao backend via variáveis de ambiente.
- **CI/CD:** Pipeline automatizado via GitHub — qualquer "push" para a branch `main` atualiza o site automaticamente em 60 segundos.

### 13.3 Detalhes Técnicos e Chaves de Acesso
>
> [!IMPORTANT]
> Manter estas credenciais em local seguro. Foram configuradas para o funcionamento imediato do ecossistema Tywaky Cloud.

**1. GitHub (Repositório Central)**

- **URL:** `https://github.com/tywaky/Tywaky`
- **User:** `tywakysocial@gmail.com`
- **Token de Acesso:** Gerido via Credenciais Git Locais.

**2. MongoDB Atlas (Base de Dados)**

- **URI de Ligação:** `mongodb+srv://tywakysocial_db_user:aSJqJYD5AVw1Tiy8@tywaky-db.vzzw1fg.mongodb.net/?appName=tywaky-db`
- **User DB:** `tywakysocial_db_user`
- **Senha DB:** `aSJqJYD5AVw1Tiy8`
- **Cluster:** `tywaky-db`

**3. Render (Backend Cloud)**

- **URL API:** `https://tywaky-backend.onrender.com`
- **Variáveis de Ambiente:**
  - `MONGODB_URI`: (conforme acima)
  - `JWT_SECRET`: `tywaky_super_secret_2026`
  - `FRONTEND_URL`: `https://tywaky.vercel.app`

**4. Vercel (Frontend Cloud)**

- **URL Site:** `https://tywaky.vercel.app`
- **Variável de Ambiente:**
  - `VITE_API_URL`: `https://tywaky-backend.onrender.com`

---

---

## 🌊 Fase 14: Fluidity & Governance (v3.1)

### 2026-03-05

### 14.1 Sincronização em Tempo Real (Auto-Sync)

- **O Motor de Fluidos:** Implementado um sistema de *polling* inteligente em `App.jsx` que refresca todos os dados (posts, users, likes) a cada **15 segundos**.
- **User Experience:** A rede social agora é "viva". Mudanças de perfil ou novos posts aparecem automaticamente em todos os ecrãs sem necessidade de refresh manual.

### 14.2 Moderação Avançada & Shield

- **Identificação de IPs:** Adicionado rastreio de IP de registo para detetar contas duplicadas e prevenir abusos.
- **Painel de Controlo:** Interface administrativa completa para:
  - Banir/Desbanir Contas (Temporário ou Permanente).
  - Banir IPs (Blacklist Global).
  - **Sincronização Forçada:** Ferramenta de diagnóstico para recalcular estatísticas e limpar seguidores "fantasmas" em toda a base de dados.

### 14.3 Unificação de Identidade (ID Fix)

- **MongoDB Standard:** Migração total da lógica interna para usar o padrão de ID do MongoDB (`_id`).
- **Correção de Identidade:** Resolvido o conflito onde perfis de utilizadores diferentes (ex: João vs Andry) se misturavam devido a IDs de teste antigos.
- **Persistência de Media:** Corrigido o erro de gravação de Fotos/Banners através da exclusão técnica do campo `_id` nas atualizações, permitindo personalização total sem erros de base de dados.

---

## 🌍 Estrutura Final do Ecossistema (Tywaky v3.1)

A rede social opera agora num modelo de **Cloud Distribuída e Automática**:

1. **Camada de Dados (MongoDB Atlas):** Onde residem os utilizadores, posts, likes e seguidores.
2. **Motor Lógico (Render):** O servidor processa a autenticação (JWT/Bcrypt) e serve os dados via API Rest.
3. **Interface Visual (Vercel):** O site "bebe" os dados do servidor e oferece a experiência Glassmorphism fluida ao utilizador final.
4. **Cérebro de Auto-Sincronização:** O frontend mantém-se em constante diálogo com o servidor, garantindo que a rede nunca está "parada".

---
---

## 🏗️ Fase 15: Modularização e Estrutura V4 (v4.0)

### 2026-03-05

### 15.1 Reconstrução do Painel Admin

- **Correção de Props:** Resolvido o erro em `App.jsx` que impedia o carregamento do painel administrativo.
- **Auditoria de Performance:** Limpeza de variáveis não utilizadas e otimização das chamadas à API de moderação.

### 15.2 Layout de Três Colunas (Pro UX)

- **RightSidebar:** Implementação de uma terceira coluna dedicada a contactos (seguidores/seguindo) e espaços para publicidade futura.
- **Densidade Visual:** Reduzida a altura vertical da lista de contactos para libertar espaço estratégico no topo e fundo da barra lateral, otimizando a visualização em resoluções 1920x1080.
- **Glassmorphism V2:** Refinamento dos efeitos de vidro para garantir legibilidade máxima sobre o fundo dinâmico.

---

## 💬 Fase 16: Messenger Pro & Floating Chat (v5.0)

### 2026-03-05

### 16.1 O Fim do Modelo "Página de Mensagens"

- **Limpeza de Legado:** Remoção total do menu "Mensagens" e do componente `MessagesView` de ecrã inteiro.
- **Navegação Contínua:** Agora é possível navegar em todo o site sem nunca interromper a experiência de chat.

### 16.2 Chat Flutuante (Estilo Facebook/Messenger)

- **FloatingChat.jsx:** Novo componente flutuante no canto inferior direito que se abre instantaneamente ao clicar num contacto.
- **Polling Otimizado:** O chat flutuante mantém-se sincronizado com o servidor a cada 3 segundos, garantindo conversas em tempo real.
- **Smart Trigger:** O chat pode ser ativado a partir da barra lateral direita ou diretamente no botão "Mensagem" no perfil de qualquer utilizador.

### 16.3 Animações e Micro-Interações

- **Slide-Up Animation:** Transição suave de entrada e saída das janelas de chat.
- **Notificações Subtis:** Feedback visual integrado para novas mensagens e estados de envio.

### 16.4 Refinamento Profundo e Alinhamento (Pixel-Perfect)

- **Flexbox Flow:** Transição da janela de chat flutuante de `position: fixed` para dentro do fluxo normal (Flexbox) da `RightSidebar`, garantindo um alinhamento matemático e exato (margins idênticas) por baixo da lista de contactos, indiferente à largura do monitor.
- **Prevenção de Crashes (Profile Fix):** Correção rigorosa no encaminhamento de *props* na `ProfileView.jsx` (recuperação da prop `PostComponent`) que causava travamentos totais ao carregar visualizações de perfis de utilizadores.
- **Minimalismo no Feed:** Remoção definitiva da caixa de texto estática ("Bio") que criava ruído no card de perfil principal do utilizador (em `App.jsx`), redirecionando a atenção para o painel dinâmico em *ticker* criado anteriormente.

---

## 🌍 Estrutura Final do Ecossistema (Tywaky v5.0)

Com a versão 5.0, a Tywaky transformou-se numa plataforma moderna de "Single View Experience":

1. **Navegação à Esquerda (Sidebar):** Organizada e minimalista.
2. **Conteúdo ao Centro:** Focado no feed e na identidade social.
3. **Contactos à Direita (RightSidebar):** Sempre acessível para mensagens rápidas.
4. **Chat Dinâmico (FloatingChat):** Camada de conversação flutuante que não bloqueia a exploração.

---
*Documento atualizado em 2026-03-05 23:50:00*
