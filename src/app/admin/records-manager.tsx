"use client";

import { useEffect, useState } from "react";

type Table = "newsletter_subscribers" | "contact_messages" | "donations";
const labels: Record<Table, string> = { newsletter_subscribers: "Newsletter subscribers", contact_messages: "Contact messages", donations: "Donations" };

export default function RecordsManager({ table }: { table: Table }) {
  const [rows, setRows] = useState<Record<string, string | number | null>[]>([]);
  const [status, setStatus] = useState("");
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/records?table=${table}`, { cache: "no-store" }).then((response) => response.json()).then((result) => {
      if (!cancelled) { setRows(result.rows || []); if (result.error) setStatus(result.error); }
    });
    return () => { cancelled = true; };
  }, [table]);
  return <div className="bg-white p-6 md:p-8"><div className="flex items-center justify-between"><div><p className="sans text-[10px] font-bold uppercase tracking-widest text-[#a44d32]">Supabase records</p><h2 className="mt-2 text-3xl">{labels[table]}</h2></div><span className="sans text-xs text-[#77756e]">{rows.length} records</span></div>{status && <p className="mt-5 border-l-4 border-[#a44d32] bg-[#f8f7f2] p-3 sans text-sm">{status}</p>}<div className="mt-7 grid border-t border-[#202421]/15">{rows.length === 0 ? <p className="py-8 text-[#77756e]">No records yet.</p> : rows.map((row, index) => <div key={String(row.id || index)} className="border-b border-[#202421]/15 py-5"><div className="grid gap-2 sm:grid-cols-3">{Object.entries(row).filter(([key]) => !["id", "created_at", "subscribed_at"].includes(key)).map(([key, value]) => <div key={key}><p className="sans text-[10px] font-bold uppercase tracking-wider text-[#77756e]">{key.replaceAll("_", " ")}</p><p className="mt-1 text-sm break-words">{String(value ?? "")}</p></div>)}</div></div>)}</div></div>;
}
