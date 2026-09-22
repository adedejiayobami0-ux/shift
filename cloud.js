(() => {
  const cfg = window.SHIFT_CONFIG || {};
  let client = null;
  let syncTimer = null;
  let syncEnabled = localStorage.getItem('shift_cloud_sync_enabled') === 'true';
  const configured = Boolean(cfg.enableCloudSync && cfg.supabaseUrl && cfg.supabasePublishableKey);

  async function getClient() {
    if (!configured) return null;
    if (client) return client;
    const mod = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.116.0/+esm');
    client = mod.createClient(cfg.supabaseUrl, cfg.supabasePublishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
    return client;
  }

  async function session() {
    const c = await getClient();
    if (!c) return null;
    const { data } = await c.auth.getSession();
    return data.session || null;
  }

  async function sendMagicLink(email) {
    const c = await getClient();
    if (!c) throw new Error('Cloud sync is not configured in this build.');
    const redirectTo = location.href.split('#')[0];
    const { error } = await c.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
    if (error) throw error;
  }

  async function signOut() {
    const c = await getClient();
    if (!c) return;
    await c.auth.signOut();
    setSyncEnabled(false);
  }

  function setSyncEnabled(value) {
    syncEnabled = Boolean(value);
    localStorage.setItem('shift_cloud_sync_enabled', String(syncEnabled));
  }

  async function pushState(state) {
    if (!syncEnabled) return { skipped: true };
    const c = await getClient();
    const s = await session();
    if (!c || !s) return { skipped: true };
    const { error } = await c.from('shift_state').upsert({
      user_id: s.user.id,
      state_json: state,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
    if (error) throw error;
    return { ok: true };
  }

  async function pullState() {
    const c = await getClient();
    const s = await session();
    if (!c || !s) return null;
    const { data, error } = await c.from('shift_state').select('state_json,updated_at').eq('user_id', s.user.id).maybeSingle();
    if (error) throw error;
    return data?.state_json || null;
  }

  function queueSync(state) {
    if (!syncEnabled) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => pushState(state).catch(() => {}), 900);
  }

  async function onAuthChange(cb) {
    const c = await getClient();
    if (!c) return () => {};
    const { data } = c.auth.onAuthStateChange((_event, s) => cb(s));
    return () => data.subscription.unsubscribe();
  }

  window.ShiftCloud = {
    configured,
    session,
    sendMagicLink,
    signOut,
    setSyncEnabled,
    isSyncEnabled: () => syncEnabled,
    pushState,
    pullState,
    queueSync,
    onAuthChange
  };
})();
