// LoginScreen — branded sign-in (recreation of the CHA login surface).
const { Button, TextField, Icon, Separator } = window.CloudHeroesAfricaDesignSystem_45bdf7;
const LOGO = "../../assets/logo-cha-mark.png";
const HERO = "../../assets/img-community.png";

function LoginScreen() {
  return (
    <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--cha-white)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 clamp(48px,7vw,120px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 48 }}>
          <img src={LOGO} alt="CHA" style={{ width: 56, height: 56, borderRadius: 12 }} />
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, lineHeight: 1.05 }}>CLOUD HEROES<br />AFRICA</div>
        </div>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 40, lineHeight: 1.08, maxWidth: 460 }}>
          Welcome back, hero.
        </h1>
        <p style={{ margin: '14px 0 32px', fontSize: 17, color: 'var(--cha-zinc-500)', maxWidth: 420, lineHeight: 1.5 }}>
          Empowering Africans to build world-class cloud careers — for free.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 400 }}>
          <TextField label="Email address" placeholder="you@example.com" defaultValue="eddiepatrick39@gmail.com" />
          <Button variant="primary" size="lg" block iconRight={<Icon name="arrow-forward" size={18} />}>Continue</Button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
            <Separator /><span style={{ fontSize: 13, color: 'var(--cha-zinc-400)', whiteSpace: 'nowrap' }}>or continue with</span><Separator />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button variant="outline" size="lg" block iconLeft={<Icon name="logo-google" size={20} />}>Google</Button>
            <Button variant="outline" size="lg" block iconLeft={<Icon name="logo-apple" size={20} />}>Apple</Button>
          </div>
          <p style={{ fontSize: 13, color: 'var(--cha-zinc-500)', marginTop: 8 }}>
            New here? <a style={{ color: 'var(--cha-blue-500)', fontWeight: 600, cursor: 'pointer' }}>Create account</a>
          </p>
        </div>
      </div>
      <div style={{ position: 'relative', background: 'var(--cha-canvas)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={HERO} alt="Learners across Africa" style={{ width: '78%', objectFit: 'contain' }} />
        <div style={{ position: 'absolute', top: 56, left: 56, right: 56, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, lineHeight: 1.15 }}>
          Empowering Africans to build world-class cloud careers.
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LoginScreen });
