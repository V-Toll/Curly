// ==UserScript==
// @name         Cite-Konverter Bridge (Wikipedia ⇄ Cite-Konverter)
// @namespace    https://github.com/V-Toll/Cite-Konverter-Wikipedia
// @homepageURL  https://github.com/V-Toll/Curly
// @version      1.6.0
// @description  Markierten Wikitext im Wikipedia-Bearbeitenfenster per Rechtsklick an einen offenen Cite-Konverter-Tab senden (konvertieren / konvertieren + übersetzen) und das Ergebnis an Ort und Stelle wieder einsetzen. Übersetzung läuft direkt über GM_xmlhttpRequest (ohne CORS-Erweiterung).
// @author       V-Toll
// @match        *://*.wikipedia.org/w/index.php*
// @match        *://*.wikipedia.org/wiki/*
// @include      file://*/Cite-Konverter*.html*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_addValueChangeListener
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @grant        GM_info
// @connect      api-free.deepl.com
// @connect      api.deepl.com
// @run-at       document-idle
// @noframes
// ==/UserScript==
//
// ───────────────────────────────────────────────────────────────────────────
//  EINRICHTUNG (kurz)
//  1) Beide Tabs offen halten: (a) die Wikipedia-Bearbeitenseite und
//     (b) den Cite-Konverter (lokale HTML-Datei oder gehostet).
//  2) Für lokale Dateien (file://): in Violentmonkey bzw. in den Firefox/Zen-
//     Add-on-Einstellungen den Zugriff auf Datei-URLs erlauben.
//  3) Läuft der Konverter nicht unter file://…/Cite-Konverter*.html, sondern z. B.
//     gehostet, oben eine passende Zeile ergänzen, etwa:
//        // @match  https://deine-domain.example/pfad/Cite-Konverter*.html*
//  4) Für „Konvertieren + Übersetzen" muss im Konverter der DeepL-API-Key in
//     den Optionen hinterlegt sein. Eine CORS-Erweiterung ist NICHT nötig –
//     die Übersetzung läuft direkt aus dem Userscript via GM_xmlhttpRequest.
//
//  BEDIENUNG
//  Im Bearbeitenfeld Text markieren → in der Leiste „Cite-Konverter" über dem
//  Editor auf „Konvertieren" bzw. „Konvertieren + Übersetzen" klicken.
//  Der Konverter-Tab arbeitet die Anfrage ab; das Ergebnis ersetzt die Markierung
//  automatisch (reines Textfeld) bzw. liegt zum Einfügen mit Strg/Cmd+V in der
//  Zwischenablage (VisualEditor/andere Editoren). Alternativ über das
//  Violentmonkey-Menü; dort auch „Bridge: Diagnose".
// ───────────────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  var REQ = 'CK_BRIDGE_REQ';   // Wikipedia → Konverter
  var RES = 'CK_BRIDGE_RES';   // Konverter → Wikipedia
  var ACK = 'CK_BRIDGE_ACK';   // Konverter → Wikipedia (Empfangsbestätigung)
  // 1.6.0: Der Konverter darf bis zu 90 s konvertieren und danach bis zu 60 s
  // übersetzen; die Wiki-Seite wartet deshalb länger als beides zusammen.
  var CONVERT_TIMEOUT = 90000;
  var TRANSLATE_TIMEOUT = 60000;
  var REQ_TIMEOUT = CONVERT_TIMEOUT + TRANSLATE_TIMEOUT + 10000;
  var VERSION = (typeof GM_info !== 'undefined' && GM_info && GM_info.script && GM_info.script.version) || '?';

  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

  // ───────── kleine Toast-Benachrichtigung ─────────
  function toast(msg, kind, ms) {
    var t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText =
      'position:fixed;z-index:2147483647;left:50%;bottom:24px;transform:translateX(-50%);' +
      'background:' + (kind === 'err' ? '#b91c1c' : kind === 'ok' ? '#15803d' : '#1e293b') + ';color:#fff;' +
      'padding:10px 16px;border-radius:10px;font:14px/1.4 system-ui,-apple-system,sans-serif;' +
      'box-shadow:0 8px 30px rgba(0,0,0,.35);max-width:80vw;text-align:center';
    (document.body || document.documentElement).appendChild(t);
    var life = ms || 3000;
    setTimeout(function () {
      t.style.transition = 'opacity .4s';
      t.style.opacity = '0';
      setTimeout(function () { if (t.parentNode) t.remove(); }, 400);
    }, life);
    return t;
  }

  // 1.6.0: IDs allein sind zu schwach (jede lokale Datei mit passendem Namen und
  // gleichen IDs würde Wikitext empfangen). Zusätzlich muss sich die Seite als
  // Curly ausweisen: Ereignis-Marker (ab v11.10.0) oder Titel.
  var isKonverter =
    !!document.getElementById('inputText') &&
    !!document.getElementById('convertBtn') &&
    !!document.getElementById('outputText') &&
    (!!document.documentElement.dataset.curlyEvents || /Curly|Cite-Konverter/.test(document.title));

  var isWikiEditor = !!document.getElementById('wpTextbox1');

  if (typeof GM_addValueChangeListener !== 'function') {
    if (isKonverter || isWikiEditor) {
      toast('Cite-Konverter-Bridge: GM_addValueChangeListener fehlt – bitte Violentmonkey/Tampermonkey nutzen.', 'err', 6000);
    }
    return;
  }

  // ============================================================
  //  KONVERTER-SEITE – Anfragen empfangen, abarbeiten, antworten
  // ============================================================
  if (isKonverter) {
    // wartet, bis sich der Ausgabewert stabilisiert hat (Konvertierung ist asynchron)
    function waitStable(el, prev, timeout) {
      return new Promise(function (resolve, reject) {
        var start = Date.now(), last = null, lastChange = Date.now(), seen = false;
        var iv = setInterval(function () {
          var v = el.value;
          if (v !== prev) seen = true;
          if (v !== last) { last = v; lastChange = Date.now(); }
          var stableFor = Date.now() - lastChange;
          if ((seen || Date.now() - start > 1500) && stableFor >= 450 && v.trim() !== '') {
            clearInterval(iv); resolve(v);
          } else if (Date.now() - start > timeout) {
            clearInterval(iv);
            v.trim() !== '' ? resolve(v) : reject(new Error('Zeitüberschreitung beim Konvertieren'));
          }
        }, 150);
      });
    }
    // 1.6.0: accept(detail) entscheidet, ob das Ereignis zum eigenen Lauf gehört
    // (Konverter ab v12.1.0 liefert detail.runId). Ohne accept zählt jedes Ereignis.
    function waitConverted(timeout, accept) {
      return new Promise(function (resolve, reject) {
        var timer = setTimeout(function () {
          document.removeEventListener('curly:converted', onDone);
          reject(new Error('Zeitüberschreitung beim Konvertieren'));
        }, timeout);
        function onDone(ev) {
          if (accept && !accept(ev && ev.detail)) return;
          clearTimeout(timer);
          document.removeEventListener('curly:converted', onDone);
          resolve();
        }
        document.addEventListener('curly:converted', onDone);
      });
    }
    // ── Übersetzung direkt aus dem Userscript via GM_xmlhttpRequest (umgeht CORS) ──
    // Schützt – wie der Konverter selbst – <ref>…</ref>, Wikilinks [[…]] sowie
    // Wiki-Kursiv/Fett (''…''/'''…''') und entfernt DeepL-Artefakte (Anführungszeichen
    // um Platzhalter, Leerzeichen vor <ref>).
    var PROTECT = /<ref\b[^>]*?\/>|<ref\b[^>]*?>[\s\S]*?<\/ref>|'''[^\n]+?'''|''[^\n]+?''|\[\[[^\]]*?\]\]/gi;
    function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    function unesc(s) { return s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'); }
    function build(text) {
      var spans = [];
      var t = text.replace(PROTECT, function (m) { spans.push(m); return '\uE000' + (spans.length - 1) + '\uE001'; });
      t = esc(t);
      t = t.replace(/\uE000(\d+)\uE001/g, function (_, n) { return '<x>' + n + '</x>'; });
      return { payload: t, spans: spans };
    }
    function restore(tr, spans) {
      tr = tr.replace(/[\u201E\u201C\u0022](<x>\d+<\/x>)[\u201C\u201D\u0022]/g, '$1'); // Anführungszeichen um Platzhalter entfernen
      var t = tr.replace(/<x>(\d+)<\/x>/g, function (_, n) { return '\uE000' + n + '\uE001'; });
      t = unesc(t);
      t = t.replace(/\uE000(\d+)\uE001/g, function (_, n) { return spans[+n]; });
      t = t.replace(/[ \t]+(<ref\b)/g, '$1'); // Leerzeichen vor <ref> entfernen
      return t;
    }
    function translateViaGM(text, key, target) {
      return new Promise(function (resolve, reject) {
        var built = build(text);
        var bare = built.payload.replace(/<x>\d+<\/x>/g, '').replace(/\s+/g, '');
        if (!bare) { resolve(text); return; } // nur ref/Wikilinks → nichts zu übersetzen
        var endpoint = /:fx$/.test(key) ? 'https://api-free.deepl.com/v2/translate' : 'https://api.deepl.com/v2/translate';
        // 1.6.0: Payload in <d>…</d> hüllen wie im Konverter seit v11.6.2; sonst ist
        // Text direkt hinter einem führenden Platzhalter kein wohlgeformtes XML
        // und DeepL bricht nach dem ersten Platzhalter ab.
        var data = 'text=' + encodeURIComponent('<d>' + built.payload + '</d>') +
                   '&target_lang=' + encodeURIComponent(target) +
                   '&tag_handling=xml&ignore_tags=x&outline_detection=0';
        GM_xmlhttpRequest({
          method: 'POST', url: endpoint, timeout: TRANSLATE_TIMEOUT,
          headers: { 'Authorization': 'DeepL-Auth-Key ' + key, 'Content-Type': 'application/x-www-form-urlencoded' },
          data: data,
          onload: function (r) {
            if (r.status >= 200 && r.status < 300) {
              try {
                var j = JSON.parse(r.responseText);
                var tr = j && j.translations && j.translations[0] && j.translations[0].text;
                if (tr == null) { reject(new Error('Unerwartete Antwort von DeepL.')); return; }
                var mWrap = tr.match(/<d\b[^>]*>([\s\S]*)<\/d>/i); if (mWrap) tr = mWrap[1];
                resolve(restore(tr, built.spans));
              } catch (e) { reject(new Error('DeepL-Antwort nicht lesbar.')); }
            } else {
              var m = r.status === 403 ? 'DeepL-API-Key ungültig (403).'
                    : r.status === 456 ? 'DeepL-Kontingent für diesen Monat aufgebraucht (456).'
                    : r.status === 429 ? 'Zu viele Anfragen (429) – bitte kurz warten.'
                    : 'DeepL-Fehler (HTTP ' + r.status + ').';
              reject(new Error(m));
            }
          },
          onerror: function () { reject(new Error('DeepL nicht erreichbar (Netzwerkfehler).')); },
          ontimeout: function () { reject(new Error('Zeitüberschreitung bei der Übersetzung.')); }
        });
      });
    }

    async function process(req) {
      var input = document.getElementById('inputText');
      var output = document.getElementById('outputText');
      var convertBtn = document.getElementById('convertBtn');

      var prev = output.value;
      input.value = req.text;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      var converted;
      if (document.documentElement.dataset.curlyEvents) {
        // 1.5.0: Konverter ab v11.10.0 meldet das Ende selbst („curly:converted“).
        // Das Feld zu beobachten reichte nicht: Wikidata/DOI antworten mitunter erst
        // nach mehr als 450 ms Ruhe, dann kam der Zwischenstand zurück.
        // 1.6.0: Läuft gerade ein Lauf (Klick im Tab), erst dessen Ende abwarten;
        // danach nur das Ereignis mit der eigenen runId annehmen.
        if (convertBtn.dataset.busy) { await waitConverted(CONVERT_TIMEOUT); input.value = req.text; }
        var myRun = null;
        var done = waitConverted(CONVERT_TIMEOUT, function (d) {
          if (!d || d.runId == null || myRun == null) return true;
          return String(d.runId) === myRun;
        });
        convertBtn.click();
        myRun = convertBtn.dataset.runId || null;
        await done;
        converted = output.value;
      } else {
        convertBtn.click();
        converted = await waitStable(output, prev, CONVERT_TIMEOUT);
      }

      if (req.action === 'translate') {
        var keyEl = document.getElementById('deeplKey');
        var tgtEl = document.getElementById('deeplTarget');
        var key = ((keyEl && keyEl.value) || localStorage.getItem('deeplKey') || sessionStorage.getItem('deeplKey') || '').trim();
        var target = (tgtEl && tgtEl.value) || localStorage.getItem('deeplTarget') || 'DE';
        if (!key) return { ok: false, text: converted, error: 'Kein DeepL-API-Key in den Optionen des Konverters hinterlegt.' };
        try {
          var translated = await translateViaGM(converted, key, target);
          output.value = translated; // Konverter-Ausgabe sichtbar aktualisieren
          try { if (typeof window.updateOutputHighlight === 'function') window.updateOutputHighlight(); } catch (_) {}
          return { ok: true, text: translated };
        } catch (err) {
          return { ok: false, text: converted, error: String((err && err.message) || err) };
        }
      }
      return { ok: true, text: converted };
    }

    GM_addValueChangeListener(REQ, function (name, oldV, newV, remote) {
      if (!remote || !newV) return;
      var req; try { req = JSON.parse(newV); } catch (e) { return; }
      if (!req || !req.id || typeof req.text !== 'string') return;

      try { GM_setValue(ACK, JSON.stringify({ id: req.id, ts: Date.now() })); } catch (e) {} // Empfang bestätigen
      var working = toast('Anfrage empfangen – ' + (req.action === 'translate' ? 'konvertiere + übersetze' : 'konvertiere') + ' …', 'info', REQ_TIMEOUT);
      process(req).then(function (res) {
        if (working.parentNode) working.remove();
        GM_setValue(RES, JSON.stringify({ id: req.id, ok: res.ok, text: res.text, error: res.error, ts: Date.now() }));
        toast(res.ok ? 'Fertig – Ergebnis zurückgesendet ✓' : 'Zurückgesendet (mit Hinweis)', res.ok ? 'ok' : 'err', 3000);
      }).catch(function (err) {
        if (working.parentNode) working.remove();
        var msg = String((err && err.message) || err);
        GM_setValue(RES, JSON.stringify({ id: req.id, ok: false, text: '', error: msg, ts: Date.now() }));
        toast('Fehler: ' + msg, 'err', 5000);
      });
    });

    if (typeof GM_registerMenuCommand === 'function') {
      GM_registerMenuCommand('Bridge: Status (Konverter)', function () {
        var keyEl = document.getElementById('deeplKey');
        var key = ((keyEl && keyEl.value) || localStorage.getItem('deeplKey') || sessionStorage.getItem('deeplKey') || '').trim();
        var tgtEl = document.getElementById('deeplTarget');
        var target = (tgtEl && tgtEl.value) || localStorage.getItem('deeplTarget') || 'DE';
        alert('Cite-Konverter-Bridge ' + VERSION + ' (Konverter-Seite)\n\n' +
          'Bridge aktiv und lauschbereit: ja\n' +
          'Konvertieren-Button gefunden: ' + !!document.getElementById('convertBtn') + '\n' +
          'DeepL-Key hinterlegt: ' + (key ? 'ja (' + key.length + ' Zeichen, ' + (/:fx$/.test(key) ? 'Free' : 'Pro') + ')' : 'NEIN – bitte in den Optionen des Konverters eintragen') + '\n' +
          'Zielsprache: ' + target);
      });
    }

    toast('Cite-Konverter-Bridge aktiv', 'info', 1500);
  }

  // ============================================================
  //  WIKIPEDIA-SEITE – markieren, senden, Ergebnis einsetzen
  // ============================================================
  if (isWikiEditor) {
    var ta = document.getElementById('wpTextbox1');
    var pending = null;   // { id, mode, start, end, original, range, toast, timer }
    var lastSel = null;   // zuletzt gemerkte, nicht-leere Markierung

    function taUsable() { return !!ta && typeof ta.selectionStart === 'number'; }
    // 1.6.0: GM_setClipboard braucht keine Nutzeraktivierung. navigator.clipboard
    // wird im Rückweg (Ereignis aus dem anderen Tab) von Firefox abgelehnt.
    function copyToClipboard(text) {
      try { if (typeof GM_setClipboard === 'function') { GM_setClipboard(text, 'text'); return true; } } catch (e) {}
      try { navigator.clipboard.writeText(text).catch(function () {}); return true; } catch (e) { return false; }
    }

    // wikEd-Editor – läuft in einem iframe (#wikEdFrame), eigenes Dokument/Selektion
    function wikEdFrameEl() { return document.getElementById('wikEdFrame'); }
    function wikEdWin() { try { var f = wikEdFrameEl(); return f && f.contentWindow; } catch (e) { return null; } }
    function wikEdDoc() { try { var f = wikEdFrameEl(); return f && (f.contentDocument || (f.contentWindow && f.contentWindow.document)); } catch (e) { return null; } }
    function selFromWikEd() {
      var w = wikEdWin(); if (!w || !w.getSelection) return null;
      var s; try { s = w.getSelection(); } catch (e) { return null; }
      if (s && s.rangeCount && !s.isCollapsed) {
        var t = s.toString();
        if (t && t.trim()) { var r = null; try { r = s.getRangeAt(0).cloneRange(); } catch (e) {} return { mode: 'wiked', text: t, range: r }; }
      }
      return null;
    }

    function selFromTextarea() {
      if (taUsable() && ta.selectionStart !== ta.selectionEnd) {
        return { mode: 'textarea', start: ta.selectionStart, end: ta.selectionEnd, text: ta.value.substring(ta.selectionStart, ta.selectionEnd) };
      }
      return null;
    }
    function selFromDom() {
      var s = window.getSelection && window.getSelection();
      if (s && s.rangeCount && !s.isCollapsed) {
        var t = s.toString();
        if (t && t.trim()) {
          var r = null; try { r = s.getRangeAt(0).cloneRange(); } catch (e) {}
          return { mode: 'dom', text: t, range: r };
        }
      }
      return null;
    }
    // bevorzugt wikEd-iframe, dann DOM-Markierung (VisualEditor/contenteditable), dann reines Textfeld
    function currentSelection() { return selFromWikEd() || selFromDom() || selFromTextarea() || lastSel; }

    // Laufend die letzte nicht-leere Markierung merken – falls ein Klick sie aufhebt
    function remember() { var s = selFromWikEd() || selFromTextarea() || selFromDom(); if (s) lastSel = s; }
    document.addEventListener('selectionchange', remember, true);
    document.addEventListener('mouseup', remember, true);
    document.addEventListener('keyup', remember, true);
    // wikEd: Events aus dem iframe erreichen das Hauptdokument nicht → dort separat lauschen
    (function bindWikEd(tries) {
      var d = wikEdDoc();
      if (d) {
        if (!d.__ckBound) {
          d.__ckBound = true;
          d.addEventListener('selectionchange', remember, true);
          d.addEventListener('mouseup', remember, true);
          d.addEventListener('keyup', remember, true);
        }
        return;
      }
      if ((tries || 0) < 20) setTimeout(function () { bindWikEd((tries || 0) + 1); }, 500);
    })(0);

    function send(action) {
      if (pending) { toast('Es läuft bereits eine Anfrage – bitte kurz warten.', 'err'); return; }
      var sel = currentSelection();
      if (!sel || !sel.text) { toast('Bitte zuerst Text im Bearbeitenfeld markieren.', 'err'); return; }
      var id = uid();
      var tn = toast('An Cite-Konverter gesendet – warte auf Ergebnis … (Konverter-Tab offen halten)', 'info', REQ_TIMEOUT);
      pending = { id: id, mode: sel.mode, start: sel.start, end: sel.end, original: sel.text, range: sel.range, toast: tn, acked: false };
      // Empfangsbestätigung abwarten – bleibt sie aus, läuft das Skript im Konverter-Tab vermutlich nicht
      pending.ackTimer = setTimeout(function () {
        if (pending && pending.id === id && !pending.acked) {
          if (tn.parentNode) tn.remove();
          toast('Cite-Konverter-Tab reagiert nicht. Läuft das Bridgen-Skript dort? Bei lokaler Datei (file://) muss Violentmonkey Zugriff auf Datei-URLs haben – und den Konverter-Tab nach dem Update einmal neu laden.', 'err', 10000);
          pending = null;
        }
      }, 4000);
      pending.timer = setTimeout(function () {
        if (pending && pending.id === id) {
          if (pending.toast && pending.toast.parentNode) pending.toast.remove();
          toast('Keine Antwort vom Cite-Konverter (Zeitüberschreitung).', 'err', 6000);
          pending = null;
        }
      }, REQ_TIMEOUT);
      GM_setValue(REQ, JSON.stringify({ id: id, action: action, text: sel.text, ts: Date.now() }));
    }

    function applyResult(res) {
      if (!pending || pending.id !== res.id) return;
      clearTimeout(pending.timer);
      if (pending.ackTimer) clearTimeout(pending.ackTimer);
      if (pending.toast && pending.toast.parentNode) pending.toast.remove();
      var p = pending; pending = null;

      if (!res.ok) {
        var proceed = confirm(
          'Hinweis vom Cite-Konverter:\n' + (res.error || 'Unbekannter Fehler') + '\n\n' +
          (res.text ? 'Den konvertierten (ggf. nicht übersetzten) Text trotzdem einsetzen?' : 'Es wurde kein Text zurückgegeben.')
        );
        if (!proceed || !res.text) return;
      }

      // ── Reines Textfeld: zuverlässiges Ersetzen über Offsets ──
      if (p.mode === 'textarea' && taUsable()) {
        var val = ta.value, s = p.start, e = p.end;
        if (val.substring(s, e) !== p.original) {
          var idx = val.indexOf(p.original);
          if (idx < 0) { copyToClipboard(res.text); toast('Markierter Bereich nicht mehr auffindbar – Ergebnis in die Zwischenablage kopiert.', 'err', 6000); return; }
          s = idx; e = idx + p.original.length;
        }
        // 1.6.0: über execCommand('insertText') einsetzen, damit Strg/Cmd+Z die
        // Ersetzung rückgängig machen kann; ta.value= löscht den Undo-Verlauf.
        var viaExec = false;
        try {
          ta.focus();
          ta.setSelectionRange(s, e);
          viaExec = document.execCommand('insertText', false, res.text) &&
                    ta.value.substring(s, s + res.text.length) === res.text;
        } catch (err) { viaExec = false; }
        if (!viaExec) {
          ta.value = val.substring(0, s) + res.text + val.substring(e);
          ta.dispatchEvent(new Event('input', { bubbles: true }));
        }
        ta.selectionStart = s; ta.selectionEnd = s + res.text.length;
        ta.focus();
        toast('Eingesetzt ✓', 'ok', 2500);
        return;
      }

      // ── wikEd (iframe): Markierung wiederherstellen, einsetzen und Textarea syncen ──
      if (p.mode === 'wiked') {
        var wInserted = false;
        try {
          var w = wikEdWin(), d = wikEdDoc();
          if (w && p.range) { var ws = w.getSelection(); ws.removeAllRanges(); ws.addRange(p.range); }
          try { if (w && w.focus) w.focus(); } catch (e) {}
          wInserted = !!(d && d.execCommand && d.execCommand('insertText', false, res.text));
          try { if (window.wikEd && typeof window.wikEd.UpdateTextarea === 'function') window.wikEd.UpdateTextarea(); } catch (e) {}
        } catch (e) { wInserted = false; }
        copyToClipboard(res.text);
        if (wInserted) toast('Eingesetzt ✓ (Sicherung in der Zwischenablage)', 'ok', 3500);
        else toast('Ergebnis in der Zwischenablage – jetzt mit Strg/Cmd+V über die Markierung einfügen.', 'info', 7000);
        return;
      }

      // ── Andere Editoren (VisualEditor/contenteditable): Markierung wiederherstellen,
      //    einsetzen versuchen und das Ergebnis zusätzlich in die Zwischenablage legen ──
      var inserted = false;
      try {
        var sObj = window.getSelection();
        if (p.range && sObj) { sObj.removeAllRanges(); sObj.addRange(p.range); }
        var startEl = p.range && p.range.startContainer;
        startEl = startEl && (startEl.nodeType === 1 ? startEl : startEl.parentElement);
        var host = startEl && startEl.closest && startEl.closest('[contenteditable="true"], textarea');
        if (host && host.focus) host.focus();
        inserted = document.execCommand('insertText', false, res.text);
      } catch (e) { inserted = false; }
      copyToClipboard(res.text);
      if (inserted) toast('Eingesetzt ✓ (Sicherung liegt in der Zwischenablage)', 'ok', 3500);
      else toast('Ergebnis in der Zwischenablage – jetzt mit Strg/Cmd+V über die Markierung einfügen.', 'info', 7000);
    }

    GM_addValueChangeListener(RES, function (name, oldV, newV, remote) {
      if (!remote || !newV) return;
      var res; try { res = JSON.parse(newV); } catch (e) { return; }
      if (res && res.id) applyResult(res);
    });

    GM_addValueChangeListener(ACK, function (name, oldV, newV, remote) {
      if (!remote || !newV) return;
      var a; try { a = JSON.parse(newV); } catch (e) { return; }
      if (pending && a && a.id === pending.id && !pending.acked) {
        pending.acked = true;
        if (pending.ackTimer) clearTimeout(pending.ackTimer);
        if (pending.toast) pending.toast.textContent = 'Cite-Konverter verarbeitet die Anfrage … (konvertieren/übersetzen)';
      }
    });

    // ── Werkzeugleiste mit Buttons über dem Editor ──
    function makeBar() {
      if (document.getElementById('ck-bridge-bar')) return;
      var bar = document.createElement('div');
      bar.id = 'ck-bridge-bar';
      bar.setAttribute('data-ck-bridge', 'bar');
      bar.style.cssText = 'position:sticky;top:0;z-index:1000;display:flex;gap:8px;align-items:center;flex-wrap:wrap;' +
        'margin:0 0 6px;padding:8px 10px;background:#f1f5f9;border:1px solid #cbd5e1;border-radius:8px;' +
        'font:13px/1.3 system-ui,-apple-system,sans-serif';
      var label = document.createElement('span');
      label.textContent = 'Cite-Konverter:'; label.style.cssText = 'font-weight:600;color:#334155';
      bar.appendChild(label);
      function btn(text, action) {
        var b = document.createElement('button');
        b.type = 'button'; b.textContent = text;
        b.setAttribute('data-ck-bridge', 'btn-' + action);
        b.style.cssText = 'cursor:pointer;border:1px solid #6366f1;background:#6366f1;color:#fff;padding:6px 12px;border-radius:6px;font:inherit';
        b.addEventListener('mouseenter', function () { b.style.background = '#4f46e5'; });
        b.addEventListener('mouseleave', function () { b.style.background = '#6366f1'; });
        b.addEventListener('mousedown', function (e) { e.preventDefault(); }); // Markierung im Editor nicht verlieren
        b.addEventListener('click', function (e) { e.preventDefault(); send(action); });
        return b;
      }
      bar.appendChild(btn('🔀 Konvertieren', 'convert'));
      bar.appendChild(btn('🌐 Konvertieren + Übersetzen', 'translate'));
      var hint = document.createElement('span');
      hint.textContent = 'Text im Editor markieren, dann Button klicken';
      hint.style.cssText = 'color:#64748b';
      bar.appendChild(hint);

      var form = document.getElementById('editform');
      if (form && form.insertBefore) {
        form.insertBefore(bar, form.firstChild);
      } else {
        bar.style.position = 'fixed'; bar.style.top = '8px'; bar.style.left = '50%';
        bar.style.transform = 'translateX(-50%)'; bar.style.margin = '0';
        (document.body || document.documentElement).appendChild(bar);
      }
    }
    makeBar();

    // ── Violentmonkey-Menübefehle (Alternative + Diagnose) ──
    if (typeof GM_registerMenuCommand === 'function') {
      GM_registerMenuCommand('Markierung konvertieren', function () { send('convert'); });
      GM_registerMenuCommand('Markierung konvertieren + übersetzen', function () { send('translate'); });
      GM_registerMenuCommand('Bridge: Diagnose', function () {
        var ae = document.activeElement;
        var ce = document.querySelectorAll('[contenteditable="true"]');
        var ceInfo = []; for (var i = 0; i < ce.length && i < 4; i++) ceInfo.push(String(ce[i].className || ce[i].tagName).slice(0, 50));
        var taLen = taUsable() ? (ta.selectionEnd - ta.selectionStart) : -1;
        var ws = (window.getSelection && window.getSelection()) ? String(window.getSelection()) : '';
        var weSel = selFromWikEd();
        var ls = lastSel ? (lastSel.mode + ', ' + (lastSel.text ? lastSel.text.length : 0) + ' Zeichen') : '–';
        alert('Cite-Konverter-Bridge ' + VERSION + '\n\n' +
          '#wpTextbox1 vorhanden: ' + !!ta + '\n' +
          'aktives Element: ' + (ae ? (ae.tagName + (ae.id ? '#' + ae.id : '') + (ae.className ? '.' + String(ae.className).slice(0, 40) : '')) : '–') + '\n' +
          'wikEd-iframe (#wikEdFrame): ' + !!wikEdFrameEl() + ', erreichbar: ' + !!wikEdDoc() + '\n' +
          'wikEd-Markierung (Zeichen): ' + (weSel ? weSel.text.length : 0) + '\n' +
          'CodeMirror (.cm-editor): ' + !!document.querySelector('.cm-editor') + '\n' +
          'VisualEditor (.ve-ce-surface): ' + !!document.querySelector('.ve-ce-surface') + '\n' +
          'contenteditable-Flächen: ' + ce.length + (ceInfo.length ? '\n  [' + ceInfo.join(' | ') + ']' : '') + '\n' +
          'Textfeld-Markierung (Zeichen): ' + taLen + '\n' +
          'window.getSelection-Länge: ' + ws.length + '\n' +
          'gemerkte Markierung: ' + ls);
      });
    }

    toast('Cite-Konverter-Bridge aktiv – Buttons über dem Editor nutzen.', 'info', 2400);
  }
})();
