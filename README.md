# VibeMe - Motivational Quote Generator

VibeMe is a beautiful motivational quote generator with dynamic themes and inspiring messages. It's designed to work both online (hosted on a server) and offline (run directly from your computer).

## How It Works

-   **Online Mode:** When hosted on a web server, the application fetches the latest quotes from the `data/quotes.json` file.
-   **Offline Mode:** When you open the `index.html` file directly in your browser, it loads the quotes from the `js/quotes.js` file.

## How to Update Quotes

To ensure the quotes are the same in both online and offline mode, there is a single source of truth and an automated script to keep them in sync.

**Step 1: Edit the Master Quote List**

The main list of quotes is located at:
`data/quotes.json`

This is the **only** file you need to edit when you want to add, remove, or change quotes.

**Step 2: Synchronize the Offline Quote File**

After you have saved your changes to `data/quotes.json`, you need to run a script to update the offline file (`js/quotes.js`).

To do this, open your terminal, navigate to the project's root directory, and run the following command:

```bash
npm run sync-quotes
```

This command will automatically read your changes from `data/quotes.json` and update `js/quotes.js` to match. This ensures that your application will show the complete and correct set of quotes, whether you are viewing it online or offline.

## Performance Autotune & Privacy

The performance autotune feature benchmarks rendering performance to select the most appropriate visual profile. During this process the app captures a coarse "device hint" that includes the platform string and, when available, the WebGL renderer name (`WEBGL_debug_renderer_info`). This metadata is stored locally in `localStorage['vibeme.perf']` to help troubleshoot rendering issues. No data is transmitted off-device, but because the renderer string can contribute to browser fingerprinting, the collection is documented here for transparency. You can clear the stored information from the Settings panel or by calling `localStorage.removeItem('vibeme.perf')` in the browser console.
