# Admin Dashboard Guide
## The Compagnon - Trainer Handbuch

**Version:** 2.0  
**Zielgruppe:** Trainer und Administratoren  
**Datum:** 16. Januar 2026

---

## Inhaltsverzeichnis

1. [Erste Schritte](#erste-schritte)
2. [Dashboard Übersicht](#dashboard-übersicht)
3. [Projector Mode](#projector-mode)
4. [Module Editor](#module-editor)
5. [Design Editor](#design-editor)
6. [Teilnehmer-Verwaltung](#teilnehmer-verwaltung)
7. [Analytics](#analytics)
8. [Kontrollen](#kontrollen)
9. [Best Practices](#best-practices)

---

## Erste Schritte

### Admin Login

1. Öffne die App: `http://localhost:5173`
2. Klicke auf **"Admin"** Button (oben rechts)
3. Gib das Admin-Passwort ein (Standard: `admin123`)
4. Du wirst zum Admin Dashboard weitergeleitet

**Wichtig:** Ändere das Standard-Passwort in der `.env` Datei:
```env
ADMIN_PASSWORD=dein_sicheres_passwort
```

---

## Dashboard Übersicht

Das Admin Dashboard zeigt dir auf einen Blick:

### Live Stats Bar
- **Participants**: Gesamtzahl der Teilnehmer
- **Active Now**: Aktuell online
- **Moods**: Anzahl der Mood-Reaktionen
- **Apps**: Erstellte Sandbox-Apps
- **Chat Messages**: KI-Chat Nachrichten

### Tabs
- **Overview**: Systemübersicht und Statistiken
- **Participants**: Teilnehmerliste mit Details
- **Analytics**: Mood-Analysen und Engagement
- **Controls**: Steuerung und Verwaltung

---

## Projector Mode

**Zweck:** Präsentationsansicht für Beamer/Projektor

### Aktivierung
1. Klicke auf **"Projector Mode"** im Dashboard
2. Vollbild mit `F11` oder Fullscreen-Button

### Features
- **Live Teilnehmer-Anzeige**: Wer ist online?
- **Mood-Reaktionen**: Echtzeit Stimmungsbarometer
- **QR-Code**: Für schnellen Teilnehmer-Zugang
- **Session Stats**: Engagement-Metriken

### QR-Code teilen
1. Klicke auf **"QR Code"** Button
2. Teilnehmer scannen mit Smartphone
3. Automatische Weiterleitung zur App

**Tipp:** Nutze den Projector Mode während der Schulung, um Engagement zu visualisieren!

---

## Module Editor

**Zweck:** Inhalte verwalten und anpassen

### Modul erstellen
1. Öffne **"Module Editor"** im Dashboard
2. Klicke auf **"Neu"**
3. Fülle aus:
   - **Titel**: z.B. "Modul 1: KI Grundlagen"
   - **Beschreibung**: Kurze Zusammenfassung
   - **Reihenfolge**: Position in der Liste
   - **Inhalt**: Markdown-formatierter Text

4. Klicke **"Speichern"**

### Modul bearbeiten
1. Wähle Modul aus der Liste
2. Bearbeite Felder
3. Speichere Änderungen

### Modul löschen
1. Klicke auf Papierkorb-Icon
2. Bestätige Löschung

### Zusatzfunktionen
- **Umfrage erstellen**: Interaktive Polls
- **Wordcloud**: Teilnehmer-Beiträge visualisieren
- **Vorschau**: Modul vor Veröffentlichung testen

**Markdown-Tipps:**
```markdown
# Überschrift 1
## Überschrift 2

**Fett** und *kursiv*

- Liste
- Punkt 2

[Link](https://example.com)
```

---

## Design Editor

**Zweck:** App-Design anpassen

### Farbschema ändern
1. Öffne **"Design"** im Dashboard
2. Wähle ein Preset:
   - Cyber Neon (Standard)
   - Ocean Blue
   - Forest Green
   - Sunset Orange
   - Purple Dream
   - Rose Gold

3. Oder passe einzelne Farben an:
   - Primärfarbe
   - Sekundärfarbe
   - Akzentfarbe
   - Hintergrund
   - Textfarbe

### Typografie
- **Schriftart**: Inter, Roboto, Poppins, Montserrat, JetBrains Mono
- **Schriftgröße**: Klein, Mittel, Groß

### Layout
- **Eckenradius**: Eckig, Abgerundet, Sehr rund

### Speichern
1. Klicke **"Vorschau"** zum Testen
2. Klicke **"Speichern"**
3. Seite lädt neu mit neuem Design

**Tipp:** Passe das Design an deine Marke an!

---

## Teilnehmer-Verwaltung

### Teilnehmerliste
- **Online-Status**: Grün = online, Grau = offline
- **Avatar**: Automatisch generiert
- **Details**: Klicke auf "Details" für mehr Info

### Teilnehmer kicken
1. Klicke auf **"Kick"** Button
2. Bestätige Aktion
3. Teilnehmer wird ausgeloggt

**Wann kicken?**
- Störendes Verhalten
- Technische Probleme
- Neustart erforderlich

---

## Analytics

### Mood Analytics
- **Zeitbereich**: 1h, 6h, 24h, 7 Tage
- **Verteilung**: Prozentuale Aufteilung
- **Trends**: Häufigste Stimmung

### Interpretation
- **Verwirrt 😕**: Erklärung nötig
- **Nachdenklich 🤔**: Gutes Engagement
- **Aha! 💡**: Verständnis erreicht
- **Wow! 🤩**: Begeisterung

**Best Practice:** Reagiere auf viele "Verwirrt"-Reaktionen mit Pause oder Wiederholung!

---

## Kontrollen

### Broadcast Message
1. Gib Nachricht ein
2. Wähle Typ: Info, Warning, Error
3. Klicke **"Send Broadcast"**
4. Alle Teilnehmer sehen die Nachricht

**Beispiele:**
- "Pause in 5 Minuten"
- "Bitte Modul 2 öffnen"
- "Technische Probleme - bitte warten"

### Module freischalten
1. Wähle Modul aus Dropdown
2. Klicke **"Unlock for All"**
3. Alle Teilnehmer erhalten Zugriff

### Secret Codes generieren
1. Wähle Modul
2. Gib Beschreibung ein
3. Klicke **"Generate Code"**
4. Teile Code mit Teilnehmern

**Verwendung:** Easter Eggs, Bonusinhalte, Gamification

### Emergency Controls
- **Pause System**: Stoppt alle Aktivitäten
- **Resume System**: Setzt fort
- **Export Data**: Speichert alle Daten

---

## Best Practices

### Vor der Schulung
1. ✅ Teste Admin-Login
2. ✅ Prüfe Module-Inhalte
3. ✅ Öffne Projector Mode
4. ✅ Zeige QR-Code für Teilnehmer

### Während der Schulung
1. 👀 Beobachte Live-Moods
2. 📊 Nutze Analytics für Pacing
3. 💬 Reagiere auf "Pause"-Anfragen
4. 🎯 Schalte Module schrittweise frei

### Nach der Schulung
1. 📥 Exportiere Daten
2. 📊 Analysiere Engagement
3. 📝 Notiere Verbesserungen
4. 🔄 Aktualisiere Module

### Troubleshooting

**Teilnehmer kann nicht joinen:**
- Prüfe Netzwerk-Verbindung
- Stelle sicher, Server läuft
- Checke Firewall-Einstellungen

**Moods werden nicht angezeigt:**
- Aktualisiere Dashboard (auto alle 10s)
- Prüfe WebSocket-Verbindung
- Checke Browser-Konsole

**Design-Änderungen nicht sichtbar:**
- Hard-Refresh: `Ctrl + Shift + R`
- Lösche Browser-Cache
- Prüfe localStorage

---

## Tastenkombinationen

- `F11`: Vollbild
- `Ctrl + Shift + R`: Hard Refresh
- `Esc`: Schließe Modals

---

## Support

**Technische Probleme:**
1. Prüfe Server-Logs
2. Checke Browser-Konsole (F12)
3. Restart Server: `npm run dev`

**Fragen?**
- Siehe: `API_DOCUMENTATION.md`
- Siehe: `README.md`

---

**Viel Erfolg mit deiner Schulung! 🚀**
