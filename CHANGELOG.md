# Changelog

Alle nennenswerten Änderungen am *Cite-Konverter für Wikipedia* – neueste Version zuerst. Die letzten Einträge sind auch direkt im Tool über das 📜-Symbol einsehbar.

Benannte Minor-Versionen (mit Codename) sind Funktions-Releases, Patches betreffen Fehlerbehebungen und Robustheit. Mehrere kleine, am selben Tag entstandene Patches sind zu Bereichen zusammengefasst (z. B. `v4.0 – v4.0.10`).

## v12.3.0 (2026-09-30)

**Barrierefreiheit: Kontrast**

Alle 38 Themes wurden in Hell- und Dunkelmodus, auf Desktop- und Mobilbreite automatisiert gemessen (Text gegen den tatsächlich gerenderten Hintergrund, einschließlich Verläufen und Glas-Effekt). Ziel: WCAG AA, also 4,5:1 für Text und 3:1 für den großen Titel. Nach den Änderungen meldet die Messung keine Unterschreitung mehr.

- Buttons und Badges: Bei 26 Themes waren die Akzentverläufe zu hell für weiße bzw. zu dunkel für dunkle Schrift (u. a. Spice, Colonial Cobalt, Ancient Gild, Vintage Hearth). Die Verlaufsstopps wurden nur in der Helligkeit verschoben, Farbton und Sättigung bleiben.
- Titel und Untertitel: Wo der Farbverlauf des Titels oder die Akzentfarbe des Untertitels auf dem Theme-Hintergrund zu schwach war, gibt es je Theme und Modus eine abgedunkelte bzw. aufgehellte Variante (gesammelt in einem Override-Block am Ende des Stylesheets).
- Konvertierungs-Log: Die Etiketten („Info“, angewendete Hinweise) haben jetzt einen fast deckenden eigenen Grund, statt nur leicht getönt über dem Theme zu liegen. Auf dunklen Themes fiel der Kontrast vorher bis auf 2,6:1.
- Theme-Kacheln im Dunkelmodus: heller Text lag auf halbtransparentem Weiß (etwa 3:1). Die Kacheln sind im Dunkelmodus jetzt dunkel hinterlegt.
- Eingabe-Platzhalter (z. B. DeepL-Schlüssel), `<ref>`-Hervorhebung im Hellmodus, Datumszeilen im Versionsverlauf und der Routen-Zähler sind dunkler bzw. weniger transparent.

## v12.2.0 (2026-09-30)

**Neu**

- Zufallsmodus im Farbschema: Die Kachel „🎲 Zufall“ (EN: „Random“) speichert `random` als Theme. Bei jedem Laden der Seite und bei jedem erneuten Klick auf die Kachel wird eines der 38 Themes zufällig angewendet. Das zuletzt gezogene Theme (`localStorage.themeRandomLast`) ist dabei ausgeschlossen, damit ein Neuladen sichtbar wechselt. Die Kachel zeigt das aktuell gezogene Theme an; Favicon, `theme-color` und Dunkelmodus folgen dem tatsächlich angewendeten Theme.
- Ein unbekannter gespeicherter Theme-Name (z. B. aus einer älteren Version) fällt jetzt auf Sunset zurück, statt eine wirkungslose Klasse zu setzen.

## v12.1.0 (2026-09-30)

Fehlerbehebungen, Aufräumarbeiten und Barrierefreiheit aus einem Gesamt-Review von v12.0.0.

**Behoben (hoch)**

- Selbstschließende Refs (`<ref name=a/>`) galten als Öffnungs-Tag. Folge: Die nächste echte Referenz blieb unkonvertiert, im DOI-Pfad ging Fließtext verloren. Betroffen waren Hauptkonvertierung, DOI-Block und Konvertierungs-Log; alle erkennen `/>` jetzt einheitlich.
- DOI-Auflösung ersetzte ganze Segmente: Ohne `<ref>` blieb vom gesamten Text nur `{{Literatur}}` übrig, und Begleittext in einer Ref („Müller 2019, S. 5; …“) verschwand. Eine vorlagenlose DOI wird jetzt nur noch aufgebaut, wenn das Segment im Wesentlichen aus der DOI besteht; sonst bleibt der Text unverändert.
- Ein `{{Internetquelle}}` in der Eingabe wurde als `cite web` behandelt und dabei zerstört. deWP-Vorlagen bleiben jetzt unangetastet.
- `last=… |last2=…` ergab nur den zweiten Autor (cite web, Citation). Alle Konverter nutzen jetzt einen gemeinsamen Personensammler; unnummerierte Angaben zählen als Nr. 1, `authorN` wird berücksichtigt.
- `url-access=subscription` landete in cite web als `abruf=`. Entfällt.
- Ausgeschriebene Sprachnamen wurden abgeschnitten (`German` → `ge`, `Dutch` → `du`). Englische und deutsche Sprachnamen werden jetzt vorab auf ISO-Codes abgebildet.
- Zwischenspeicher in `localStorage` wuchsen unbegrenzt: Crossref-Antworten wurden vollständig gespeichert (bis etwa 70 KB je DOI), der Ablauf galt für den ganzen Block und verschob sich bei jedem Schreiben, und bei vollem Speicher cachte danach auch Wikidata nichts mehr. Neues Format mit Ablauf je Eintrag und Obergrenze; bei Platzmangel werden die ältesten Einträge verworfen. Crossref speichert nur noch die benötigten Felder, Dateigrößen und Discogs liegen in je einem begrenzten Block statt in einem Schlüssel pro URL. Alte Caches werden einmalig entfernt.

**Behoben (mittel)**

- Datumsformate: `Mar 7, 2007` ergab `2007-Mar-07`, `March 2007` und `2007-3-7` blieben roh. Kurzmonate (auch `Sept.`, deutsche Abkürzungen) werden erkannt, „Monat Jahr“ wird zu `JJJJ-MM`, Unbekanntes bleibt im Original.
- `url-status=dead` ohne `archive-url` setzt jetzt `offline=1`. cite web, cite press release und `{{Citation}}` → `{{Internetquelle}}` nutzen eine gemeinsame Archivregel; im Citation-Pfad griff die Option „Archiv-Parameter entfernen“ vorher nicht, und `abruf` war immer heute.
- Wikidata: HTTP-Status und API-Fehler (Ratelimit, `maxlag`) werden geprüft. Sie kamen mit HTTP 200 und wurden ein Jahr lang als „kein deutscher Artikel“ gespeichert.
- Doppelklick auf Konvertieren startete parallele Läufe, `curly:converted` feuerte doppelt. Während eines Laufs ist der Button gesperrt (`aria-busy`, sichtbarer Wartezustand); das Ereignis trägt eine `runId`.
- Discogs-Links in einem externen Link `[URL Text]` ergaben kaputten Wikitext. Der ganze Link wird ersetzt, der verworfene Linktext steht im Log.
- Crossref-Werte mit `|`, `}}` oder `]]` brachen die Vorlage; sie werden jetzt entschärft.
- Das Übernehmen abweichender Crossref-Felder baute die Ausgabe aus der Eingabe neu und verwarf dabei Discogs-, Dateigrößen- und Log-Umschaltungen. Es ersetzt jetzt nur die betroffene Vorlage in der aktuellen Ausgabe.
- Vorlagen außerhalb von Refs blieben unkonvertiert, sobald eine Ref etwas geändert hatte, und je Ref wurde nur die erste Vorlage umgewandelt. Ein Durchlauf erfasst jetzt alle Vorlagen im Text.
- `{{rp|page=5}}` ergab `details="S. page=5"`; benannte Werte werden ausgewertet, das angehängte Leerzeichen vor Satzzeichen entfällt.
- Spracherkennung zählt Treffer je Sprache, statt die erste passende Regel gewinnen zu lassen („Die Hard review“ war Deutsch).
- Kennungen (ISBN, OCLC, SSRN, HDL …) werden in allen Konvertern gleich abgebildet; cite encyclopedia überschrieb vorher `ID` mit jeder weiteren Kennung.

**Behoben (niedrig)**

- Präfixe „ISBN“ und `p.`/`pp.` werden entfernt; die Formaterkennung versteht `datei.PDF?x=1`; `publisher` geht neben `work` nicht mehr verloren; `cite_web` und abweichende Schreibweisen werden erkannt; cite press release setzt `abruf` nur noch mit Option oder `access-date`; der Dunkelmodus folgt dem System auch nach späterem Umschalten auf „automatisch“; Wikidata-Ersetzungen können sich nicht mehr verketten; DOI-Cache-Schlüssel sind kleingeschrieben; zwischen Discogs-Abrufen liegt eine kurze Pause.
- `{{cite conference}}`: `chapter` wird nicht mehr zu `Kapitel` (laut enWP-Doku zeigt die Vorlage es nicht an), die Option „Abrufdatum auf heute“ wirkt, verworfene Archivangaben und `quote` stehen im Log, die Kennungen folgen cite book, erfolglose Crossref-Suchen werden nur noch 14 Tage gespeichert. Die Crossref-Anreicherung greift weiterhin nur, wenn Ein- und Ausgabe gleich viele Refs haben (sonst ist die Zuordnung Quelle ↔ Ausgabe nicht sicher); dann bleibt die einfache Konvertierung stehen.
- `type=` wird in `{{Literatur}}` nicht mehr als `Typ` übernommen (einziger gültiger Wert ist `wl`), `quote` nicht mehr als das veraltete `Zitat`; beides steht als Hinweis im Log.

**Sicherheit und Datenschutz**

- DeepL-Key standardmäßig nur in `sessionStorage` (bis zum Schließen des Tabs); dauerhaft nur mit „Key dauerhaft im Browser speichern“.
- Update-Links aus der GitHub-API werden nur übernommen, wenn sie auf `https://github.com/` zeigen.
- Bridge 1.6.0: engeres `@include` (`file://*/Cite-Konverter*.html*`) und zusätzliche Prüfung, dass die Seite Curly ist; DeepL-Payload in `<d>…</d>` wie im Tool (behebt Abbrüche nach Platzhaltern); Zwischenablage über `GM_setClipboard`; Timeouts passend zur Konvertier- und Übersetzungsdauer; Ersetzung über `insertText`, damit Strg/Cmd+Z funktioniert; Version aus `GM_info` statt hart codiert; wartet nur auf das `curly:converted` des eigenen Laufs. `@namespace` bleibt bewusst beim alten Repo-Namen: Userscript-Manager erkennen Skripte an Name + Namespace, eine Änderung würde die Bridge als zweites Skript neben der alten installieren.
- Crossref wird weiterhin ohne `mailto=` abgefragt (keine persönliche Adresse im Code); HEAD-Anfragen für die Dateigröße bleiben standardmäßig an und sind jetzt in README und Website dokumentiert.

**Aufgeräumt**

- Entfernt: ungenutzte Funktionen (`escapeHtml`, `refRegex`, zweites `looksEnglish`), der stillgelegte Fallback-Konverter, wirkungslose `setTimeout`-Nachbearbeiter, der tote Override von `buildInternetquelle`, die Builder-Kopien im DOI-Block (er nutzt jetzt die des Hauptskripts, einschließlich der Abruf-Regel), veraltete Kopfkommentare und etwa 70 CSS-Regeln für die nie gesetzte Klasse `body.dark` sowie weitere ungenutzte Selektoren.
- Gemeinsame Helfer statt Kopien für Sprache, Kennungen, Personen und Archiv. Auch `{{Zitat}}` und `{{Titelliste}}` lesen ihre Parameterreihenfolge aus den zentralen Listen. Laufzeitmeldungen sind über eine kleine Funktion `ckT` zweisprachig.

**Oberfläche und Barrierefreiheit**

- Kein horizontaler Überlauf mehr auf schmalen Bildschirmen.
- Kontrast: dunkle Schrift auf hellen Akzentfarben (u. a. Sunset, Vibrant Amber, Midnight), lesbare Titelverläufe für Midnight und Ancient Gild im Hellmodus, kräftigere Grautexte.
- Englische Oberfläche vollständig: Log, DeepL-, Kopier- und Fortschrittsmeldungen.
- Eingabe- und Ausgabefeld sind beschriftet, das versteckte Dunkelmodus-Auswahlfeld ist kein Tab-Stopp mehr, `aria-expanded`/`aria-pressed` für Sprachinfo und Theme-Kacheln, größere Trefferflächen für Versions- und Update-Abzeichen sowie die Routen-Links, die jetzt auch per Tastatur erreichbar sind.
- Leere Eingabe erzeugt keinen irreführenden Log mehr, leere Ausgabe wird nicht als „kopiert“ gemeldet.
- Optionen heißen „Anzeigetext von Wikilinks beibehalten“ und „Dunkelmodus“. DOI erscheint als eigene Route (jetzt 6, wie in README und Website).

**Dokumentation**

- Website: Datenschutzhinweis nennt die tatsächlich abgerufenen Dienste statt „nichts wird an Dritte gesendet“, DOI verlinkt auf doi.org, Tagungsbeiträge ohne DOI erwähnt.
- README: exakt 38 Themes, reparierte Konvertierungstabelle, Ausnahme für `{{cite conference}}` beim Überschreiben, DeepL-Speicherort, Caching-Fristen, Option *Netzwerk*.

## v12.0.0 “Symposium” (2026-09-30)

- Neu: `{{cite conference}}` wird zu `{{Literatur}}`. Zuordnung: `book-title` (veröffentlichter Tagungsband) → `Sammelwerk`; ohne `book-title` wird `conference` zum `Sammelwerk`, bei beiden landet die Konferenz in `WerkErg`. `publisher` → `Verlag`, `publication-place` bzw. laut Doku ersatzweise `location` → `Ort`, `date`/`year` → `Datum`, `chapter` → `Kapitel`, `editor-*` → `Hrsg`, Kennungen (ISBN, ISSN, DOI, OCLC, arXiv …) wie bei den übrigen Konvertern. `url` bzw. ersatzweise `conference-url` → `Online`, `Abruf` nur mit Online-URL.
- Neu: Crossref-Anreicherung für `{{cite conference}}`. Mit DOI wird sie direkt abgefragt, ohne DOI sucht Curly per Titel + Autor (`query.bibliographic`/`query.author`). Übernommen wird nur ein strikter Treffer: Titel nach Normalisierung gleich, mindestens ein Nachname gleich, Jahr höchstens ±1 entfernt. Dann ersetzen die Crossref-Werte `Sammelwerk`, `Verlag`, `Datum` und ergänzen `ISSN`, `ISBN`, `DOI` (sowie fehlende `Hrsg`/`Seiten`); Autor, Titel und Sprache bleiben aus der Vorlage, `Online`/`Abruf` werden nicht ergänzt. Gab die Vorlage nur ein Jahr an, wird auch aus Crossref nur das Jahr übernommen. Kein Treffer oder Netzfehler: die einfache Konvertierung bleibt stehen. Das Konvertierungs-Log bietet für jede angereicherte Referenz das Zurückschalten auf die einfache Fassung. Gesteuert über die bestehende Option „`{{cite}}`-Vorlagen per Crossref ergänzen“; Suchergebnisse werden zwischengespeichert, Netzfehler nicht.

## v11.10.0 “Rulebook” (2026-09-30)

- Behoben: `{{Literatur}}` bekam ein `Abruf=` auch ohne Online-Beleg, etwa bei `{{cite book}}` mit ISBN, aber ohne URL (und bei `{{cite journal}}`/`{{cite encyclopedia}}` sogar aus `url-access=subscription`). `Abruf` wird jetzt nur noch gesetzt, wenn `Online=` eine URL enthält; zusätzlich greift eine zentrale Prüfung beim Zusammenbau der Vorlage, damit kein Konverterpfad es durchreicht. `url-access` wird nicht mehr als Datum gelesen.
- Behoben: `url-status=offline` wurde nicht als tote Quelle erkannt; `offline=1` entstand nur bei exakt `dead`. Jetzt führen `dead`, `offline`, `usurped` und `unfit` zu `offline=1` (mit `archiv-url`/`archiv-datum`), `live` und `online` gelten als erreichbar – bei aktiver Option „Archiv-Parameter entfernen" entfallen die Archivangaben dann wie bisher. Gilt für `{{cite web}}`-Familie, `{{Citation}}` und `{{cite press release}}`.
- Behoben: Die Parameterreihenfolge im `{{Citation}}` → `{{Internetquelle}}`-Pfad stellte `offline` ans Ende; sie folgt jetzt wie alle übrigen Pfade der Kopiervorlage von Vorlage:Internetquelle (`… sprache, offline, archiv-url, archiv-datum, abruf …`).
- Spracherkennung: Neuer Rückfall über die ISBN-Registrierungsgruppe (`978-0/1` → `en`, `978-2` → `fr`, `978-3` → `de` usw.), wenn Titel und Werk keine eindeutigen Wörter liefern. Die Wortliste für Englisch ist um häufige Funktionswörter erweitert (`on`, `by`, `over`, `how`, `new` …), dadurch erhalten auch kurze englische Titel wie „RimWorld sells over a million copies" `sprache=en`. `{{cite encyclopedia}}` nutzt jetzt dieselbe Erkennung wie die übrigen Konverter.
- Geändert: Die Parameterreihenfolge von `{{Literatur}}` folgt jetzt exakt der vollständigen Kopiervorlage der Vorlagendoku. Verschoben wurden `NummerReihe` (vor `BandReihe`), `Kapitel`/`Seiten`/`Spalten`/`ArtikelNr`/`Fundstelle` (direkt nach den ISBN/ISSN-Angaben, vor `ZDB`), `LCCN` (vor `OCLC`) sowie `Originaljahr`/`Originalort` (vor `Originalsprache`).
- Wikilinks → Deutsch (Wikidata): Hat der deutsche Artikel einen Klammerzusatz zur Begriffsklärung, bekommt der Link einen Anzeigetext ohne Zusatz, z. B. `[[Titel (Zusatz)|Titel]]` statt `[[Titel (Zusatz)]]`. Ein vorhandener Anzeigetext bleibt bei aktiver Option „Display-Namen beibehalten“ erhalten.
- Behoben: Wikidata-Auflösung merkte sich Netzfehler ein Jahr lang als „kein deutscher Artikel“. Ein einziger Aussetzer (Timeout, offline, blockierte Anfrage) führte dazu, dass z. B. `[[Gamasutra]]` dauerhaft unverändert blieb bzw. seine Klammern verlor. Fehlgeschlagene Abrufe werden jetzt nicht mehr gespeichert, der Link bleibt in dem Fall unverändert, und die alten Zwischenspeicher werden einmalig verworfen.
- Behoben: Nach dem Klick auf „Konvertieren“ schrieb ein zweiter, synchroner Handler sofort ein Ergebnis *ohne* Wikidata-, DOI-, Discogs- und Dateigrößen-Schritt ins Ausgabefeld; das vollständige Ergebnis folgte erst, wenn die Abrufe fertig waren. Die Bridge übernahm das Feld, sobald es 450 ms unverändert blieb, und bekam bei langsamer Wikidata-Antwort den Zwischenstand, also z. B. `werk=[[Gamasutra]]` statt `werk=[[Game Developer (Website)|Game Developer]]`. Der Zwischenstand entfällt jetzt. Während der Konvertierung trägt der Button `data-busy="1"`, am Ende feuert `curly:converted` auf `document`.
- Bridge 1.5.0: wartet auf `curly:converted` statt auf ein ruhiges Ausgabefeld. Ältere Konverter-Versionen ohne dieses Ereignis werden wie bisher über das Feld beobachtet.
- Intern: Die Parameterreihenfolgen standen für `{{Internetquelle}}` sechsmal und für `{{Literatur}}` dreimal im Code. Es gibt jetzt je eine zentrale Liste (`IQ_ORDER`, `LIT_ORDER`), die alle Konverterpfade nutzen. Die Ausgabe ändert sich dadurch nicht.
- README und Website: Hinweis ergänzt, dass Curly regelbasiert arbeitet und keine KI bzw. kein Sprachmodell einsetzt.

## v11.9.1 (2026-08-29)

- Behoben: Bei `{{cite web}}`/`{{cite news}}`/`{{cite magazine}}` wurden `pages`/`page` verworfen – sie werden jetzt als `seiten` übernommen (mit Halbgeviertstrich, z. B. `12–15`), passend zur Parameterreihenfolge der Vorlage (`… datum, seiten, format, sprache …`). `{{cite press release}}` und `{{Citation}}` taten das bereits.
- Behoben: Ein ausdrückliches `format=` der Quellvorlage wurde nicht gelesen; `format` entstand ausschließlich aus der Datei-Endung der URL. Jetzt hat der Wert aus der Quelle Vorrang, die Endung dient nur noch als Rückfall.
- Neu: Bei Sonderformaten (PDF, DOC …) ergänzt Curly die ungefähre Dateigröße (`PDF; 2,6 MB`) – die Vorlagendoku verlangt sie, damit Nutzer mit langsamer oder teurer Verbindung den Abruf einschätzen können. Steht die Größe bereits in der Quelle, bleibt sie unverändert; andernfalls wird sie per Kopfanfrage (HEAD, `Content-Length`) an der zitierten Datei ermittelt, 1024-basiert mit Dezimalkomma formatiert und 30 Tage lokal zwischengespeichert. Server ohne CORS-Freigabe – darunter viele Behörden- und Verlagsserver – liefern sie nicht; dann entfällt die Angabe stillschweigend.
- Neu: Options-Gruppe *Netzwerk* mit Schalter für diesen Abruf (Standard: an). Die README-Angabe zur Datensparsamkeit nennt jetzt die tatsächlich kontaktierten Dienste.

## v11.9.0 “Fold” (2026-08-27)

- Die Liste der unterstützten Konvertierungen über dem Eingabefeld ist jetzt **ein-/ausklappbar** und startet zugeklappt; der zuletzt gewählte Zustand wird gemerkt (`localStorage`). Sie belegte dauerhaft rund 180 px zwischen Einleitung und Eingabefeld – eingeklappt sind es 29 px, das Eingabefeld rückt rund 240 px nach oben.
- Ausgeklappt ist die Liste flacher: eine Textzeile je Route, Quellen mit „·" getrennt und das Ziel fett, statt einer Kachel je Vorlage (146 px statt 180 px). Alle Vorlagen bleiben verlinkt.
- Die Zusammenfassungszeile nennt die Anzahl der Routen; sie wird aus der Liste selbst gezählt.

## v11.8.2 (2026-08-27)

- Behoben: Eine Webquelle wurde schon dann komplett durch eine Discogs-Vorlage ersetzt, wenn *irgendwo* in ihr ein Discogs-Link stand – etwa in `zitat`/`kommentar` oder `archiv-url`. Dabei gingen Titel, Autor und die eigentliche URL verloren. Ersetzt wird jetzt nur noch, wenn der Discogs-Link der Wert von `url` ist (und zwar als ganzer Wert, nicht als Textbestandteil).
- Behoben: Enthielten die von Discogs gelieferten Daten `|`, `=`, `{` oder `}`, entstand eine kaputte Vorlage (`|` begann einen zusätzlichen Parameter, `=` machte aus dem Positions- einen benannten Parameter). Solche Zeichen werden jetzt als HTML-Entity maskiert; enthält ein Wert ein `=`, werden die Positionsparameter nummeriert (`1=`, `2=`, `3=`).
- Behoben: Discogs-URLs mit Query oder Fragment, aber ohne Titel-Teil (z. B. `…/master/68831?srsltid=…`) ließen den Rest als Textrumpf hinter der Vorlage stehen.
- Behoben: Ein groß geschriebener Hostname (`Discogs.com`) wurde von der Vorprüfung übersprungen und gar nicht konvertiert.
- Discogs-Ersetzungen erscheinen jetzt als Hinweis im Konvertierungs-Log – eine ersetzte `{{Internetquelle}}` soll nicht unbemerkt verschwinden.

## v11.8.1 (2026-08-27)

- Steht ein Discogs-Link als `|url=` in einem `{{cite web}}` (Discogs `/release/`, `/master/`, `/artist/`, `/label/`), wird jetzt die passende `{{Discogs …}}`-Vorlage erzeugt statt `{{Internetquelle}}`. Ist die Discogs-API nicht erreichbar, bleibt es als Fallback bei `{{Internetquelle}}`. (Freistehende Discogs-URLs werden wie bisher konvertiert.)

## v11.8.0 “Crate” (2026-08-26)

- Neu: **Discogs-Links** werden automatisch in die passende Wikipedia-Vorlage umgewandelt: `discogs.com/release/…` → `{{Discogs Titel|ID|Titel|Interpret|Abruf=}}`, `…/master/…` → `{{Discogs Master|ID|Titel|Abruf=}}`, `…/artist/…` → `{{Discogs|ID|Name|Abruf=}}`, `…/label/…` → `{{Discogs Label|ID|Name|Abruf=}}`. Titel/Interpret/Name werden über die (CORS-fähige) Discogs-API geholt – ohne Schlüssel; Ergebnisse werden 365 Tage lokal gecacht, `Abruf` = heutiges Datum. Discogs-URLs innerhalb einer `{{cite …}}`-Vorlage (`|url=`) bleiben unangetastet.
- Behoben: `{{cite news}}`/`{{cite magazine}}` **ohne URL**, aber mit Druckangabe (`issue`/`page`/`pages`/`volume`) werden jetzt als `{{Literatur}}` aufgebaut (gedrucktes Werk) statt als `{{Internetquelle}}` – `magazine`/`newspaper` → `Sammelwerk`, `issue` → `Nummer`, `page` → `Seiten`. Online-Artikel (mit URL) bleiben `{{Internetquelle}}`.
- Wird das Eingabefeld komplett geleert, wird jetzt auch das Ausgabefeld geleert.

## v11.7.0 “Setlist” (2026-08-25)

- Neue Konvertierung `{{Track listing}}` → `{{Titelliste}}` für Tracklisten von Alben und Singles (eigenständige Tabellen-Vorlage, kein Einzelnachweis).
- Feldzuordnung je Titel: `title→Titel`, `note→Notiz`, `length→Länge`, `lyrics→Text`, `music→Musik`, `writer→Autor`, `extra→Extra`. Kopf: `headline→Überschrift`, `extra_column→Extra Spalte`, `total_length→Gesamtlänge`, `width→Größe`, `collapsed→collapsed`. Nicht fortlaufende Titelnummern bleiben erhalten.
- Die Sammel-Credits `all_writing`/`all_lyrics`/`all_music` haben in `{{Titelliste}}` keine Entsprechung und werden als Satz über die Tabelle gesetzt (z. B. „Alle Titel wurden von … geschrieben.“; `all_writing` hat Vorrang, wie in der englischen Vorlage). Spaltenbreiten-Parameter (`title_width` u. a.) entfallen mangels Entsprechung.
- Track-Wikilinks werden – wie bei den übrigen Konvertierungen – über Wikidata ins Deutsche übersetzt bzw. entlinkt.
- Mehrere Vorlagen im Eingabefeld werden jetzt **alle** konvertiert (z. B. mehrere `{{Track listing}}` untereinander); zuvor wurde nur die erste Top-Level-Vorlage umgesetzt.

## v11.6.2 (2026-08-14)

- Behoben: Beim „Übersetzen (DeepL)" ging Text verloren, wenn direkt hinter einem geschützten Element (Wikilink/`<ref>`/Kursiv) weiterer Klartext folgte – z. B. `[[…]]'s work …`. Mit `tag_handling=xml` war das Text auf Dokument-Ebene hinter dem Wurzelelement und damit kein wohlgeformtes XML; DeepL brach ab und lieferte nur den ersten Platzhalter zurück. Der Text wird jetzt in ein einzelnes Wurzelelement `<d>…</d>` gehüllt (nach der Übersetzung wieder entfernt).
- Behoben: Konsolenfehler `InvalidStateError: Transition was aborted…` beim Laden bzw. Theme-Wechsel. Der Überblend-Effekt (View Transitions) wurde ausgelöst, obwohl `<body>` bereits mit einer Theme-Klasse startet (Erst-Anwendung) bzw. in nicht sichtbaren Tabs; er läuft jetzt nur noch bei echtem Nutzerwechsel und sichtbarem Dokument, und eine etwaige Ablehnung wird abgefangen.

## v11.6.1 (2026-08-14)

- Behoben: Bei der `{{cite web}}`/`{{cite news}}`-Familie wurde der Parameter `author=` (auch `authorN=` und `authors=`) nicht ausgewertet und ging verloren – er wird jetzt korrekt als `autor=` übernommen. Explizite `last`/`first`-Angaben haben weiterhin Vorrang.

## v11.6.0 “Lucid” (2026-07-30)

UI-Modernisierung nach aktuellen Web-Standards (Funktion/Konvertierung unverändert):

- Neues Farbschema **„Midnight“** – nahezu schwarz mit kühlem Eisblau-Akzent, am besten im Dunkelmodus (damit 38 Themes).
- **Englische Oberfläche:** wird automatisch anhand der Systemsprache gewählt und ist in den Optionen unter *Sprache / Language* manuell umstellbar. Wichtig: betrifft nur die Oberfläche – **konvertiert wird weiterhin ausschließlich Englisch → Deutsch**, nicht umgekehrt.
- Die vier Fenster (Optionen, Farbschema, Versionsverlauf, Update) nutzen jetzt das **native `<dialog>`-Element** (`showModal()`): echte Fokus-Falle, inerter Hintergrund, Top-Layer-Rendering, `::backdrop` und Esc-zu-schließen ohne eigenen Code.
- **Barrierefreiheit:** einheitlicher `:focus-visible`-Tastaturfokusring auf allen interaktiven Elementen inklusive der Eingabe-/Ausgabefelder (`:focus-within`); der Fokus liegt beim Laden direkt im Eingabefeld.
- Sanfter Crossfade beim Theme-Wechsel (View Transitions API, respektiert „reduzierte Bewegung“); dynamisches `<meta name="theme-color">` passend zum Theme (Mobil-Browserleiste); `100dvh` gegen den Viewport-Sprung auf Mobilgeräten; global respektierte `prefers-reduced-motion`; `text-wrap: balance/pretty` für ausgewogenere Umbrüche.
- Der Versionsverlauf wird nicht mehr komplett in `Cite-Konverter.html` eingebettet, sondern hier in `CHANGELOG.md` gepflegt (das 📜-Fenster zeigt die letzten Einträge und verlinkt hierher) – das reduziert die Dateigröße deutlich.

## v11.5.0 “Communiqué” (2026-07-22)

Neue Konvertierung `{{Cite press release}}` → `{{Internetquelle}}`:

- Autoren (`first/last`), Herausgeber (`editor-*`) und Interviewer (`interviewer-*`) werden gemeinsam in `autor` geführt; ein zugehöriger `*-link`-Parameter verlinkt die Person als Wikilink (`[[Ziel|Name]]`, bzw. `[[Name]]` wenn Ziel = Name).
- Feldzuordnung u. a.: `publisher`/`agency` → `hrsg`, `work` → `werk`, `date`/`year`/`publication-date` → `datum`, `language` → `sprache`, `page`/`pages`/`quote-page(s)` → `seiten`, `minutes`/`time-caption`/`time`/`at` → `kommentar`, `quote` → `zitat`, `format`/`archive-format` → `format`, `url-status`/`archive-url`/`archive-date` → `offline`/`archiv-url`/`archiv-datum`, `access-date` → `abruf`.
- Enthält die Vorlage eine Druck-/Publikations-ID (ISBN, DOI, ISSN, PMID, bibcode, JSTOR …), wird sie stattdessen als `{{Literatur}}` aufgebaut, sodass die IDs erhalten bleiben.
- Hinweis: `url-access` ist ein Zugriffs-Flag (kein Datum) und wird daher nicht in `abruf` übernommen; `abruf` kommt aus `access-date` bzw. der Heute-Option.
- Außerdem vereinheitlicht: nach `{{Internetquelle` steht jetzt in allen Ausgabepfaden genau **ein Leerzeichen** (zuvor an einigen Stellen zwei).

## v11.4.3 (2026-07-20)

- Die „werk“-Ableitung erkennt jetzt deutlich mehr **mehrteilige Länder-Domains**.
- Registry-Label-Liste erweitert (u. a. `go.jp`, `ne.jp`, `gouv.fr`, `govt.nz`, `gob.mx`, `gv.at`, `res.in`, `ind.br`, `nom.es`) – z. B. `www.mext.go.jp` → `werk=mext.go.jp` (statt `go.jp`).
- BBC-Subdomain-Erkennung und Look-alike-Absicherung aus v11.4.2 bleiben unverändert.

## v11.4.2 (2026-07-20)

Korrekturen an der „werk“-Ableitung aus der URL:

- **Mehrteilige Länder-Domains** werden jetzt korrekt behandelt (z. B. `www.imperial.ac.uk` → `werk=imperial.ac.uk` statt bisher `ac.uk`; gilt für `.ac.uk`, `.gov.uk`, `.co.uk` u. a. über eine Registry-Label-Heuristik statt einer festen Liste).
- **BBC-Quellen** erhalten das Werk anhand der Subdomain (`news.bbc.co.uk`/`.com` → `BBC News`, `sport.…` → `BBC Sport`, `culture.…` → `BBC Culture`; unbekannte/keine Subdomain → `BBC`). Die Erkennung ist auf `*.bbc.co.uk`/`*.bbc.com` verankert, damit Look-alike-Domains wie `bbc.co.uk.evil.com` nicht greifen.
- Der Parameter `agency=` (Nachrichtenagentur/Herausgeber der Meldung) wird jetzt als `hrsg=` übernommen (z. B. `agency=Imperial College London` → `hrsg=Imperial College London`).

## v11.4.1 (2026-07-20)

Zwei Korrekturen am Update-Abzeichen:

- Das „⬆️ Update“-Abzeichen wird jetzt **nur noch angezeigt, wenn tatsächlich eine neuere Version vorliegt** (zuvor hob die `.badge`-Regel `display:inline-block` das `hidden`-Attribut auf, sodass es dauerhaft sichtbar blieb – und der Dialog beim Klick „–“ statt Versionsnummern zeigte).
- Das Abzeichen übernimmt nun die **Akzentfarbe des gewählten Farbschemas** (statt eines festen Orangetons) und wechselt damit wie das Versions-Abzeichen mit dem Theme.

## v11.4.0 “Beacon” (2026-07-19)

Neue **Update-Prüfung**:

- Curly schaut beim Start (höchstens einmal pro Tag, gedrosselt per `localStorage`) über die GitHub-Releases-API nach, ob eine neuere Version vorliegt.
- Falls ja, erscheint neben der Versionsnummer ein **„⬆️ Update“-Abzeichen**, das einen Dialog mit direktem Download (ZIP-Asset des Releases) und einem Link zu den Release-Notes öffnet.
- Still bei Fehlern/Offline (kein Nag); in den Optionen unter *Aktualisierung* abschaltbar (Standard: aktiv).
- Da Curly eine einzelne HTML-Datei ist, ersetzt man die alte Datei einfach durch die heruntergeladene – die Einstellungen bleiben im Browser erhalten.

## v11.3.0 “Locale” (2026-07-18)

Erweiterte Spracherkennung:

- Findet die Wortheuristik keine Sprache, wird sie jetzt aus der Domain-Endung der URL abgeleitet (z. B. `.uk`/`.us`/`.edu`/`.gov`/`.au` → `en`; `.de`/`.at` → `de`; `.fr`/`.es`/`.it`/`.nl` entsprechend).
- So erhält z. B. eine Quelle von `ucl.ac.uk` nun `sprache=en`, auch ohne typische Signalwörter in Titel/Herausgeber.
- Mehrdeutige Endungen (`.com`/`.org`/`.net`/`.ca` …) bleiben unbestimmt; eine ausdrückliche Sprachangabe und die Wortheuristik haben weiterhin Vorrang.

## v11.2.2 (2026-07-18)

Code-Review-Korrekturen am Konvertierungs-Log:

- Ein Hinweis wird jetzt eindeutig seiner `<ref>` zugeordnet (per Position statt Zählung), sodass „Übernehmen“ bei gemischten Referenzen nicht mehr die falsche Vorlage trifft.
- Auf per DOI/Crossref angereicherten Referenzen werden Offline-Umschaltungen nicht mehr angeboten (verhinderte den Verlust der DOI-Daten).
- Die DOI-Zielformat-Umschaltung arbeitet nun ebenfalls positionsbasiert (robust gegen Reformatierung/doppelte Referenzen).
- Kein leeres `|url=` mehr, wenn eine `{{Citation}}` ohne URL nach `{{Internetquelle}}` umgestellt wird.

## v11.2.1 (2026-07-17)

- Farbschema-Auswahl: lange Theme-Namen (z. B. „Burgundy Champagne“) passen jetzt sauber in die Kacheln (kompaktere Schrift/Farbfelder; auf schmalen Bildschirmen einspaltig).

## v11.2.0 “Ledger” (2026-07-17)

Neues **Konvertierungs-Log** unter dem Eingabefeld:

- Zeigt regelbedingte Hinweise – z. B. „Archiv-URL entfernt, weil `url-status=live`“, „`sprache=de` unterdrückt“, „Sprachcode gekürzt“ sowie das gewählte Zielformat bei `{{Citation}}` und bei DOIs.
- Jeder Hinweis ist **anklickbar** und übernimmt die Alternative direkt in die Ausgabe (per „Rückgängig“ wieder umschaltbar), ohne die gespeicherten Optionen zu ändern.
- Der Log leert sich automatisch, sobald das Eingabefeld neuen Inhalt bekommt.
- Zudem: überflüssige `<i>…</i>`-Kursiv-Auszeichnung aus Crossref-Titeln wird beim DOI-Import entfernt (`<sub>`, `<sup>` und Entities wie `&amp;` bleiben erhalten).

## v11.1.0 “Permalink” (2026-07-17)

DOI-Konverter erweitert um **Online-/Web-Quellen**:

- DOIs web-nativer Inhalte (Preprints/`posted-content`, Datensätze, Reports, Lexikoneinträge u. a.) werden als `{{Internetquelle}}` aufgebaut statt als `{{Literatur}}` (Journalartikel, Bücher, Buchkapitel, Tagungsbände bleiben `{{Literatur}}`). Als `url` dient die echte Artikel-/Landing-Page (sonst `doi.org`).
- Auch bestehende `{{Internetquelle}}`-Vorlagen mit DOI werden per Crossref um fehlende Felder ergänzt.
- Neue Option *Zielformat bei DOI* (Automatisch / immer Literatur / immer Internetquelle).
- Neuer Aufklapp-Block *Feedback & Mitwirken* unter den Buttons – „Fehler melden“ und „Funktion vorschlagen“ öffnen ein vorausgefülltes GitHub-Formular.

## v11.0.0 “Rosetta” (2026-07-17)

Neuer **DOI-Konverter** über die Crossref-API:

- Enthält eine Referenz einen DOI (als `doi.org`-Link, in einer Verlags-URL oder als reine `10.xxxx/…`-Nummer), werden die vollständigen Angaben geholt und als `{{Literatur}}` aufgebaut – Autor, Titel, Sammelwerk, Band/Nummer, Datum, Sprache, ISSN/ISBN, Seiten, DOI und Online-Link.
- Zwei Optionen (beide standardmäßig aktiv, werden gespeichert): *Vorlagenlose DOIs auflösen* und *{{cite}}-Vorlagen per Crossref ergänzen* (füllt fehlende Felder; abweichende Felder lassen sich per Häkchen übernehmen).
- Ergebnisse werden lokal zwischengespeichert (365 Tage). Alles läuft direkt aus dem Browser – kein Schlüssel, keine CORS-Erweiterung nötig.

## v10.2.3 (2026-07-10)

- Endgültig behoben: Nach dem Konvertieren blieb das Ausgabefeld in sichtbaren Tabs ohne farbige Hervorhebung. Ursache war ein alter „Display-Sync“-Notbehelf, der die Hervorhebung zwei Frames nach dem Konvertieren durch reinen Text ersetzte; er hebt die Ausgabe jetzt korrekt hervor, statt sie zu überschreiben.

## v10.2.2 (2026-07-10)

- Behoben: Nach dem Konvertieren fehlte manchmal die farbige Syntaxhervorhebung (erst nach Neuladen sichtbar). Ursache war die Bündelung über `requestAnimationFrame`, die in nicht sichtbaren Tabs hängen bleiben konnte – das Ausgabe-Highlighting wird jetzt direkt aktualisiert.

## v10.2.1 (2026-07-10)

- Behoben bei `{{cite news}}`/`{{cite magazine}}`: `newspaper` bzw. `magazine`/`periodical` wird jetzt korrekt als `werk` übernommen (z. B. `newspaper=BBC News` → `werk=BBC News` statt „BBC“ aus dem Domain-Namen); dadurch wird auch die Sprache zuverlässiger erkannt.

## v10.2.0 “Control Panel” (2026-07-09)

- Das Optionen-Fenster wurde modernisiert – Gruppen als abgesetzte Karten, Hover-Effekt je Zeile, Kontrollkästchen als moderne Umschalter (Toggle-Switches) im Akzent-Verlauf des Themes. Funktion und Optionen unverändert.

## v10.1.3 (2026-07-09)

- Mehr Abstand zwischen Routen-Pills und Eingabefeld; die Feldbeschriftungen „Eingabe“/„Ausgabe“ erscheinen als versale Labels mit kleinem Akzent-Punkt im Theme-Verlauf.

## v10.1.2 (2026-07-09)

- Mehr Abstand zwischen den Eingabe-/Ausgabe-Feldern und den Knöpfen darunter (Zwei-Spalten-Layout). Der Hinweis „Citation ohne Seitenangabe …“ wurde entfernt.

## v10.1.1 (2026-07-09)

- Feinschliff der Kopfzeile – der Untertitel „der Cite-Konverter für Wikipedia“ erscheint als versale, gesperrte Zeile im Akzent-Verlauf; das Versions-Abzeichen wurde etwas verkleinert.

## v10.1.0 “Twin View” (2026-07-09)

- Auf großen Bildschirmen (ab 900 px) stehen Eingabe- und Ausgabefeld nebeneinander, mit kompaktem `🔀`-Knopf dazwischen – so lassen sich Original und Ergebnis direkt vergleichen.
- Auf schmalen Bildschirmen bleibt der gestapelte Aufbau mit vollbreitem Knopf „🔀 Konvertieren“. Die Einleitung nutzt die volle Breite.

## v10.0.0 “Namesake” (2026-07-08)

- Rebranding – das Tool heißt jetzt **Curly**. Das Klammern-Icon `{ }` dient als Markenzeichen, darunter der Untertitel „der Cite-Konverter für Wikipedia“. Funktion/Bedienung unverändert; angepasst wurden Kopfzeile, Seitentitel, README und Projektbeschreibung.

## v9.2.0 “Sigil” (2026-07-08)

- Neues Marken-Icon – ein Logo mit geschweiften Klammern `{ }` auf einem Verlaufs-Quadrat links vom Titel; der Verlauf übernimmt automatisch die Akzentfarben des Themes (im Dunkelmodus die dunkle Variante).
- Auch das Browser-Tab-Favicon wird als passendes SVG erzeugt und wechselt mit dem Theme. Die bisherigen externen Favicon-Dateien (im Ordner `grafiken/`) werden nicht mehr benötigt und wurden entfernt.

## v9.1.1 (2026-07-06)

- Blockquote-Korrektur – steht die Fußnote *innerhalb* der Vorlage direkt hinter dem Zitat (z. B. `{{blockquote|… Text.<ref name="x" />}}`), wird sie nun korrekt in `|ref=` übernommen und aus dem `Text` entfernt (zuvor blieb `Text` leer, weil das `=` in `name="x"` als Parametertrenner gedeutet wurde). Positionaler Zitattext mit `=` bleibt allgemein erhalten.

## v9.1.0 “Verbatim” (2026-07-06)

Neue Vorlage `{{blockquote}}` (auch `{{Blockquote}}` / Alias `{{quote}}`) → `{{Zitat}}`:

- Der Zitattext kommt aus dem ersten Parameter bzw. `text=`; ein enthaltenes `{{lang|xx|…}}` wird entpackt und liefert die `Sprache` (sonst automatische Erkennung, Standard `en`).
- Bei `multiline=yes` werden Zeilen mit `<br />` verbunden. `author=` → `Autor`; `title=` und `source=` werden zu `Quelle` zusammengeführt (`"Titel" - Quelle`).
- Ein direkt hinter der Vorlage stehendes `<ref>…</ref>` (oder `<ref … />`) wird in `|ref=` eingezogen, sonst bleibt ein leerer Platzhalter. `Übersetzung` bleibt leer.

## v9.0.2 (2026-06-18)

- Übersetzung – Wiki-Kursiv/Fett (`''…''`, `'''…'''`) bleibt erhalten. Ein entlinkter Werktitel ohne deutschen Artikel (z. B. `''A Blank on the Map''`) wird nicht mehr von DeepL in Anführungszeichen umgewandelt, sondern bleibt kursiv.

## v9.0.1 (2026-06-18)

- Feinschliff der DeepL-Übersetzung – das von DeepL eingefügte Leerzeichen vor `<ref>` wird wieder entfernt (`an. <ref>` → `an.<ref>`); die um Wikilinks gesetzten deutschen Anführungszeichen werden entfernt (`„[[Tansania]]“` → `[[Tansania]]`).

## v9.0 “Polyglot” (2026-06-18)

Optionale Übersetzung der Ausgabe über DeepL:

- In den Optionen lassen sich ein DeepL-API-Key (nur lokal im Browser gespeichert) und die Zielsprache hinterlegen.
- Der neue Button „🌐 Übersetzen (DeepL)“ übersetzt nur den Fließtext – `<ref>…</ref>` und Wikilinks `[[…]]` bleiben unverändert.
- Hinweis: Als lokale Datei verlangt der direkte DeepL-Aufruf eine CORS-Erweiterung (z. B. „CORS Unblock“), die nur während der Übersetzung aktiv sein sollte; der Schlüssel wird ausschließlich direkt an DeepL gesendet.

## v8.8 “Chronik” (2026-06-18)

- Der Versionsverlauf öffnet sich (wie Optionen und Farbschema) über ein eigenes Symbol (📜) – ebenso per Klick auf das Versions-Abzeichen; Schließen per ✕, Klick außerhalb oder Esc.
- Die Einträge sind als aufgeräumte, klar gegliederte Liste mit hervorgehobener Versionsnummer dargestellt.
- Der Verlauf wurde konsolidiert: viele kleinteilige Patch-Einträge (u. a. vierstellige Versionen wie `v4.0.0.1`) wurden zu ihren Hauptversionen zusammengefasst.

## v8.7 “Palette” (2026-06-18)

- Das Farbschema öffnet jetzt über ein eigenes Symbol (🎨) ein Modal statt als Aufklapp-Block unten.
- Behoben: Der Klammerzusatz in Wikilinks (z. B. `(television executive)`) wurde fälschlich kursiv dargestellt – er erscheint nun normal grün wie der übrige Wikilink.

## v8.6 “Optionen-Modal” (2026-06-18)

- Die Seitenleiste wurde durch ein Optionen-Fenster ersetzt: Ein Zahnrad-Symbol (⚙️) oben rechts öffnet ein Modal mit den gewohnten Gruppen (Konvertierung, Wikilinks, Ausgabe, Darstellung); Schließen per ✕, Klick außerhalb oder Esc. Der Konverter nutzt wieder die volle Breite. Funktion/Optionen unverändert.

## v8.5 “Sidebar” (2026-06-18)

- Layout aufgeräumt: Die Einstellungen stehen als gegliederte Seitenleiste rechts neben dem Konverter (Gruppen: Konvertierung, Wikilinks, Ausgabe, Darstellung).
- Das Farbschema ist ein eigener Aufklapp-Block; der Einleitungstext zeigt die unterstützten Konvertierungen kompakt als „Routen“. Auf schmalen Bildschirmen rutscht die Seitenleiste unter den Konverter. Funktion/Optionen unverändert.

## v8.4 “Emphasis” (2026-06-18)

- Wiki-Formatierung im Syntax-Highlighting: `''…''` wird kursiv, `'''…'''` fett dargestellt – inklusive enthaltener Wikilinks (z. B. `'''[[Snooker|Snookie]]'''` wird fett und bleibt grün). Die Apostrophe bleiben als Quelltext sichtbar; einzelne Apostrophe in Wörtern wie „public’s“ werden nicht verändert.

## v8.3 “Clean Read” (2026-06-18)

- Jahreszahlen werden nicht mehr farblich hervorgehoben (normaler Text; grau innerhalb von Referenzen); verschachtelte Tokens in Wikilinks erben die grüne Farbe.
- Behoben: Die graue Färbung der Referenz-Inhalte lief zuvor über das schließende `</ref>` hinaus, sodass nachfolgender Fließtext grau blieb.

## v8.2 “Swift Current” (2026-06-17)

- Deutlich schnellere Wikilink-Übersetzung über Wikidata – statt bis zu drei einzelner API-Aufrufe pro Artikel werden die Titel jetzt gebündelt in wenigen Aufrufen abgefragt.
- Intern: Die Button-/Badge-Farben der Themes laufen nun über CSS-Variablen statt über viele wiederholte Regeln.

## v8.1 “Prismatic Links” (2026-06-17)

- Wikilinks (`[[Ziel]]`, `[[Ziel|Anzeige]]`) werden in der Syntaxhervorhebung jetzt in einer eigenen Farbe (Grün) dargestellt.
- Die gesamte Farbpalette der Hervorhebung wurde vereinheitlicht und für Kontrast optimiert – getrennt für Hell- und Dunkelmodus (Vorlagenname, Klammern, Parameter, Werte, URLs, `<ref>`, Zahlen/Datum, Kommentare).

## v8.0 “Citation Horizon” (2026-06-01)

- Neue Vorlage `{{Citation}}` → `{{Literatur}}` (mit Seitenangabe oder ohne URL) bzw. `{{Internetquelle}}` (ohne Seitenangabe, mit URL).
- Folgekorrekturen (06-17): Syntax-Hervorhebung pro Frame gebündelt (`requestAnimationFrame`); „Alles markieren“ (⌘/Strg + A) markiert nun den gesamten Text auch sichtbar.

## v7.1 – v7.3 “Chromatic Bloom / Earthen Glow / Velvet Garden” (2026-03-30)

- Insgesamt 29 neue Farbthemen in drei Paketen (u. a. Celestial, Daffodil, Misty Lavender, Vibrant Amber, Crimson Tide, Rustic Sienna, Terracotta Sunset, Coral Horizon, Neon Twilight, Dark Orchid Vine, French Celadon …), jeweils mit abgestimmten H1-, Button- und Badge-Farben sowie Darkmode-Varianten.

## v7.0 "The Redirection" (2025-12-20)

- Wikipedia-Redirects werden automatisch befolgt – englische Wikilinks mit Redirects (z. B. `[[Eastern Band Cherokee]]` → `[[Eastern Band of Cherokee Indians]]`) werden erkannt und der finale Artikel zur deutschen Übersetzung verwendet.
- Button umbenannt: „🔀 Konvertieren“. Die Progress Bar zeigt jetzt auch die Anzahl aufgelöster Redirects. Separater Redirect-Cache für bessere Performance.

## v6.0 "Welcome to Wikidata" (2025-12-10)

- Wikidata-Integration – englische Wikilinks werden automatisch ins Deutsche übersetzt (z. B. `[[Yellowstone National Park]]` → `[[Yellowstone-Nationalpark]]`).
- Optionen: „Wikilinks → Deutsch (Wikidata)“ (optional), „Display-Namen beibehalten“ (Standard aktiv), „Klammern entfernen bei fehlendem deutschen Artikel“ (Standard aktiv).
- Progress Bar bei mehreren Links, Cache (365 Tage), Rate Limiting (100 ms zwischen API-Calls).

## v5.0 (2025-12-09)

- Neue Funktion: Subreferenzierung – `{{rp|...}}` wird automatisch in ein `details=`-Attribut konvertiert (z. B. `{{rp|10–20}}` → `details="S. 10–20"`). Mehrere `{{rp}}` werden zusammengeführt, Bindestriche zu Bistrich normalisiert. Standardmäßig aktiv.

## v4.4 – v4.4.3 (2025-09-11 – 11-26)

- Kleinere Fehlerkorrekturen (doppelte Leerzeichen, fehlende Zitat-Konvertierungen, Parameter-Reihenfolge in `{{Literatur}}`); Archiv-Parameter-Logik korrigiert (`archiveurl`/`archivedate` werden nur bei aktiver URL entfernt); Intro aktualisiert.

## v4.1 – v4.3.5 (2025-09-08 – 09-10)

- `{{Internetquelle}}` verfeinert – feste Parameter-Reihenfolge, gekürzte Sprachcodes (z. B. `en-US` → `en`), Mapping `website`→`werk` und `publisher`→`hrsg`, Domain-Fallback für „werk“ inkl. Auto-Mapping (z. B. nytimes.com → The New York Times), Titel-Normalisierung um Gedankenstriche; stabileres Rebinding von Highlight und Konvertieren.

## v4.0 – v4.0.10 (2025-09-05 – 09-06)

- Neue Vorlage `{{cite encyclopedia}}` → `{{Literatur}}` (Autor/Hrsg/Sammelwerk/Band/Verlag/Datum/IDs/Seiten).
- Zahlreiche Folgekorrekturen am Encyclopedia-Mapping, Parser-Fix für verschachtelte Templates (`{{google books}}`), Fix für doppelte Leerzeichen nach „`{{Internetquelle`“, Darkmode-Beschriftung weiß.

## v3.0 – v3.0.3 (2025-09-03 – 09-05)

- Neue Vorlage `{{cite journal}}` → `{{Literatur}}` (Autoren/Editoren, Datum, Sammelwerk/Band/Nummer, Seiten, IDs, Zitat).
- Dispatcher- und Builder-Korrekturen, cite-web-Bugfixes (robuste Aliase, `toISODate` statt nicht definierter Funktion); Dev-Smoke-Test-Modus (`?test=1`).

## v2.5.1 – v2.5.19.1 (2025-08-31 – 09-01)

- Verfeinerungen – Darkmode-Optionen (Automatisch / An / Aus) und durchgängig bessere Kontraste, animierter H1-Verlauf, neue Themes (Simple, Spice, Jade Fruit, Hacker), verlustfrei neu aufgebauter Highlighter, responsives Theme-Grid (max. 4 Spalten) und diverse Anzeige-Fixes.

## v2.5 (2025-08-30)

- Syntax-Highlighting für Eingabe & Ausgabe; verständliche Konvertierungs-Zusammenfassung; Design & Konvertierungsskript unberührt.

## v2.4 – v2.4.7 (2025-08-29 – 08-30)

- Redesign mit modernem Glasmorphism-UI. Robuste Konvertierungslogik integriert, animierter Copy-Button, Theme-Wechsel mit Darkmode-Varianten pro Theme, erweiterte Sprachheuristik (Flaggen, Info-Icon); diverse Bugfixes (Erkennung von cite web/news/magazine/book auch mit Parametern).

## v2.3 (2025-08-28)

- Neues Theme-System (4 Designs mit LocalStorage), Optionen erweitert (Sprachcodes ungekürzt, Direktkopie, Info-Hinweis per Klick), kleinere Textareas, Favicon gefixt. Neueste Version oben gelistet.

## v2.2 (2025-08-28)

- Einstellungsmenü in `details`-Block; neue Checkbox „Sprache=de unterdrücken“.

## v2.1 – v2.1.2 (2025-08-28)

- ISBN-Gruppierung und strengere Sprachheuristik; Normalisierung der Sprachcodes (Deutsch wird unterdrückt) und Info-Hinweis zu `Sprache=de`.

## v2.0 (2025-08-28)

- Neue Konvertierung `{{cite book}}` → `{{Literatur}}`.

## v1.0 (2025-04-02)

- Erste Version.
