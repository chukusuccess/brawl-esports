"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { adminAuth, contentStore, uid } from "@/lib/community-data";
import ThemeToggle from "@/components/theme-toggle";

const RANKS = ["Tin", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Valhallan"];
const ROLES = ["Founder", "Admin", "Moderator", "Tournament Organizer", "Veteran", "Member"];

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => setAuthed(adminAuth.isAuthed()), []);

  return authed ? <Dashboard onLogout={() => setAuthed(false)} /> : <LoginForm onSuccess={() => setAuthed(true)} />;
}

function LoginForm({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const firebaseLogin = adminAuth.usesFirebaseAuth();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      await adminAuth.login(email, password);
      onSuccess();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="auth-page"><div className="auth-shell"><section className="auth-card">
      <Link className="back-link" href="/">← Back to AfroBrawlers</Link>
      <p className="section-kicker">RESTRICTED AREA</p><h1>Admin<br />desk.</h1>
      <p>{firebaseLogin ? "Sign in with the Firebase Email/Password account allowed to edit the community." : "Local development sign-in is active. Connect Firebase to use production credentials and shared data."}</p>
      <form className="form-stack" onSubmit={handleSubmit}>
        <label className="field">EMAIL<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@email.com" autoComplete="email" required /></label>
        <label className="field">PASSWORD<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" autoComplete="current-password" required /></label>
        {error && <p className="form-error">{error}</p>}
        <button className="button button-primary" type="submit" disabled={pending}>{pending ? "Signing in…" : "Sign in →"}</button>
      </form>
    </section></div></main>
  );
}

function Dashboard({ onLogout }) {
  const [content, setContent] = useState(() => contentStore.get());
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const dirtyRef = useRef(false);

  useEffect(() => {
    const unsubscribe = contentStore.subscribe((nextContent) => {
      if (!dirtyRef.current) setContent(nextContent);
    });
    const stopRemoteSync = contentStore.startRemoteSync();
    return () => { unsubscribe(); stopRemoteSync(); };
  }, []);

  useEffect(() => {
    if (!dirty) return undefined;

    function warnBeforeUnload(event) {
      event.preventDefault();
      event.returnValue = "You have unsaved changes.";
      return event.returnValue;
    }

    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [dirty]);

  function markDirty() {
    dirtyRef.current = true;
    setDirty(true);
    setSaveError("");
  }

  function update(patch) {
    setContent((current) => ({ ...current, ...patch }));
    markDirty();
  }

  function confirmDiscard() {
    return !dirty || window.confirm("You have unsaved changes. Leave without saving them?");
  }

  function handleExit(event) {
    if (!confirmDiscard()) event.preventDefault();
  }

  async function save() {
    setSaving(true);
    setSaveError("");
    try {
      await contentStore.save(content);
      dirtyRef.current = false;
      setDirty(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Could not save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    if (!confirmDiscard()) return;
    await adminAuth.logout();
    onLogout();
  }

  return (
    <main className="admin-page"><div className="admin-shell">
      <header className="admin-header">
        <div><Link className="back-link" href="/" onClick={handleExit}>← View public site</Link><p className="section-kicker">CONTENT CONTROL</p><h1 className="admin-title">Community<br />desk.</h1><p className="admin-subtitle">Make your edits, then publish them together with Save changes.</p>{saveError && <p className="form-error">{saveError}</p>}</div>
        <div className="admin-actions"><ThemeToggle /><button className="button button-small button-primary" onClick={save} disabled={!dirty || saving}>{saving ? "Saving…" : "Save changes"}</button><button className="button button-small" onClick={logout}>Sign out</button></div>
      </header>

      <div className="admin-grid">
        <Panel className="wide" title="About / summary"><label className="field">SITE INTRO<textarea value={content.about} onChange={(event) => update({ about: event.target.value })} /></label></Panel>

        <Panel className="wide" title="Community links"><div className="form-stack"><label className="field">WHATSAPP URL<input value={content.links.whatsapp} onChange={(event) => update({ links: { ...content.links, whatsapp: event.target.value } })} /></label><label className="field">DISCORD URL<input value={content.links.discord} onChange={(event) => update({ links: { ...content.links, discord: event.target.value } })} /></label></div></Panel>

        <Panel className="wide" title="Hall of Fame" onAdd={() => update({ members: [...content.members, { id: uid(), ign: "", peakElo: 0, rank: "Silver", role: "Member", country: "" }] })}>
          <div className="repeat-stack">{content.members.map((member, index) => <MemberEditor key={member.id} member={member} onChange={(next) => { const members = [...content.members]; members[index] = next; update({ members }); }} onDelete={() => update({ members: content.members.filter((item) => item.id !== member.id) })} />)}</div>
        </Panel>

        <Panel className="wide" title="Countries represented" onAdd={() => update({ countries: [...content.countries, { id: uid(), name: "", flag: "" }] })}>
          <div className="repeat-stack">{content.countries.map((country, index) => <div className="country-editor editor-card" key={country.id}><label className="field">FLAG<input value={country.flag} onChange={(event) => replaceAt(content.countries, index, { ...country, flag: event.target.value }, (countries) => update({ countries }))} /></label><label className="field">COUNTRY<input value={country.name} onChange={(event) => replaceAt(content.countries, index, { ...country, name: event.target.value }, (countries) => update({ countries }))} /></label><button className="delete-button" onClick={() => update({ countries: content.countries.filter((item) => item.id !== country.id) })}>Remove</button></div>)}</div>
        </Panel>

        <Panel className="wide" title="Community events" onAdd={() => update({ events: [...content.events, { id: uid(), title: "", date: new Date().toISOString().slice(0, 10), summary: "" }] })}>
          <div className="repeat-stack">{content.events.map((event, index) => <EventEditor key={event.id} event={event} onChange={(next) => { const events = [...content.events]; events[index] = next; update({ events }); }} onDelete={() => update({ events: content.events.filter((item) => item.id !== event.id) })} />)}</div>
        </Panel>
      </div>
      <p className={`draft-status ${dirty ? "is-dirty" : ""}`}>{saving ? "Saving changes…" : dirty ? "You have unsaved changes." : "All changes are saved."}</p>
    </div></main>
  );
}

function replaceAt(items, index, value, commit) { const next = [...items]; next[index] = value; commit(next); }

function MemberEditor({ member, onChange, onDelete }) {
  return <div className="editor-card"><div className="field-grid"><label className="field">PLAYER NAME<input value={member.ign} onChange={(event) => onChange({ ...member, ign: event.target.value })} /></label><label className="field">BRAWLHALLA ID<input value={member.brawlhallaId || ""} onChange={(event) => onChange({ ...member, brawlhallaId: event.target.value })} /></label><label className="field">PEAK ELO<input type="number" value={member.peakElo} onChange={(event) => onChange({ ...member, peakElo: Number(event.target.value) || 0 })} /></label><label className="field">RANK<select value={member.rank} onChange={(event) => onChange({ ...member, rank: event.target.value })}>{RANKS.map((rank) => <option key={rank}>{rank}</option>)}</select></label><label className="field">ROLE<select value={member.role} onChange={(event) => onChange({ ...member, role: event.target.value })}>{ROLES.map((role) => <option key={role}>{role}</option>)}</select></label><label className="field">COUNTRY<input value={member.country} onChange={(event) => onChange({ ...member, country: event.target.value })} /></label></div><div className="editor-footer"><button className="delete-button" onClick={onDelete}>Remove player</button></div></div>;
}

function EventEditor({ event, onChange, onDelete }) {
  return <div className="editor-card"><div className="field-grid"><label className="field">EVENT TITLE<input value={event.title} onChange={(input) => onChange({ ...event, title: input.target.value })} /></label><label className="field">DATE<input type="date" value={event.date.slice(0, 10)} onChange={(input) => onChange({ ...event, date: input.target.value })} /></label><label className="field">WINNER (OPTIONAL)<input value={event.winner || ""} onChange={(input) => onChange({ ...event, winner: input.target.value })} /></label><label className="field">PARTICIPANTS<input type="number" value={event.participants || ""} onChange={(input) => onChange({ ...event, participants: Number(input.target.value) || undefined })} /></label></div><label className="field" style={{ marginTop: ".65rem" }}>SUMMARY<textarea value={event.summary} onChange={(input) => onChange({ ...event, summary: input.target.value })} /></label><div className="editor-footer"><button className="delete-button" onClick={onDelete}>Remove event</button></div></div>;
}

function Panel({ title, children, onAdd, className = "" }) {
  return <section className={`admin-panel ${className}`}><div className="panel-head"><h2>{title}</h2>{onAdd && <button className="icon-button" onClick={onAdd} aria-label={`Add ${title}`}>+</button>}</div>{children}</section>;
}
