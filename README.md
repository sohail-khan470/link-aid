# LinkAid :fire:

**AI-Powered Emergency Coordination Platform**  
_Streamlining accidents, towing, and insurance workflows with real-time AI assistance._

---

## :rocket: Features

### **Role-Based Assistance**

- **Civilians**: Report accidents, request roadside help, or summon nearby aid.
- **Insurers**: Manage claims, assign adjusters, and communicate via `claims/`.
- **Responders**: File emergency reports with AI summaries (`emergency_reports/`).
- **Tow Operators**: Accept jobs with real-time GPS tracking (`tow_operators/`).

### **AI Automation**

- Auto-categorize claims (`aiSuggestion`).
- Rephrase distress messages (`aiMessage` in `/civilian_requests`).
- Prioritize tow jobs (`priorityScore`).

### **Real-Time Coordination**

- GeoPoint-based matching for tow operators.
- Push notifications for nearby civilians (`acceptedBy` array).

---

## :wrench: Tech Stack

| Component            | Technology                |
| -------------------- | ------------------------- |
| Mobile               | Flutter (iOS/Android)     |
| Backend              | Firebase (Auth/Firestore) |
| AI                   | OpenAI + Custom Logic     |
| Web                  | ReactJS/vite+TailwindCSS  |
| TypeScript + Zustand |

---
