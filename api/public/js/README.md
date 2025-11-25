# Frontend JavaScript Utilities

## utils.js - Common Utility Functions

This file provides type-safe helper functions available globally on all pages.

### Type Safety Functions

#### `ensureString(value, defaultValue = '')`
Ensures a value is a string. Returns the value if it's already a string, converts it if not, or returns defaultValue if null/undefined.

```javascript
const text = ensureString(data.message);  // Safe even if data.message is undefined
```

#### `ensureArray(value, defaultValue = [])`
Ensures a value is an array.

```javascript
const items = ensureArray(response.data);  // Safe even if response.data is not an array
```

### HTML & Display Functions

#### `escapeHtml(text)`
Safely escapes HTML to prevent XSS attacks.

```javascript
element.innerHTML = escapeHtml(userInput);
```

#### `showLoading(element, message)`
Shows loading state in an element.

```javascript
showLoading(resultDiv, 'Generating...');
```

#### `showError(element, message)`
Shows error state in an element.

```javascript
showError(resultDiv, 'Failed to load data');
```

#### `showSuccess(element, message)`
Shows success state in an element.

```javascript
showSuccess(resultDiv, 'Data saved successfully');
```

### Data Access Functions

#### `safeGet(obj, path, defaultValue)`
Safely get nested object properties without errors.

```javascript
const name = safeGet(response, 'data.user.name', 'Unknown');
// Safe even if response.data or response.data.user is undefined
```

### Clipboard Functions

#### `copyToClipboard(text, feedbackElement)`
Copy text to clipboard with automatic fallback and visual feedback.

```javascript
await copyToClipboard(message, buttonElement);
// Automatically shows "Copied!" feedback
```

#### `showCopyFeedback(element, success)`
Show visual feedback for copy operation (called automatically by copyToClipboard).

### Utility Functions

#### `debounce(func, wait = 300)`
Debounce function calls to prevent excessive executions.

```javascript
const debouncedSearch = debounce(performSearch, 500);
searchInput.addEventListener('input', debouncedSearch);
```

#### `formatDate(date, options)`
Format dates consistently.

```javascript
const formatted = formatDate(new Date(), { month: 'short', day: 'numeric' });
```

## Usage Best Practices

1. **Always use `ensureString()` before calling string methods:**
   ```javascript
   // Bad
   const text = data.message.replace(/<[^>]*>/g, '');  // Error if data.message is undefined

   // Good
   const text = ensureString(data.message).replace(/<[^>]*>/g, '');
   ```

2. **Use `safeGet()` for nested properties:**
   ```javascript
   // Bad
   const value = response.data.user.name;  // Error if any level is undefined

   // Good
   const value = safeGet(response, 'data.user.name', 'N/A');
   ```

3. **Always escape user input before displaying:**
   ```javascript
   // Bad
   element.innerHTML = userInput;  // XSS vulnerability

   // Good
   element.innerHTML = escapeHtml(userInput);
   ```

4. **Use built-in copy function instead of custom implementations:**
   ```javascript
   // Bad
   navigator.clipboard.writeText(text).then(...)  // No fallback, no feedback

   // Good
   copyToClipboard(text, buttonElement);  // Has fallback, automatic feedback
   ```

## Files Using These Utilities

All EJS pages can now use these utilities without needing to define them inline:
- `/views/pages/tools/commit.ejs`
- `/views/pages/utilities/lorem.ejs`
- `/views/pages/data/domains.ejs`
- `/views/pages/data/blogs.ejs`
- And all other pages...

## Adding New Utilities

To add a new utility function:

1. Add it to `utils.js`
2. Document it here
3. Export it at the bottom of the file
4. Test it works across different pages
