import generated from './media.generated.json';

export interface Variant { src: string; width: number; height: number; bytes: number }
export interface Photo {
  id: string; width: number; height: number; alt: string; color: string;
  preview: Variant[]; display: Variant[]; large: Variant; avif?: Variant[]; kind?: 'film-poster';
}
export interface Film { id: string; key: string; title: string; description: string; duration: number; width: number; height: number; poster: string; src: string; bytes: number; coverId?: string }
export const photos = generated.photos as Record<string, Photo>;
export const collections = generated.collections as Record<string, string[]>;
export const films = generated.films as Film[];
export const photo = (id: string) => photos[id];
export const collection = (key: string) => collections[key].map(photo);
export const first = (key: string) => collection(key)[0];
export const film = (key: string) => films.find(f => f.key === key)!;

const curatedPeopleIds = ["1XpXigQVcsMNC2XFNH8ZbzLsSDWJ4iBkh", "1FKRwC-Laq21vAe-DfvIbTVIGX43J_QKC", "19C_dkzDoPpoodBEI4h_mEMvnVLuaxGxO", "14UDWX8QULotiOOAqv_cE1n9HSUdJoeb6", "1aQFlo4zRBXToKvYNYchwbYzoCYhUN7xO", "1-HMPKCz6ZvFVPOSZl5L6UOZ9nSPs3xTy", "12m-dv9jGQxJsNu3RDJRUYlwMkgknpMZ_", "1fQu9PFB46S96rXpq2RakOzYz7XGfp4f7", "1AAb9_JvA1poP6LQ8ktshIdkPDyXQPSgI", "1DWazbTW3If6GScxAKLflxu-cmin6f3Q_", "1mQeziG3XKC3MkJ5_VlROedeBD6f_qERg", "1BFV_TJ5AFp2EC3i1QpAW6TJLtEjrQOaK", "1t-cZCSsIs2BtliD1Yat6F_YLotP8Yv-G", "1m2ZhsGeQF_rOMAtgORSfsaQ10OGwsnNo"];
const excludedAnimalIds = new Set(['1DONW1U_MzB70tH8IfPUpS2BwGiVE23es', '1UI85atQM3gtsPTn1Y6xK5atAQM8-ym6W']);
const peopleBackdrop = photo("1AAb9_JvA1poP6LQ8ktshIdkPDyXQPSgI");
// Only the theme's reading order changes; its cover, scenery and Hero sources
// continue to use the untouched generated collection.
const autotreffenImages = collection('autotreffen');
[autotreffenImages[0], autotreffenImages[2]] = [autotreffenImages[2], autotreffenImages[0]];

const themeData = [
  { slug:'people', name:'People', subtitle:'Porträts und persönliche Shootings.', description:'Porträts draußen, im natürlichen Licht oder mit einer Bildidee, die wir gemeinsam ausprobieren.', note:'Porträts und persönliche Shootings', cover:first('people'), backdrop:peopleBackdrop, images:[...curatedPeopleIds, ...collections['people-culture-day']].map(photo) },
  { slug:'fahrzeuge', name:'Fahrzeuge', subtitle:'Fahrzeuge aus verschiedenen Perspektiven.', description:'Fahrzeugfotos aus unterschiedlichen Perspektiven, mit wechselnden Umgebungen und einem Blick für Details.', note:'Automotive und Fahrzeugshootings', cover:first('fahrzeuge'), backdrop:first('fahrzeuge'), images:collection('fahrzeuge') },
  { slug:'events', name:'Events', subtitle:'Partys, DJs und Veranstaltungen.', description:'Eine Auswahl von Fotos aus Partys, DJ-Sets und Veranstaltungen.', note:'Partys, DJs und Veranstaltungen', cover:first('events'), backdrop:first('events'), images:collection('events'), filmKeys:['schalla-2024','lounge-jakobimarkt'], filmHeading:'Eventfilme' },
  { slug:'hochzeiten', name:'Hochzeiten', subtitle:'Hochzeitsfotografie.', description:'Fotografische Begleitung von Hochzeiten.', note:'Hochzeitsfotografie und Film', cover:first('hochzeiten'), backdrop:first('hochzeiten'), images:collection('hochzeiten'), filmKeys:['hochzeit-marie-wenzel-trailer','hochzeit-nicole-thomas-trailer','hochzeit'], filmHeading:'Hochzeitsfilm Beispiele' },
  { slug:'autotreffen', name:'Autotreffen', subtitle:'Menschen und Fahrzeuge bei Autotreffen.', description:'Fotos von Menschen und Fahrzeugen bei Autotreffen, mit Aufnahmen der Fahrzeuge und ihrer Details.', note:'Treffen und automobile Kultur', cover:first('autotreffen'), backdrop:first('autotreffen'), images:autotreffenImages },
  { slug:'tiere', name:'Tiere', subtitle:'Tiere in Porträts und Bewegung.', description:'Tierporträts, Aufnahmen in Bewegung und Bilder von Menschen mit ihren tierischen Begleitern.', note:'Tierfotografie', cover:first('tiere'), backdrop:first('tiere'), images:collection('tiere').filter(image => !excludedAnimalIds.has(image.id)) },
  { slug:'reisen', name:'Reisen', subtitle:'Landschaften, Architektur und Licht.', description:'Freie Sammlung von meinen Reisen.', note:'Freie fotografische Arbeiten', cover:first('reisen'), backdrop:first('reisen'), images:collection('reisen') },
];

export const themes = themeData.map(theme => ({ ...theme, filmKeys: theme.filmKeys ?? [], filmHeading: theme.filmHeading ?? 'Filme' }));

export const mainFilmKeys: string[] = ['jamina-aperol','zixspeed-lohsa','kxxma','schalla-2024','greeneyes-upperhive','hochzeit'];
export const r2Images = {
  heroVehicle:photo('10Jclk9w74rC7aEzIkqp8MzJ7r7Dl0Ny5'),
  workplaceGimbal:photo('13Whveks9hoSPFgZkV7piNqyWDNi311kd'),
  eventCamera:photo('1rL5il04tynMaFDDKgwjFBSfhUpKxgL7g'),
  postproduction:photo('19ch1IcrenlHmHD0HniJbDJZSJ0cXWpp6'),
};
export interface Project {
  slug:string; name:string; title:string; category:string; description:string;
  descriptionParagraphs?:string[]; cover:Photo; images:Photo[]; filmKey:string|null; filmKeys:string[];
  tags:string[]; related:string; works?:{title:string; description:string; filmKeys:string[]; imageIds:string[]}[];
}
const filmCover = (key:string) => photo(film(key).coverId!);
const kekilaIntro = 'Fotografie und Social Media Content rund um Kekila: Menschen im Betrieb, Produkte und Veranstaltungen.';
const kekilaFilms = 'Fotos und kurze Filme geben Einblicke in unterschiedliche Seiten des Unternehmens und begleiten Geschichten aus dem Arbeitsalltag.';
export const projects: Project[] = [
  { slug:'kxxma', name:'KXXMA', title:'Wenn die Bühne aufdreht.', category:'Eventfotografie und Stage-Edit', description:'Eventfotografie und Film mit KXXMA: der DJ am Pult, Bühnenlicht und die Nähe zum Publikum. Fotos und Stage-Edits halten die Atmosphäre seiner Auftritte fest.', cover:first('kxxma'), images:collection('kxxma'), filmKey:'kxxma', filmKeys:['kxxma'], tags:['Eventfotografie','Stage-Edit'], related:'events' },
  { slug:'green-eyes-media', name:'Green Eyes Media', title:'Einblicke in die Zusammenarbeit.', category:'Fotografie und Film', description:'Green Eyes Media ist eine Marketingagentur, für die ich freiberuflich gearbeitet habe. Hier findest du Foto- und Filmarbeiten aus dieser Zusammenarbeit, von Sportveranstaltungen bis zu Partys und kulturellen Events.', cover:photo('1A_B6EX5IVVfqI4ggXXaG27mJ11CNS_gK'), images:collection('greeneyes'), filmKey:'greeneyes-upperhive', filmKeys:['greeneyes-roedertal','greeneyes-upperhive'], tags:['Eventfotografie','Film','Freie Mitarbeit'], related:'events', works:[
    {title:'FC Rödertal',description:'Heimspiel zum Saisonende 2025, als Film zusammengefasst.',filmKeys:['greeneyes-roedertal'],imageIds:[]},
    {title:'Upperhive',description:'Afterwork Party 2025 im Film.',filmKeys:['greeneyes-upperhive'],imageIds:[]},
    {title:'Culture Day',description:'Fotografische Begleitung des Culture Day in Berlin 2025.',filmKeys:[],imageIds:collections.greeneyes},
  ] },
  { slug:'autohaus-heidrich', name:'Autohaus Heidrich', title:'Fahrzeuge im richtigen Licht.', category:'Fahrzeugfotografie', description:'Fahrzeugfotografie für Autohaus Heidrich: unterschiedliche Modelle, Perspektiven und Umgebungen. Die Auswahl zeigt Fahrzeuge auf der Straße, in der Landschaft und vor Architektur.', cover:first('heidrich'), images:collection('heidrich'), filmKey:null, filmKeys:[], tags:['Fahrzeugfotografie','Automotive'], related:'fahrzeuge' },
  { slug:'kekila', name:'Kekila', title:'Menschen. Produkte. Geschichten.', category:'Fotografie und Social Media Content', description:kekilaIntro+'\n'+kekilaFilms, descriptionParagraphs:[kekilaIntro,kekilaFilms], cover:first('kekila'), images:collection('kekila'), filmKey:'kekila', filmKeys:['kekila','kekila-lagerregal','kekila-lager-container-weg','kekila-marmeladenwettbewerb'], tags:['Fotografie','Kurzvideo','Social Media Content'], related:'people' },
  { slug:'zixspeedracing', name:'Zixspeedracing', title:'Kartsport. Nah am Geschehen.', category:'Motorsportfotografie und Film', description:'Fotos und Filme rund um Zixspeedracing: Fahrten, Vorbereitungen und Momente mit dem Team. Die Begleitung verbindet das Geschehen auf der Strecke mit Einblicken ins Training und den Kartsport.', cover:first('zixspeed'), images:collection('zixspeed'), filmKey:'zixspeed', filmKeys:['zixspeed-lohsa','zixspeed'], tags:['Motorsportfotografie','Kurzfilm','Short'], related:'fahrzeuge' },
  { slug:'lounge-oderwitz', name:'Lounge Oderwitz', title:'Partys. Menschen. Musik.', category:'Eventfilm und Social Media Content', description:'Eventfilme und Social Media Content aus der Lounge Oderwitz. Kurze Filme halten die Musik, die Menschen und die Atmosphäre unterschiedlicher Veranstaltungen fest.', cover:filmCover('lounge-jakobimarkt'), images:[], filmKey:'lounge-jakobimarkt', filmKeys:['lounge-80er-90er','lounge-jakobimarkt','lounge-hausparty','lounge-tekknowitz'], tags:['Eventfilm','Shorts','Social Media Content'], related:'events' },
  { slug:'nohand-mtb', name:'NoHand MTB', title:'Auf dem Bike. Mitten im Geschehen.', category:'Mountainbike-Fotografie und Short', description:'Foto- und Videobegleitung rund um den Mountainbike-YouTuber und Influencer NoHand MTB. Sprünge, Training und Momente mit dem Publikum geben Einblicke ins Mountainbike-Umfeld, auch bei den Dirtmasters.', cover:photo('1hBXDIyXdx0jjdEFVahsTfQSPLSSY9svZ'), images:collection('nohand'), filmKey:'nohand-wheelie', filmKeys:['nohand-wheelie'], tags:['Mountainbike','Fotografie','Short','Influencer Begleitung'], related:'people' },
  { slug:'schamo-beach-party', name:'Schamo Beach Party', title:'Zehn Jahre Schamo.', category:'Eventfilm', description:'Filmische Eindrücke von der Schamo Beach Party. Musik und Sounddesign begleiten die Atmosphäre der Veranstaltung, darunter die Jubiläumsausgabe „10 Jahre Schamo“.', cover:filmCover('schamo-aftermovie'), images:[], filmKey:'schamo-aftermovie', filmKeys:['schamo-aftermovie'], tags:['Eventfilm','Aftermovie'], related:'events' },
  { slug:'jamina', name:'Jamina', title:'Sunday Vibes am Ostra Beach.', category:'Social Media Content', description:'Social Media Content mit Jamina am Ostra Beach. Das Aperol Sunday Vibes liefert die Kulisse für kurze Momente im Reel-Format.', cover:filmCover('jamina-aperol'), images:[], filmKey:'jamina-aperol', filmKeys:['jamina-aperol'], tags:['Social Media Content','Reel'], related:'events' },
  { slug:'schalla-balla', name:'Schalla Balla', title:'15 Jahre Open Air.', category:'Eventfilm', description:'Filmische Eindrücke vom Schalla Balla Open Air: Musik, Bühnenlicht und Publikum. Dazu gehört die Ausgabe „15 Jahre Schalla Balla“ von 2024.', cover:filmCover('schalla-2024'), images:[], filmKey:'schalla-2024', filmKeys:['schalla-2024'], tags:['Eventfilm','Aftermovie','Open Air'], related:'events' },
];
export const featuredProjects = ['kxxma','green-eyes-media','autohaus-heidrich','kekila'].map(slug => projects.find(project => project.slug === slug)!);

export const services = [
  { id:'foto', name:'Fotografie', text:'Fotoshootings für dich, dein Unternehmen oder einen besonderen Anlass. Ob People, Fahrzeuge, Hochzeit oder Bilder für deine Marke: Wir stimmen die Bildidee gemeinsam ab.', items:['People und Business','Automotive','Events und Sport','Hochzeiten','Immobilien und Grundstücke'], image:first('people'), link:'/arbeiten/themen/people' },
  { id:'video', name:'Videografie', text:'Kurze Videos für deinen Social Media Content oder längere Filme. Für dich, deine Marke, ein Event oder eine Hochzeit, passend zu dem, was du erzählen möchtest.', items:['Social Content und Werbung','Interviews und Mini-Dokus','Vorstellungsvideos','Event- und DJ-Begleitung','Hochzeiten','Motorsport und Immobilien'], image:first('events'), link:'/#filme' },
  { id:'postproduktion', name:'Postproduktion', text:'Du hast bereits Foto- oder Videomaterial? Ich unterstütze dich bei Schnitt, Color Grading und Bildbearbeitung, auch als einzelner Beitrag zu einer bestehenden Produktion.', items:['Kurzvideoschnitt','Schnitt kleiner Projekte','Verarbeitung vorhandenen Materials','Color Grading','Bildbearbeitung'], image:r2Images.postproduction, link:'/arbeiten/kekila' },
  { id:'kamera', name:'Kameraarbeit', text:'Du suchst Unterstützung hinter der Kamera? Als Kamera-Operator werde ich Teil deines Teams, bei Contentdrehs, Livestreams oder als Second Shooter.', items:['Kamera-Operator','Livestreams und Contentdrehs','Second Shooter','POV-Kameras','Gimbal Guide'], image:collection('sandro')[1], link:'/ueber-mich' },
];

export const faqs = [
  ['Bist du offen für neue Themen und Projekte?', 'Auf jeden Fall. Ich erweitere gerne meinen Horizont und wende dabei an, was ich gelernt habe. Mit transparenter Absprache und Planung finden wir heraus, wie sich deine Idee umsetzen lässt.'],
  ['Wie gestaltest du deine Preise?', 'Ich habe keine festen Preise. Ich kalkuliere die Fix- und Standardkosten und bespreche den Preis individuell mit dir, passend zum Auftrag und seinem Umfang.'],
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
