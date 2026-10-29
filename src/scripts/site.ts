import { initContactForm } from './contact-form';

let routeController: AbortController | undefined;
let heroPlayed = false;
let stopCurrentMedia = () => {};

function init() {
  routeController?.abort();
  routeController = new AbortController();
  const signal = routeController.signal;
  const on = (element: EventTarget | null, event: string, handler: EventListener) => element?.addEventListener(event, handler, {signal});
  const menu = document.querySelector<HTMLDialogElement>('#menu-dialog');
  const menuButton = document.querySelector<HTMLButtonElement>('[data-open-menu]');
  on(menuButton, 'click', () => { menu?.showModal(); menuButton?.setAttribute('aria-expanded','true'); });
  on(document.querySelector('[data-close-menu]'), 'click', () => menu?.close());
  on(menu, 'close', () => menuButton?.setAttribute('aria-expanded','false'));
  menu?.querySelectorAll('a').forEach(a => on(a,'click',()=>menu.close()));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = document.querySelector('[data-hero]');
  if (hero && !hero.classList.contains('hero--trail') && !heroPlayed && !reduced) {
    heroPlayed=true;
    const windows=[...hero.querySelectorAll<HTMLElement>('.hero-window')];
    const transforms=windows.map(w=>getComputedStyle(w).transform);
    windows.forEach((w,i)=>w.animate([{transform:'translateY(45px) rotate(0deg) scale(.94)',opacity:.5},{transform:transforms[i],opacity:1}],{duration:680,delay:i*35,easing:'cubic-bezier(.2,.7,.2,1)'}));
  }
  const dialog=document.querySelector<HTMLDialogElement>('#media-dialog')!;
  const content=document.querySelector<HTMLElement>('#media-content')!;
  const title=document.querySelector<HTMLElement>('#media-title')!;
  const counter=document.querySelector<HTMLElement>('#media-counter')!;
  const prev=document.querySelector<HTMLButtonElement>('[data-photo-prev]')!;
  const next=document.querySelector<HTMLButtonElement>('[data-photo-next]')!;
  let items: HTMLAnchorElement[] = [], index=0;
  let trigger: HTMLElement | null=null;
  const clear = () => {
    const video=content.querySelector('video');
    if(video){video.pause();video.removeAttribute('src');video.load();}
    content.replaceChildren();
  };
  stopCurrentMedia = () => { clear(); if(dialog.open)dialog.close(); if(menu?.open)menu.close(); };
  const openDialog = () => { if(!dialog.open)dialog.showModal(); };
  const showPhoto = (n:number) => {
    index=(n+items.length)%items.length;
    const item=items[index];
    clear();
    const image=new Image();
    image.alt=item.dataset.caption||'';
    image.width=Number(item.dataset.width);image.height=Number(item.dataset.height);
    image.decoding='async';image.src=item.dataset.large!;
    content.append(image);
    title.textContent=image.alt;counter.textContent=`${index+1} / ${items.length}`;
    prev.hidden=next.hidden=items.length<2;
    dialog.classList.remove('media-dialog--film');
    openDialog();
  };
  document.querySelectorAll<HTMLAnchorElement>('[data-photo]').forEach(a=>on(a,'click',event=>{
    event.preventDefault();trigger=a;
    const gallery=a.closest('[data-gallery]')!;
    items=[...gallery.querySelectorAll<HTMLAnchorElement>('[data-photo]')];
    showPhoto(items.indexOf(a));
  }));
  on(prev,'click',()=>showPhoto(index-1));on(next,'click',()=>showPhoto(index+1));
  on(document.querySelector('[data-close-media]'),'click',()=>dialog.close());
  on(dialog,'close',()=>{clear();trigger?.focus({preventScroll:true});});
  on(dialog,'click',event=>{if(event.target===dialog)dialog.close();});
  on(document,'keydown',event=>{
    const e=event as KeyboardEvent;
    if(!dialog.open||dialog.classList.contains('media-dialog--film'))return;
    if(e.key==='ArrowLeft'){e.preventDefault();showPhoto(index-1);}
    if(e.key==='ArrowRight'){e.preventDefault();showPhoto(index+1);}
  });
  document.querySelectorAll<HTMLButtonElement>('[data-film]').forEach(button=>on(button,'click',()=>{
    clear();trigger=button;
    const video=document.createElement('video');
    video.controls=true;video.playsInline=true;video.preload='none';
    video.poster=button.dataset.poster!;video.src=button.dataset.src!;
    video.width=Number(button.dataset.width);video.height=Number(button.dataset.height);
    video.setAttribute('aria-label',button.dataset.title!);
    content.append(video);title.textContent=button.dataset.title!;counter.textContent='';
    prev.hidden=next.hidden=true;dialog.classList.add('media-dialog--film');
    openDialog();void video.play().catch(()=>{});
  }));
  on(document,'visibilitychange',()=>{if(document.hidden)content.querySelector('video')?.pause();});
  const tabs=[...document.querySelectorAll<HTMLAnchorElement>('[data-work-tab]')];
  const panels=[...document.querySelectorAll<HTMLElement>('[data-work-panel]')];
  if(tabs.length && new URL(location.href).searchParams.get('ansicht')==='projekte'){
    location.replace('/#projekte');
    return;
  }
  const setTab=(value:string,update=false)=>{
    const selected=['themen','filme'].includes(value)?value:'themen';
    tabs.forEach(tab=>{const active=tab.dataset.workTab===selected;tab.setAttribute('aria-current',active?'true':'false');});
    panels.forEach(panel=>panel.hidden=panel.dataset.workPanel!==selected);
    if(update){const url=new URL(location.href);url.searchParams.set('ansicht',selected);history.replaceState(history.state,'',url);}
  };
  if(tabs.length){setTab(new URL(location.href).searchParams.get('ansicht')||'themen');tabs.forEach(tab=>on(tab,'click',e=>{e.preventDefault();setTab(tab.dataset.workTab!,true);}));}
  const form=document.querySelector<HTMLFormElement>('#enquiry');
  if(form) initContactForm(form, signal);
  document.querySelectorAll<HTMLButtonElement>('[data-copy-email]').forEach(button=>on(button,'click',()=>{
    void navigator.clipboard.writeText('sandro.mondini@icloud.com').then(()=>{button.textContent='Adresse kopiert';}).catch(()=>{button.textContent='sandro.mondini@icloud.com';});
  }));
}
document.addEventListener('astro:after-swap',init);
document.addEventListener('astro:page-load',()=>{if(!routeController)init();});
document.addEventListener('astro:before-swap',()=>{stopCurrentMedia();routeController?.abort();routeController=undefined;});
