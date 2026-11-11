import { authConfig } from './auth-config.js';
const el = id => document.getElementById(id);
let client, user, mode = 'login', busy = false;
const redirectTo = new URL('./', location.href).href;
const message = text => { el('authMessage').textContent = text; };
function setMode(next) {
  mode = next;
  el('authTitle').textContent = mode === 'signup' ? 'Crie sua conta.' : mode === 'recovery' ? 'Escolha uma nova senha.' : 'Bem-vindo ao Recomeço.';
  el('authSubmit').textContent = mode === 'signup' ? 'Criar conta com e-mail' : mode === 'recovery' ? 'Salvar nova senha' : 'Entrar';
  el('authPassword').autocomplete = mode === 'login' ? 'current-password' : 'new-password';
  el('authEmail').required = mode !== 'recovery';
  el('authEmail').disabled = mode === 'recovery';
  el('googleLogin').hidden = mode === 'recovery';
  el('authToggle').hidden = mode === 'recovery';
  el('authForgot').hidden = mode === 'recovery';
  el('authToggle').textContent = mode === 'signup' ? 'Já tenho conta' : 'Criar uma conta';
  message('');
}
function updateUser(next) {
  user = next;
  el('account').textContent = user ? 'Minha conta' : 'Entrar / Criar conta';
  el('authLogout').classList.toggle('hidden', !user);
}
async function action(fn) {
  if (busy) return;
  if (!client) { message('Não foi possível conectar ao serviço de contas. Recarregue e tente novamente.'); return; }
  busy = true;
  const buttons = [...el('authDialog').querySelectorAll('button:not(.close)')];
  buttons.forEach(b => b.disabled = true);
  try { await fn(); } catch (e) {
    const messages = { invalid_credentials: 'E-mail ou senha incorretos.', email_not_confirmed: 'Confirme seu e-mail antes de entrar.', user_already_exists: 'Confira seu e-mail ou tente entrar na sua conta.', over_email_send_rate_limit: 'Aguarde um pouco antes de pedir outro e-mail.', weak_password: 'Use uma senha mais forte, com pelo menos 8 caracteres.' };
    message(messages[e.code] || 'Não foi possível concluir. Verifique sua conexão e tente novamente. Se estiver usando Google, o provedor precisa estar habilitado no projeto.');
  } finally { busy = false; buttons.forEach(b => b.disabled = false); }
}
el('account').onclick = () => {
  setMode('login');
  el('authDialog').showModal();
  if (user) message('Você está conectado como ' + user.email + '.');
};
el('authToggle').onclick = () => setMode(mode === 'signup' ? 'login' : 'signup');
el('googleLogin').onclick = () => action(async () => {
  const { error } = await client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
  if (error) throw error;
});
el('authForm').onsubmit = e => {
  e.preventDefault();
  action(async () => {
    const email = el('authEmail').value.trim(), password = el('authPassword').value;
    const result = mode === 'signup' ? await client.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } }) : mode === 'recovery' ? await client.auth.updateUser({ password }) : await client.auth.signInWithPassword({ email, password });
    if (result.error) throw result.error;
    el('authPassword').value = '';
    if (mode === 'signup' && !result.data.session) message('Confira seu e-mail para confirmar o cadastro. Depois, volte para entrar.');
    else { updateUser(result.data.user); el('authDialog').close(); notify(mode === 'recovery' ? 'Senha atualizada.' : 'Você entrou na sua conta.'); }
  });
};
el('authForgot').onclick = () => {
  const email = el('authEmail');
  if (!email.value || !email.checkValidity()) { email.reportValidity(); message('Informe um e-mail válido para recuperar sua senha.'); return; }
  action(async () => {
    const { error } = await client.auth.resetPasswordForEmail(email.value.trim(), { redirectTo });
    if (error) throw error;
    message('Se houver uma conta para esse e-mail, você receberá as instruções para recuperar a senha.');
  });
};
el('authLogout').onclick = () => action(async () => {
  const { error } = await client.auth.signOut();
  if (error) throw error;
  updateUser(null); el('authDialog').close(); notify('Você saiu da sua conta.');
});
try {
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.57.4');
  client = createClient(authConfig.url, authConfig.key, { auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true, autoRefreshToken: true } });
  client.auth.onAuthStateChange((event, session) => {
    updateUser(session?.user || null);
    if (event === 'PASSWORD_RECOVERY') { setMode('recovery'); if (!el('authDialog').open) el('authDialog').showModal(); }
  });
  const { data, error } = await client.auth.getUser();
  if (!error) updateUser(data.user);
} catch { message('O serviço de contas está temporariamente indisponível. Tente novamente em instantes.'); }
