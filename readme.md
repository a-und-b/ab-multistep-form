# a&b Multistep Form

A lightweight JavaScript library for creating interactive multi-step forms with progress tracking, validation, smooth transitions, and enhanced accessibility. Since it's intended for use in Webflow, it requires jQuery and utilizes data attributes for flexible implementation.


## Table of Contents
- [Features](#features)
- [Usage](#usage)
- [Configuration Options](#configuration-options)
- [Accessibility](#accessibility)
- [State Management](#state-management)
- [Error Handling](#error-handling)
- [Auto-Advancing Steps](#auto-advancing-steps)
- [Development](#development)
- [Build](#build)
- [Deployment](#deployment)
- [Example](#example)
- [Dependencies](#dependencies)
- [License](#license)


## Features

- Multi-step form navigation
- Progress bar visualization
- Step counter
- Form validation with error handling
- Loading state transitions
- Auto-advance capability for steps with radio buttons
- Smooth animations
- State management with form data persistence
- Accessibility enhancements (ARIA attributes, live regions)
- FTP deployment support
- Browser history management
- Debounced validation
- Error announcements for screen readers
- Customizable loading steps


## Usage

Include the `ab-multistep-form.min.js` script in your project and initialize the multi-step form with your desired configuration.

### HTML Structure

Ensure your HTML follows this basic structure:

```html
<form data-multistep-form="form">
    <div data-multistep-form="progress-bar"></div>
    <div data-multistep-form="step-counter"></div>
    <div data-multistep-form="step">
        <!-- Step 1 content -->
    </div>
    <div data-multistep-form="step">
        <!-- Step 2 content -->
    </div>
        <!-- More steps as needed -->
    <button type="button" data-multistep-form="prev">Previous</button>
    <button type="button" data-multistep-form="next">Next</button>
    <button type="submit" data-multistep-form="submit">Submit</button>
</form>
```


### JavaScript Initialization

Initialize the multi-step form with optional custom configurations:

```javascript
const multiStepForm = new WebflowMultistepForm({
    // Custom configurations (options are optional)
});
```
If you are using the default data attribute selectors, you can initialize the form without passing any options.

### Configuration Options

Below are the available configuration options with their default values:

| Option                         | Type     | Default                                     | Description                                                  |
|--------------------------------|----------|---------------------------------------------|--------------------------------------------------------------|
| `formSelector`                 | string   | `[data-multistep-form="form"]`              | Selector for the form element                                |
| `stepSelector`                 | string   | `[data-multistep-form="step"]`              | Selector for individual form steps                           |
| `progressBarSelector`          | string   | `[data-multistep-form="progress-bar"]`      | Selector for the progress bar                                |
| `stepCounterSelector`          | string   | `[data-multistep-form="step-counter"]`      | Selector for the step counter                                |
| **Buttons**                    |          |                                             |                                                              |
| `nextButtonSelector`           | string   | `[data-multistep-form="next"]`              | Selector for "Next" buttons                                  |
| `prevButtonSelector`           | string   | `[data-multistep-form="prev"]`              | Selector for "Previous" buttons                              |
| `submitButtonSelector`         | string   | `[data-multistep-form="submit"]`            | Selector for the "Submit" button                             |
| **Validation and Errors**      |          |                                             |                                                              |
| `formFieldErrorClass`          | string   | `[data-multistep-form="field-error"]`       | Selector for form field error messages                       |
| `fieldWrapperSelector`         | string   | `[data-multistep-form="field-wrapper"]`     | Selector for field wrapper elements                          |
| `inputErrorClass`              | string   | `error`                                     | Class added to inputs when there is a validation error       |
| **Auto-Advance**               |          |                                             |                                                              |
| `autoAdvanceStepClass`         | string   | `auto-advance-step`                         | Class added to steps that should auto-advance                |
| `autoAdvanceDelay`             | number   | `500`                                       | Delay before auto-advancing to the next step (ms)            |
| **Timing**                     |          |                                             |                                                              |
| `navigateStepsFadeOutTimeout`  | number   | `150`                                       | Duration of fade-out when navigating steps (ms)              |
| `navigateStepsFadeInTimeout`   | number   | `150`                                       | Duration of fade-in when navigating steps (ms)               |
| **Custom Classes**             |          |                                             |                                                              |
| `progressBarActiveClass`       | string   | `active`                                    | Class added to active progress bar elements                  |
| `stepActiveClass`              | string   | `active`                                    | Class added to the active step                               |
| **Text Content**               |          |                                             |                                                              |
| `stepCounterTemplate`          | string   | `Step {current} of {total}`                 | Template for the step counter text                           |
| **Loading Step Configuration** |          |                                             |                                                              |
| `loadingStepClass`             | string   | `loading-step`                              | Class added to steps that represent a loading state          |
| `loadingDelay`                 | number   | `2000`                                      | Delay for loading steps before advancing (ms)                |
| `loadingTemplate`              | string   | `<div class="loading-spinner">Loading...</div>` | HTML template for loading steps      

### Example Configuration

```javascript
const multiStepForm = new WebflowMultistepForm({
    // Custom form selector
    formSelector: '#my-multistep-form',

    // Custom step counter text
    stepCounterTemplate: 'Page {current} of {total}',

    // Longer fade transitions
    navigateStepsFadeOutTimeout: 300,
    navigateStepsFadeInTimeout: 300,

    // Custom loading configuration
    loadingDelay: 1500,
    loadingTemplate: `
        <div class="custom-loader">
            <div class="spinner"></div>
            <p>Processing...</p>
        </div>
    `,

    // Custom validation classes
    inputErrorClass: 'has-error',
    formFieldErrorClass: '.field-error',
    
    // Auto-advance configuration
    autoAdvanceDelay: 750
});
```

### Accessibility

The script includes several accessibility enhancements:

- **ARIA Attributes:** Automatically sets ARIA attributes for dynamic content.
- **Live Regions:** Uses `aria-live` regions to announce step changes and validation errors to assistive technologies.
- **Focus Management:** Ensures the correct elements are focused when navigating steps.

### State Management

Form data and the current step are saved to `localStorage`, allowing users to resume the form where they left off, even after closing the browser or refreshing the page.

### Error Handling

## Error Handling

The library includes built-in error handling:

- Form-wide errors are displayed at the top of the form.
- Field-specific errors are shown next to the relevant form fields.
- Errors are announced to screen readers using ARIA live regions.
- Console errors are logged for debugging purposes.

You can customize error messages and styling by modifying the relevant CSS classes and error message templates in the configuration options.
### Auto-Advancing Steps

Steps containing only radio buttons will auto-advance when a selection is made. To enable this, ensure the step contains only radio inputs.

## Development

1. Clone the repository:
   ```bash
   git clone https://github.com/a-und-b/ab-multistep-form.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## Build

To build the project and generate the `ab-multistep-form.min.js` file:

```bash
npm run build
```

This will use Webpack to compile and minify the JavaScript files into a single script located in the `dist` directory.

## Deployment

To deploy the built files to your FTP server, set up a `.env` file in the project root with your FTP credentials:


```env
FTP_USER=your_ftp_username
FTP_PASSWORD=your_ftp_password
FTP_HOST=your_ftp_host
FTP_PORT=21
FTP_REMOTE_ROOT=/path/on/ftp/server
```

Then run:

```bash
npm run deploy
```

This will upload the contents of the `dist` directory to your FTP server.

## Example

Refer to the `example.html` file for a complete implementation of the multi-step form, including styling and structure.

## Dependencies

- **jQuery 3.6.0+**: Required for DOM manipulation and event handling.
- **Webpack** (development): For bundling the script.
- **FTP Deploy** (development): For deploying files to an FTP server.
- **Dotenv** (development): For managing environment variables.

## License

This project is licensed under the MIT License.

---

Feel free to contribute to this project by submitting pull requests or opening issues.
