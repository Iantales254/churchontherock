"use client";

import { type FormEvent, useEffect, useState } from "react";



type ContentItem = { id: string; title: string; description: string; date: string; location: string; url: string };

const defaultBranches = ["Nango", "Nyang'oma", "Sifu Island", "Banga", "Lenya", "Onyinyore", "Nyamwanga", "Alego", "Asembo"];

export default function Home() {

  const [menuOpen, setMenuOpen] = useState(false);

  const [galleryOpen, setGalleryOpen] = useState<number | null>(null);

  const [day, setDay] = useState("All");

  const [contactStatus, setContactStatus] = useState("");

  const [newsletterStatus, setNewsletterStatus] = useState("");

  const [donationStatus, setDonationStatus] = useState("");

  const [branchItems, setBranchItems] = useState<ContentItem[]>(defaultBranches.map((title, index) => ({ id: `default-branch-${index}`, title, description: "", date: "", location: "", url: "" })));

  const [eventItems, setEventItems] = useState<ContentItem[]>([]);

  const [galleryItems, setGalleryItems] = useState<ContentItem[]>([]);

  const [sermonItems, setSermonItems] = useState<ContentItem[]>([]);

  const [fellowshipItems, setFellowshipItems] = useState<ContentItem[]>([]);

  const [peopleItems, setPeopleItems] = useState<ContentItem[]>([]);

  const days = ["Wednesday", "Friday", "Sartuday"];

  const fellowships = [{ day: "FRIDAYS", name: "Prayer Night", time: "6:00 PM", place: "Nango" }, { day: "WEDNESDAY", name: "Home Fellowships", time: "3:00 PM", place: "Household" }, { day: "SARTUDAY", name: "Praise and worship training", time: "2:00 pm", place: "Main church" }, { day: "SARTUDAY", name: "YOUTH PRACTICE", time: "3:30 PM", place: "Nango" }];

  useEffect(() => {

    const load = async (type: string) => {

      const response = await fetch(`/api/content?type=${type}`, { cache: "no-store" });

      return response.ok ? (await response.json()).items as ContentItem[] : [];

    };

    void Promise.all([load("branches"), load("events"), load("gallery"), load("sermons"), load("fellowships"), load("people")]).then(([branches, events, gallery, sermons, fellowships, people]) => {

      if (branches.length) setBranchItems(branches);

      if (events.length) setEventItems(events);

      if (gallery.length) setGalleryItems(gallery);

      if (sermons.length) setSermonItems(sermons);

      if (fellowships.length) setFellowshipItems(fellowships);

      if (people.length) setPeopleItems(people);

    });

  }, []);



  async function submitContact(event: FormEvent<HTMLFormElement>) {

    event.preventDefault();

    setContactStatus("Sending...");

    const form = new FormData(event.currentTarget);

    const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form)) });

    const result = await response.json();

    setContactStatus(response.ok ? "Thanks, your message is on its way." : result.error || "Unable to send message.");

    if (response.ok) event.currentTarget.reset();

  }



  async function submitNewsletter(event: FormEvent<HTMLFormElement>) {

    event.preventDefault();

    setNewsletterStatus("Joining...");

    const form = new FormData(event.currentTarget);

    const response = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form)) });

    const result = await response.json();

    setNewsletterStatus(response.ok ? "You are on the list." : result.error || "Unable to subscribe.");

    if (response.ok) event.currentTarget.reset();

  }



  async function submitDonation(event: FormEvent<HTMLFormElement>) {

    event.preventDefault();

    setDonationStatus("Starting secure M-Pesa prompt...");

    const form = new FormData(event.currentTarget);

    const response = await fetch("/api/donations/mpesa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form)) });

    const result = await response.json();

    setDonationStatus(response.ok ? result.message : result.error || "Unable to start donation.");

  }



  return <main>

    <header className="absolute z-20 w-full px-5 py-5 text-white md:px-10 md:py-7">

      <div className="mx-auto flex max-w-[1380px] items-center justify-between">

        <a href="#top" className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center border border-gold text-lg font-bold">CR</span><span className="sans text-[11px] font-bold uppercase tracking-[.18em]">Church<br />on the Rock</span></a>

        <nav className={`${menuOpen ? "flex" : "hidden"} absolute left-0 top-full w-full flex-col gap-5 bg-ink px-5 py-6 sans text-sm md:static md:flex md:w-auto md:flex-row md:items-center md:gap-8 md:bg-transparent md:p-0`}><a href="#about" onClick={() => setMenuOpen(false)}>Our story</a><a href="#gather" onClick={() => setMenuOpen(false)}>Gather</a><a href="#branches" onClick={() => setMenuOpen(false)}>Branches</a><a href="#events" onClick={() => setMenuOpen(false)}>Events</a><a href="/news" onClick={() => setMenuOpen(false)}>News &amp; teachings</a><a href="#contact" onClick={() => setMenuOpen(false)} className="border border-gold px-4 py-2 text-center text-gold">Get in touch</a></nav>

        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden" aria-label="Toggle menu"><span className="text-2xl">{menuOpen ? "x" : "= "}</span></button>

      </div>

    </header>



    <section id="top" className="hero-image flex min-h-[720px] items-end px-5 pb-16 pt-32 text-white md:min-h-[800px] md:px-10 md:pb-24"><div className="mx-auto w-full max-w-[1380px]"><p className="eyebrow rise">A family of faith Based in Siaya County</p><h1 className="display rise rise-delay mt-5 max-w-4xl">Rooted in<br /><em>Christ.</em><br />Open to all.</h1><div className="mt-9 flex flex-col gap-4 sans sm:flex-row"><a href="#gather" className="bg-gold px-7 py-4 text-center text-sm font-bold text-ink">Lets fellowship together <span className="ml-5">🙏</span></a><a href="#sermons" className="border border-white/60 px-7 py-4 text-center text-sm font-bold">Watch online <span className="ml-5">▶</span></a></div></div></section>



    <section id="about" className="px-5 py-24 md:px-10 md:py-36"><div className="mx-auto grid max-w-[1380px] gap-14 md:grid-cols-[.8fr_1.2fr] md:gap-24"><div><p className="eyebrow">Welcome home</p><h2 className="section-title mt-5">This is the place to be.</h2></div><div className="max-w-2xl"><p className="text-2xl leading-snug md:text-4xl">Church on the Rock(BONDO REGION) is a part of Church on the Rock Africa, a growing family of churches under the ministry of Christian Ministries in Africa.</p><p className="mt-8 max-w-lg text-lg leading-8 text-stone-600">As the Bondo/Siaya Branch we seek to express our calling within our local community-creating a spiritual home where people can encouter God, grow in His Word, discover their purpose and serve others.</p><a href="#story" className="mt-8 inline-block border-b border-rust pb-2 sans text-sm font-bold text-rust"> </a></div></div></section>



    <section id="gather" className="bg-cream px-5 py-24 md:px-10 md:py-32"><div className="mx-auto max-w-[1380px]"><div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="eyebrow">Every Sunday</p><h2 className="section-title mt-4">Come We Praise The Lord.</h2></div><p className="max-w-sm text-lg leading-7 text-stone-600">Join us every Sunday for our Sunday services from Morning until Afternoon. Lets rejoice in the house of the Lord.</p></div><div className="grid gap-5 md:grid-cols-2"><article className="bg-paper p-7 md:p-10"><p className="eyebrow">8:00 AM</p><h3 className="mt-10 text-4xl">INTERSESSORY</h3><p className="mt-4 text-stone-600">A time of prayer, where we communicate to God through our prayers.</p><div className="mt-12 rule flex justify-between pt-4 sans text-xs font-bold uppercase tracking-widest"><span>ALL BRANCHES</span><span>Welcome</span></div></article><article className="bg-rust p-7 text-white md:p-10"><p className="eyebrow">10:00 AM</p><h3 className="mt-10 text-4xl">MAIN SERVICE</h3><p className="mt-4 text-white/75">A joyful and powerful service, where we worship the lord, pray and recieve his teachings.</p><div className="mt-12 border-t border-white/30 pt-4 sans text-xs font-bold uppercase tracking-widest">All Branches<span className="float-right">We love you</span></div></article></div></div></section>



    <section id="leaders" className="px-5 py-24 md:px-10 md:py-32"><div className="mx-auto max-w-[1380px]"><div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="eyebrow">Our leaders</p><h2 className="section-title mt-4">Meet the team guiding us.</h2></div><p className="max-w-md text-lg leading-7 text-stone-600">The shepherds and leaders God has placed over our church family, serving with compassion and wisdom.</p></div><div className="grid gap-8 md:grid-cols-3">{peopleItems.map((person) => <article key={person.id} className="overflow-hidden bg-paper shadow-sm"><img src={person.url} alt={person.title} className="aspect-[4/5] w-full object-cover" /><div className="p-6"><h3 className="text-2xl text-ink">{person.title}</h3>{person.location && <p className="mt-3 sans text-xs font-bold uppercase tracking-[.15em] text-rust">{person.location}</p>}</div></article>)}</div></div></section>



    <section id="branches" className="px-5 py-24 md:px-10 md:py-32"><div className="mx-auto max-w-[1380px]"><div className="grid gap-12 md:grid-cols-[1fr_1.6fr]"><div><p className="eyebrow">One church, different branches</p><h2 className="section-title mt-4">We are<br /><em>closer to you.</em></h2><p className="mt-7 max-w-sm leading-7 text-stone-600">Fellowship with us, from any of our branches.</p></div><div className="grid border-t border-ink/20 sm:grid-cols-2">{branchItems.map((branch, i) => <a key={branch.id} href="#contact" className="group flex items-center justify-between border-b border-ink/20 py-5 pr-3"><span className="sans text-sm font-bold">0{i + 1} <span className="ml-4">{branch.title}</span></span><span className="text-xl text-gold transition-transform group-hover:translate-x-1">↗</span></a>)}</div></div></div></section>



      <section id="events" className="bg-ink px-5 py-24 text-white md:px-10 md:py-32"><div className="mx-auto max-w-[1380px]"><div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="eyebrow">Make room for more</p><h2 className="section-title mt-4">What&apos;s happening.</h2></div><a href="#contact" className="sans text-sm font-bold text-gold">View all events ↗</a></div><div className="mt-16 grid gap-0 border-y border-white/20 md:grid-cols-3">{(eventItems.length ? eventItems : [{ id: "default-event-1", title: "Sunday Worship", description: "", date: "14 Jun · 09:00", location: "Main Church, Nango", url: "" }, { id: "default-event-2", title: "Community Sunday", description: "", date: "21 Jun · 10:00", location: "All branches together", url: "" }, { id: "default-event-3", title: "Worship Night", description: "", date: "28 Jun · 16:00", location: "Main Church, Nango", url: "" }]).map((item) => <article key={item.id} className="border-b border-white/20 py-7 md:border-b-0 md:border-r md:px-8"><p className="eyebrow">{item.date || "Upcoming"}</p><h3 className="mt-5 text-2xl">{item.title}</h3><p className="mt-3 text-white/60">{item.location || "Church on the Rock"}</p></article>)}</div></div></section>



    <section id="fellowships" className="texture px-5 py-24 md:px-10 md:py-32"><div className="mx-auto max-w-[1380px]"><div className="flex flex-col justify-between gap-7 md:flex-row md:items-end"><div><p className="eyebrow">Weekly events</p><h2 className="section-title mt-4">Faith, in the<br /><em>middle of life.</em></h2></div><div className="flex flex-wrap gap-2 sans text-xs font-bold">{days.map((item) => <button key={item} onClick={() => setDay(item)} className={`border px-4 py-2 ${day === item ? "border-ink bg-ink text-white" : "border-ink/25"}`}>{item}</button>)}</div></div><div className="mt-14 grid border-t border-ink/20">{(fellowshipItems.length ? fellowshipItems.map((item) => ({ day: item.date.split(" · ")[0], name: item.title, time: item.date.split(" · ")[1] || "", place: item.location })) : fellowships).filter((item) => day === "All" || item.day === day).map((item) => <div key={item.name} className="grid gap-3 border-b border-ink/20 py-5 md:grid-cols-[1fr_1fr_1fr] md:items-center"><span className="text-2xl">{item.name}</span><span className="sans text-sm text-stone-600">{item.day} · {item.time}</span><span className="sans text-sm text-stone-600 md:text-right">{item.place} ↗</span></div>)}</div></div></section>



    <section id="gallery" className="px-5 py-24 md:px-10 md:py-32"><div className="mx-auto max-w-[1380px]"><div className="flex items-end justify-between"><div><p className="eyebrow">Life together</p><h2 className="section-title mt-4">A glimpse of us.</h2></div><span className="hidden sans text-sm text-stone-500 md:block">Scroll to explore ↠</span></div><div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">{galleryItems.map((item, i) => <button key={item.id} onClick={() => setGalleryOpen(i)} className={`group overflow-hidden rounded-sm bg-paper text-left ${i === 1 ? "md:mt-10" : i === 3 ? "md:mt-20" : ""}`}><img src={item.url} alt={item.title} className="aspect-[3/4] w-full object-cover grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0" /><div className="px-3 py-4"><p className="sans text-xs font-bold uppercase tracking-[.15em] text-rust">Gallery</p><h3 className="mt-2 text-lg text-ink">{item.title}</h3></div></button>)}</div></div></section>



      <section id="sermons" className="bg-gold px-5 py-20 md:px-10"><div className="mx-auto flex max-w-[1380px] flex-col justify-between gap-8 md:flex-row md:items-center"><div><p className="eyebrow text-ink/70">Latest message</p><h2 className="mt-3 text-4xl md:text-6xl">{sermonItems[0]?.title || "The hope we carry."}</h2><p className="mt-3 text-ink/70">{sermonItems[0]?.description || "A sermon series on living with courage, together."}</p></div><a href={sermonItems[0]?.url || "https://www.youtube.com"} target="_blank" rel="noreferrer" className="sans text-sm font-bold underline underline-offset-8">Watch on YouTube ↗</a></div></section>



    <section id="donate" className="bg-cream px-5 py-20 md:px-10 md:py-28"><div className="mx-auto grid max-w-[1380px] gap-12 md:grid-cols-[1fr_1fr] md:items-center"><div><p className="eyebrow">Give generously</p><h2 className="section-title mt-4">Support the work.</h2><p className="mt-6 max-w-lg text-lg leading-8 text-stone-600">You can offer your offering through this platform.</p></div><form onSubmit={submitDonation} className="bg-paper p-7 md:p-10"><div className="grid gap-4 sm:grid-cols-2"><input name="name" placeholder="Your name" required className="border border-ink/20 bg-white px-4 py-3 outline-none focus:border-rust" /><input name="phone" placeholder="07XX XXX XXX" required className="border border-ink/20 bg-white px-4 py-3 outline-none focus:border-rust" /></div><input name="amount" type="number" min="10" placeholder="Amount in KES" required className="mt-4 w-full border border-ink/20 bg-white px-4 py-3 outline-none focus:border-rust" /><button className="mt-4 w-full bg-rust px-5 py-4 sans text-sm font-bold text-white">Give via M-Pesa ↗</button>{donationStatus && <p className="mt-4 sans text-sm text-stone-600">{donationStatus}</p>}</form></div></section>



    <footer id="contact" className="bg-ink px-5 py-20 text-white md:px-10 md:py-28"><div className="mx-auto grid max-w-[1380px] gap-16 md:grid-cols-[1fr_1fr_1.2fr]"><div><p className="eyebrow">We&apos;d love to hear from you</p><h2 className="mt-5 text-4xl md:text-5xl">Let&apos;s stay<br /><em>connected.</em></h2><p className="mt-8 leading-7 text-white/70">Main Church<br />Nango, Siaya County<br />Kenya<br />hello@churchontherock.ke</p></div><div><p className="sans text-xs font-bold uppercase tracking-widest text-gold">Send a message</p><form onSubmit={submitContact} className="mt-5 flex flex-col gap-3"><input name="name" placeholder="Name" required className="border border-white/20 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/40" /><input name="email" type="email" placeholder="Email" required className="border border-white/20 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/40" /><textarea name="message" placeholder="How can we help?" required rows={3} className="border border-white/20 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/40" /><button className="bg-gold px-4 py-3 sans text-sm font-bold text-ink">Send message ↗</button></form>{contactStatus && <p className="mt-3 sans text-xs text-white/60">{contactStatus}</p>}</div><div><p className="sans text-xs font-bold uppercase tracking-widest text-gold">Stay in the loop</p><p className="mt-5 text-white/70">Monthly news, events, and encouragement from the Church on the Rock family.</p><form onSubmit={submitNewsletter} className="mt-5 flex gap-2"><input name="email" type="email" placeholder="Your email" required className="min-w-0 flex-1 border border-white/20 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/40" /><button className="bg-rust px-4 py-3 sans text-sm font-bold">Join</button></form>{newsletterStatus && <p className="mt-3 sans text-xs text-white/60">{newsletterStatus}</p>}<div className="mt-10 flex flex-col gap-3 text-white/70"><a href="#about">Our story</a><a href="#branches">Find a branch</a><a href="#events">Upcoming events</a><a href="/news">News &amp; teachings</a><a href="/admin">Admin dashboard ↗</a></div></div></div><div className="mx-auto mt-20 max-w-[1380px] border-t border-white/20 pt-5 sans text-xs text-white/40">© 2026 Church on the Rock · Nango, Kenya <span className="float-right">mystic technologies</span></div></footer>



    {galleryOpen !== null && <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-5" onClick={() => setGalleryOpen(null)}><div className="max-w-4xl"><img src={galleryItems[galleryOpen].url} alt={galleryItems[galleryOpen].title} className="max-h-[85vh] w-full object-contain" /><p className="mt-4 text-center text-lg text-white">{galleryItems[galleryOpen].title}</p></div><button aria-label="Close gallery" className="absolute right-6 top-5 text-3xl text-white">x</button></div>}

  </main>;

}

