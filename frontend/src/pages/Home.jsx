import { useEffect, useState } from "react";
import API from "../api";
import Calendar from "../components/Calendar";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#3b82f6"];

const Skeleton = ({ h = 20, w = "100%", r = 8 }) => (
  <div style={{ height: h, width: w, borderRadius: r, background: "var(--surface2)", animation: "pulse 1.5s infinite" }} />
);

/* ─── ADMIN DASHBOARD ─── */
function AdminDashboard({ setActive }) {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const attendanceTrend = [
    { month: "Jan", pct: 82 }, { month: "Feb", pct: 85 }, { month: "Mar", pct: 79 },
    { month: "Apr", pct: 88 }, { month: "May", pct: 91 }, { month: "Jun", pct: 87 },
  ];
  const feeData = [
    { name: "Paid", value: 68 }, { name: "Pending", value: 22 }, { name: "Overdue", value: 10 },
  ];
  const deptData = [
    { dept: "CS", students: 320 }, { dept: "ECE", students: 280 }, { dept: "ME", students: 240 },
    { dept: "Civil", students: 180 }, { dept: "IT", students: 210 },
  ];

  useEffect(() => {
    Promise.all([
      API.get("/users/analytics").catch(() => ({ data: {} })),
      API.get("/users/logs?limit=6").catch(() => ({ data: { logs: [] } })),
    ]).then(([a, l]) => {
      setStats(a.data);
      setLogs(l.data.logs || []);
      setLoading(false);
    });
  }, []);

  const cards = [
    { label: "Total Students", val: stats?.totalStudents ?? "—", icon: "🎓", color: "indigo", key: null },
    { label: "Total Faculty",  val: stats?.totalFaculty  ?? "—", icon: "👨‍🏫", color: "blue",   key: null },
    { label: "Departments",    val: stats?.departments?.length ?? "—", icon: "🏛️", color: "purple", key: null },
    { label: "Active Users",   val: stats?.activeStudents ?? "—", icon: "✅", color: "green",  key: null },
  ];

  return (
    <div className="page">
      {/* Header */}
      <div className="dash-hero" style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #ec4899 100%)" }}>
        <div>
          <p className="dash-hero-sub">Admin Control Panel</p>
          <h1 className="dash-hero-title">System Overview</h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", marginTop: 6 }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[["👤 Add User", "users"], ["📢 Notice", "notifications"], ["💳 Fees", "fees"]].map(([label, key]) => (
            <button key={key} className="btn btn-outline" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.1)" }}
              onClick={() => setActive(key)}>{label}</button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        {cards.map(({ label, val, icon, color }) => (
          <div key={label} className="stat-card">
            <div className={`stat-icon ${color}`}>{icon}</div>
            <div className="stat-info">
              <p>{label}</p>
              <h3>{loading ? <Skeleton h={28} w={60} /> : val}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 300px", gap: 16, marginBottom: 20 }}>
        {/* Attendance Trend */}
        <div className="card">
          <p className="chart-title">📊 Attendance Trend</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={attendanceTrend}>
              <defs>
                <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fill: "var(--text3)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--text3)", fontSize: 11 }} domain={[70, 100]} />
              <Tooltip contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)" }} />
              <Area type="monotone" dataKey="pct" stroke="#6366f1" strokeWidth={2} fill="url(#aGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Department Students */}
        <div className="card">
          <p className="chart-title">🏛️ Students by Department</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="dept" tick={{ fill: "var(--text3)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--text3)", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)" }} />
              <Bar dataKey="students" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Fee Pie */}
        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <p className="chart-title" style={{ alignSelf: "flex-start" }}>💳 Fee Status</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={feeData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                {feeData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)" }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            {feeData.map((d, i) => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.72rem", color: "var(--text3)" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[i] }} />
                {d.name} {d.value}%
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions + Activity Log */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card">
          <p className="chart-title">⚡ Quick Actions</p>
          <div className="quick-grid">
            {[
              ["👤", "Manage Users",    "users"],
              ["📊", "Attendance",      "attendance"],
              ["💳", "Fee Management",  "fees"],
              ["📢", "Announcements",   "notifications"],
              ["📝", "Assignments",     "assignments"],
              ["🏅", "Results",         "results"],
              ["🎉", "Events",          "events"],
              ["🔧", "Tech Support",    "tech"],
            ].map(([icon, label, key]) => (
              <div key={key} className="quick-card" onClick={() => setActive(key)}>
                <div className="icon">{icon}</div>
                <p>{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <p className="chart-title">🕐 Recent Activity</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {loading ? [...Array(5)].map((_, i) => <Skeleton key={i} h={44} r={10} />) :
              logs.length === 0 ? <div className="empty"><p>No recent activity</p></div> :
              logs.map((log, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--bg2)", borderRadius: 10, border: "1px solid var(--border)" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: log.status === "success" ? "#10b981" : "#ef4444", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.action}</p>
                    <p style={{ fontSize: "0.7rem", color: "var(--text3)" }}>{log.userName} · {log.module}</p>
                  </div>
                  <span style={{ fontSize: "0.65rem", color: "var(--text3)", flexShrink: 0 }}>{new Date(log.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── TEACHER DASHBOARD ─── */
function TeacherDashboard({ user, setActive }) {
  const [stats, setStats] = useState({ assignments: 0, submissions: 0, attendance: 0, leaves: 0 });
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const perfData = [
    { subject: "Math", avg: 78 }, { subject: "Physics", avg: 82 }, { subject: "CS", avg: 91 },
    { subject: "English", avg: 74 }, { subject: "Chemistry", avg: 68 },
  ];

  useEffect(() => {
    const safe = p => p.catch(() => ({ data: [] }));
    Promise.all([
      safe(API.get("/assignments")),
      safe(API.get("/submissions")),
      safe(API.get("/attendance")),
      safe(API.get("/leaves?status=pending")),
    ]).then(([a, s, att, l]) => {
      setStats({
        assignments: a.data.length,
        submissions: s.data.filter(x => !x.marks).length,
        attendance: att.data.length,
        leaves: l.data.length,
      });
      setLeaves(l.data.slice(0, 4));
      setLoading(false);
    });
  }, []);

  return (
    <div className="page">
      <div className="dash-hero" style={{ background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)" }}>
        <div>
          <p className="dash-hero-sub">Faculty Portal</p>
          <h1 className="dash-hero-title">Welcome, {user.name.split(" ")[0]} 👋</h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", marginTop: 6 }}>{user.subject} · {user.designation || "Faculty"}</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {[["📊 Attendance", "attendance"], ["📝 Assignments", "assignments"], ["🏅 Results", "results"]].map(([l, k]) => (
            <button key={k} className="btn btn-outline" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.1)" }}
              onClick={() => setActive(k)}>{l}</button>
          ))}
        </div>
      </div>

      <div className="stat-grid">
        {[
          ["My Assignments", stats.assignments, "📝", "purple"],
          ["Pending Grades", stats.submissions, "⏳", "orange"],
          ["Attendance Records", stats.attendance, "📊", "blue"],
          ["Leave Requests", stats.leaves, "📋", "red"],
        ].map(([label, val, icon, color]) => (
          <div key={label} className="stat-card">
            <div className={`stat-icon ${color}`}>{icon}</div>
            <div className="stat-info"><p>{label}</p><h3>{loading ? "—" : val}</h3></div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div className="card">
          <p className="chart-title">📈 Class Performance by Subject</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={perfData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="subject" tick={{ fill: "var(--text3)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--text3)", fontSize: 11 }} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)" }} />
              <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
                {perfData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="section-header" style={{ marginBottom: 12 }}>
            <p className="chart-title" style={{ margin: 0 }}>📋 Pending Leave Requests</p>
            <button className="btn btn-outline btn-sm" onClick={() => setActive("leaves")}>View All</button>
          </div>
          {leaves.length === 0
            ? <div className="empty"><div className="empty-icon">✅</div><p>No pending requests</p></div>
            : leaves.map(l => (
              <div key={l._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "var(--bg2)", borderRadius: 10, border: "1px solid var(--border)", marginBottom: 8 }}>
                <div>
                  <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>{l.studentName}</p>
                  <p style={{ fontSize: "0.72rem", color: "var(--text3)" }}>{l.type} · {l.days} day(s)</p>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn btn-success btn-xs" onClick={() => API.put(`/leaves/${l._id}/review`, { status: "approved" }).then(() => setLeaves(leaves.filter(x => x._id !== l._id)))}>✓</button>
                  <button className="btn btn-danger btn-xs" onClick={() => API.put(`/leaves/${l._id}/review`, { status: "rejected" }).then(() => setLeaves(leaves.filter(x => x._id !== l._id)))}>✕</button>
                </div>
              </div>
            ))
          }
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
        {[["📊","Mark Attendance","attendance"],["📝","Assignments","assignments"],["🏅","Enter Marks","results"],["📢","Announce","notifications"],["🗓","Timetable","timetable"],["💬","Messages","chat"]].map(([icon, label, key]) => (
          <div key={key} className="quick-card" onClick={() => setActive(key)}>
            <div className="icon">{icon}</div><p>{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── EXAM COUNTDOWN WIDGET ─── */
const EXAMS = [
  { name: "Mid-Term Exam",     subject: "Mathematics",     date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 12) },
  { name: "End-Term Exam",     subject: "Computer Science", date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 28) },
  { name: "Practical Exam",    subject: "Physics Lab",      date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 5)  },
  { name: "Quiz",              subject: "Data Structures",  date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 2)  },
];

function ExamCountdown() {
  const [now, setNow] = useState(new Date());
  const [activeExam, setActiveExam] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const sorted = [...EXAMS].sort((a, b) => a.date - b.date);
  const exam = sorted[activeExam] || sorted[0];
  const diff = exam.date - now;
  const days    = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  const hours   = Math.max(0, Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
  const minutes = Math.max(0, Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)));
  const seconds = Math.max(0, Math.floor((diff % (1000 * 60)) / 1000));
  const urgent  = days < 3;
  const color   = days < 3 ? "#ef4444" : days < 7 ? "#f59e0b" : "#6366f1";
  const glow    = days < 3 ? "rgba(239,68,68,0.25)" : days < 7 ? "rgba(245,158,11,0.2)" : "rgba(99,102,241,0.2)";

  return (
    <div className="card" style={{ marginBottom: 16, border: `1px solid ${color}40`, background: `linear-gradient(135deg, var(--surface) 0%, ${glow} 100%)` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <p className="chart-title" style={{ margin: 0 }}>⏳ Exam Countdown</p>
        <div style={{ display: "flex", gap: 6 }}>
          {sorted.map((e, i) => (
            <button key={i} onClick={() => setActiveExam(i)}
              style={{ padding: "3px 10px", borderRadius: 8, border: `1px solid ${i === activeExam ? color : "var(--border)"}`, background: i === activeExam ? `${color}20` : "transparent", color: i === activeExam ? color : "var(--text3)", fontSize: "0.7rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              {e.subject.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        {/* Countdown blocks */}
        <div style={{ display: "flex", gap: 10 }}>
          {[[days, "Days"], [hours, "Hours"], [minutes, "Mins"], [seconds, "Secs"]].map(([val, label]) => (
            <div key={label} style={{ textAlign: "center", minWidth: 56 }}>
              <div style={{
                background: `${color}15`, border: `1px solid ${color}40`,
                borderRadius: 12, padding: "10px 8px",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "1.6rem", fontWeight: 800, color,
                boxShadow: urgent ? `0 0 12px ${glow}` : "none",
                minWidth: 56, textAlign: "center",
                transition: "color 0.3s"
              }}>
                {String(val).padStart(2, "0")}
              </div>
              <p style={{ fontSize: "0.6rem", color: "var(--text3)", marginTop: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Exam info */}
        <div style={{ flex: 1, minWidth: 160 }}>
          <p style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text)", marginBottom: 4 }}>{exam.name}</p>
          <p style={{ fontSize: "0.8rem", color: "var(--text3)", marginBottom: 8 }}>{exam.subject}</p>
          <p style={{ fontSize: "0.75rem", color, fontWeight: 600 }}>
            📅 {exam.date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}
          </p>
          {urgent && (
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "5px 10px" }}>
              <span style={{ fontSize: "0.75rem" }}>🚨</span>
              <span style={{ fontSize: "0.72rem", color: "#f87171", fontWeight: 600 }}>Exam is very soon! Start preparing now.</span>
            </div>
          )}
        </div>

        {/* Progress ring */}
        <div style={{ textAlign: "center" }}>
          <svg width={80} height={80} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={40} cy={40} r={32} fill="none" stroke="var(--surface3)" strokeWidth={6} />
            <circle cx={40} cy={40} r={32} fill="none" stroke={color} strokeWidth={6}
              strokeDasharray={`${2 * Math.PI * 32}`}
              strokeDashoffset={`${2 * Math.PI * 32 * (1 - Math.min(1, days / 30))}`}
              strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }}
            />
          </svg>
          <p style={{ fontSize: "0.65rem", color: "var(--text3)", marginTop: -8, fontWeight: 600 }}>{days}d left</p>
        </div>
      </div>
    </div>
  );
}

/* ─── STUDENT DASHBOARD ─── */
function StudentDashboard({ user, setActive }) {
  const [stats, setStats] = useState({ attendance: 0, assignments: 0, fees: 0, events: 0 });
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);

  const semData = [
    { sem: "S1", sgpa: 8.4 }, { sem: "S2", sgpa: 8.7 }, { sem: "S3", sgpa: 9.1 },
    { sem: "S4", sgpa: 8.9 }, { sem: "S5", sgpa: 9.3 },
  ];

  useEffect(() => {
    const safe = p => p.catch(() => ({ data: [] }));
    Promise.all([
      safe(API.get("/attendance")),
      safe(API.get("/assignments")),
      safe(API.get("/fees")),
      safe(API.get("/events")),
    ]).then(([att, a, f, e]) => {
      const present = att.data.filter(r => r.status === "present" || r.status === "late").length;
      const total = att.data.length;
      setStats({
        attendance: total ? Math.round((present / total) * 100) : 0,
        assignments: a.data.filter(x => new Date(x.dueDate) >= new Date()).length,
        fees: f.data.filter(x => x.status !== "paid").reduce((s, x) => s + (x.amount || 0), 0),
        events: e.data.filter(x => new Date(x.date) >= new Date()).length,
      });
      setEvents(e.data.filter(x => new Date(x.date) >= new Date()).slice(0, 3));
      setLoading(false);
    });
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const attendanceColor = stats.attendance >= 75 ? "#10b981" : stats.attendance >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="page">
      {/* Hero */}
      <div className="dash-hero" style={{ background: "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", fontWeight: 800, color: "#fff" }}>
            {user.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
          </div>
          <div>
            <p className="dash-hero-sub">{greeting} 👋</p>
            <h1 className="dash-hero-title">{user.name.split(" ")[0]}</h1>
            <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
              {user.class && <span style={{ background: "rgba(255,255,255,0.2)", color: "#fff", padding: "2px 10px", borderRadius: 999, fontSize: "0.72rem", fontWeight: 600 }}>📚 {user.class}</span>}
              {user.rollNo && <span style={{ background: "rgba(255,255,255,0.2)", color: "#fff", padding: "2px 10px", borderRadius: 999, fontSize: "0.72rem", fontWeight: 600 }}>🔢 {user.rollNo}</span>}
              {user.semester && <span style={{ background: "rgba(255,255,255,0.2)", color: "#fff", padding: "2px 10px", borderRadius: 999, fontSize: "0.72rem", fontWeight: 600 }}>Sem {user.semester}</span>}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.75rem" }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
          <p style={{ color: "#fff", fontSize: "1.4rem", fontWeight: 800, fontFamily: "JetBrains Mono, monospace" }}>{new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        <div className="stat-card" onClick={() => setActive("attendance")} style={{ cursor: "pointer" }}>
          <div className="stat-icon green">📊</div>
          <div className="stat-info">
            <p>Attendance</p>
            <h3 style={{ color: loading ? "var(--text)" : attendanceColor }}>{loading ? "—" : `${stats.attendance}%`}</h3>
          </div>
        </div>
        <div className="stat-card" onClick={() => setActive("assignments")} style={{ cursor: "pointer" }}>
          <div className="stat-icon purple">📝</div>
          <div className="stat-info"><p>Due Assignments</p><h3>{loading ? "—" : stats.assignments}</h3></div>
        </div>
        <div className="stat-card" onClick={() => setActive("fees")} style={{ cursor: "pointer" }}>
          <div className="stat-icon orange">💳</div>
          <div className="stat-info"><p>Pending Fees</p><h3>{loading ? "—" : `₹${stats.fees.toLocaleString()}`}</h3></div>
        </div>
        <div className="stat-card" onClick={() => setActive("events")} style={{ cursor: "pointer" }}>
          <div className="stat-icon blue">🎉</div>
          <div className="stat-info"><p>Upcoming Events</p><h3>{loading ? "—" : stats.events}</h3></div>
        </div>
      </div>

      <ExamCountdown />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* SGPA Trend */}
        <div className="card">
          <p className="chart-title">🏅 SGPA Trend</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={semData}>
              <defs>
                <linearGradient id="sgpaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="sem" tick={{ fill: "var(--text3)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--text3)", fontSize: 11 }} domain={[7, 10]} />
              <Tooltip contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)" }} />
              <Area type="monotone" dataKey="sgpa" stroke="#10b981" strokeWidth={2} fill="url(#sgpaGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Upcoming Events */}
        <div className="card">
          <div className="section-header" style={{ marginBottom: 12 }}>
            <p className="chart-title" style={{ margin: 0 }}>🎉 Upcoming Events</p>
            <button className="btn btn-outline btn-sm" onClick={() => setActive("events")}>View All</button>
          </div>
          {events.length === 0
            ? <div className="empty"><div className="empty-icon">📅</div><p>No upcoming events</p></div>
            : events.map(ev => (
              <div key={ev._id} style={{ display: "flex", gap: 12, padding: "10px 12px", background: "var(--bg2)", borderRadius: 10, border: "1px solid var(--border)", marginBottom: 8 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>🎉</div>
                <div>
                  <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>{ev.title}</p>
                  <p style={{ fontSize: "0.72rem", color: "var(--text3)" }}>{new Date(ev.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {ev.venue || "Campus"}</p>
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {/* Quick Access */}
      <div className="card" style={{ marginBottom: 16 }}>
        <p className="chart-title">⚡ Quick Access</p>
        <div className="quick-grid">
          {[["🗓","Timetable","timetable"],["📊","Attendance","attendance"],["📝","Assignments","assignments"],["🏅","Results","results"],["📚","Library","library"],["💳","Fees","fees"],["🏥","Medical","dispensary"],["📋","Leave","leaves"],["💬","Messages","chat"],["🔍","Lost & Found","lostfound"]].map(([icon, label, key]) => (
            <div key={key} className="quick-card" onClick={() => setActive(key)}>
              <div className="icon">{icon}</div><p>{label}</p>
            </div>
          ))}
        </div>
      </div>

      <Calendar events={events} assignments={[]} />
    </div>
  );
}

/* ─── MAIN HOME EXPORT ─── */
export default function Home({ user, setActive }) {
  if (user?.role === "admin")   return <AdminDashboard setActive={setActive} />;
  if (user?.role === "teacher") return <TeacherDashboard user={user} setActive={setActive} />;
  return <StudentDashboard user={user} setActive={setActive} />;
}
