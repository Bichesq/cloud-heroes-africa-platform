// DashboardScreen — "My Learning Path"
const { Card, Chip, Tabs, ProgressBar, Button, Icon, Tag } =
  window.CloudHeroesAfricaDesignSystem_45bdf7;

function ModuleCard({ tag, tagTone, n, title, desc, variant }) {
  const light = variant === 'ocean';
  return (
    <Card variant={variant} padding={22} radius={22} style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 240 }}>
      <Chip tone="dark" size="sm" style={{ alignSelf: 'flex-start' }}>{tag}</Chip>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, lineHeight: 1.05 }}>Module {n}:</div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 20, marginTop: 4 }}>{title}</div>
      </div>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: light ? 'rgba(255,255,255,0.92)' : 'var(--cha-zinc-500)' }}>{desc}</p>
    </Card>
  );
}

function LessonCard({ tag, status, statusTone, n, title, desc, pct, locked }) {
  return (
    <Card variant="outline" padding={18} radius={18} style={{ opacity: locked ? 0.6 : 1, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 200 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Chip tone={locked ? 'default' : 'dark'} size="sm" style={locked ? { background: 'var(--cha-zinc-100)' } : undefined}>{tag}</Chip>
        {status && <Tag tone={statusTone} size="sm">{status}</Tag>}
      </div>
      <div>
        <div style={{ fontSize: 14, color: 'var(--cha-zinc-500)' }}>Lesson {n}:</div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 19 }}>{title}</div>
      </div>
      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.45, color: 'var(--cha-zinc-500)', flex: 1 }}>{desc}</p>
      <ProgressBar value={pct} tone={locked ? 'dark' : 'orange'} height={12} showValue={false} track="var(--cha-zinc-100)" />
    </Card>
  );
}

function DashboardScreen() {
  const [filter, setFilter] = React.useState('all');
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.9fr) minmax(320px,1fr)', gap: 28 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 44, lineHeight: 1 }}>My Learning Path</h1>

        <Tabs items={[{id:'all',label:'All'},{id:'devops',label:'DevOps'},{id:'security',label:'Security'},{id:'terraform',label:'Terraform'}]}
          value={filter} onChange={setFilter} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          <ModuleCard tag="DevOps" n="1" title="DevOps Foundations" variant="ocean" desc="Master CI/CD pipelines and learn how to automate your deployment workflows." />
          <ModuleCard tag="Cloud Security" n="2" title="Security Fundamentals" variant="default" desc="Understand identity, access, and security fundamentals in the cloud." />
          <ModuleCard tag="Terraform" n="3" title="Terraform Basics" variant="default" desc="Learn how to provision infrastructure as code using Terraform." />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28 }}>My Lessons — Up Next</h2>
          <Button variant="primary" iconRight={<Icon name="arrow-forward" size={16} />}>Resume · Module 1</Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          <LessonCard tag="DevOps" status="In Progress" statusTone="orange" n="3" title="Setting Up Jenkins" pct={60}
            desc="Configure your first Jenkins server and run a basic pipeline." />
          <LessonCard tag="DevOps" status="Locked" statusTone="neutral" n="4" title="Docker Fundamentals" pct={0} locked
            desc="Learn containerization basics and run your first Docker container." />
          <LessonCard tag="DevOps" status="Locked" statusTone="neutral" n="5" title="Intro to Kubernetes" pct={0} locked
            desc="Understand container orchestration and deploy your first cluster." />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Card padding={22} radius={22}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24 }}>Learning Progress</h3>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--cha-zinc-500)' }}>See all</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div><div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Basics of Linux and Shell Scripting</div><ProgressBar value={87} tone="orange" /></div>
            <div><div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Cloud Security</div><ProgressBar value={99} tone="ocean" /></div>
            <div><div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Terraform</div><ProgressBar value={15} tone="orange" /></div>
          </div>
        </Card>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24 }}>Recommended for you:</h3>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--cha-zinc-500)' }}>See all</span>
        </div>
        <Card variant="orange" padding={26} radius={22} style={{ position: 'relative', overflow: 'hidden', minHeight: 240 }}>
          <div style={{ position: 'absolute', right: -20, bottom: -30, fontSize: 150, fontWeight: 800, opacity: 0.14, fontFamily: 'var(--font-display)' }}>aws</div>
          <Chip tone="dark" size="sm" style={{ position: 'absolute', top: 22, right: 22 }}>Beginner</Chip>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 40, lineHeight: 1, maxWidth: 260 }}>Cloud Fundamentals</div>
          <div style={{ marginTop: 16, fontSize: 15, fontWeight: 600 }}>Linux → AWS Fundamentals</div>
          <p style={{ margin: '10px 0 0', fontSize: 15, lineHeight: 1.5, maxWidth: 280 }}>Start your AWS journey and build something real.</p>
        </Card>
      </div>
    </div>
  );
}

Object.assign(window, { DashboardScreen });
