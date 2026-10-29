import generated from './media.generated.json';

export interface Variant { src: string; width: number; height: number; bytes: number }
export interface Photo {
  id: string; width: number; height: number; alt: string; color: string;
  preview: Variant[]; display: Variant[]; large: Variant; avif?: Variant[];
}
export interface Film { id: string; key: string; title: string; description: string; duration: number; width: number; height: number; poster: string; src: string; bytes: number }
export const photos = generated.photos as Record<string, Photo>;
export const collections = generated.collections as Record<string, string[]>;
export const films = generated.films as Film[];
export const photo = (id: string) => photos[id];
export const collection = (key: string) => collections[key].map(photo);
export const first = (key: string) => collection(key)[0];
export const film = (key: string) => films.find(f => f.key === key)!;

export const themes = [
  { slug:'people', name:'People', subtitle:'Menschen, so wie sie sind.', description:'Nah dran. Draußen unterwegs, im natürlichen Licht oder mit einer Idee, die wir gemeinsam ausprobieren.', note:'Porträts und persönliche Shootings', cover:first('people'), images:collection('people') },
  { slug:'fahrzeuge', name:'Fahrzeuge', subtitle:'Mehr als eine schöne Karosserie.', description:'Licht auf dem Lack, Linien in der Umgebung und die kleinen Details. Fahrzeuge aus ganz unterschiedlichen Perspektiven.', note:'Automotive und Fahrzeugshootings', cover:first('fahrzeuge'), images:collection('fahrzeuge') },
  { slug:'events', name:'Events', subtitle:'Mittendrin statt nur dabei.', description:'Bühnenlicht, volle Räume und die Momente dazwischen. Eine Auswahl aus Partys, DJ-Sets und Veranstaltungen.', note:'Partys, DJs und Veranstaltungen', cover:first('events'), images:collection('events') },
  { slug:'hochzeiten', name:'Hochzeiten', subtitle:'Ein Tag. So viele echte Momente.', description:'Die großen Augenblicke und die leisen dazwischen. Fotografische Begleitung von Laura und Florian sowie Nicole und Thomas.', note:'Hochzeitsfotografie und Film', cover:first('hochzeiten'), images:collection('hochzeiten') },
  { slug:'autotreffen', name:'Autotreffen', subtitle:'Benzin im Gespräch. Licht im Bild.', description:'Menschen, ihre Fahrzeuge und das, was sie zusammenbringt. Unterwegs zwischen Gesprächen, Details und Gegenlicht.', note:'Treffen und automobile Kultur', cover:first('autotreffen'), images:collection('autotreffen') },
  { slug:'tiere', name:'Tiere', subtitle:'Ein eigener Charakter vor der Kamera.', description:'Porträts, Bewegung und die Verbindung zwischen Mensch und Tier. Am liebsten mit Zeit und Platz für natürliche Momente.', note:'Tierfotografie', cover:first('tiere'), images:collection('tiere') },
  { slug:'reisen', name:'Reisen', subtitle:'Mit offenen Augen unterwegs.', description:'Neue Orte, andere Perspektiven. Eine freie fotografische Sammlung von Landschaften, Architektur und Licht.', note:'Freie fotografische Arbeiten', cover:first('reisen'), images:collection('reisen') },
];

export const projects = [
  { slug:'autohaus-heidrich', name:'Autohaus Heidrich', title:'Fahrzeuge im richtigen Licht.', category:'Fahrzeugfotografie', description:'Fahrzeugfotografie für Autohaus Heidrich: unterschiedliche Modelle, bewusst gewählte Perspektiven und wechselnde Umgebungen. Die Auswahl reicht vom klassischen Opel bis zum Pickup – auf dem Parkplatz, in der Landschaft und vor Architektur.', cover:first('heidrich'), images:collection('heidrich'), filmKey:null, tags:['Fahrzeugfotografie','Automotive'], related:'fahrzeuge' },
  { slug:'kekila', name:'Kekila', title:'Menschen. Produkte. Geschichten.', category:'Fotografie und Social Content', description:'Fotografie und Social Content rund um Kekila: Menschen im Betrieb, Produkte und Veranstaltungen. Die Bilder geben Einblicke in unterschiedliche Seiten des Unternehmens; das kurze Video erzählt von einem Teebeutel im Großformat.', cover:first('kekila'), images:collection('kekila'), filmKey:'kekila', tags:['Fotografie','Kurzvideo','Social Content'], related:'people' },
  { slug:'zixspeedracing', name:'Zixspeedracing', title:'Kartsport. Nah am Geschehen.', category:'Motorsportfotografie und Film', description:'Motorsportfotografie und eine Renndokumentation rund um Zixspeedracing. Die Fotos zeigen Fahrten, Vorbereitungen und Momente mit dem Team; der Kurzfilm führt nach Mülsen 2024.', cover:first('zixspeed'), images:collection('zixspeed'), filmKey:'zixspeed', tags:['Motorsportfotografie','Renndokumentation'], related:'fahrzeuge' },
  { slug:'kxxma', name:'KXXMA', title:'Wenn die Bühne aufdreht.', category:'Eventfotografie und Stage-Edit', description:'Eventfotografie und ein kurzer Stage-Edit mit KXXMA. Die Fotos zeigen den DJ am Pult, Bühnenlicht und die Nähe zum Publikum. Dazu siehst du den Video-Edit von Taktgefühl 2024.', cover:first('kxxma'), images:collection('kxxma'), filmKey:'kxxma', tags:['Eventfotografie','Stage-Edit'], related:'events' },
];

export const services = [
  { id:'foto', name:'Fotografie', text:'Fotoshootings für dich, dein Unternehmen oder einen besonderen Anlass. Ob People, Fahrzeuge, Hochzeit oder Bilder für deine Marke: Wir stimmen die Bildidee gemeinsam ab.', items:['People und Business','Automotive','Events und Sport','Hochzeiten','Immobilien und Grundstücke'], image:first('people'), link:'/arbeiten/themen/people' },
  { id:'video', name:'Videografie', text:'Kurze Videos für deinen Social Content oder längere Filme. Für dich, deine Marke, ein Event oder eine Hochzeit – passend zu dem, was du erzählen möchtest.', items:['Social Content und Werbung','Interviews und Mini-Dokus','Vorstellungsvideos','Event- und DJ-Begleitung','Hochzeiten','Motorsport und Immobilien'], image:first('events'), link:'/#filme' },
  { id:'postproduktion', name:'Postproduktion', text:'Du hast bereits Foto- oder Videomaterial? Ich unterstütze dich bei Schnitt, Color Grading und Bildbearbeitung – auch als einzelner Beitrag zu einer bestehenden Produktion.', items:['Kurzvideoschnitt','Schnitt kleiner Projekte','Verarbeitung vorhandenen Materials','Color Grading','Bildbearbeitung'], image:first('kekila'), link:'/arbeiten/kekila' },
  { id:'kamera', name:'Kameraarbeit', text:'Du suchst Unterstützung hinter der Kamera? Als Kamera-Operator werde ich Teil deines Teams – bei Contentdrehs, Livestreams oder als Second Shooter.', items:['Kamera-Operator','Livestreams und Contentdrehs','Second Shooter','POV-Kameras','Gimbal Guide'], image:collection('sandro')[1], link:'/ueber-mich' },
];

export const faqs = [
  ['Bist du offen für neue Themen und Projekte?', 'Auf jeden Fall. Ich erweitere gerne meinen Horizont und wende dabei an, was ich gelernt habe. Mit transparenter Absprache und Planung finden wir heraus, wie sich deine Idee umsetzen lässt.'],
  ['Wie gestaltest du deine Preise?', 'Ich habe keine festen Preise. Ich kalkuliere die Fix- und Standardkosten und bespreche den Preis individuell mit dir – passend zum Auftrag und seinem Umfang.'],
  ['Übernimmst du auch die Planung?', 'Das kommt auf die Projektgröße, deine Erfahrung, die verfügbaren Ressourcen und mein Netzwerk an. Lass uns besprechen, welche Unterstützung du für dein Event oder Shooting brauchst.'],
  ['Können wir zusammen kreative Dinge ausprobieren?', 'Klar! Nur so weiß man, ob es funktioniert oder Spaß macht. Schreib mir, was du vorhast.'],
];

export const biography = [
  'Wir verbringen ja die meiste Zeit auf Arbeit. Und wenn man diese Zeit unglücklich verbringt, wird man im Leben auch nie glücklich. Das dachte ich mir vor acht Jahren selbst und musste am eigenen Leib erfahren, was Nachtschichten, ein falsches Umfeld und wenig Aussichten auf eine bessere Zukunft mit einem machen.',
  'Gott sei Dank waren meine privaten Interessen schon so groß und ausgeprägt, dass ich an mich geglaubt habe und daran, daraus mehr machen zu können.',
  'Ich habe mich schon immer für Technik und vor allem Medien interessiert. Ich bin damit aufgewachsen. Ich fand alles toll, was mit Content Creation, Fotografie oder kreativer Selbstdarstellung zu tun hatte.',
  'Ich habe angefangen, mich für kreative Software wie Photoshop und später auch für Videoschnittprogramme zu interessieren. Natürlich ließ auch die erste Kamera nicht lange auf sich warten. Mit ihr habe ich übrigens meine ersten 100 Euro für ein kleines Event in meinem Heimatort eingenommen.',
  'Ich hatte mir also mit 20 Jahren ein Ziel gesetzt: etwas Kreatives machen und anderen Menschen und Veranstaltern helfen, in diesem Bereich zu wachsen. Mit meiner eBay-Spiegelreflexkamera und der gecrackten Software auf meinem PC versuchte ich, kleine Aufträge an Land zu ziehen. Mit Freunden startete ich ein paar Foto- und Videoprojekte.',
  'Viele private Dinge und mein Job hatten mich ziemlich runtergezogen. Aber meine kreative Nebentätigkeit hat mich nie im Stich gelassen.',
  'Da saß ich nun nach Feierabend als Fotograf, Grafikdesigner und Cutter für kleine wie große Projekte – nach meiner eigentlichen Arbeit. Ich hatte mich in dieser Zeit besser und schneller in den Themen weitergebildet als noch zur Schulzeit.',
  'Mit 23 Jahren kam der Punkt, an dem ich endgültig die Reißleine ziehen wollte. Ich erhielt eine Chance bei einem Unternehmen, baute dort über die letzten Jahre mit neuen Kollegen ein Marketing-Team auf und wir verzeichneten Wachstum und Social-Media-Erfolge, mit denen ich nie gerechnet hätte.',
  'Ich arbeitete weiter an mir und meinen Skills, kam mit unterschiedlichsten Agenturen, Influencern und Auftraggebern in Kontakt. Meine Aufträge wuchsen, bis ich ein Gewerbe gründete.',
  'Ich habe mich verbessert, aufgerüstet und Herausforderungen in unterschiedlichen Branchen gestellt. Heute kann ich sagen, dass ich etwas aus mir gemacht habe, auf das ich stolz sein kann.',
  'Meine Kreativität und schnelles Umdenken sind meine größte Waffe. Davon könnt ihr euch hier selbst überzeugen.',
  'Egal ob Beratung, Content Creation für dich oder deine Marke, Fotografie oder Kamera-Operator: Ich bin dein spezieller Partner für dein kreatives Projekt. Lass es uns machen!',
];
export const contactEmail = 'sandro.mondini@icloud.com';
