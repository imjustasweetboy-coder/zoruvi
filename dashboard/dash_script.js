    const SUPABASE_URL = 'https://odrcgxwgbltinaudplao.supabase.co/rest/v1/';
    const SUPABASE_ANON_KEY = 'sb_publishable_omwz5S3thHuN2-fzry4QSg_3d0KcpIS';
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    document.addEventListener('DOMContentLoaded', async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (!session || error) {
        window.location.href = 'index.html';
        return;
      }

      const user = session.user;
      document.getElementById('userEmailDisplay').innerText = user.email;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        document.getElementById('userNameDisplay').innerText = profile.full_name;
        document.getElementById('userRoleDisplay').innerText = profile.role;
      } else {
        document.getElementById('userNameDisplay').innerText = user.email.split('@')[0];
        document.getElementById('userRoleDisplay').innerText = 'agent';
      }
    });

    async function handleLogout() {
      await supabase.auth.signOut();
      window.location.href = 'index.html';
    }