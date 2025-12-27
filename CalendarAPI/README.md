# Google Calendar Web App

A modern, premium productivity dashboard that displays your Google Calendar events. Built with pure HTML, CSS, and vanilla JavaScript - no frameworks or build tools required.

![Calendar App Preview](https://via.placeholder.com/800x400?text=Google+Calendar+App)

## Features

- 🔐 **Google OAuth 2.0 Authentication** - Secure sign-in with Google
- 📅 **Calendar Event Display** - View your upcoming calendar events
- ➕ **Create New Events** - Add events directly to your Google Calendar
- 🌙 **Dark Mode** - System-aware dark mode with manual toggle
- 🎨 **Modern UI/UX** - Premium design inspired by Google Calendar and Notion
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🎯 **Smart Event Grouping** - Events organized by Today, This Week, and Upcoming
- 🏷️ **Event Type Detection** - Automatic color coding for birthdays, meetings, and reminders
- ⚡ **Fast & Lightweight** - No dependencies, pure vanilla JavaScript

## Prerequisites

- A modern web browser (Chrome, Firefox, Edge, Safari)
- Python 3.x OR Node.js (for running a local server)
- A Google Cloud Project with OAuth credentials

## Installation

**No installation required!** This is a static web app with no dependencies.

Simply:
1. Extract the ZIP folder
2. Open the folder in VS Code (or any code editor)
3. Configure your Google OAuth credentials (see below)

## Quick Start

### Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Calendar API**:
   - Navigate to "APIs & Services" → "Library"
   - Search for "Google Calendar API"
   - Click "Enable"
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Add authorized JavaScript origins:
     - `http://localhost:3000`
   - Add authorized redirect URIs (optional for popup flow):
     - `http://localhost:3000`
   - Click "Create"
5. Copy your **Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)

### Step 2: Configure Credentials

1. Open `script.js` in VS Code
2. Find this line (around line 4):
   ```javascript
   const CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID";
   ```
3. Replace `YOUR_GOOGLE_CLIENT_ID` with your actual Client ID:
   ```javascript
   const CLIENT_ID = "251083837138-q5aoftvrr9veu0tgbec67dcp21mc23cg.apps.googleusercontent.com";
   ```

### Step 3: Start a Local Server

**Important:** You must run this app on a local server (not by opening `index.html` directly) because:
- Google OAuth requires `http://localhost:3000`
- Browsers block CORS requests from `file://` protocol

#### Option A: Using Python 3 (Recommended - Easiest)

1. Open Terminal/Command Prompt in VS Code:
   - Press `Ctrl + ~` (Windows/Linux) or `Cmd + ~` (Mac)
   - Or go to: Terminal → New Terminal

2. Navigate to the project folder (if not already there):
   ```bash
   cd path/to/CalendarAPI
   ```

3. Start the server:
   ```bash
   # Python 3
   python -m http.server 3000
   
   # Or if python3 is required
   python3 -m http.server 3000
   ```

4. You should see:
   ```
   Serving HTTP on 0.0.0.0 port 3000 (http://0.0.0.0:3000/) ...
   ```

#### Option B: Using Node.js

1. Install `http-server` globally (one-time setup):
   ```bash
   npm install -g http-server
   ```

2. Start the server:
   ```bash
   http-server -p 3000
   ```

#### Option C: Using VS Code Live Server Extension

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"
4. **Note:** You may need to configure Live Server to use port 3000 in settings

### Step 4: Open in Browser

1. Open your web browser
2. Navigate to: `http://localhost:3000`
3. You should see the login screen
4. Click "Sign in with Google"
5. **Important:** Authorize **full calendar access** (read and write permissions)
   - The app requires write access to create new events
   - You'll see a consent screen asking for calendar permissions
6. Your events will load automatically!

## Usage Guide

### Viewing Events

After signing in, your calendar events are automatically displayed:
- **Today** - Events happening today (green accent)
- **This Week** - Events in the next 7 days (orange accent)
- **Upcoming** - Future events beyond this week (blue accent)

Events are automatically color-coded:
- 🎂 **Birthdays** - Pink/Purple accent
- 💼 **Meetings** - Blue accent
- ⏰ **Reminders** - Orange accent

### Creating New Events

1. Click the **"➕ New Event"** button (below the header)
2. Fill in the event details:
   - **Event Title** (required) - Name of your event
   - **Date** (required) - Select the date
   - **Time** (optional) - Leave empty for all-day events
3. Click **"Save"** to create the event
4. The event list will automatically refresh to show your new event
5. A success notification will appear briefly

**Tips:**
- Leave time empty for all-day events
- Timed events default to 1 hour duration
- Events are created in your primary Google Calendar

### Dark Mode

Toggle between light and dark themes:
- Click the **🌙/☀️** button in the top-right corner (floating button)
- Your preference is automatically saved
- The app respects your system's dark mode preference on first visit
- Works on both login and calendar screens

**Note:** Dark mode preference persists across sessions using localStorage.

### Keyboard Shortcuts

- **Escape** - Close the create event modal
- **Tab** - Navigate between form fields in the modal

## Quick Reference

| Feature | How to Use |
|---------|------------|
| **Sign In** | Click "Sign in with Google" button |
| **Sign Out** | Click "Sign Out" button in header |
| **View Events** | Events load automatically after sign-in |
| **Create Event** | Click "➕ New Event" → Fill form → Click "Save" |
| **Toggle Dark Mode** | Click 🌙/☀️ button (top-right corner) |
| **Close Modal** | Click Cancel, click outside, or press Escape |

## Project Structure

```
CalendarAPI/
├── index.html          # Main HTML file
├── style.css           # All styles and design
├── script.js           # JavaScript logic and OAuth
└── README.md           # This file
```

## File Descriptions

- **index.html** - Main HTML structure with authentication, event display, dark mode toggle, and create event modal
- **style.css** - Complete styling with modern design, dark mode support, animations, and responsive layout
- **script.js** - OAuth flow, API calls, event rendering, dark mode logic, event creation, and UI logic

## Troubleshooting

### "Failed to load Google Identity Services"
- **Solution:** Check your internet connection and refresh the page
- Make sure the Google Identity Services script loads properly

### "The given origin is not allowed"
- **Solution:** Ensure `http://localhost:3000` is added to Authorized JavaScript origins in Google Cloud Console
- Wait 1-2 minutes after adding for changes to propagate

### "Failed to fetch events"
- **Solution:** 
  - Check that Google Calendar API is enabled in your Google Cloud project
  - Verify your OAuth credentials are correct
  - Make sure you granted **full calendar access** (read and write) when signing in
  - The app requires write permissions to create events

### "Failed to create event" or "New Event button doesn't work"
- **Solution:**
  - Ensure you granted **full calendar access** during OAuth consent
  - Check that the OAuth scope includes `https://www.googleapis.com/auth/calendar` (not just readonly)
  - Sign out and sign back in to refresh permissions
  - Check browser console (F12) for specific error messages

### Dark mode toggle not visible
- **Solution:**
  - The toggle button is a floating button in the top-right corner
  - Make sure your browser window is wide enough
  - On mobile, it appears as a smaller button in the corner
  - Refresh the page if it doesn't appear

### Port 3000 already in use
- **Solution:** Use a different port:
  ```bash
  # Python
  python -m http.server 3001
  
  # Then access at http://localhost:3001
  ```
  - **Important:** Update your Google Cloud Console authorized origins to match!

### Events not showing
- **Solution:**
  - Check browser console (F12) for errors
  - Verify you have events in your Google Calendar
  - Make sure you're signed in with the correct Google account

## Browser Compatibility

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Edge
- ✅ Safari
- ❌ Internet Explorer (not supported)

## Security Notes

- Access tokens are stored **in memory only** (not localStorage)
- Tokens are automatically revoked on sign out
- Dark mode preference is stored in localStorage (non-sensitive)
- No sensitive data is persisted
- All API calls use HTTPS
- OAuth scope requires full calendar access for event creation

## Customization

### Changing Colors

Edit CSS variables in `style.css` (lines 8-50):
```css
:root {
    --primary-color: #6366f1;
    --secondary-color: #8b5cf6;
    /* ... more colors ... */
}
```

### Event Type Keywords

Modify event detection keywords in `script.js` (function `detectEventType`):
```javascript
const birthdayKeywords = ['birthday', 'bday', 'birth'];
const meetingKeywords = ['meeting', 'call', 'conference'];
const reminderKeywords = ['reminder', 'todo', 'task'];
```

## Development

### Making Changes

1. Edit files in VS Code
2. Save changes (Ctrl+S / Cmd+S)
3. Refresh browser (Ctrl+R / Cmd+R)
4. Server auto-reloads (Python/Node) or use Live Server

### Testing

- Test OAuth flow on `localhost:3000`
- Test dark mode toggle (should work on login and calendar screens)
- Test creating new events (all-day and timed)
- Test responsive design by resizing browser window
- Test with different calendar event types
- Test modal closing (click outside, Escape key, Cancel button)

## License

This project is open source and available for personal and educational use.

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Verify your Google Cloud Console settings
3. Check browser console for error messages (F12)

## Credits

Built with:
- Google Identity Services (OAuth 2.0)
- Google Calendar API v3 (Read & Write)
- Inter font family
- Pure HTML, CSS, and JavaScript
- No frameworks or build tools required

---

**Enjoy your calendar dashboard! 📅✨**

