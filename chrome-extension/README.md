# Court Data Collector Chrome Extension

## Installation and Setup

1. Open Chrome/Chromium browser
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right corner)
4. Click "Load unpacked"
5. Select the `chrome-extension` directory

## Debugging

### Common Issues and Solutions

1. **"sidebarInjected is not defined" error**
   - This was fixed by properly declaring global variables with `let` instead of using undeclared variables
   - Fixed in `content.js`

2. **"window.CourtDataCollectorSidebar is undefined"**
   - This happens when the sidebar script isn't loaded properly
   - Fixed by improving script loading sequence and error handling
   - Added better error logging and retry mechanisms

3. **Icon issues**
   - Updated manifest.json to use .png icons instead of .svg
   - Ensured all icon files are properly referenced

### Debugging Tools

1. **Test Page**: Open `test-sidebar.html` in your browser to test sidebar functionality
2. **Debug Script**: Run `debug-extension.js` in the browser console for detailed diagnostics
3. **Extension Console**: 
   - Open the page where you want to use the extension
   - Right-click and select "Inspect" or press F12
   - Go to the Console tab
   - Look for log messages from the extension

### Debug Functions

After the extension is loaded, you can use these functions in the browser console:

```javascript
// Check extension status
window.extensionDebug.getStatus()

// Reload sidebar
window.extensionDebug.reloadSidebar()

// Check if required elements exist
window.extensionDebug.checkElements()

// Switch to a specific tab
window.extensionDebug.testTabSwitch('data-collection')
```

## File Structure

```
chrome-extension/
├── assets/
│   ├── icons/
│   │   ├── icon16.png
│   │   ├── icon32.png
│   │   ├── icon48.png
│   │   └── icon128.png
│   ├── scripts/
│   │   ├── data-collector.js
│   │   ├── logger.js
│   │   └── sidebar.js
│   └── styles/
│       ├── content.css
│       └── sidebar.css
├── background.js
├── content.js
├── manifest.json
├── sidebar.html
├── test-sidebar.html
├── debug-extension.js
└── README.md
```

## Development Notes

1. **Global Variables**: Always declare global variables with `let`, `const`, or `var`
2. **Script Loading**: Scripts are loaded in sequence: logger.js → sidebar.js
3. **Error Handling**: All functions include proper error handling
4. **Messaging**: Extension uses Chrome's messaging API for communication between components

## Troubleshooting

1. If the sidebar doesn't appear:
   - Check the browser console for errors
   - Verify the extension is properly loaded
   - Try reloading the page

2. If buttons don't work:
   - Check if event listeners are properly attached
   - Verify that `CourtDataCollectorSidebar.init()` was called

3. If data isn't being collected:
   - Check network requests in Developer Tools
   - Verify API key and server URL settings