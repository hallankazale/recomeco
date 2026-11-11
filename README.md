# Recomeço

Plataforma em português para explorar histórias de dívidas e simular contribuições. HTML, CSS e JavaScript estáticos; autenticação real integrada ao Supabase.

## Publicação no GitHub Pages

Envie este projeto para um repositório com branch `main`. Em Settings → Pages → Build and deployment, escolha **GitHub Actions**. O workflow publica somente `dist/`. Os caminhos relativos funcionam em subdiretórios do GitHub Pages.

## Autenticação

O projeto selecionado pelo proprietário é `pgdpjhjnzcohdixqpbsx`. `dist/auth-config.js` contém apenas a URL e a chave publicável. Nunca coloque chaves secretas ou service_role no frontend.

No painel Supabase:

1. Authentication → URL Configuration: configure a URL final do site e adicione a URL exata ao conjunto de Redirect URLs (Sites e/ou GitHub Pages). Mantenha URLs de outros aplicativos que usem este projeto.
2. Authentication → Sign In / Providers → Email: habilite e-mail e confirmação de cadastro. Configure SMTP para entrega de e-mails em produção.
3. Habilite Google e configure o client ID e client secret do Google Cloud no painel Supabase, nunca no código.
4. No Google Cloud, adicione `https://pgdpjhjnzcohdixqpbsx.supabase.co/auth/v1/callback` como URI de redirecionamento autorizado.

O site oferece cadastro, confirmação por e-mail, login por senha, OAuth Google, recuperação de senha, renovação de sessão e saída. Fluxos de redirecionamento usam PKCE. A biblioteca supabase-js está fixada em 2.57.4 e carregada via esm.sh.

## Limites atuais

As histórias são fictícias; cadastros de dívidas e contribuições são demonstrações armazenadas apenas no navegador, sem sincronização entre pessoas ou contas. O login não altera esse armazenamento. Nenhum pagamento real é processado. A configuração dos provedores e URLs deve ser concluída no Supabase antes de validar os fluxos reais. Não informe dados financeiros pessoais neste protótipo.

## Verificar

`node --check dist/app.js` e `node --check dist/auth.js`. Para testar os fluxos reais, confirme um e-mail de teste, entre e saia, recupere a senha e autentique com Google na URL final autorizada.
