// ============================================
// CONFIGURATION
// ============================================
const CLIENT_ID = "251083837138-q5aoftvrr9veu0tgbec67dcp21mc23cg.apps.googleusercontent.com";

// Google Calendar API endpoint
const CALENDAR_API_BASE = "https://www.googleapis.com/calendar/v3";

// Token Client instance (initialized in window.onload)
let tokenClient;

// Store access token in memory (not localStorage for security)
let accessToken = null;

// ============================================
// DOM ELEMENTS
// ============================================
const authSection = document.getElementById("auth-section");
const mainSection = document.getElementById("main-section");
const signoutButton = document.getElementById("signout-button");
const loading = document.getElementById("loading");
const errorMessage = document.getElementById("error-message");
const eventsList = document.getElementById("events-list");

// ============================================
// INITIALIZATION
// ============================================
/**
 * Initialize Token Client when page loads
 * This pattern uses initTokenClient directly (popup-based OAuth flow)
 */
window.onload = () => {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: "https://www.googleapis.com/auth/calendar",
        callback: (response) => {
            console.log("LOGIN SUCCESS", response);
            
            if (response.error) {
                console.error("Token error:", response.error);
                showError("Failed to get access token: " + response.error);
                return;
            }

            // Store access token
            accessToken = response.access_token;

            // Hide auth section, show main section
            authSection.classList.add("hidden");
            mainSection.classList.remove("hidden");

            // Update current date display
            updateCurrentDate();

            // Fetch calendar events with the access token
            fetchCalendarEvents(response.access_token);
        }
    });
};

// ============================================
// SIGN IN FUNCTION
// ============================================
/**
 * Triggers the OAuth popup flow
 * Called when user clicks the sign-in button
 */
function signIn() {
    if (!tokenClient) {
        console.error("Token Client not initialized");
        showError("Authentication not ready. Please refresh the page.");
        return;
    }
    tokenClient.requestAccessToken();
}

// ============================================
// FETCH CALENDAR EVENTS
// ============================================
/**
 * Fetches upcoming events from the user's primary calendar
 * Uses Google Calendar API v3
 * @param {string} token - OAuth access token
 */
async function fetchCalendarEvents(token) {
    if (!token) {
        showError("No access token available. Please sign in again.");
        return;
    }

    // Show loading state
    loading.classList.remove("hidden");
    errorMessage.classList.add("hidden");
    eventsList.innerHTML = "";

    try {
        // Get current time in RFC3339 format
        const now = new Date().toISOString();

        // Build API request URL
        // Parameters:
        // - timeMin: Only get events from now onwards
        // - maxResults: Limit to 10 events
        // - singleEvents: Expand recurring events
        // - orderBy: Sort by start time
        const url = new URL(`${CALENDAR_API_BASE}/calendars/primary/events`);
        url.searchParams.append("timeMin", now);
        url.searchParams.append("maxResults", "10");
        url.searchParams.append("singleEvents", "true");
        url.searchParams.append("orderBy", "startTime");

        // Make API request
        const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        // Check if request was successful
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API Error: ${response.status} ${response.statusText}`);
        }

        // Parse response
        const data = await response.json();
        const events = data.items || [];

        // Hide loading state
        loading.classList.add("hidden");

        // Render events
        if (events.length === 0) {
            renderEmptyState();
        } else {
            renderEvents(events);
        }

    } catch (error) {
        console.error("Error fetching calendar events:", error);
        loading.classList.add("hidden");
        showError(`Failed to fetch events: ${error.message}`);
    }
}

// ============================================
// RENDER EVENTS
// ============================================
/**
 * Renders the list of calendar events grouped by time period
 * @param {Array} events - Array of event objects from Calendar API
 */
function renderEvents(events) {
    eventsList.innerHTML = "";

    if (events.length === 0) {
        renderEmptyState();
        return;
    }

    // Group events by time period
    const grouped = groupEventsByTime(events);

    // Render each group
    if (grouped.today.length > 0) {
        renderEventGroup("Today", grouped.today, "today");
    }
    if (grouped.thisWeek.length > 0) {
        renderEventGroup("This Week", grouped.thisWeek, "this-week");
    }
    if (grouped.upcoming.length > 0) {
        renderEventGroup("Upcoming", grouped.upcoming, "upcoming");
    }
}

/**
 * Groups events into Today, This Week, and Upcoming
 * @param {Array} events - Array of event objects
 * @returns {Object} Grouped events object
 */
function groupEventsByTime(events) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (7 - today.getDay())); // End of this week (Sunday)

    const grouped = {
        today: [],
        thisWeek: [],
        upcoming: []
    };

    events.forEach(event => {
        const eventDate = new Date(event.start.dateTime || event.start.date);
        const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());

        if (eventDateOnly.getTime() === today.getTime()) {
            grouped.today.push(event);
        } else if (eventDateOnly <= endOfWeek) {
            grouped.thisWeek.push(event);
        } else {
            grouped.upcoming.push(event);
        }
    });

    return grouped;
}

/**
 * Renders a group of events with a header
 * @param {string} title - Group title
 * @param {Array} events - Array of events in this group
 * @param {string} groupClass - CSS class for the group
 */
function renderEventGroup(title, events, groupClass) {
    const groupDiv = document.createElement("div");
    groupDiv.className = `event-group ${groupClass}`;

    // Group header
    const header = document.createElement("div");
    header.className = "group-header";
    
    const titleEl = document.createElement("h2");
    titleEl.className = "group-title";
    titleEl.textContent = title;
    
    const countEl = document.createElement("span");
    countEl.className = "group-count";
    countEl.textContent = events.length;
    
    header.appendChild(titleEl);
    header.appendChild(countEl);
    groupDiv.appendChild(header);

    // Events list
    const eventsListEl = document.createElement("div");
    eventsListEl.className = "events-list";

    events.forEach((event, index) => {
        const eventCard = createEventCard(event, groupClass);
        eventCard.style.animationDelay = `${index * 0.05}s`;
        eventsListEl.appendChild(eventCard);
    });

    groupDiv.appendChild(eventsListEl);
    eventsList.appendChild(groupDiv);
}

// ============================================
// EVENT TYPE DETECTION
// ============================================
/**
 * Detects event type from event title/keywords
 * @param {Object} event - Event object from Calendar API
 * @returns {string} Event type class name
 */
function detectEventType(event) {
    const title = (event.summary || "").toLowerCase();
    
    // Birthday keywords
    const birthdayKeywords = ['birthday', 'bday', 'birth', 'turns', 'years old'];
    if (birthdayKeywords.some(keyword => title.includes(keyword))) {
        return 'event-birthday';
    }
    
    // Meeting keywords
    const meetingKeywords = ['meeting', 'call', 'conference', 'standup', 'sync', 'discussion', 'review'];
    if (meetingKeywords.some(keyword => title.includes(keyword))) {
        return 'event-meeting';
    }
    
    // Reminder keywords
    const reminderKeywords = ['reminder', 'remind', 'todo', 'task', 'check', 'follow up', 'follow-up'];
    if (reminderKeywords.some(keyword => title.includes(keyword))) {
        return 'event-reminder';
    }
    
    // Default
    return '';
}

// ============================================
// CREATE EVENT CARD
// ============================================
/**
 * Creates a DOM element for a single event
 * @param {Object} event - Event object from Calendar API
 * @param {string} groupClass - CSS class for the group (today, this-week, upcoming)
 * @returns {HTMLElement} Event card element
 */
function createEventCard(event, groupClass) {
    const card = document.createElement("div");
    
    // Detect event type and combine with group class
    const eventType = detectEventType(event);
    const cardClasses = ['event-card', groupClass, eventType].filter(Boolean).join(' ');
    card.className = cardClasses;

    // Event title
    const title = document.createElement("div");
    title.className = "event-title";
    title.textContent = event.summary || "(No Title)";

    // Event details container
    const details = document.createElement("div");
    details.className = "event-details";

    // Date
    const dateElement = document.createElement("div");
    dateElement.className = "event-date";
    dateElement.textContent = formatEventDate(event.start);

    // Time
    const timeElement = document.createElement("div");
    timeElement.className = "event-time";
    timeElement.textContent = formatEventTime(event.start, event.end);

    // Assemble card
    details.appendChild(dateElement);
    details.appendChild(timeElement);
    card.appendChild(title);
    card.appendChild(details);

    return card;
}

// ============================================
// CURRENT DATE DISPLAY
// ============================================
/**
 * Updates the current date display in the header
 */
function updateCurrentDate() {
    const dateElement = document.getElementById("current-date");
    if (!dateElement) return;

    const now = new Date();
    const options = { 
        weekday: "long", 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
    };
    dateElement.textContent = now.toLocaleDateString("en-US", options);
}

// ============================================
// DATE/TIME FORMATTING HELPERS
// ============================================
/**
 * Formats the event date for display with smart relative dates
 * @param {Object} start - Event start object (has dateTime or date property)
 * @returns {string} Formatted date string
 */
function formatEventDate(start) {
    if (!start) return "Date TBD";

    const dateStr = start.dateTime || start.date;
    const eventDate = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Reset time for date comparison
    const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());

    // Check if it's today
    if (eventDateOnly.getTime() === todayOnly.getTime()) {
        return "Today";
    }

    // Check if it's tomorrow
    if (eventDateOnly.getTime() === tomorrowOnly.getTime()) {
        return "Tomorrow";
    }

    // Check if it's within the next 7 days
    const daysDiff = Math.floor((eventDateOnly - todayOnly) / (1000 * 60 * 60 * 24));
    if (daysDiff > 0 && daysDiff <= 7) {
        const options = { weekday: "long" };
        return eventDate.toLocaleDateString("en-US", options);
    }

    // For dates further out, show full date
    const options = { 
        weekday: "long", 
        month: "long", 
        day: "numeric",
        year: eventDate.getFullYear() !== today.getFullYear() ? "numeric" : undefined
    };
    return eventDate.toLocaleDateString("en-US", options);
}

/**
 * Formats the event time for display
 * @param {Object} start - Event start object
 * @param {Object} end - Event end object
 * @returns {string} Formatted time string
 */
function formatEventTime(start, end) {
    if (!start) return "Time TBD";

    // Check if it's an all-day event (has 'date' instead of 'dateTime')
    if (start.date && !start.dateTime) {
        return "All Day";
    }

    const startDate = new Date(start.dateTime);
    const endDate = end ? new Date(end.dateTime) : null;

    // Format start time
    const startTime = startDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });

    // Format end time if available
    if (endDate) {
        const endTime = endDate.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        });
        return `${startTime} - ${endTime}`;
    }

    return startTime;
}

// ============================================
// EMPTY STATE
// ============================================
/**
 * Renders empty state when no events are found
 */
function renderEmptyState() {
    eventsList.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">📅</div>
            <p>No upcoming events found in your calendar.</p>
        </div>
    `;
}

// ============================================
// ERROR HANDLING
// ============================================
/**
 * Displays an error message to the user
 * @param {string} message - Error message to display
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove("hidden");
}

// ============================================
// SIGN OUT
// ============================================
/**
 * Handles user sign out
 * Revokes the access token and resets the UI
 */
signoutButton.addEventListener("click", async function() {
    if (!accessToken) {
        // Already signed out
        resetUI();
        return;
    }

    try {
        // Revoke the access token
        await revokeToken(accessToken);
    } catch (error) {
        console.error("Error revoking token:", error);
        // Continue with sign out even if revocation fails
    }

    // Clear access token
    accessToken = null;

    // Reset UI
    resetUI();
});

/**
 * Revokes the OAuth access token
 * @param {string} token - Access token to revoke
 */
async function revokeToken(token) {
    try {
        const response = await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });

        if (!response.ok) {
            throw new Error("Failed to revoke token");
        }
    } catch (error) {
        console.error("Token revocation error:", error);
        throw error;
    }
}

/**
 * Resets the UI to the initial signed-out state
 */
function resetUI() {
    // Clear events
    eventsList.innerHTML = "";
    
    // Hide main section, show auth section
    mainSection.classList.add("hidden");
    authSection.classList.remove("hidden");
    
    // Hide loading and error messages
    loading.classList.add("hidden");
    errorMessage.classList.add("hidden");
}

// ============================================
// DARK MODE
// ============================================
/**
 * Dark mode toggle with system preference detection
 * Respects user's system preference and allows manual override
 * Toggle button is floating outside the container for global access
 */
function initializeDarkMode() {
    const themeToggle = document.getElementById("theme-toggle");
    
    if (!themeToggle) return;
    
    // Check system preference on load
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const savedTheme = localStorage.getItem("theme");

    // Apply theme based on saved preference or system preference
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
        document.body.classList.add("dark");
        themeToggle.textContent = "☀️";
    } else {
        themeToggle.textContent = "🌙";
    }

    // Toggle dark mode on button click
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        const isDark = document.body.classList.contains("dark");
        themeToggle.textContent = isDark ? "☀️" : "🌙";
        localStorage.setItem("theme", isDark ? "dark" : "light");
    });

    // Listen for system preference changes
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
        // Only auto-switch if user hasn't manually set a preference
        if (!localStorage.getItem("theme")) {
            if (e.matches) {
                document.body.classList.add("dark");
                themeToggle.textContent = "☀️";
            } else {
                document.body.classList.remove("dark");
                themeToggle.textContent = "🌙";
            }
        }
    });
}

// Initialize dark mode when page loads
initializeDarkMode();

// ============================================
// CREATE EVENT
// ============================================
/**
 * Create new calendar event functionality
 * Opens modal, collects event details, and creates event via API
 */
let modal, addBtn, saveBtn, cancelBtn, eventTitleInput, eventDateInput, eventTimeInput;

// Initialize event creation elements
function initializeEventCreation() {
    modal = document.getElementById("event-modal");
    addBtn = document.getElementById("add-event-btn");
    saveBtn = document.getElementById("save-event");
    cancelBtn = document.getElementById("cancel-event");
    eventTitleInput = document.getElementById("event-title");
    eventDateInput = document.getElementById("event-date");
    eventTimeInput = document.getElementById("event-time");

    if (!modal || !addBtn || !saveBtn || !cancelBtn) {
        console.warn("Event creation elements not found");
        return;
    }

    // Open modal when "New Event" button is clicked
    addBtn.addEventListener("click", () => {
        if (!accessToken) {
            showError("Please sign in to create events.");
            return;
        }
        
        // Set default date to today
        const today = new Date().toISOString().split("T")[0];
        eventDateInput.value = today;
        eventTitleInput.value = "";
        eventTimeInput.value = "";
        
        // Show modal and disable body scroll
        modal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
        
        // Focus on title input
        setTimeout(() => eventTitleInput.focus(), 100);
    });

    // Close modal function
    function closeModal() {
        modal.classList.add("hidden");
        document.body.style.overflow = ""; // Re-enable scroll
        // Clear form
        eventTitleInput.value = "";
        eventDateInput.value = "";
        eventTimeInput.value = "";
    }

    // Close modal when cancel is clicked
    cancelBtn.addEventListener("click", closeModal);

    // Close modal when clicking outside
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close modal on Escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !modal.classList.contains("hidden")) {
            closeModal();
        }
    });

    // Save event when save button is clicked
    saveBtn.addEventListener("click", async () => {
        const title = eventTitleInput.value.trim();
        const date = eventDateInput.value;
        const time = eventTimeInput.value;

        if (!title || !date) {
            showError("Title and date are required");
            return;
        }

        if (!accessToken) {
            showError("Please sign in to create events.");
            closeModal();
            return;
        }

        // Disable save button during request
        saveBtn.disabled = true;
        saveBtn.textContent = "Saving...";

        try {
            // Build start datetime with proper timezone
            let startData, endData;
            
            if (time) {
                // Timed event - use dateTime with timezone
                const startDateTime = new Date(`${date}T${time}:00`);
                const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hour later
                
                startData = { dateTime: startDateTime.toISOString() };
                endData = { dateTime: endDateTime.toISOString() };
            } else {
                // All-day event - use date only
                startData = { date: date };
                endData = { date: date };
            }

            // Create event via API
            const response = await fetch(`${CALENDAR_API_BASE}/calendars/primary/events`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    summary: title,
                    start: startData,
                    end: endData
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `Failed to create event: ${response.status}`);
            }

            const createdEvent = await response.json();
            console.log("Event created successfully:", createdEvent);

            // Close modal
            closeModal();

            // Show success feedback
            showSuccessMessage("Event created successfully!");

            // Refresh events list
            fetchCalendarEvents(accessToken);
        } catch (error) {
            console.error("Error creating event:", error);
            showError(`Failed to create event: ${error.message}`);
        } finally {
            // Re-enable save button
            saveBtn.disabled = false;
            saveBtn.textContent = "Save";
        }
    });
}

// Initialize event creation when DOM is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeEventCreation);
} else {
    initializeEventCreation();
}

// ============================================
// SUCCESS MESSAGE
// ============================================
/**
 * Shows a temporary success message
 */
function showSuccessMessage(message) {
    const successDiv = document.createElement("div");
    successDiv.className = "success-message";
    successDiv.textContent = message;
    document.body.appendChild(successDiv);

    // Trigger animation
    setTimeout(() => successDiv.classList.add("show"), 10);

    // Remove after 3 seconds
    setTimeout(() => {
        successDiv.classList.remove("show");
        setTimeout(() => successDiv.remove(), 300);
    }, 3000);
}

