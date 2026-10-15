# ZOEY — Clean & Minimal Invoice Creator Website

A modern, streamlined invoice generator built specifically for **ZOEY**, a web and software development agency.

---

## 🚀 Running Live on Localhost

The server is currently running at:
👉 **http://localhost:3000**

To launch or relaunch anytime:
1. Double-click [**`start.bat`**](file:///C:/Users/YUKESH/.gemini/antigravity/scratch/zoey-invoice-creator/start.bat) or open [**`index.html`**](file:///C:/Users/YUKESH/.gemini/antigravity/scratch/zoey-invoice-creator/index.html) in your browser.
2. Or in PowerShell:
   ```powershell
   cd C:\Users\YUKESH\.gemini\antigravity\scratch\zoey-invoice-creator
   python -m http.server 3000
   ```

---

## ✨ Features

1. **Fixed Company Profile for ZOEY**:
   - Company Name (**ZOEY**), Tagline (*Web & Software Development*), Email, and Phone number are pre-filled by default.
   - Bank details, office address, GST, and website fields have been removed as requested for a cleaner, minimal profile.
   - Click **"ZOEY Profile"** in the top bar anytime to update your info (saved in `localStorage`).

2. **Customer & Project Details**:
   - Enter Customer Name, Company, Email, Phone, and Project Title.

3. **Software & Web Service Line Items**:
   - Add custom items or choose from presets (*Full-Stack Web App*, *UI/UX Design*, *Backend API*, *Mobile App*, etc.).

4. **Advance Amount & Full Amount Calculations**:
   - **Full Project Amount** = direct sum of deliverables (no GST/tax or discount clutter).
   - **Advance Amount Paid** = entered by you, with a quick **"Set 50%"** button.
   - **Balance Due** = automatically calculated as `Full Amount - Advance Paid`.

5. **Instant Live A4 Invoice Sheet Preview**:
   - Professional agency-style A4 layout updating in real-time.

6. **One-Click Download & Print**:
   - Click **"Download PDF"** to export crisp, vector-accurate PDF files directly.
   - Click **"Print"** for direct paper printing.

7. **Invoice History**:
   - Save and reload previous client invoices from local browser storage.
