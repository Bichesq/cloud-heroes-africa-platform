// ProfileScreen — "My Profile"
const { Card, Chip, Tabs, Tag, Button, Icon, Avatar, AvatarGroup, ProgressBar } =
  window.CloudHeroesAfricaDesignSystem_45bdf7;
const AV = "../../assets/avatar-patrick.jpg";
const peers = [{src:AV},{name:"Ada L"},{name:"Ben O"},{name:"Cara M"}];

function SkillTile({ label }) {
  return (
    <div style={{
      width: 64, height: 64, borderRadius: 14, background: 'var(--cha-zinc-50)',
      border: '1px solid var(--cha-zinc-150)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--cha-zinc-700)', textAlign: 'center',
    }}>{label}</div>
  );
}

function Bars() {
  const data = [12, 20, 16, 40, 8, 14]; const labels = ['Jan','Feb','Mar','Apr','May','Jun'];
  const tones = ['var(--cha-zinc-150)','var(--cha-zinc-150)','var(--cha-ocean-500)','var(--color-primary)','var(--cha-zinc-150)','var(--cha-zinc-150)'];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 120, padding: '0 4px' }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ width: '100%', height: v * 2.4, background: tones[i], borderRadius: 6 }} />
          <span style={{ fontSize: 10, color: 'var(--cha-zinc-400)' }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

function AssignmentRow({ n, name, course, due, status, tone, grade }) {
  return (
    <tr style={{ borderTop: '1px solid var(--separator)' }}>
      <td style={{ padding: '12px 8px', fontSize: 14, fontWeight: 500 }}>{n}. {name}</td>
      <td style={{ padding: '12px 8px', fontSize: 14, color: 'var(--cha-zinc-500)' }}>{course}</td>
      <td style={{ padding: '12px 8px', fontSize: 14, color: 'var(--cha-zinc-500)' }}>{due}</td>
      <td style={{ padding: '12px 8px' }}><Tag tone={tone} size="sm">{status}</Tag></td>
      <td style={{ padding: '12px 8px', fontSize: 14, fontWeight: 600 }}>{grade}</td>
    </tr>
  );
}

function ProfileScreen() {
  const [tab, setTab] = React.useState('all');
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.9fr) minmax(320px,1fr)', gap: 28 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 44 }}>My Profile</h1>
          <Button variant="secondary" iconLeft={<Icon name="settings" size={18} />}>Profile Settings</Button>
        </div>
        <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26 }}>Your Statistics</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Card variant="ocean" padding={0} radius={22} style={{ overflow: 'hidden' }}>
            <div style={{ background: '#fff', margin: 10, borderRadius: 16, padding: 18 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--cha-ink)' }}>Activity Overview</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 48, color: 'var(--cha-ink)', lineHeight: 1.1 }}>87%</div>
              <div style={{ fontSize: 13, color: 'var(--cha-ocean-600)', fontWeight: 600 }}>↑ 4.5% than last month</div>
            </div>
            <div style={{ padding: '4px 20px 18px', color: '#fff' }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Daily Tasks</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 34 }}>40%</span>
                <Tag tone="dark" size="sm">+2.6%</Tag>
              </div>
            </div>
          </Card>

          <Card padding={22} radius={22}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 20 }}>Verified Skills Badge Count</div>
            <div style={{ fontSize: 14, color: 'var(--cha-zinc-500)', marginTop: 4 }}>View All Your Certifications and Badges</div>
            <div style={{ display: 'flex', gap: 12, margin: '18px 0' }}>
              <SkillTile label="Terra-form" /><SkillTile label="AWS" /><SkillTile label="Docker" /><SkillTile label="Red Hat" />
            </div>
            <a style={{ fontSize: 14, fontWeight: 600, color: 'var(--cha-blue-500)', cursor: 'pointer' }}>Click Here ↗</a>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 16 }}>
              <AvatarGroup people={peers} max={4} extra={5} />
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--cha-zinc-500)' }}>Share Your Progress With Peers</span>
            </div>
          </Card>
        </div>

        <Card variant="orange" padding={24} radius={22} style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, opacity: 0.9 }}>DevOps Track Lv1</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 34, lineHeight: 1.05 }}>Resume Where<br />You Left Off →</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: 18, minWidth: 220 }}>
            <Tag tone="dark" size="sm">In Progress</Tag>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 44, margin: '6px 0' }}>60%</div>
            <div style={{ fontSize: 13, opacity: 0.92 }}>Module 1: DevOps Foundations</div>
          </div>
        </Card>

        <h2 style={{ margin: '4px 0 0', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26 }}>Current and Upcoming Assignments</h2>
        <Tabs items={[{id:'all',label:'All'},{id:'jenkins',label:'Jenkins Lab'},{id:'sec',label:'Security Project'},{id:'cka',label:'CKA Practice'}]} value={tab} onChange={setTab} />
        <Card padding={8} radius={18}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ textAlign: 'left' }}>
              {['Assignment','Course','Due','Status','Grade'].map(h => (
                <th key={h} style={{ padding: '8px', fontSize: 13, fontWeight: 600, color: 'var(--cha-zinc-500)' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              <AssignmentRow n="1" name="Advanced Jenkins Pipeline" course="DevOps Track" due="Oct 31" status="In Progress" tone="orange" grade="—" />
              <AssignmentRow n="2" name="Kubernetes Cluster Hardening" course="Cloud Security" due="Nov 05" status="Submitted" tone="ocean" grade="A+" />
              <AssignmentRow n="3" name="Terraform Module Refactoring" course="Terraform" due="Nov 10" status="Not Started" tone="neutral" grade="—" />
            </tbody>
          </table>
        </Card>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Card padding={22} radius={22}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, lineHeight: 1.1 }}>Course<br />Completion</h3>
            <Chip tone="ocean" size="sm">32% Complete</Chip>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '18px 0' }}>
            <Avatar src={AV} size={150} ring />
          </div>
        </Card>

        <Card padding={22} radius={22}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="square-fill" size={16} /><span style={{ fontWeight: 700, fontSize: 15 }}>Monthly Streak</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '8px 0 12px' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20 }}>You're on a Roll!</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--cha-ocean-600)' }}>↗ 23%</span>
          </div>
          <Bars />
        </Card>

        <div>
          <h3 style={{ margin: '0 0 12px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22 }}>Upcoming Live Labs and Events</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[['Oct 28'],['Nov 10']].map(([d], i) => (
              <Card key={i} variant="outline" padding={12} radius={14} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--cha-ocean-300)', flex: 'none' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--cha-zinc-400)' }}>Course: DevOps</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Become an Acme Creator!</div>
                  <div style={{ fontSize: 11, color: 'var(--cha-zinc-400)' }}>Starts: {d}</div>
                </div>
                <Icon name="arrow-upright" size={16} style={{ color: 'var(--cha-zinc-400)' }} />
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ProfileScreen });
