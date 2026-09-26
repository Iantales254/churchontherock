"use client";

import { useState } from "react";
import Link from "next/link";
import ContentManager from "./content-manager";
import RecordsManager from "./records-manager";

type ContentType = "events" | "branches" | "sermons" | "gallery" | "people" | "fellowships" | "articles";
type Section = "Overview" | "Events" | "Branches" | "Sermons" | "Gallery" | "People" | "Fellowships" | "News & Teachings" | "Newsletter" | "Messages" | "Donations";
const navItems: Section[] = ["Overview", "Events", "Branches", "Sermons", "Gallery", "People", "Fellowships", "News & Teachings", "Newsletter", "Messages", "Donations"];
const contentTypes: Partial<Record<Section, ContentType>> = { Events: "events", Branches: "branches", Sermons: "sermons", Gallery: "gallery", People: "people", Fellowships: "fellowships", "News & Teachings": "articles" };
const recordTables: Partial<Record<Section, "newsletter_subscribers" | "contact_messages" | "donations">> = { Newsletter: "newsletter_subscribers", Messages: "contact_messages", Donations: "donations" };

function Header() { return <header className="border-b border-[#202421]/15 bg-[#202421] px-5 py-5 text-white md:px-10"><div className="mx-auto flex max-w-[1440px] items-center justify-between"><Link href="/" className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center border border-[#c99a43] text-sm font-bold">CR</span><span className="sans text-xs font-bold uppercase tracking-widest">Church on the Rock<br /><span className="font-normal text-white/50">Content studio</span></span></Link><Link href="/" className="text-[#c99a43]">View site ↗</Link></div></header>; }
function Sidebar({ active, setActive }: { active: Section; setActive: (section: Section) => void }) { return <aside className="border-r border-[#202421]/15 p-5 md:min-h-[calc(100vh-76px)] md:p-7"><p className="sans mb-4 text-[10px] font-bold uppercase tracking-widest text-[#77756e]">Workspace</p><nav className="flex gap-2 overflow-auto md:flex-col">{navItems.map((item) => <button key={item} onClick={() => setActive(item)} className={`whitespace-nowrap px-3 py-3 text-left sans text-sm ${active === item ? "bg-[#c99a43] font-bold" : "text-[#77756e] hover:bg-white"}`}>{item}</button>)}</nav><div className="mt-16 hidden border-t border-[#202421]/15 pt-5 md:block"><p className="sans text-xs leading-5 text-[#77756e]">Role: <strong className="text-[#202421]">Administrator</strong><br />Content and records access</p></div></aside>; }

export default function AdminDashboard() {
  const [active, setActive] = useState<Section>("Overview");
  const contentType = contentTypes[active];
  const recordTable = recordTables[active];
  return <main className="min-h-screen bg-[#f1efe8] text-[#202421]"><Header /><div className="mx-auto grid max-w-[1440px] md:grid-cols-[230px_1fr]"><Sidebar active={active} setActive={setActive} /><section className="p-5 md:p-10"><p className="sans text-[10px] font-bold uppercase tracking-widest text-[#a44d32]">{active}</p><h1 className="mt-2 text-4xl md:text-5xl">{active === "Overview" ? "Good morning, team." : `Manage ${active.toLowerCase()}.`}</h1>{contentType && <div className="mt-10"><ContentManager type={contentType} /></div>}{recordTable && <div className="mt-10"><RecordsManager table={recordTable} /></div>}{active === "Overview" && <div className="mt-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[["Events", "Manage upcoming gatherings"], ["Gallery", "Upload church images"], ["Newsletter", "Review subscribers"], ["Messages", "Read contact requests"]].map(([title, description]) => <button key={title} onClick={() => setActive(title as Section)} className="bg-white p-6 text-left hover:bg-[#c99a43]"><p className="text-2xl">{title}</p><p className="mt-3 sans text-xs text-[#77756e]">{description}</p><span className="mt-7 block sans text-xs font-bold">Open section ↗</span></button>)}</div>}</section></div></main>;
}
