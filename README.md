<div align="center">

<img src="icon.svg" alt="Curly Logo" width="120" height="120">

# Curly

### der Cite-Konverter für Wikipedia

**Konvertiert englische Wikipedia-Zitationsvorlagen in die passenden deutschen Vorlagen – mit DOI-Auflösung über Crossref, automatischer Wikidata-Übersetzung der Wikilinks, optionaler DeepL-Übersetzung des Fließtexts, Subreferenzierung (`{{rp}}` → `details=`), Redirect-Auflösung und Syntax-Highlighting. Alles in einer einzigen HTML-Datei, ganz ohne Server, Installation oder externe Abhängigkeiten.**

[![Version](https://img.shields.io/github/v/release/V-Toll/Curly?label=Version&color=8A2BE2)](https://github.com/V-Toll/Curly/releases)
[![Lizenz](https://img.shields.io/badge/Lizenz-Unlicense-4CAF50)](LICENSE)
[![Single-File](https://img.shields.io/badge/Single--File-HTML-FF8C00)](Cite-Konverter.html)
[![Abhängigkeiten](https://img.shields.io/badge/Abh%C3%A4ngigkeiten-keine-2E7D32)](#-warum-dieses-tool)
[![Für Wikipedia](https://img.shields.io/badge/f%C3%BCr-Wikipedia-lightgrey?logo=wikipedia&logoColor=white)](https://de.wikipedia.org)

[⬇️ Neueste Version herunterladen](https://github.com/V-Toll/Curly/releases/latest) · [📜 Changelog](CHANGELOG.md) · [🐞 Problem melden](https://github.com/V-Toll/Curly/issues)

</div>

---

## ✨ Warum dieses Tool?

- 🗂️ **Eine einzige Datei** – herunterladen, im Browser öffnen, fertig. Kein Server, keine Installation, keine Tracker.
- 🔄 **Viele Vorlagen** – von `{{cite web}}` bis `{{blockquote}}`, jeweils in die passende deutsche Entsprechung.
- 🔗 **DOI-Auflösung** – aus einem DOI holt Curly per [Crossref](https://www.crossref.org/) automatisch alle Angaben und baut ein fertiges `{{Literatur}}`. [Mehr dazu](#-doi-auflösung-crossref).
- 🌍 **Wikidata & DeepL** – englische Wikilinks werden automatisch übersetzt, der Fließtext auf Wunsch per DeepL.
- 🎨 **Rund 38 Farbthemen** inkl. Dunkelmodus – das Icon passt sich dem gewählten Theme an.
- 🌐 **Zweisprachige Oberfläche** – Deutsch und Englisch, automatisch nach Systemsprache und in den Optionen umstellbar. (Konvertiert wird weiterhin ausschließlich Englisch → Deutsch, nicht umgekehrt.)
- 🔒 **Datensparsam** – alles läuft lokal im Browser; nichts wird an Dritte gesendet.
- 🔌 **Optionale Wikipedia-Bridge** – per Userscript direkt aus dem Bearbeitenfenster konvertieren (und übersetzen), ohne Kopieren. [Mehr dazu](#-optional-cite-konverter-bridge-userscript).

---

## 🔄 Unterstützte Konvertierungen

| Englische Vorlage | | Deutsche Vorlage |
|---|:---:|---|
| [`{{cite web}}`](https://de.wikipedia.org/wiki/Vorlage:Cite_web) · [`{{cite news}}`](https://de.wikipedia.org/wiki/Vorlage:Cite_news) · [`{{cite magazine}}`](https://en.wikipedia.org/wiki/Template:Cite_magazine) · [`{{cite press release}}`](https://en.wikipedia.org/wiki/Template:Cite_press_release) | → | [`{{Internetquelle}}`](https://de.wikipedia.org/wiki/Vorlage:Internetquelle) |
| [`{{cite book}}`](https://de.wikipedia.org/wiki/Vorlage:Cite_book) · [`{{cite journal}}`](https://de.wikipedia.org/wiki/Vorlage:Cite_journal) · [`{{cite encyclopedia}}`](https://de.wikipedia.org/wiki/Vorlage:Cite_encyclopedia) · [`{{Citation}}`](https://en.wikipedia.org/wiki/Template:Citation) | → | [`{{Literatur}}`](https://de.wikipedia.org/wiki/Vorlage:Literatur) |
| [`{{blockquote}}`](https://en.wikipedia.org/wiki/Template:Blockquote) · [`{{quote}}`](https://en.wikipedia.org/wiki/Template:Blockquote) | → | [`{{Zitat}}`](https://de.wikipedia.org/wiki/Vorlage:Zitat) |
| [`{{track listing}}`](https://en.wikipedia.org/wiki/Template:Track_listing) | → | [`{{Titelliste}}`](https://de.wikipedia.org/wiki/Vorlage:Titelliste) |
| [Discogs](https://www.discogs.com/)-Link (`release` · `master` · `artist` · `label`) | → | [`{{Discogs Titel}}`](https://de.wikipedia.org/wiki/Vorlage:Discogs_Titel) · [`{{Discogs Master}}`](https://de.wikipedia.org/wiki/Vorlage:Discogs_Master) · [`{{Discogs}}`](https://de.wikipedia.org/wiki/Vorlage:Discogs) · [`{{Discogs Label}}`](https://de.wikipedia.org/wiki/Vorlage:Discogs_Label) |

| DOI (`doi.org`-Link · Verlags-URL · reine `10.xxxx/…`-Nummer) | → | [`{{Literatur}}`](https://de.wikipedia.org/wiki/Vorlage:Literatur) bzw. [`{{Internetquelle}}`](https://de.wikipedia.org/wiki/Vorlage:Internetquelle) (über [Crossref](https://www.crossref.org/)) |

> [!NOTE]
> [`{{Citation}}`](https://en.wikipedia.org/wiki/Template:Citation) ohne Seitenangabe und mit URL wird alternativ in [`{{Internetquelle}}`](https://de.wikipedia.org/wiki/Vorlage:Internetquelle) konvertiert.

---

## 🧠 Intelligente Funktionen

- **Automatische Subreferenzierung:** `{{rp|...}}`-Tags werden automatisch in das `details=`-Attribut konvertiert (z. B. `{{rp|10–20}}` → `details="S. 10–20"`). Mehrere `{{rp}}`-Tags werden zusammengeführt.
- **Wikidata-Integration:** Englische Wikilinks werden automatisch ins Deutsche übersetzt (z. B. `[[Yellowstone National Park]]` → `[[Yellowstone-Nationalpark]]`). Display-Namen bleiben optional erhalten, fehlende deutsche Artikel werden intelligent behandelt. Die Titel werden dabei gebündelt abgefragt, sodass auch viele Wikilinks zügig übersetzt werden.
- **Wikipedia-Redirects:** Automatische Verfolgung von Redirects – englische Wikilinks werden zum finalen Artikel aufgelöst und korrekt ins Deutsche übersetzt (z. B. `[[Eastern Band Cherokee]]` → `[[Eastern Band of Cherokee Indians]]`).
- **Pressemitteilungen:** `{{Cite press release}}` wird zu `{{Internetquelle}}` (Autoren/Herausgeber/Interviewer zusammengeführt in `autor`, inkl. Wikilinks über `*-link`). Enthält die Vorlage eine Druck-/Publikations-ID (ISBN, DOI, ISSN …), wird stattdessen `{{Literatur}}` gebaut.
- **Discogs-Links:** Ein Discogs-Link (Release/Master/Artist/Label) wird automatisch in die passende Vorlage (`{{Discogs Titel}}` / `{{Discogs Master}}` / `{{Discogs}}` / `{{Discogs Label}}`) umgewandelt – Titel/Interpret/Name kommen über die Discogs-API, `Abruf` = heute.
- **Tracklisten:** `{{Track listing}}` wird zu `{{Titelliste}}` (Alben/Singles) – inkl. Titel/Länge/Autor/Text/Musik/Notiz je Titel. Sammel-Credits (`all_writing` …) werden als Satz über die Tabelle gesetzt.
- **Zitat-Konvertierung:** `{{blockquote}}` / `{{quote}}` werden zu `{{Zitat}}` – inklusive Sprach­erkennung, `{{lang|xx|…}}`-Entpackung, `multiline`-Umbrüchen und dem Einziehen eines direkt anschließenden `<ref>` in den `ref`-Parameter.
- **DOI-Auflösung (Crossref):** DOIs werden erkannt und automatisch zu vollständigen `{{Literatur}}`-Angaben aufgelöst; bestehende `{{cite}}`-Vorlagen mit `doi=` lassen sich um fehlende Felder ergänzen – siehe [eigener Abschnitt](#-doi-auflösung-crossref).
- **Konvertierungs-Log:** Unter dem Eingabefeld erscheinen regelbedingte Hinweise – z. B. „Archiv-URL entfernt, weil `url-status=live`", „`sprache=de` unterdrückt", „Sprachcode gekürzt" oder das gewählte Zielformat bei `{{Citation}}`/DOIs. Jeder Hinweis ist anklickbar und übernimmt die Alternative direkt in die Ausgabe (umschaltbar); der Log leert sich, sobald sich die Eingabe ändert.
- **Syntax-Highlighting:** Farbliche Hervorhebung für bessere Lesbarkeit von Eingabe und Ausgabe – inklusive grün markierter Wikilinks sowie kursiver (`''…''`) und fetter (`'''…'''`) Wikitext-Formatierung. Abgestimmt für Hell- und Dunkelmodus.
- **Optionale DeepL-Übersetzung** der konvertierten Ausgabe – siehe [eigener Abschnitt](#-übersetzung-mit-deepl-optional).
- **Update-Prüfung:** Curly meldet automatisch (höchstens einmal pro Tag, still bei Offline/Fehlern), wenn auf GitHub eine neuere Version vorliegt – über ein **„⬆️ Update“-Abzeichen** neben der Versionsnummer, das einen Dialog mit direktem Download und Release-Notes öffnet. In den Optionen unter *Aktualisierung* abschaltbar.

---

## 🚀 Nutzung

1. Lade die Datei [`Cite-Konverter.html`](https://github.com/V-Toll/Curly/releases/latest) herunter und öffne sie im Browser deiner Wahl.
2. Füge im ersten Eingabefeld den zu konvertierenden Code ein – gern inkl. `<ref>` bzw. `<ref name="…">`.
3. Klicke auf **🔀 Konvertieren**. Im Ausgabefeld erscheint der fertig formatierte Einzelnachweis (`{{Internetquelle}}`, `{{Literatur}}` bzw. `{{Zitat}}`).
4. Kopieren, auf der Wikipedia-Seite einfügen – und vor dem Speichern bitte noch einmal manuell prüfen. ✅

> [!TIP]
> Optionen, Farbschema und Versionsverlauf erreichst du über die Symbole oben rechts: **⚙️ Optionen**, **🎨 Farbschema** und **📜 Versionsverlauf** (jeweils als Fenster/Modal; Schließen per ✕, Klick außerhalb oder <kbd>Esc</kbd>).

<details>
<summary><strong>⚙️ Alle Optionen im Überblick</strong></summary>

<br>

- **Abrufdatum automatisch auf heute setzen** – setzt das Abrufdatum immer auf den heutigen Tag, unabhängig von der Vorgabe.
- **Archiv-Parameter entfernen, wenn URL aktiv** (`url-status=live`) – entfernt alle Archivparameter, wenn die ursprüngliche URL noch live ist.
- **`Sprache=de` unterdrücken** – wird bei der Ausgabe dann nicht ausgegeben.
- **Ungekürzte Sprachcodes ausgeben** (z. B. `en-GB`) – standardmäßig werden Sprachcodes auf zwei Stellen gekürzt (`en`, `fr` …).
- **Sprache manuell überschreiben** – `Sprache=` anhand der Top-Wikipedia-Sprachen manuell festlegen.
- **Subreferenzierung konvertieren** – `{{rp|...}}` → `details=`.
- **Konvertierte Ausgabe direkt in die Zwischenablage kopieren.**
- **Wikilinks → Deutsch (Wikidata)** – optionale automatische Übersetzung englischer Wikilinks.
- **Display-Namen beibehalten** – behält bei übersetzten Wikilinks den originalen Anzeigenamen bei (standardmäßig aktiv).
- **Klammern entfernen bei fehlendem deutschen Artikel** – entfernt eckige Klammern, wenn kein deutscher Artikel existiert (standardmäßig aktiv).
- **Vorlagenlose DOIs auflösen** – baut aus einem DOI ohne Vorlage automatisch `{{Literatur}}` (standardmäßig aktiv).
- **`{{cite}}`-Vorlagen per Crossref ergänzen** – füllt fehlende Felder aus Crossref; abweichende Felder werden aufgelistet (standardmäßig aktiv).
- **Zielformat bei DOI** – *Automatisch* (nach Crossref-Typ), *immer `{{Literatur}}`* oder *immer `{{Internetquelle}}`*.
- **DeepL-API-Key & Zielsprache** – optional, für die DeepL-Übersetzung (siehe unten).
- **Wahl aus rund 38 Farbthemen.**
- **Darkmode** – automatisch, erzwingen oder abschalten.
- **Sprache / Language** – Oberfläche auf Deutsch oder Englisch, oder *Automatisch* nach Systemsprache.
- **Beim Start auf neue Version prüfen (GitHub)** – blendet ein Update-Abzeichen ein, wenn eine neuere Version vorliegt (standardmäßig aktiv).

</details>

---

## 🌐 Übersetzung mit DeepL (optional)

Ab Version 9.0 kann die konvertierte Ausgabe optional per [DeepL](https://www.deepl.com/) ins Deutsche (oder eine andere Zielsprache) übersetzt werden – praktisch, um einen englischen Artikelabschnitt samt Einzelnachweisen zu übertragen.

> [!IMPORTANT]
> Für die Übersetzung ist ein **eigener, persönlicher DeepL-API-Key** erforderlich – ohne ihn funktioniert die DeepL-Übersetzung nicht. Ein kostenloser Key (Endung `:fx`) genügt; du erhältst ihn nach der Registrierung bei [DeepL API](https://www.deepl.com/pro-api). Die reine Vorlagen-Konvertierung funktioniert selbstverständlich auch ganz ohne DeepL-Key.

**Einrichtung**

1. In den Optionen (⚙️) einen DeepL-API-Key eintragen (kostenloser Key mit `:fx`-Endung oder Pro-Key). Der Schlüssel wird ausschließlich lokal im Browser (`localStorage`) gespeichert, bleibt nach dem Schließen erhalten und wird **nur direkt an DeepL** gesendet.
2. Optional die Zielsprache wählen (Standard: Deutsch).
3. Auf **🌐 Übersetzen (DeepL)** klicken – das Ergebnis ersetzt die Ausgabe.

**Was unangetastet bleibt:** Übersetzt wird nur der Fließtext. `<ref>…</ref>` (inklusive selbstschließender `<ref … />`), Wikilinks `[[…]]` sowie Wiki-Kursiv/Fett (`''…''`, `'''…'''`) bleiben unverändert. So bleiben Belege, Verlinkungen und kursive Werktitel exakt erhalten – auch ein entlinkter Werktitel ohne deutschen Artikel bleibt korrekt kursiv (z. B. `''A Blank on the Map''`).

> [!WARNING]
> **CORS-Hinweis:** Die DeepL-API erlaubt keine direkten Aufrufe aus dem Browser. Als lokale HTML-Datei brauchst du daher eine CORS-Erweiterung (z. B. „CORS Unblock" für Firefox/Chrome). Diese sollte **nur während der Übersetzung** aktiv sein und danach wieder deaktiviert werden, da sie eine Sicherheitsfunktion des Browsers vorübergehend abschaltet. Der Schlüssel verlässt deinen Browser dabei ausschließlich in Richtung DeepL – er läuft über keinen Drittanbieter.

---

## 🔗 DOI-Auflösung (Crossref)

Ab Version 11 erkennt Curly **DOIs** in einer Referenz und holt die vollständigen bibliografischen Angaben automatisch über die [Crossref-API](https://www.crossref.org/) – als `doi.org`-Link, in einer Verlags-URL oder als reine `10.xxxx/…`-Nummer.

Beispiel – aus dieser Referenz:

```wikitext
<ref>De Ketelaere A, Pullar J, Broad GR (2026) The description of a new genus of Pedunculinae … ''Journal of Natural History'' 60, 1167-1180 [https://www.tandfonline.com/doi/full/10.1080/00222933.2026.2663058 …]</ref>
```

wird automatisch:

```wikitext
<ref>{{Literatur |Autor=Augustijn De Ketelaere, Jennifer Pullar, Gavin R. Broad |Titel=The description of a new genus of Pedunculinae (Hymenoptera: Ichneumonidae) from Chile and a key to the world genera |Sammelwerk=Journal of Natural History |Band=60 |Nummer=21-24 |Datum=2026-06-03 |Sprache=en |ISSN=0022-2933 |DOI=10.1080/00222933.2026.2663058 |Seiten=1167–1180 |Online=https://www.tandfonline.com/doi/full/10.1080/00222933.2026.2663058 |Abruf=…}}</ref>
```

**Print vs. Online:** Klassische Publikationen (Journalartikel, Bücher, Buchkapitel, Tagungsbände) werden zu `{{Literatur}}`. Web-native Inhalte – Preprints (`posted-content`), Datensätze, Reports, Lexikoneinträge u. a. – werden stattdessen zu [`{{Internetquelle}}`](https://de.wikipedia.org/wiki/Vorlage:Internetquelle) (mit der echten Artikel-URL, sonst dem `doi.org`-Link). Es sind **zwei Optionen** verfügbar (beide standardmäßig aktiv, werden lokal gespeichert):

- **Vorlagenlose DOIs auflösen** – eine Referenz mit DOI, aber ohne `{{cite}}`-Vorlage, wird zu `{{Literatur}}` aufgebaut.
- **`{{cite}}`-Vorlagen per Crossref ergänzen** – eine `{{cite…|doi=}}`-Vorlage wird um **fehlende** Felder ergänzt. Bereits vorhandene Werte werden **nicht** überschrieben; weicht ein Feld von Crossref ab, wird der Unterschied unter der Ausgabe aufgelistet und lässt sich per Häkchen gezielt übernehmen.

Über die Option **Zielformat bei DOI** lässt sich die automatische Zuordnung übersteuern – *Automatisch* (nach Crossref-Typ), *immer `{{Literatur}}`* oder *immer `{{Internetquelle}}`*.

> [!NOTE]
> Die DOI-Auflösung läuft direkt aus dem Browser gegen Crossref – **kein API-Key und keine CORS-Erweiterung nötig**. Die Ergebnisse werden lokal 365 Tage zwischengespeichert. Bitte die erzeugten Angaben vor dem Speichern kurz prüfen.

---

## 🔌 Optional: Cite-Konverter Bridge (Userscript)

Die **Cite-Konverter Bridge** verbindet die Wikipedia-Bearbeitenseite direkt mit einem geöffneten Konverter-Tab – ganz ohne manuelles Kopieren. Markiere im Editor den Wikitext (z. B. einen `<ref>…</ref>`-Block oder eine `{{cite …}}`-Vorlage) und klicke in der Leiste über dem Editor auf **🔀 Konvertieren** oder **🌐 Konvertieren + Übersetzen** – das Ergebnis ersetzt die Markierung an Ort und Stelle.

**Besonderheiten**

- Kein Kopieren/Einfügen nötig – der markierte Text wird gesendet und das Ergebnis automatisch wieder eingesetzt.
- Die DeepL-Übersetzung läuft direkt aus dem Userscript über `GM_xmlhttpRequest` – **ohne CORS-Erweiterung**. `<ref>…</ref>`, Wikilinks `[[…]]` sowie Wiki-Kursiv/Fett (`''…''`, `'''…'''`) bleiben dabei geschützt.
- Unterstützt den Quelltext-Editor (`#wpTextbox1`), den wikEd-Editor sowie VisualEditor/contenteditable (dort landet das Ergebnis zusätzlich in der Zwischenablage zum Einfügen mit <kbd>Strg</kbd>/<kbd>Cmd</kbd>+<kbd>V</kbd>).
- Zusätzliche Befehle im Userscript-Menü, inklusive „Bridge: Diagnose" zur Fehlersuche.

**Voraussetzungen**

- Ein Userscript-Manager wie [Violentmonkey](https://violentmonkey.github.io/) oder Tampermonkey.
- Beide Tabs offen: die Wikipedia-Bearbeitenseite **und** der Cite-Konverter.
- Für den lokalen Konverter (`file://`): im Userscript-Manager den **Zugriff auf Datei-URLs** erlauben. Läuft der Konverter unter einer anderen Adresse (z. B. gehostet), im Skriptkopf eine passende `@match`-Zeile ergänzen.
- Für „Konvertieren + Übersetzen": den DeepL-API-Key in den Optionen (⚙️) des Konverters hinterlegen.

**Installation**

[➡️ Bridge-Userscript installieren](https://github.com/V-Toll/Curly/raw/main/cite-konverter-bridge.user.js) – der Userscript-Manager erkennt die `.user.js`-Datei automatisch und bietet die Installation an. Quelltext: [`cite-konverter-bridge.user.js`](cite-konverter-bridge.user.js).

> [!NOTE]
> Die Bridge ist völlig optional. Der Konverter funktioniert eigenständig auch ohne sie – dann per Kopieren und Einfügen.

---

## ⚡ Performance

Der Konverter nutzt intelligentes Caching (365 Tage für Wikidata-Übersetzungen und Crossref-DOI-Daten, separater Cache für Redirects), gebündelte API-Abfragen und Rate Limiting für optimale Performance und einen schonenden Umgang mit Wikipedia-/Wikidata-/Crossref-Ressourcen.

---

## 🎨 Design & Themes

Rund 38 abgestimmte Farbthemen mit eigenen Hell- und Dunkelmodus-Varianten. Das Icon links vom Titel sowie das Browser-Tab-Favicon werden als eingebettetes SVG erzeugt und übernehmen automatisch die Akzentfarben des gewählten Themes – ganz ohne externe Bilddateien.

---

## 📦 Version & Changelog

Aktuelle Version: **v11.8.2**. Den vollständigen Verlauf findest du in der [CHANGELOG.md](CHANGELOG.md) sowie direkt im Tool über das **📜**-Symbol.

## 📄 Lizenz

Veröffentlicht unter der [Unlicense](LICENSE) (Public Domain) – frei nutzbar, veränderbar und weitergebbar.

---

<div align="center">
<sub>In unzähligen Stunden entstanden – von Hand und mit Unterstützung von <a href="https://www.anthropic.com/claude">Claude</a> (Anthropic). 🤖✍️</sub>
</div>
