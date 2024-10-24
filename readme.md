# a&b Multistep Form
A lightweight JavaScript library for creating interactive multi-step forms in Webflow with progress tracking, validation, and smooth transitions.


## Features

- Multi-step form navigation
- Progress bar visualization
- Step counter
- Form validation
- Loading state transitions
- Auto-advance capability
- Smooth animations
- FTP deployment support

## To Do:
- Use data attributes instead of classes for more flexibility

## Usage

Initialize the multi-step form with your desired configuration:

```javascript
const contactForm = new WebflowMultistepForm({
   formSelector: '#wf-form-Contact-Form',
   stepSelector: '.contact-form_step',
   progressBarSelector: '.form_progress-bar',
   nextButtonSelector: '.form_button-next',
   prevButtonSelector: '.form_button-prev',
   stepCounterSelector: '.step-counter',
   stepCounterTemplate: 'Step {current} of {total}',
   autoAdvanceDelay: 500,
   loadingStepClass: 'loading-step',
   loadingDelay: 1000,
   navigateStepsFadeOutTimeout: 500,
   navigateStepsFadeInTimeout: 500
});
```
## Configuration Options


| Option | Type | Description |
|--------|------|-------------|
| formSelector | string | CSS selector for the form element |
| stepSelector | string | CSS selector for individual form steps |
| progressBarSelector | string | CSS selector for the progress bar |
| nextButtonSelector | string | CSS selector for next buttons |
| prevButtonSelector | string | CSS selector for previous buttons |
| stepCounterSelector | string | CSS selector for step counter |
| stepCounterTemplate | string | Template for step counter text |
| autoAdvanceDelay | number | Delay for auto-advancing steps (ms) |
| loadingStepClass | string | Class name for loading state |
| loadingDelay | number | Delay for loading transitions (ms) |
| navigateStepsFadeOutTimeout | number | Fade out animation duration (ms) |
| navigateStepsFadeInTimeout | number | Fade in animation duration (ms) |

## Development

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

## Build

To build the project and generate the `webflow-helpers.min.js` file:

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

See the example.html file for a complete implementation of the multi-step form, including styling and structure.

## Dependencies

- jQuery 3.6.0+
- webpack (dev)
- ftp-deploy (dev)
- dotenv (dev)

## License

This project is licensed under the MIT License.

---

Feel free to contribute to this project by submitting pull requests or opening issues.