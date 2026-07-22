// CalendarScreen — "Calendar" (day view)
const { Card, Button, ButtonGroup, Icon, Checkbox, Indicator, AvatarGroup, Tabs, Switch, Input, IconButton, CloseButton, Tag } =
  window.CloudHeroesAfricaDesignSystem_45bdf7;
const AV = "../../assets/avatar-patrick.jpg";
const att = [{src:AV},{name:"Ada L"},{name:"Ben O"},{name:"Cara M"}];

function DayCell({ n, dd, active }) {
  return (
    <div style={{
      flex: 1, textAlign: 'center', padding: '10px 0', borderRadius: 14,
      background: active ? 'var(--color-primary)' : 'var(--cha-zinc-50)',
      color: active ? '#fff' : 'var(--cha-ink)',
    }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, lineHeight: 1 }}>{n}</div>
      <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.7 }}>{dd}</div>
    </div>
  );
}

function EventBlock({ title, time, tone, offset }) {
  const bg = tone === 'blue' ? 'var(--cha-ocean-300)' : 'var(--cha-warning)';
  return (
    <div style={{ marginLeft: offset, background: bg, borderRadius: 12, padding: 10, width: 220, marginBottom: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>{title}</span>
        <Icon name="comment" size={13} style={{ color: '#1a1a1a' }} />
      </div>
      <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.6)', marginBottom: 6 }}>{time}</div>
      <AvatarGroup people={att} max={4} extra={5} size="xs" />
    </div>
  );
}

function TimeRow({ label, children }) {
  return (
    <div style={{ display: 'flex', gap: 16, minHeight: 78, borderTop: '1px solid var(--separator)', paddingTop: 8 }}>
      <div style={{ width: 54, fontSize: 13, fontWeight: 600, color: 'var(--cha-zinc-500)', flex: 'none' }}>{label}</div>
      <div style={{ flex: 1 }}>{children || <button style={{ width: '100%', height: 54, border: '1.5px dashed var(--cha-zinc-200)', borderRadius: 12, background: 'transparent', color: 'var(--cha-blue-500)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>+ Add</button>}</div>
    </div>
  );
}

function CalendarScreen() {
  const [view, setView] = React.useState('day');
  const [cats, setCats] = React.useState({ live: true, events: false, tasks: false, assign: false });
  const [loc, setLoc] = React.useState(true);
  const [etype, setEtype] = React.useState('event');
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px minmax(0,1fr) 320px', gap: 24, alignItems: 'start' }}>
      {/* left rail */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 40 }}>Calendar</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="accent" iconLeft={<Icon name="plus" size={16} />}>Create Event</Button>
          <Button variant="secondary" iconLeft={<Icon name="plus" size={16} />}>Invite</Button>
        </div>
        <Card variant="sunken" padding={18} radius={18}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 15, marginBottom: 14 }}>
            <Icon name="settings" size={16} /> Categories
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[['live','Live Sessions','ocean'],['events','Events','blue'],['tasks','Tasks','red'],['assign','Assignments','green']].map(([k,l,c]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Checkbox checked={cats[k]} onChange={v => setCats({ ...cats, [k]: v })} />
                <Indicator color={c} /><span style={{ fontSize: 14 }}>{l}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card variant="orange" padding={16} radius={18}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>Today</span>
            <CloseButton size={26} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, marginTop: 10 }}>DevOps Class</div>
          <div style={{ fontSize: 12, opacity: 0.9, marginTop: 4 }}>⏱ 3:00 - 4:00 PM</div>
          <div style={{ fontSize: 12, opacity: 0.9 }}>🔗 https://zoom.us/...</div>
          <a style={{ fontSize: 13, fontWeight: 700, marginTop: 10, display: 'inline-block' }}>Edit ↗</a>
        </Card>
      </div>

      {/* day grid */}
      <Card padding={22} radius={24}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconButton variant="soft" size="sm"><Icon name="chevron-left" size={16} /></IconButton>
            <Button variant="secondary" size="sm">Today</Button>
            <IconButton variant="soft" size="sm"><Icon name="chevron-right" size={16} /></IconButton>
          </div>
          <ButtonGroup items={[{id:'day',label:'Day'},{id:'week',label:'Week'},{id:'month',label:'Month'},{id:'year',label:'Year'}]} value={view} onChange={setView} size="sm" />
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {[['21','SU'],['22','MO'],['23','TU'],['24','WE'],['25','TH'],['26','FR'],['27','SA']].map(([n,d]) => (
            <DayCell key={n} n={n} dd={d} active={n === '24'} />
          ))}
        </div>
        <div>
          <TimeRow label="1 PM" />
          <TimeRow label="2 PM"><EventBlock title="DevOps Class" time="2:00 - 2:30 PM" tone="warning" offset={120} /></TimeRow>
          <TimeRow label="3 PM"><EventBlock title="Intermediate Lab" time="3:00 - 4:30 PM" tone="warning" offset={200} /></TimeRow>
          <TimeRow label="4 PM"><EventBlock title="Kubernetes Class" time="4:00 - 5:30 PM" tone="blue" offset={0} /></TimeRow>
          <TimeRow label="5 PM" />
        </div>
      </Card>

      {/* create event popover */}
      <Card padding={20} radius={22}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20 }}>Create Event</span>
          <CloseButton size={28} />
        </div>
        <Input placeholder="Event Title..." />
        <div style={{ margin: '14px 0' }}>
          <Tabs activeTone="blue" size="sm" items={[{id:'event',label:'Event'},{id:'task',label:'Task'},{id:'appt',label:'Appointment'}]} value={etype} onChange={setEtype} />
        </div>
        <Card variant="sunken" padding={16} radius={16} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <Icon name="chart-pie" size={20} style={{ color: 'var(--cha-zinc-500)', marginTop: 2 }} />
          <div style={{ fontSize: 14 }}>
            <div style={{ fontWeight: 600 }}>8:15 - 9:15 AM</div>
            <div style={{ color: 'var(--cha-zinc-500)' }}>01/29/26</div>
            <div style={{ color: 'var(--cha-zinc-500)' }}>Doesn't Repeat</div>
          </div>
        </Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0' }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>Location</span>
          <Switch checked={loc} onChange={setLoc} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Input size="sm" leading={<Icon name="comment" size={16} />} defaultValue="https://us04web.zoom.us/j/716..." />
          <Input size="sm" leading={<Icon name="map-pin" size={16} />} placeholder="Add Location" />
          <Input size="sm" leading={<Icon name="star" size={16} />} placeholder="Add a note" />
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 18, justifyContent: 'flex-end' }}>
          <Button variant="accent">Create Event</Button>
          <Button variant="ghost">Cancel</Button>
        </div>
      </Card>
    </div>
  );
}

Object.assign(window, { CalendarScreen });
