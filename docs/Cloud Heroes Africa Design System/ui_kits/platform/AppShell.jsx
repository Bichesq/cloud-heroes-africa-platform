// AppShell — the CHA Platform product chrome: top bar + left sidebar.
// Composes DS primitives (NavItem, Avatar, Input, IconButton, Button, Icon, Card).
const { NavItem, Avatar, Input, IconButton, Button, Icon, Card, Separator, Tabs } =
  window.CloudHeroesAfricaDesignSystem_45bdf7;

const LOGO = "../../assets/logo-cha-mark.png";
const AVATAR = "../../assets/avatar-patrick.jpg";

function TopBar({ theme, setTheme }) {
  return (
    <header style={{
      height: 88, flex: 'none', display: 'flex', alignItems: 'center', gap: 20,
      padding: '0 32px', background: 'var(--cha-canvas)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: 300, flex: 'none' }}>
        <img src={LOGO} alt="CHA" style={{ width: 46, height: 46, borderRadius: 10 }} />
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, lineHeight: 1.05, letterSpacing: '.01em' }}>
          CLOUD HEROES<br />AFRICA
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--cha-white)', borderRadius: 999, padding: 4, boxShadow: 'var(--shadow-xs)' }}>
        <IconButton size="sm"><Icon name="chevron-left" size={16} /></IconButton>
        <span style={{ fontSize: 14, fontWeight: 600, padding: '0 8px', color: 'var(--cha-zinc-700)' }}>Explore</span>
        <IconButton size="sm"><Icon name="chevron-right" size={16} /></IconButton>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 14, justifyContent: 'center' }}>
        <IconButton variant="soft" style={{ position: 'relative' }}>
          <Icon name="comment" size={18} />
          <span style={{ position: 'absolute', top: 8, right: 9, width: 8, height: 8, borderRadius: '50%', background: 'var(--cha-danger)', border: '1.5px solid #fff' }} />
        </IconButton>
        <div style={{ width: 360 }}>
          <Input shape="pill" placeholder="Search"
            leading={<Icon name="search" size={18} />}
            trailing={<span style={{ fontSize: 11, fontWeight: 600, color: 'var(--cha-zinc-400)', border: '1px solid var(--cha-zinc-200)', borderRadius: 6, padding: '2px 6px' }}>Ctrl K</span>} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'var(--cha-white)', borderRadius: 999, padding: 4, boxShadow: 'var(--shadow-xs)' }}>
        {[['light','☀'],['dark','☾'],['system','▢']].map(([m, g]) => (
          <button key={m} onClick={() => setTheme(m)} style={{
            width: 34, height: 34, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: theme === m ? 'var(--cha-zinc-100)' : 'transparent',
            fontSize: 15, color: 'var(--cha-zinc-700)',
          }}>{g}</button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 'none' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, lineHeight: 1.1 }}>Profile</div>
          <div style={{ fontSize: 13, color: 'var(--cha-zinc-500)' }}>C. Patrick Edward</div>
        </div>
        <Avatar src={AVATAR} size="md" />
        <Icon name="chevron-down" size={16} style={{ color: 'var(--cha-zinc-400)' }} />
      </div>
    </header>
  );
}

function Sidebar({ active, onNavigate }) {
  const main = [
    { id: 'dashboard', label: 'Dashboard', icon: 'house', badge: 'New' },
    { id: 'assessments', label: 'Assessments', icon: 'menucard', chevron: true },
    { id: 'calendar', label: 'Schedule', icon: 'chart-pie' },
    { id: 'reports', label: 'Reports', icon: 'folder', badge: 'New' },
  ];
  return (
    <aside style={{
      width: 300, flex: 'none', background: 'var(--cha-white)',
      borderTopRightRadius: 28, display: 'flex', flexDirection: 'column',
      padding: '28px 20px 22px', gap: 18, overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Avatar src={AVATAR} size={54} />
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, lineHeight: 1.05 }}>Chem Patrick</div>
          <div style={{ fontSize: 12, color: 'var(--cha-zinc-500)', lineHeight: 1.3 }}>Student | Intermediate<br />DevOps Engineer Track</div>
        </div>
      </div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--cha-zinc-400)', padding: '0 8px 6px' }}>Main menu</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {main.map(m => (
            <NavItem key={m.id} icon={<Icon name={m.icon} size={20} />} badge={m.badge} chevron={m.chevron}
              active={active === m.id} onClick={() => onNavigate(m.id)}>{m.label}</NavItem>
          ))}
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: 'var(--cha-zinc-400)', padding: '0 8px 6px' }}>
          Management <Icon name="chevron-down" size={14} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <NavItem icon={<Icon name="star" size={20} />}>Notes</NavItem>
          <NavItem icon={<Icon name="person-line" size={20} />}>Support</NavItem>
          <NavItem icon={<Icon name="person-line" size={20} />} active={active === 'profile'} onClick={() => onNavigate('profile')}>My Profile</NavItem>
        </div>
      </div>

      <Card variant="outline" padding={18} radius={20} style={{ marginTop: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14 }}>
          <Icon name="comment" size={18} /> Need support?
        </div>
        <p style={{ margin: '8px 0 14px', fontSize: 12.5, color: 'var(--cha-zinc-500)', lineHeight: 1.45 }}>
          Contact one of our team members to get the help you need.
        </p>
        <Button variant="primary" block>Contact Support</Button>
      </Card>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Separator style={{ margin: '4px 0 8px' }} />
        <NavItem icon={<Icon name="settings" size={20} />} badge="New">Settings</NavItem>
        <NavItem icon={<Icon name="arrow-upright" size={20} />} badge="New">Log out</NavItem>
      </div>
    </aside>
  );
}

function AppShell({ active, onNavigate, theme, setTheme, children }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--cha-canvas)' }}>
      <TopBar theme={theme} setTheme={setTheme} />
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <Sidebar active={active} onNavigate={onNavigate} />
        <main style={{ flex: 1, overflow: 'auto', padding: '20px 34px 40px' }}>{children}</main>
      </div>
    </div>
  );
}

Object.assign(window, { AppShell });
