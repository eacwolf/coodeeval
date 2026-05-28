import { useState, useEffect, useRef } from "react";

const FONT_URL = "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:ital,wght@0,400;0,500;1,400&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap";

const T = {
  bg:"#07090f", surface:"#0d1117", panel:"#111720", border:"#1c2535",
  accent:"#3b82f6", accentGlow:"#3b82f633", emerald:"#10b981",
  amber:"#f59e0b", rose:"#f43f5e", violet:"#8b5cf6",
  text:"#e2e8f0", textSub:"#94a3b8", textMuted:"#475569",
  mono:"'DM Mono', monospace", sans:"'DM Sans', sans-serif", display:"'Syne', sans-serif",
};

const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${T.bg}; color: ${T.text}; font-family: ${T.sans}; }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 2px; }
  input, textarea, select, button { font-family: inherit; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
  @keyframes pulse  { 0%,100% { opacity:1 } 50% { opacity:.4 } }
  @keyframes spin   { to { transform: rotate(360deg) } }
  .fade-up  { animation: fadeUp .35s ease both; }
  .pulsing  { animation: pulse 1.4s ease infinite; }
  .spinning { animation: spin .7s linear infinite; }
`;

const uid   = () => Math.random().toString(36).slice(2, 10);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const sum   = arr => arr.reduce((a, b) => a + b, 0);

async function callLLM(system, user, apiKey, maxTokens = 1200, provider = "Anthropic Claude", model = "claude-sonnet-4-20250514", token) {
  const BACKEND_URL = "http://localhost:5000";
  try {
    const res = await fetch(`${BACKEND_URL}/api/ask`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify({
        question: user,
        system: system,
        apiKey: apiKey,
        maxTokens: maxTokens,
        provider: provider,
        model: model,
      }),
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: `HTTP ${res.status}: ${res.statusText}` }));
      throw new Error(errorData.details || errorData.error || `Server error: ${res.status}`);
    }
    
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.answer ?? "";
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
      throw new Error("Cannot connect to backend server. Make sure backend is running on http://localhost:5000");
    }
    throw error;
  }
}

function parseJSON(raw) {
  return JSON.parse(raw.replace(/```json|```/g, "").trim());
}

function Spinner({ size = 16 }) {
  return <span className="spinning" style={{ display:"inline-block", width:size, height:size, border:`2px solid ${T.border}`, borderTopColor:T.accent, borderRadius:"50%" }} />;
}

function Tag({ children, color = T.accent }) {
  return <span style={{ display:"inline-flex", alignItems:"center", padding:"2px 8px", borderRadius:4, fontSize:11, fontWeight:600, letterSpacing:".04em", fontFamily:T.mono, background:color+"18", color, border:`1px solid ${color}30` }}>{children}</span>;
}

function Btn({ children, onClick, variant="primary", disabled, small, full, style:sx={}, loading }) {
  const base = { display:"inline-flex", alignItems:"center", justifyContent:"center", gap:7, cursor:disabled||loading?"not-allowed":"pointer", border:"none", borderRadius:8, fontWeight:600, transition:"all .18s", outline:"none", opacity:disabled?.45:1, padding:small?"6px 14px":"9px 20px", fontSize:small?12:13, width:full?"100%":undefined, ...sx };
  const v = { primary:{background:T.accent,color:"#fff"}, ghost:{background:"transparent",color:T.textSub,border:`1px solid ${T.border}`}, danger:{background:"transparent",color:T.rose,border:`1px solid ${T.rose}30`}, violet:{background:T.violet+"18",color:T.violet,border:`1px solid ${T.violet}40`} };
  return <button onClick={!disabled&&!loading?onClick:undefined} style={{...base,...v[variant]}}>{loading&&<Spinner size={13}/>}{children}</button>;
}

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom:10 }}>
      {label && <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
        <label style={{ fontSize:11, fontWeight:600, color:T.textSub, letterSpacing:".06em", textTransform:"uppercase" }}>{label}</label>
        {hint && <span style={{ fontSize:11, color:T.textMuted }}>{hint}</span>}
      </div>}
      {children}
    </div>
  );
}

const iStyle = (x={}) => ({ width:"100%", background:T.bg, border:`1px solid ${T.border}`, borderRadius:8, padding:"9px 12px", color:T.text, fontSize:13, outline:"none", transition:"border-color .15s", ...x });

function Input({ label, hint, value, onChange, placeholder, type="text", disabled }) {
  return <Field label={label} hint={hint}><input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} disabled={disabled} style={iStyle({opacity:disabled?.5:1})} onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border} /></Field>;
}

function Textarea({ label, hint, value, onChange, placeholder, rows=4, mono }) {
  return <Field label={label} hint={hint}><textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} style={iStyle({resize:"vertical",fontFamily:mono?T.mono:"inherit",fontSize:mono?12:13,lineHeight:1.6})} onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border} /></Field>;
}

function Select({ label, hint, value, onChange, options }) {
  return <Field label={label} hint={hint}><select value={value} onChange={e=>onChange(e.target.value)} style={iStyle({cursor:"pointer"})} onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}>{options.map(o=><option key={o.value??o} value={o.value??o} style={{background:T.surface}}>{o.label??o}</option>)}</select></Field>;
}

function Panel({ children, style:sx={}, glow }) {
  return <div style={{ background:T.panel, border:`1px solid ${T.border}`, borderRadius:12, padding:16, boxShadow:glow?`0 0 0 1px ${T.accentGlow}, 0 8px 32px #0006`:"0 2px 12px #0004", ...sx }}>{children}</div>;
}

function SectionTitle({ icon, title, sub }) {
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:2 }}>
        <span style={{ fontSize:20 }}>{icon}</span>
        <h2 style={{ fontFamily:T.display, fontSize:22, fontWeight:700, color:T.text, letterSpacing:"-.02em" }}>{title}</h2>
      </div>
      {sub && <p style={{ fontSize:13, color:T.textSub, paddingLeft:30, lineHeight:1.6 }}>{sub}</p>}
    </div>
  );
}

function ProgressBar({ value, max=100 }) {
  const pct = clamp((value/max)*100,0,100);
  const ok = value===max;
  return <div style={{ height:4, background:T.border, borderRadius:2, overflow:"hidden" }}><div style={{ height:"100%", width:`${pct}%`, background:ok?T.emerald:value>max?T.rose:T.accent, borderRadius:2, transition:"width .3s, background .3s" }} /></div>;
}

function ScoreDonut({ score, size=72 }) {
  const r = size*.38, circ = 2*Math.PI*r, offset = circ-(score/100)*circ;
  const color = score>=75?T.emerald:score>=50?T.amber:T.rose;
  return (
    <svg width={size} height={size} style={{ display:"block", flexShrink:0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.border} strokeWidth={size*.1} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={size*.1} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{ transform:"rotate(-90deg)", transformOrigin:"50% 50%", transition:"stroke-dashoffset .8s ease" }} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" style={{ fill:color, fontSize:size*.22, fontWeight:700, fontFamily:T.display }}>{score}</text>
    </svg>
  );
}

const NAV = [
  { id:"admin",      icon:"\u2699\ufe0f",  label:"Admin Settings"   },
  { id:"challenge",  icon:"\ud83e\udde9",  label:"Challenge Builder" },
  { id:"upload",     icon:"\ud83d\udcc2",  label:"Code Upload"       },
  { id:"scoreboard", icon:"\ud83c\udfc6",  label:"Scoreboard"        },
  { id:"send",       icon:"\ud83d\udce7",  label:"Send Challenge"    },
];

function Sidebar({ active, setActive, apiKeySet, challengeCount, submissionCount, isMobile, isOpen, onClose }) {
  const handleNavClick = (id) => {
    setActive(id);
    if (isMobile) onClose();
  };
  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`} style={{ width:228, flexShrink:0, background:T.surface, borderRight:`1px solid ${T.border}`, display:"flex", flexDirection:"column", minHeight:"100vh" }}>
      <div style={{ padding:"20px 18px 16px", borderBottom:`1px solid ${T.border}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:9, background:`linear-gradient(135deg,${T.accent},${T.violet})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:800, color:"#fff", fontFamily:T.display }}>CE</div>
          <div>
            <div style={{ fontFamily:T.display, fontSize:14, fontWeight:700, color:T.text }}>CodeEval AI</div>
            <div style={{ fontFamily:T.mono, fontSize:9, color:T.textMuted, letterSpacing:".08em" }}>MVP · HIRING MANAGER</div>
          </div>
        </div>
      </div>
      <nav style={{ padding:"12px 10px", flex:1 }}>
        {NAV.map(n => (
          <button key={n.id} onClick={()=>handleNavClick(n.id)} style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:8, border:"none", cursor:"pointer", background:active===n.id?T.accentGlow:"transparent", color:active===n.id?T.accent:T.textSub, fontSize:13, fontWeight:active===n.id?600:400, transition:"all .14s", marginBottom:2, textAlign:"left" }}>
            <span style={{ fontSize:15 }}>{n.icon}</span>
            <span style={{ flex:1 }}>{n.label}</span>
            {n.id==="challenge"&&challengeCount>0&&<span style={{ fontFamily:T.mono, fontSize:10, color:T.textMuted }}>{challengeCount}</span>}
            {n.id==="upload"&&submissionCount>0&&<span style={{ fontFamily:T.mono, fontSize:10, color:T.textMuted }}>{submissionCount}</span>}
          </button>
        ))}
      </nav>
      <div style={{ padding:"12px 14px", borderTop:`1px solid ${T.border}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
          <div style={{ width:7, height:7, borderRadius:"50%", background:apiKeySet?T.emerald:T.rose, boxShadow:apiKeySet?`0 0 6px ${T.emerald}`:"none" }} className={apiKeySet?"":"pulsing"} />
          <span style={{ fontSize:11, color:T.textMuted, fontFamily:T.mono }}>{apiKeySet?"LLM READY":"API KEY NEEDED"}</span>
        </div>
      </div>
    </aside>
  );
}

function AdminSettings({ cfg, setCfg }) {
  const [local, setLocal] = useState(cfg);
  const [saved, setSaved] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 767);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  const save = () => { setCfg(local); setSaved(true); setTimeout(()=>setSaved(false),2200); };

  return (
    <div className="fade-up">
      <SectionTitle icon="⚙️" title="Admin Settings" sub="Configure the LLM provider used for problem generation and code evaluation." />
      <div className="grid-2-col" style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:12 }}>
        <Panel>
          <h3 style={{ fontFamily:T.display, fontSize:14, fontWeight:700, color:T.accent, marginBottom:12 }}>LLM Configuration</h3>
          <Select label="LLM Provider" value={local.provider} onChange={v=>setLocal(s=>({...s,provider:v}))} options={["Anthropic Claude","OpenAI GPT-4o","Google Gemini","Azure OpenAI"]} />
          <Input label="API Key" type="password" value={local.apiKey} onChange={v=>setLocal(s=>({...s,apiKey:v}))} placeholder="sk-ant-... or sk-..." />
          <Select label="Model" value={local.model} onChange={v=>setLocal(s=>({...s,model:v}))} options={[{value:"claude-sonnet-4-20250514",label:"Claude Sonnet 4 (recommended)"},{value:"claude-opus-4-6",label:"Claude Opus 4"},{value:"gpt-4o",label:"GPT-4o"},{value:"gpt-4o-mini",label:"GPT-4o Mini"}]} />
          <Select label="Max Tokens" value={local.maxTokens} onChange={v=>setLocal(s=>({...s,maxTokens:v}))} options={["1024","2048","4096","8192"]} />
          <Btn onClick={save} full style={{marginTop:4}}>{saved?"Saved!":"Save Configuration"}</Btn>
          {saved&&<div style={{ marginTop:12, padding:"10px 14px", borderRadius:8, background:T.emerald+"12", border:`1px solid ${T.emerald}30`, fontSize:12, color:T.emerald }}>Configuration saved — LLM engine ready</div>}
        </Panel>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <Panel>
            <h3 style={{ fontFamily:T.display, fontSize:14, fontWeight:700, color:T.textSub, marginBottom:12 }}>Configuration Notes</h3>
            {[["Provider","Select the AI vendor whose API key you hold"],["API Key","Your secret key from the provider's dashboard"],["Model","The specific model version to use for all calls"],["Max Tokens","Upper limit on LLM response length per call"]].map(([k,v])=>(
              <div key={k} style={{ display:"flex", gap:10, marginBottom:10, fontSize:12 }}>
                <span style={{ fontFamily:T.mono, color:T.accent, width:90, flexShrink:0 }}>{k}</span>
                <span style={{ color:T.textSub, lineHeight:1.5 }}>{v}</span>
              </div>
            ))}
          </Panel>
          <Panel style={{ background:T.accentGlow, borderColor:T.accent+"30" }}>
            <div style={{ fontSize:12, color:T.textSub, lineHeight:1.7 }}><span style={{ color:T.accent, fontWeight:600 }}>Security note: </span>The API key is stored in your browser session only and never transmitted to any server other than the configured LLM provider.</div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

const TECH_OPTIONS = ["Database","Scalability","Latency","Concurrency","Error Handling","Caching","Security","Pagination","API Design","File I/O"];
const DIFFICULTIES = ["Easy","Medium","Hard"];
const INIT_METRICS = () => [
  {id:uid(),name:"Code Quality",weight:20},
  {id:uid(),name:"Algorithm Efficiency",weight:25},
  {id:uid(),name:"Error Handling",weight:20},
  {id:uid(),name:"Code Structure",weight:20},
  {id:uid(),name:"Documentation",weight:15},
];

function ChallengeBuilder({ cfg, challenges, setChallenges, token }) {
  const STORAGE_KEY_FORM = "challengeBuilder_form";
  const STORAGE_KEY_STATEMENT = "challengeBuilder_statement";
  const STORAGE_KEY_METRICS = "challengeBuilder_metrics";
  const STORAGE_KEY_STEP = "challengeBuilder_step";

  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_FORM);
    return saved ? JSON.parse(saved) : { name:"", role:"", difficulty:"Medium", description:"", businessLogic:"", constraints:"", domain:"", techInputs:[] };
  });
  const [statement, setStatement] = useState(() => localStorage.getItem(STORAGE_KEY_STATEMENT) || "");
  const [metrics, setMetrics]     = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_METRICS);
    return saved ? JSON.parse(saved) : INIT_METRICS();
  });
  const [genPS, setGenPS]         = useState(false);
  const [genM, setGenM]           = useState(false);
  const [saved, setSaved]         = useState(false);
  const [savedPS, setSavedPS]     = useState(false);
  const [step, setStep]           = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_STEP);
    return saved ? Number(saved) : 1;
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);
  
  // Save form to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FORM, JSON.stringify(form));
  }, [form]);

  // Save statement to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_STATEMENT, statement);
  }, [statement]);

  // Save metrics to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_METRICS, JSON.stringify(metrics));
  }, [metrics]);

  // Save step to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_STEP, String(step));
  }, [step]);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 767);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalWeight = sum(metrics.map(m=>Number(m.weight)||0));
  const weightOk    = totalWeight===100;
  const upd = (k,v) => setForm(f=>({...f,[k]:v}));
  const toggleTech = t => upd("techInputs", form.techInputs.includes(t)?form.techInputs.filter(x=>x!==t):[...form.techInputs,t]);

  const generateStatement = async () => {
    if (!cfg.apiKey) return alert("Set your API key in Admin Settings first.");
    if (!form.name||!form.role) return alert("Fill in Challenge Name and Role first.");
    setGenPS(true);
    try {
      const result = await callLLM(
        "You are a senior software architect creating technical interview assessments. Write clear, realistic, detailed coding challenges.",
        `Create a coding challenge:\nRole: ${form.role}\nDifficulty: ${form.difficulty}\nDescription: ${form.description}\nBusiness Logic: ${form.businessLogic}\nConstraints: ${form.constraints}\nDomain: ${form.domain}\nTech Focus: ${form.techInputs.join(", ")||"General"}\n\nWrite a complete 350-500 word problem statement including: scenario, what to build, I/O format, constraints, 2 example I/O pairs, edge cases. Write professionally.`,
        cfg.apiKey, Number(cfg.maxTokens), cfg.provider, cfg.model, token
      );
      setStatement(result); setStep(2);
    } catch(e) { alert("LLM error: "+e.message); }
    setGenPS(false);
  };

  const generateMetrics = async () => {
    if (!statement) return;
    setGenM(true);
    try {
      const result = await callLLM(
        "You are a technical hiring expert. Return only valid JSON — no markdown, no explanation.",
        `Generate 5 evaluation metrics for this coding challenge. Weights must sum to exactly 100.\n\nProblem:\n${statement.slice(0,600)}\n\nReturn ONLY: {"metrics":[{"name":"<metric>","weight":<integer>}]}`,
        cfg.apiKey, 400, cfg.provider, cfg.model, token
      );
      const {metrics:m} = parseJSON(result);
      setMetrics(m.map(x=>({...x,id:uid()})));
    } catch(e) { alert("Metrics generation failed — check API key."); }
    setGenM(false);
  };

  const saveChallenge = () => {
    if (!statement) return alert("Generate a problem statement first.");
    if (!weightOk) return alert("Metric weights must sum to 100%.");
    setChallenges(cs=>[...cs,{id:uid(),...form,statement,metrics,createdAt:new Date().toISOString()}]);
    setSaved(true);
    setTimeout(()=>{ 
      setSaved(false); 
      setStep(1); 
      setStatement(""); 
      setForm({name:"",role:"",difficulty:"Medium",description:"",businessLogic:"",constraints:"",domain:"",techInputs:[]}); 
      setMetrics(INIT_METRICS());
      // Clear localStorage after successful save
      localStorage.removeItem("challengeBuilder_form");
      localStorage.removeItem("challengeBuilder_statement");
      localStorage.removeItem("challengeBuilder_metrics");
      localStorage.removeItem("challengeBuilder_step");
    },1800);
  };

  return (
    <div className="fade-up">
      <SectionTitle icon="🧩" title="Challenge Builder" sub="Create a coding challenge, generate a problem statement, and configure evaluation criteria." />

      <div style={{ display:"flex", alignItems:"center", marginBottom:16, padding:"12px 16px", background:T.panel, borderRadius:10, border:`1px solid ${T.border}` }}>
        {[["1","Inputs",true],["2","Statement + Criteria",!!statement]].map(([n,lbl,done],i,arr)=>(
          <div key={n} style={{ display:"flex", alignItems:"center", flex:i<arr.length-1?1:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, cursor:done?"pointer":"default" }} onClick={()=>done&&setStep(Number(n))}>
              <div style={{ width:26, height:26, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, fontFamily:T.display, background:step===Number(n)?T.accent:done&&step>Number(n)?T.emerald:T.border, color:"#fff" }}>{done&&step>Number(n)?"v":n}</div>
              <span style={{ fontSize:13, fontWeight:step===Number(n)?600:400, color:step===Number(n)?T.text:T.textMuted }}>{lbl}</span>
            </div>
            {i<arr.length-1&&<div style={{ flex:1, height:1, background:T.border, margin:"0 12px" }}/>}
          </div>
        ))}
      </div>

      {step===1&&(
        <div>
          <div className="grid-2-col" style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:12, marginBottom:12 }}>
            <Panel>
              <h3 style={{ fontFamily:T.display, fontSize:13, fontWeight:700, color:T.accent, marginBottom:12 }}>CHALLENGE METADATA</h3>
              <Input label="Challenge Name" value={form.name} onChange={v=>upd("name",v)} placeholder="e.g. Rate Limiter API" />
              <Input label="Target Role" value={form.role} onChange={v=>upd("role",v)} placeholder="e.g. Senior Backend Engineer" />
              <Select label="Difficulty" value={form.difficulty} onChange={v=>upd("difficulty",v)} options={DIFFICULTIES} />
              <Textarea label="Quick Description" value={form.description} onChange={v=>upd("description",v)} placeholder="Brief summary..." rows={1} />
            </Panel>
            <Panel>
              <h3 style={{ fontFamily:T.display, fontSize:13, fontWeight:700, color:T.accent, marginBottom:14 }}>PROBLEM CONTEXT</h3>
              <Textarea label="Business Logic" value={form.businessLogic} onChange={v=>upd("businessLogic",v)} placeholder="Core rules and logic..." rows={1} />
              <Textarea label="Constraints" value={form.constraints} onChange={v=>upd("constraints",v)} placeholder="Time/space complexity, restrictions..." rows={1} />
              <Textarea label="Domain Context" value={form.domain} onChange={v=>upd("domain",v)} placeholder="Industry-specific background (optional)..." rows={1} />
            </Panel>
          </div>
          <Panel style={{ marginBottom:12 }}>
            <h3 style={{ fontFamily:T.display, fontSize:13, fontWeight:700, color:T.accent, marginBottom:10 }}>TECHNICAL FOCUS AREAS — select all that apply</h3>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              {TECH_OPTIONS.map(t=>{
                const on=form.techInputs.includes(t);
                return <button key={t} onClick={()=>toggleTech(t)} style={{ padding:"6px 14px", borderRadius:20, border:`1px solid ${on?T.accent:T.border}`, background:on?T.accentGlow:"transparent", color:on?T.accent:T.textSub, fontSize:12, fontWeight:500, cursor:"pointer", transition:"all .14s" }}>{t}</button>;
              })}
            </div>
          </Panel>
          <div style={{ display:"flex", justifyContent:"flex-end" }}>
            <Btn onClick={generateStatement} loading={genPS} disabled={!form.name||!form.role} style={{ minWidth:220 }}>Generate Problem Statement</Btn>
          </div>
        </div>
      )}

      {step===2&&(
        <div>
          <Panel glow style={{ marginBottom:16, borderColor:T.accent+"44" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <Tag color={T.emerald}>Statement Ready</Tag>
                <span style={{ fontSize:12, color:T.textMuted }}>{form.name} · {form.role} · {form.difficulty}</span>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <Btn small variant="ghost" onClick={()=>setStep(1)}>Edit Inputs</Btn>
                <Btn small variant="ghost" onClick={generateStatement} loading={genPS}>Regenerate</Btn>
                {savedPS
                  ? <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 12px", borderRadius:7, background:T.emerald+"18", border:`1px solid ${T.emerald}40`, fontSize:12, color:T.emerald, fontWeight:600 }}>✓ Saved</span>
                  : <Btn small variant="violet" onClick={()=>{ setSavedPS(true); setTimeout(()=>setSavedPS(false),2200); }}>💾 Save Statement</Btn>}
              </div>
            </div>
            <div style={{ fontFamily:T.mono, fontSize:12, color:T.text, lineHeight:1.8, whiteSpace:"pre-wrap", maxHeight:260, overflowY:"auto", padding:"14px 16px", background:T.bg, borderRadius:8, border:`1px solid ${T.border}` }}>{statement}</div>
            <details style={{ marginTop:10, cursor:"pointer" }}>
              <summary style={{ fontSize:11, color:T.textMuted, userSelect:"none", padding:"4px 0" }}>Edit statement manually</summary>
              <div style={{ marginTop:8 }}><Textarea value={statement} onChange={setStatement} rows={8} mono /></div>
            </details>
          </Panel>

          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div>
              <h3 style={{ fontFamily:T.display, fontSize:16, fontWeight:700, color:T.text, marginBottom:2 }}>Evaluation Criteria</h3>
              <p style={{ fontSize:12, color:T.textMuted }}>Define up to 10 metrics — weights must sum to 100%</p>
            </div>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <Tag color={weightOk?T.emerald:T.rose}>{totalWeight}% / 100%</Tag>
              <Btn small variant="violet" onClick={generateMetrics} loading={genM} disabled={!statement}>AI Generate Metrics</Btn>
              <Btn small variant="ghost" onClick={()=>metrics.length<10&&setMetrics(m=>[...m,{id:uid(),name:"",weight:0}])} disabled={metrics.length>=10}>+ Add</Btn>
            </div>
          </div>

          <ProgressBar value={totalWeight} />
          <div style={{ height:12 }}/>

          {metrics.map((m,i)=>(
            <Panel key={m.id} style={{ marginBottom:10, padding:"14px 16px" }}>
              <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                <div style={{ width:24, height:24, borderRadius:"50%", background:`linear-gradient(135deg,${T.accent},${T.violet})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"#fff", flexShrink:0 }}>{i+1}</div>
                <input value={m.name} onChange={e=>setMetrics(ms=>ms.map((x,j)=>j===i?{...x,name:e.target.value}:x))} placeholder="Metric name..." style={{ flex:1,...iStyle({padding:"7px 11px",fontSize:13,fontWeight:600}) }} onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border} />
                <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
                  <input type="number" min={0} max={100} value={m.weight} onChange={e=>setMetrics(ms=>ms.map((x,j)=>j===i?{...x,weight:Number(e.target.value)}:x))} style={{ width:56,...iStyle({padding:"7px 10px",fontSize:14,fontWeight:700,color:T.amber,textAlign:"center"}) }} onFocus={e=>e.target.style.borderColor=T.amber} onBlur={e=>e.target.style.borderColor=T.border} />
                  <span style={{ fontSize:12, color:T.amber, fontWeight:700 }}>%</span>
                </div>
                <Btn small variant="danger" onClick={()=>setMetrics(ms=>ms.filter((_,j)=>j!==i))}>X</Btn>
              </div>
            </Panel>
          ))}

          <div style={{ marginTop:20, display:"flex", justifyContent:"flex-end" }}>
            {saved
              ? <div style={{ padding:"10px 20px", borderRadius:8, background:T.emerald+"18", border:`1px solid ${T.emerald}40`, fontSize:13, color:T.emerald, fontWeight:600 }}>Challenge saved!</div>
              : <Btn onClick={saveChallenge} disabled={!statement||!weightOk} style={{ minWidth:180 }}>Save Challenge</Btn>}
          </div>
        </div>
      )}

      {challenges.length>0&&(
        <div style={{ marginTop:32 }}>
          <h3 style={{ fontFamily:T.display, fontSize:14, fontWeight:700, color:T.textSub, marginBottom:12 }}>SAVED CHALLENGES ({challenges.length})</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {challenges.map(ch=>(
              <Panel key={ch.id} style={{ padding:"12px 16px", display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ flex:1 }}><span style={{ fontWeight:600, color:T.text, fontSize:14 }}>{ch.name}</span><span style={{ fontSize:12, color:T.textMuted, marginLeft:10 }}>{ch.role}</span></div>
                <Tag color={ch.difficulty==="Hard"?T.rose:ch.difficulty==="Medium"?T.amber:T.emerald}>{ch.difficulty}</Tag>
                <Tag color={T.textMuted}>{ch.metrics.length} metrics</Tag>
                <span style={{ fontFamily:T.mono, fontSize:11, color:T.textMuted }}>{new Date(ch.createdAt).toLocaleDateString()}</span>
              </Panel>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CodeUpload({ cfg, challenges, submissions, setSubmissions, token }) {
  const [selChallenge, setSelChallenge] = useState("");
  const [candName, setCandName]         = useState("");
  const [candEmail, setCandEmail]       = useState("");
  const [file, setFile]                 = useState(null);
  const [evaluating, setEvaluating]     = useState(false);
  const [progress, setProgress]         = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 767);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const challenge = challenges.find(c=>c.id===selChallenge);

  const handleFile = f => {
    if (!f) return;
    if (!f.name.endsWith(".zip")) return alert("Only .zip files are accepted.");
    if (f.size>52428800) return alert("File exceeds 50 MB limit.");
    setFile(f);
  };

  const readFile = f => new Promise(res=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.readAsText(f); });

  const runEvaluation = async () => {
    if (!cfg.apiKey) return alert("Set your API key in Admin Settings first.");
    if (!challenge)  return alert("Select a challenge.");
    if (!candName)   return alert("Enter candidate name.");
    if (!file)       return alert("Upload a code file.");

    setEvaluating(true);
    let code = "";
    try { setProgress("Reading code file..."); code = await readFile(file); }
    catch { code = `[Binary ZIP — file: ${file.name}, size: ${(file.size/1024).toFixed(1)}KB]`; }

    const metricsBlock = challenge.metrics.map(m=>`- ${m.name} (${m.weight}%)`).join("\n");
    try {
      setProgress("Sending to LLM for evaluation...");
      const raw = await callLLM(
        "You are a senior software engineer conducting a rigorous technical code review. Return ONLY valid JSON — no markdown, no prose.",
        `Evaluate this candidate's code submission.\n\nPROBLEM STATEMENT:\n${challenge.statement}\n\nEVALUATION METRICS:\n${metricsBlock}\n\nCANDIDATE CODE:\n${code.slice(0,3000)}\n\nReturn ONLY this JSON:\n{"totalScore":<0-100>,"metricScores":[{"name":"<metric>","weight":<w>,"rawScore":<0 to w>,"feedback":"<2-3 sentences>"}],"summary":"<3-4 sentences>","strengths":["<s1>","<s2>","<s3>"],"improvements":["<i1>","<i2>","<i3>"]}`,
        cfg.apiKey, Number(cfg.maxTokens), cfg.provider, cfg.model, token
      );
      setProgress("Parsing results...");
      const evaluation = parseJSON(raw);
      setSubmissions(ss=>[...ss,{ id:uid(), challengeId:challenge.id, challengeName:challenge.name, candName, candEmail, fileName:file.name, submittedAt:new Date().toISOString(), evaluation, score:evaluation.totalScore }]);
      setCandName(""); setCandEmail(""); setFile(null); setSelChallenge("");
    } catch(e) { alert("Evaluation failed: "+e.message); }
    setProgress(""); setEvaluating(false);
  };

  return (
    <div className="fade-up">
      <SectionTitle icon="📂" title="Code Upload & Evaluation" sub="Upload a candidate's code solution and run automated LLM evaluation." />
      <div className="grid-2-col" style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:12 }}>
        <Panel>
          <h3 style={{ fontFamily:T.display, fontSize:13, fontWeight:700, color:T.accent, marginBottom:12 }}>SUBMISSION DETAILS</h3>
          {challenges.length===0
            ? <div style={{ padding:"20px", textAlign:"center", color:T.textMuted, fontSize:13, background:T.bg, borderRadius:8, border:`1px dashed ${T.border}` }}>No challenges saved yet — create one in Challenge Builder first.</div>
            : <Select label="Challenge" value={selChallenge} onChange={setSelChallenge} options={[{value:"",label:"— Select a challenge —"},...challenges.map(c=>({value:c.id,label:`${c.name} (${c.role})`}))]} />
          }
          <Input label="Candidate Name" value={candName} onChange={setCandName} placeholder="Jane Smith" />
          <Input label="Candidate Email" value={candEmail} onChange={setCandEmail} placeholder="jane@example.com" type="email" hint="Optional" />

          <Field label="Code File (.zip)">
            <div onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();handleFile(e.dataTransfer.files[0]);}} onClick={()=>document.getElementById("zip-inp").click()}
              style={{ border:`2px dashed ${file?T.emerald:T.border}`, borderRadius:10, padding:"28px 20px", textAlign:"center", cursor:"pointer", background:file?T.emerald+"0a":T.bg, transition:"all .2s" }}>
              <input id="zip-inp" type="file" accept=".zip" style={{ display:"none" }} onChange={e=>handleFile(e.target.files[0])} />
              {file
                ? <div><div style={{ fontSize:28, marginBottom:8 }}>📦</div><div style={{ color:T.emerald, fontWeight:600, fontSize:13 }}>{file.name}</div><div style={{ color:T.textMuted, fontSize:11, marginTop:4 }}>{(file.size/1024).toFixed(1)} KB · click to change</div></div>
                : <div><div style={{ fontSize:28, marginBottom:8 }}>📁</div><div style={{ color:T.textSub, fontSize:13 }}>Drop .zip file here or click to browse</div><div style={{ color:T.textMuted, fontSize:11, marginTop:4 }}>Max 50 MB · .zip only</div></div>
              }
            </div>
          </Field>

          {challenge&&(
            <div style={{ padding:"10px 12px", background:T.bg, borderRadius:8, marginBottom:14, fontSize:12 }}>
              <div style={{ color:T.textMuted, marginBottom:4 }}>Challenge metrics:</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>{challenge.metrics.map(m=><Tag key={m.id} color={T.textMuted}>{m.name} · {m.weight}%</Tag>)}</div>
            </div>
          )}
          <Btn full onClick={runEvaluation} disabled={!selChallenge||!candName||!file||evaluating} loading={evaluating}>{evaluating?progress||"Evaluating...":"Run LLM Evaluation"}</Btn>
        </Panel>

        <Panel>
          <h3 style={{ fontFamily:T.display, fontSize:13, fontWeight:700, color:T.textSub, marginBottom:14 }}>RECENT SUBMISSIONS ({submissions.length})</h3>
          {submissions.length===0
            ? <div style={{ color:T.textMuted, fontSize:13, textAlign:"center", padding:40 }}>No submissions yet</div>
            : <div style={{ display:"flex", flexDirection:"column", gap:8, maxHeight:480, overflowY:"auto" }}>
                {[...submissions].reverse().map(s=>(
                  <div key={s.id} style={{ padding:"12px 14px", background:T.bg, borderRadius:8, border:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:12 }}>
                    <ScoreDonut score={s.score} size={50} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:600, fontSize:13, color:T.text }}>{s.candName}</div>
                      <div style={{ fontSize:11, color:T.textMuted, marginTop:2 }}>{s.challengeName}</div>
                      <div style={{ fontFamily:T.mono, fontSize:10, color:T.textMuted, marginTop:2 }}>{new Date(s.submittedAt).toLocaleString()}</div>
                    </div>
                    <Tag color={s.score>=75?T.emerald:s.score>=50?T.amber:T.rose}>{s.score}/100</Tag>
                  </div>
                ))}
              </div>
          }
        </Panel>
      </div>
    </div>
  );
}

function Scoreboard({ submissions, challenges }) {
  const [filterChallenge, setFilterChallenge] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 767);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filtered = submissions.filter(s=>filterChallenge==="all"||s.challengeId===filterChallenge).sort((a,b)=>b.score-a.score);

  const downloadReport = s => {
    const ev = s.evaluation;
    const lines = [
      "CODEEVAL AI — EVALUATION REPORT","",
      `Candidate   : ${s.candName}`,
      `Email       : ${s.candEmail||"—"}`,
      `Challenge   : ${s.challengeName}`,
      `File        : ${s.fileName}`,
      `Submitted   : ${new Date(s.submittedAt).toLocaleString()}`,
      `Total Score : ${s.score} / 100`,"",
      "METRIC SCORES",
      ...(ev.metricScores||[]).map(m=>`${m.name}: ${m.rawScore}/${m.weight}\n  ${m.feedback}`),"",
      "OVERALL EVALUATION", ev.summary||"","",
      "STRENGTHS",...(ev.strengths||[]).map(x=>`  - ${x}`),"",
      "AREAS FOR IMPROVEMENT",...(ev.improvements||[]).map(x=>`  - ${x}`),"",
      "Generated by CodeEval AI MVP",
    ];
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([lines.join("\n")],{type:"text/plain"}));
    a.download = `eval_${s.candName.replace(/\s+/g,"_")}.txt`;
    a.click();
  };

  return (
    <div className="fade-up">
      <SectionTitle icon="🏆" title="Scoreboard" sub="Candidates ranked by AI-generated score. Click any row to view the full evaluation report." />

      <div className="grid-4-col" style={{ display:"grid", gridTemplateColumns:isMobile?"repeat(2,1fr)":"repeat(4,1fr)", gap:10, marginBottom:18 }}>
        {[["Total Submissions",submissions.length,T.accent],["Evaluated",submissions.filter(s=>s.score!=null).length,T.emerald],["Avg Score",submissions.length?Math.round(sum(submissions.map(s=>s.score))/submissions.length):"—",T.amber],["Challenges",challenges.length,T.violet]].map(([label,val,color])=>(
          <Panel key={label} style={{ padding:"14px 16px", textAlign:"center" }}>
            <div style={{ fontFamily:T.display, fontSize:28, fontWeight:800, color, marginBottom:4 }}>{val}</div>
            <div style={{ fontSize:11, color:T.textMuted, letterSpacing:".04em", textTransform:"uppercase", fontFamily:T.mono }}>{label}</div>
          </Panel>
        ))}
      </div>

      {challenges.length>0&&(
        <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
          {[{value:"all",label:"All Challenges"},...challenges.map(c=>({value:c.id,label:c.name}))].map(o=>(
            <button key={o.value} onClick={()=>setFilterChallenge(o.value)} style={{ padding:"6px 14px", borderRadius:20, border:`1px solid ${filterChallenge===o.value?T.accent:T.border}`, background:filterChallenge===o.value?T.accentGlow:"transparent", color:filterChallenge===o.value?T.accent:T.textSub, fontSize:12, fontWeight:500, cursor:"pointer", transition:"all .14s" }}>{o.label}</button>
          ))}
        </div>
      )}

      {filtered.length===0
        ? <Panel style={{ textAlign:"center", padding:60 }}><div style={{ fontSize:40, marginBottom:12 }}>📭</div><div style={{ color:T.textMuted, fontSize:14 }}>No evaluated submissions yet.</div><div style={{ color:T.textMuted, fontSize:12, marginTop:4 }}>Upload and evaluate code in the Code Upload module.</div></Panel>
        : filtered.map((s,i)=>{
            const ev=s.evaluation||{}, isOpen=expanded===s.id, rankColor=i===0?T.amber:i===1?"#94a3b8":i===2?"#cd7c2f":T.textMuted;
            const medals=["🥇","🥈","🥉"];
            return (
              <Panel key={s.id} style={{ marginBottom:10, borderColor:i===0?T.amber+"55":T.border }}>
                <div style={{ display:"flex", alignItems:"center", gap:14, cursor:"pointer" }} onClick={()=>setExpanded(isOpen?null:s.id)}>
                  <div style={{ width:38, height:38, borderRadius:"50%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", background:rankColor+"18", border:`1px solid ${rankColor}44` }}>
                    {i<3?<span style={{ fontSize:18 }}>{medals[i]}</span>:<span style={{ fontFamily:T.display, fontSize:13, fontWeight:800, color:rankColor }}>#{i+1}</span>}
                  </div>
                  <ScoreDonut score={s.score} size={56} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:T.display, fontSize:15, fontWeight:700, color:T.text }}>{s.candName}</div>
                    <div style={{ fontSize:12, color:T.textMuted, marginTop:2 }}>{s.challengeName} · {s.fileName}</div>
                  </div>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap", justifyContent:"flex-end", maxWidth:280 }}>
                    {(ev.metricScores||[]).map(m=>(
                      <div key={m.name} style={{ padding:"5px 10px", background:T.bg, borderRadius:7, border:`1px solid ${T.border}`, textAlign:"center", minWidth:60 }}>
                        <div style={{ fontSize:16, fontWeight:800, fontFamily:T.display, color:m.rawScore/m.weight>=.75?T.emerald:m.rawScore/m.weight>=.5?T.amber:T.rose }}>{m.rawScore}</div>
                        <div style={{ fontSize:9, color:T.textMuted, fontFamily:T.mono }}>/{m.weight}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                    <Btn small variant="ghost" onClick={e=>{e.stopPropagation();downloadReport(s);}}>Download Report</Btn>
                    <span style={{ color:T.textMuted, fontSize:18 }}>{isOpen?"▲":"▼"}</span>
                  </div>
                </div>

                {isOpen&&(
                  <div className="fade-up" style={{ marginTop:20, paddingTop:20, borderTop:`1px solid ${T.border}` }}>
                    <div style={{ padding:"14px 16px", background:T.bg, borderRadius:8, marginBottom:12, border:`1px solid ${T.border}` }}>
                      <div style={{ fontSize:11, fontWeight:600, color:T.accent, marginBottom:6, textTransform:"uppercase" }}>Overall Evaluation</div>
                      <div style={{ fontSize:13, color:T.text, lineHeight:1.75 }}>{ev.summary}</div>
                    </div>
                    <div className="grid-2-col" style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:8, marginBottom:10 }}>
                      <div style={{ padding:"10px 12px", background:T.emerald+"0a", borderRadius:8, border:`1px solid ${T.emerald}25` }}>
                        <div style={{ fontSize:11, fontWeight:600, color:T.emerald, marginBottom:6 }}>STRENGTHS</div>
                        {(ev.strengths||[]).map((x,i)=><div key={i} style={{ fontSize:12, color:T.text, padding:"2px 0" }}>+ {x}</div>)}
                      </div>
                      <div style={{ padding:"10px 12px", background:T.amber+"0a", borderRadius:8, border:`1px solid ${T.amber}25` }}>
                        <div style={{ fontSize:11, fontWeight:600, color:T.amber, marginBottom:6 }}>IMPROVEMENTS</div>
                        {(ev.improvements||[]).map((x,i)=><div key={i} style={{ fontSize:12, color:T.text, padding:"2px 0" }}>- {x}</div>)}
                      </div>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {(ev.metricScores||[]).map(m=>{
                        const pct=m.rawScore/m.weight, col=pct>=.75?T.emerald:pct>=.5?T.amber:T.rose;
                        return (
                          <div key={m.name} style={{ display:"flex", gap:14, alignItems:"flex-start", padding:"12px 14px", background:T.bg, borderRadius:8, border:`1px solid ${T.border}` }}>
                            <div style={{ flexShrink:0, textAlign:"center", width:48 }}>
                              <div style={{ fontFamily:T.display, fontSize:20, fontWeight:800, color:col }}>{m.rawScore}</div>
                              <div style={{ fontSize:10, color:T.textMuted, fontFamily:T.mono }}>/{m.weight}</div>
                            </div>
                            <div style={{ flex:1 }}>
                              <div style={{ fontSize:13, fontWeight:600, color:T.text, marginBottom:4 }}>{m.name}</div>
                              <div style={{ height:3, background:T.border, borderRadius:2, marginBottom:8, overflow:"hidden" }}><div style={{ height:"100%", width:`${pct*100}%`, background:col, borderRadius:2 }}/></div>
                              <div style={{ fontSize:12, color:T.textSub, lineHeight:1.65 }}>{m.feedback}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Panel>
            );
          })
      }
    </div>
  );
}

function SendChallenge({ challenges }) {
  const [selected, setSelected] = useState("");
  const [copied, setCopied]     = useState(false);
  const [toEmail, setToEmail]   = useState("");
  const [sentMsg, setSentMsg]   = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 767);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const ch = challenges.find(c=>c.id===selected) || null;

  const makeShareLink = (challenge) => {
    const params = new URLSearchParams({ name: challenge.name, role: challenge.role, difficulty: challenge.difficulty, statement: challenge.statement });
    return `${window.location.origin}${window.location.pathname}?challenge=${btoa(encodeURIComponent(JSON.stringify({ name:challenge.name, role:challenge.role, difficulty:challenge.difficulty, statement:challenge.statement })))}`;
  };

  const shareLink = ch ? makeShareLink(ch) : "";

  const mailtoLink = ch && toEmail
    ? `mailto:${toEmail}?subject=${encodeURIComponent(`Coding Challenge: ${ch.name}`)}&body=${encodeURIComponent(`Hi,\n\nYou have been invited to complete the following coding challenge:\n\n📋 Challenge: ${ch.name}\n🎯 Role: ${ch.role}\n⚡ Difficulty: ${ch.difficulty}\n\n--- PROBLEM STATEMENT ---\n\n${ch.statement}\n\n--- VIEW ONLINE ---\n\n${shareLink}\n\nGood luck!\n`)}`
    : null;

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2000); });
  };

  return (
    <div className="fade-up">
      <SectionTitle icon="📧" title="Send Challenge" sub="Share a generated problem statement with candidates via email or a shareable link." />

      {challenges.length === 0 ? (
        <Panel style={{ textAlign:"center", padding:60 }}>
          <div style={{ fontSize:40, marginBottom:12 }}>📭</div>
          <div style={{ color:T.textMuted, fontSize:14 }}>No saved challenges yet.</div>
          <div style={{ color:T.textMuted, fontSize:12, marginTop:4 }}>Build and save a challenge in the Challenge Builder first.</div>
        </Panel>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <Panel>
            <h3 style={{ fontFamily:T.display, fontSize:13, fontWeight:700, color:T.accent, marginBottom:14 }}>SELECT A CHALLENGE</h3>
            <Select label="Challenge" value={selected} onChange={setSelected}
              options={[{value:"",label:"— choose a challenge —"}, ...challenges.map(c=>({value:c.id,label:`${c.name} · ${c.role} · ${c.difficulty}`}))]} />
          </Panel>

          {ch && (
            <>
              <Panel glow style={{ borderColor:T.accent+"44" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <Tag color={T.emerald}>Problem Statement</Tag>
                    <Tag color={ch.difficulty==="Hard"?T.rose:ch.difficulty==="Medium"?T.amber:T.emerald}>{ch.difficulty}</Tag>
                    <span style={{ fontSize:12, color:T.textMuted }}>{ch.role}</span>
                  </div>
                  <span style={{ fontFamily:T.mono, fontSize:11, color:T.textMuted }}>{new Date(ch.createdAt).toLocaleDateString()}</span>
                </div>
                <div style={{ fontFamily:T.mono, fontSize:12, color:T.text, lineHeight:1.8, whiteSpace:"pre-wrap", maxHeight:340, overflowY:"auto", padding:"14px 16px", background:T.bg, borderRadius:8, border:`1px solid ${T.border}` }}>{ch.statement}</div>
              </Panel>

              <Panel>
                <h3 style={{ fontFamily:T.display, fontSize:13, fontWeight:700, color:T.accent, marginBottom:14 }}>SHAREABLE LINK</h3>
                <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:12 }}>
                  <div style={{ flex:1, fontFamily:T.mono, fontSize:11, color:T.textSub, padding:"9px 12px", background:T.bg, borderRadius:8, border:`1px solid ${T.border}`, overflowX:"auto", whiteSpace:"nowrap" }}>{shareLink}</div>
                  <Btn small variant="ghost" onClick={copyLink}>{copied ? "✓ Copied!" : "Copy Link"}</Btn>
                </div>

                <h3 style={{ fontFamily:T.display, fontSize:13, fontWeight:700, color:T.accent, marginBottom:12, marginTop:18 }}>SEND VIA EMAIL</h3>
                <div style={{ display:"flex", gap:8, alignItems:"flex-end", flexDirection:isMobile?"column":"row" }}>
                  <div style={{ flex:1, width:isMobile?"100%":"auto" }}>
                    <Input label="Recipient Email" value={toEmail} onChange={setToEmail} placeholder="candidate@example.com" type="email" />
                  </div>
                  <div style={{ marginBottom:isMobile?0:14, width:isMobile?"100%":"auto" }}>
                    <a href={mailtoLink||"#"} onClick={e=>{ if(!toEmail){e.preventDefault();return;} setSentMsg(true); setTimeout(()=>setSentMsg(false),3000); }}
                      style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", gap:7, padding:"9px 20px", borderRadius:8, background:toEmail?T.accent:"transparent", color:toEmail?"#fff":T.textMuted, border:`1px solid ${toEmail?T.accent:T.border}`, fontWeight:600, fontSize:13, textDecoration:"none", cursor:toEmail?"pointer":"not-allowed", transition:"all .18s", width:isMobile?"100%":"auto" }}>
                      📨 Open in Mail
                    </a>
                  </div>
                </div>
                {sentMsg && <div style={{ padding:"10px 14px", borderRadius:8, background:T.emerald+"12", border:`1px solid ${T.emerald}30`, fontSize:12, color:T.emerald }}>✓ Your email client has been opened with the challenge pre-filled.</div>}
              </Panel>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [active,      setActive]      = useState("admin");
  const [cfg,         setCfg]         = useState({ provider:"Anthropic Claude", apiKey:"", model:"claude-sonnet-4-20250514", maxTokens:"4096" });
  const [challenges,  setChallenges]  = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);
  const token = "guest-token";

  useEffect(()=>{
    const link=document.createElement("link"); link.rel="stylesheet"; link.href=FONT_URL; document.head.appendChild(link);
    const style=document.createElement("style"); style.textContent=GLOBAL_CSS; document.head.appendChild(style);
    
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 767);
      if (window.innerWidth > 767) setMobileMenuOpen(false);
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  },[]);

  // Main app pages with token
  const pages = {
    admin:      <AdminSettings cfg={cfg} setCfg={setCfg} />,
    challenge:  <ChallengeBuilder cfg={cfg} challenges={challenges} setChallenges={setChallenges} token={token} />,
    upload:     <CodeUpload cfg={cfg} challenges={challenges} submissions={submissions} setSubmissions={setSubmissions} token={token} />,
    scoreboard: <Scoreboard submissions={submissions} challenges={challenges} />,
    send:       <SendChallenge challenges={challenges} />,
  };

  return (
    <div className="app-container" style={{ display:"flex", minHeight:"100vh", background:T.bg, color:T.text }}>
      {/* Mobile Menu Toggle */}
      {isMobile && (
        <button 
          className="mobile-menu-toggle" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: 1001,
            width: 40,
            height: 40,
            borderRadius: 8,
            background: T.panel,
            border: `1px solid ${T.border}`,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            color: T.text,
            padding: 0
          }}
        >
          ☰
        </button>
      )}
      
      {/* Mobile Overlay */}
      {isMobile && mobileMenuOpen && (
        <div
          className="mobile-overlay active"
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            zIndex: 999
          }}
        />
      )}
      
      <Sidebar 
        active={active} 
        setActive={setActive} 
        apiKeySet={!!cfg.apiKey} 
        challengeCount={challenges.length} 
        submissionCount={submissions.length}
        isMobile={isMobile}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
      <main className="main-content" style={{ flex:1, padding:isMobile?"12px 10px":"20px 24px", overflowY:"auto", maxHeight:"100vh" }}>
        <div style={{ maxWidth:1280, margin:"0 auto", marginTop: isMobile ? 40 : 0 }}>{pages[active]}</div>
      </main>
    </div>
  );
}
