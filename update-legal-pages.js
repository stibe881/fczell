const db = require('./db');

const impressumBody = `**FC Zell**  
Postfach  
6144 Zell  
Schweiz

**E-Mail:** [info@fczell.ch](mailto:info@fczell.ch)  
**Website:** [www.fczell.ch](https://www.fczell.ch)

**Vertretungsberechtigte Personen:**  
Der Verein wird durch den Vorstand vertreten (Präsident:in).

**Haftungsausschluss:**  
Der Autor übernimmt keinerlei Gewähr hinsichtlich der inhaltlichen Richtigkeit, Genauigkeit, Aktualität, Zuverlässigkeit und Vollständigkeit der Informationen. Haftungsansprüche gegen den Autor wegen Schäden materieller oder immaterieller Art, welche aus dem Zugriff oder der Nutzung bzw. Nichtnutzung der veröffentlichten Informationen, durch Missbrauch der Verbindung oder durch technische Störungen entstanden sind, werden ausgeschlossen.  
Alle Angebote sind unverbindlich. Der Autor behält es sich ausdrücklich vor, Teile der Seiten oder das gesamte Angebot ohne gesonderte Ankündigung zu verändern, zu ergänzen, zu löschen oder die Veröffentlichung zeitweise oder endgültig einzustellen.

**Haftung für Links:**  
Verweise und Links auf Webseiten Dritter liegen ausserhalb unseres Verantwortungsbereichs. Es wird jegliche Verantwortung für solche Webseiten abgelehnt. Der Zugriff und die Nutzung solcher Webseiten erfolgen auf eigene Gefahr des Nutzers oder der Nutzerin.

**Urheberrechte:**  
Die Urheber- und alle anderen Rechte an Inhalten, Bildern, Fotos oder anderen Dateien auf der Website gehören ausschliesslich dem FC Zell oder den speziell genannten Rechtsinhabern. Für die Reproduktion jeglicher Elemente ist die schriftliche Zustimmung der Urheberrechtsträger im Voraus einzuholen.`;

const datenschutzBody = `Wir, der **FC Zell**, nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften der Schweiz (revDSG) sowie – sofern anwendbar – der europäischen Datenschutz-Grundverordnung (DSGVO).

## 1. Verantwortliche Stelle
Verantwortlich für die Datenbearbeitung auf dieser Website ist:

**FC Zell**  
Postfach  
6144 Zell  
Schweiz  
E-Mail: [info@fczell.ch](mailto:info@fczell.ch)

## 2. Erhebung und Bearbeitung personenbezogener Daten
Wir verarbeiten personenbezogene Daten, die wir im Rahmen unserer Vereinstätigkeit von Ihnen erhalten (z.B. durch Kontaktformulare, Anmeldungen zu Anlässen oder Mitgliedschaften). 

### 2.1 Server-Log-Dateien
Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind:
- Browsertyp und Browserversion
- Verwendetes Betriebssystem
- Referrer URL
- Hostname des zugreifenden Rechners
- Uhrzeit der Serveranfrage
- IP-Adresse

Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen. Die Erfassung dieser Daten erfolgt auf Grundlage unserer berechtigten Interessen an der technisch fehlerfreien Darstellung und der Optimierung unserer Website.

### 2.2 Kontaktformular
Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. 

### 2.3 Anmeldung zu Anlässen (z.B. Juniorenlager, Dorfturnier)
Wir erheben Daten zur Organisation unserer Vereinsanlässe. Dazu gehören Name, Vorname, Geburtsdatum, Adresse, Kontaktangaben sowie allfällige gesundheitliche Angaben (z.B. Allergien beim Juniorenlager). Diese Daten werden ausschliesslich für die Planung, Durchführung und Sicherheit des jeweiligen Anlasses verwendet.

## 3. Einbindung von Diensten und Inhalten Dritter

### 3.1 SFV Widgets (Schweizerischer Fussballverband)
Wir binden auf unserer Website Widgets des Schweizerischen Fussballverbands (SFV) ein, um Spieldaten, Resultate und Ranglisten anzuzeigen (betrieben durch widget.football.ch). Beim Aufruf einer Seite, die ein solches Widget enthält, baut Ihr Browser eine direkte Verbindung zu den Servern des SFV auf. Dabei wird Ihre IP-Adresse an den SFV übermittelt und dieser kann Cookies setzen, um die Darstellung der Widgets zu gewährleisten und statistische Erhebungen durchzuführen.  
Weitere Informationen zum Datenschutz des SFV finden Sie unter: [https://www.football.ch](https://www.football.ch)

### 3.2 Veo Livestream
Für die Videoübertragung unserer Spiele verlinken wir auf die Dienste von Veo Technologies. Beim Anklicken dieser Links verlassen Sie unsere Website. Auf den Websites von Veo gelten die Datenschutzbestimmungen von Veo Technologies.

## 4. Cookies
Unsere Website verwendet teilweise so genannte Cookies. Cookies richten auf Ihrem Rechner keinen Schaden an und enthalten keine Viren. Cookies dienen dazu, unser Angebot nutzerfreundlicher, effektiver und sicherer zu machen. 
Sie können Ihren Browser so einstellen, dass Sie über das Setzen von Cookies informiert werden und Cookies nur im Einzelfall erlauben, die Annahme von Cookies für bestimmte Fälle oder generell ausschliessen sowie das automatische Löschen der Cookies beim Schliessen des Browsers aktivieren.

## 5. Weitergabe von Daten an Dritte
Wir geben Ihre persönlichen Daten nur dann an Dritte weiter, wenn:
- Sie Ihre ausdrückliche Einwilligung dazu erteilt haben,
- die Weitergabe zur Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen erforderlich ist,
- für die Weitergabe eine gesetzliche Verpflichtung besteht, oder
- dies gesetzlich zulässig und für die Abwicklung von Vertragsverhältnissen mit Ihnen erforderlich ist.

Für den Spielbetrieb des FC Zell werden notwendige Daten (z.B. von Spielern und Funktionären) an den Innerschweizerischen Fussballverband (IFV) und den SFV gemeldet.

## 6. Datensicherheit
Wir bedienen uns geeigneter technischer und organisatorischer Sicherheitsmassnahmen, um Ihre Daten gegen zufällige oder vorsätzliche Manipulationen, teilweisen oder vollständigen Verlust, Zerstörung oder gegen den unbefugten Zugriff Dritter zu schützen.

## 7. Ihre Rechte
Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung sowie ein Recht auf Berichtigung, Sperrung oder Löschung dieser Daten. Hierzu sowie zu weiteren Fragen zum Thema personenbezogene Daten können Sie sich jederzeit unter der oben angegebenen Adresse an uns wenden.

## 8. Änderungen dieser Datenschutzerklärung
Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen in der Datenschutzerklärung umzusetzen. Für Ihren erneuten Besuch gilt dann die neue Datenschutzerklärung.

*Letzte Aktualisierung: 5. Juni 2026*`;

(async () => {
  try {
    // Insert or update Impressum
    await db.query("INSERT INTO pages (slug, title, body) VALUES ('impressum', 'Impressum', ?) ON DUPLICATE KEY UPDATE body = ?, title = 'Impressum'", [impressumBody, impressumBody]);
    
    // Insert or update Datenschutz
    await db.query("INSERT INTO pages (slug, title, body) VALUES ('datenschutz', 'Datenschutzerklärung', ?) ON DUPLICATE KEY UPDATE body = ?, title = 'Datenschutzerklärung'", [datenschutzBody, datenschutzBody]);

    console.log("Database updated successfully");
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
})();
