import { contactEmail } from './portfolio';

// Anbieterangaben laut Sandros Briefing-PDF „Sandro M. Website Texte und Infos 2026“,
// Abschnitt „Impressumsdaten“. Bewusst nicht veröffentlicht: die Steuernummer (keine
// Impressumspflicht, nur eine USt-IdNr. wäre anzugeben) und „Amtsgericht Görlitz“
// (nur bei einem Registereintrag relevant, den ein Einzelgewerbe nicht hat).
export const provider = {
  name: 'Sandro Mondini',
  street: 'Robert-Berndt-Straße 18',
  city: '02708 Löbau',
  country: 'Deutschland',
  email: contactEmail,
};

// Hosting der Website. Bei einem späteren Wechsel (z. B. eigene Domain bei anderem
// Anbieter) hier und im Datenschutz anpassen.
export const hosting = {
  name: 'Vercel Inc.',
  address: '440 N Barranca Ave #4133, Covina, CA 91723, USA',
  privacyUrl: 'https://vercel.com/legal/privacy-policy',
};

export const legalUpdated = 'November 2026';
