class WebflowMultistepForm {
    constructor(options = {}) {
        console.log('WebflowMultistepForm script loaded');

        // Default selectors and configuration using data attributes
        this.options = {
            // Form elements
            formSelector: '[data-multistep-form="form"]',
            stepSelector: '[data-multistep-form="step"]',
            progressBarSelector: '[data-multistep-form="progress-bar"]',
            stepCounterSelector: '[data-multistep-form="step-counter"]',

            // Buttons
            nextButtonSelector: '[data-multistep-form="next"]',
            prevButtonSelector: '[data-multistep-form="prev"]',
            submitButtonSelector: '[data-multistep-form="submit"]',

            // Validation and errors
            formFieldErrorClass: '[data-multistep-form="field-error"]',
            fieldWrapperSelector: '[data-multistep-form="field-wrapper"]',
            inputErrorClass: 'error',

            // Auto-advance
            autoAdvanceStepClass: 'auto-advance-step',

            // Timing
            navigateStepsFadeOutTimeout: 150,
            navigateStepsFadeInTimeout: 150,
            autoAdvanceDelay: 500,

            // Custom classes for dynamic elements
            progressBarActiveClass: 'active',
            stepActiveClass: 'active',

            // Text content
            stepCounterTemplate: 'Step {current} of {total}',

            // Loading step configuration
            loadingStepClass: 'loading-step',
            loadingDelay: 2000,
            loadingTemplate: '<div class="loading-spinner">Loading...</div>',

            ...options
        };

        // Initialize currentStepIndex
        this.currentStepIndex = 0;

        try {
            // Core elements - now using configured selectors
            this.form = $(this.options.formSelector);
            if (this.form.length === 0) throw new Error(`Form not found: ${this.options.formSelector}`);
            console.log('Form found:', this.form);

            this.steps = this.form.find(this.options.stepSelector);
            if (this.steps.length === 0) throw new Error(`No steps found: ${this.options.stepSelector}`);
            console.log('Number of form steps:', this.steps.length);

            this.progressBar = this.form.find(this.options.progressBarSelector);
            console.log('Progress bar found:', this.progressBar.length > 0);

            this.stepCounter = this.form.find(this.options.stepCounterSelector);
            console.log('Step counter found:', this.stepCounter.length > 0);

            // Initialize components
            this.initForm();
            this.initEvents();
            this.initAccessibility();
            this.setupStateManagement();

            // Create live region for announcements
            this.liveRegion = $('<div>', {
                'aria-live': 'polite',
                'class': 'visually-hidden',
                'role': 'status'
            }).appendTo(this.form);

            // Restore form state if available
            this.restoreState();

            console.log('WebflowMultistepForm initialization complete');
        } catch (error) {
            console.error('Error initializing form:', error);
            this.handleError(error);
        }
    }

    initForm() {
        console.log('Initializing form');
        try {
            this.form.prop('novalidate', true);
            console.log('Form set to novalidate');
            
            // Hide all steps except first using JavaScript
            this.steps.each((index, step) => {
                const $step = $(step);
                if (index === 0) {
                    $step.css('display', 'block');
                    console.log('First step displayed');
                } else {
                    $step.css('display', 'none');
                    console.log(`Step ${index + 1} hidden`);
                }
            });

            this.updateDisplay();
            console.log('Display updated');

            // Initialize auto-advance steps
            let autoAdvanceStepsCount = 0;
            this.steps.each((index, step) => {
                const $step = $(step);
                const hasOnlyRadios = this.isRadioOnlyStep($step);
                if (hasOnlyRadios) {
                    $step.addClass(this.options.autoAdvanceStepClass);
                    autoAdvanceStepsCount++;
                    const nextButton = $step.find(this.options.nextButtonSelector);
                    if (!nextButton.is('[type="submit"]')) {
                        nextButton.hide();
                        console.log(`Next button hidden for auto-advance step ${index + 1}`);
                    }
                }
            });
            console.log('Auto-advance steps initialized:', autoAdvanceStepsCount);
        } catch (error) {
            console.error('Error in initForm:', error);
            this.handleError(error);
        }
    }

    setupStateManagement() {
        // Handle browser navigation
        window.addEventListener('popstate', (event) => {
            if (event.state && typeof event.state.step === 'number') {
                this.navigateToStep(event.state.step, true);
            }
        });

        // Handle beforeunload
        window.addEventListener('beforeunload', () => {
            this.saveState();
        });

        // Auto-save on form changes
        this.form.on('input change', debounce(() => {
            this.saveState();
        }, 500));
    }

    navigateToStep(stepIndex, skipPushState = false) {
        try {
            if (stepIndex < 0 || stepIndex >= this.steps.length) return;

            const direction = stepIndex > this.currentStepIndex ? 1 : -1;
            if (direction > 0 && !this.validateCurrentStep()) return;

            const currentStep = this.steps.eq(this.currentStepIndex);
            const targetStep = this.steps.eq(stepIndex);

            // Use jQuery's fadeOut/fadeIn with display block/none
            currentStep.fadeOut(this.options.navigateStepsFadeOutTimeout, () => {
                currentStep.css('display', 'none');
                targetStep.css('display', 'block').hide().fadeIn(this.options.navigateStepsFadeInTimeout);
                
                this.currentStepIndex = stepIndex;
                this.updateDisplay();
                this.announceStepChange();
                this.manageFocus(targetStep);

                if (!skipPushState) {
                    history.pushState({ step: stepIndex }, '', `#step-${stepIndex + 1}`);
                }
            });
        } catch (error) {
            console.error('Error in navigateToStep:', error);
            this.handleError(error);
        }
    }

    initEvents() {
        try {
            // Navigation buttons
            this.form.on('click', `${this.options.nextButtonSelector}, ${this.options.prevButtonSelector}`, (e) => {
                e.preventDefault();
                const button = $(e.currentTarget);
                const direction = button.is(this.options.nextButtonSelector) ? 1 : -1;
                this.navigateSteps(direction);
            });

            // Auto-advance radio handling with corrected selector
            this.form.on('change', `.${this.options.autoAdvanceStepClass} input[type="radio"]`, (e) => {
                const radio = $(e.target);
                if (radio.is(':checked')) {
                    setTimeout(() => {
                        this.navigateSteps(1);
                    }, this.options.autoAdvanceDelay);
                }
            });

            // Debounced validation
            const debouncedValidation = debounce(() => {
                this.validateCurrentStep();
            }, 300);

            this.form.on('input change', 'input, select', () => {
                debouncedValidation();
            });

            // Form submission
            this.form.on('submit', (e) => {
                e.preventDefault();
                if (this.validateCurrentStep()) {
                    try {
                        // Clear saved state on successful submission
                        localStorage.removeItem('form-state');
                        this.form.off('submit').submit();
                    } catch (error) {
                        console.error('Error submitting form:', error);
                        this.handleError(error);
                    }
                }
            });
        } catch (error) {
            console.error('Error in initEvents:', error);
            this.handleError(error);
        }
    }

    navigateSteps(direction, skipLoadingCheck = false) {
        try {
            let nextIndex = this.currentStepIndex + direction;

            if (nextIndex < 0 || nextIndex >= this.steps.length) return;

            if (direction < 0) {
                while (nextIndex >= 0 && this.isLoadingStep(this.steps.eq(nextIndex))) {
                    nextIndex += direction;
                }
                if (nextIndex < 0) return;
            }

            if (direction > 0) {
                this.hasAttemptedNext = true;
                if (!this.validateCurrentStep()) return;

                if (!skipLoadingCheck) {
                    const nextStep = this.steps.eq(nextIndex);
                    if (this.isLoadingStep(nextStep)) {
                        return this.handleLoadingStep(nextIndex);
                    }
                }
            }

            this.navigateToStep(nextIndex);
        } catch (error) {
            console.error('Error in navigateSteps:', error);
            this.handleError(error);
        }
    }

    initAccessibility() {
        try {
            // Set up ARIA attributes for steps
            this.steps.attr({
                'role': 'tabpanel',
                'aria-hidden': 'true'
            });

            // Set up initial step
            this.steps.eq(this.currentStepIndex).attr({
                'aria-hidden': 'false',
                'tabindex': '0'
            });

            // Add labels to form controls
            this.steps.find('input, select, textarea').each((_, element) => {
                const $element = $(element);
                const id = $element.attr('id') || `form-control-${Math.random().toString(36).substr(2, 9)}`;
                $element.attr({
                    'id': id,
                    'aria-invalid': 'false',
                    'aria-required': $element.prop('required')
                });
            });

            // Set up progress bar
            this.progressBar.attr({
                'role': 'progressbar',
                'aria-valuemin': '0',
                'aria-valuemax': '100',
                'aria-valuenow': '0'
            });
        } catch (error) {
            console.error('Error in initAccessibility:', error);
            this.handleError(error);
        }
    }

    manageFocus(targetStep) {
        try {
            // Find the first focusable element
            const focusable = targetStep.find('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])').first();

            if (focusable.length) {
                focusable.focus();
            } else {
                targetStep.attr('tabindex', '-1').focus();
            }
        } catch (error) {
            console.error('Error in manageFocus:', error);
            this.handleError(error);
        }
    }

    announceStepChange() {
        try {
            const currentStep = this.steps.eq(this.currentStepIndex);
            const stepHeading = currentStep.find('h2').text() || `Step ${this.currentStepIndex + 1}`;
            const announcement = `${stepHeading}. ${this.getRealStepIndex() + 1} of ${this.getRealStepCount()} steps.`;

            this.liveRegion.text(announcement);
        } catch (error) {
            console.error('Error in announceStepChange:', error);
            this.handleError(error);
        }
    }

    saveState() {
        try {
            const formData = new FormData(this.form[0]);
            const state = {
                data: Object.fromEntries(formData),
                step: this.currentStepIndex,
                timestamp: new Date().getTime()
            };
            
            localStorage.setItem('form-state', JSON.stringify(state));
        } catch (error) {
            console.error('Error saving form state:', error);
            this.handleError(error);
        }
    }

    restoreState() {
        try {
            const savedState = localStorage.getItem('form-state');
            if (savedState) {
                const state = JSON.parse(savedState);
                
                // Check if state is still valid (24 hour expiry)
                const now = new Date().getTime();
                if (now - state.timestamp > 24 * 60 * 60 * 1000) {
                    localStorage.removeItem('form-state');
                    return;
                }

                // Restore form data
                Object.entries(state.data).forEach(([name, value]) => {
                    const field = this.form.find(`[name="${name}"]`);
                    if (field.length) {
                        if (field.is(':radio')) {
                            field.filter(`[value="${value}"]`).prop('checked', true);
                        } else if (field.is(':checkbox')) {
                            field.prop('checked', value === 'on');
                        } else {
                            field.val(value);
                        }
                    }
                });

                // Restore step
                if (typeof state.step === 'number') {
                    this.navigateToStep(state.step, true);
                }
            }
        } catch (error) {
            console.error('Error restoring form state:', error);
            this.handleError(error);
        }
    }

    handleError(error) {
        // Show error message to user
        const errorMessage = $('<div>', {
            class: 'form-error-message',
            role: 'alert',
            'aria-live': 'assertive',
            text: 'An error occurred. Please try again or refresh the page.'
        });

        this.form.prepend(errorMessage);
        errorMessage.fadeIn();

        // Log to console for debugging
        console.error('Form error:', error);
    }

    handleLoadingStep(nextIndex) {
        try {
            const nextStep = this.steps.eq(nextIndex);
            const currentStep = this.steps.eq(this.currentStepIndex);
            
            return new Promise((resolve, reject) => {
                currentStep.fadeOut(this.options.navigateStepsFadeOutTimeout, () => {
                    nextStep.fadeIn(this.options.navigateStepsFadeInTimeout);
                    this.currentStepIndex = nextIndex;
                    this.updateDisplay();
                    
                    setTimeout(() => {
                        try {
                            const followingIndex = nextIndex + 1;
                            if (followingIndex < this.steps.length) {
                                this.navigateToStep(followingIndex);
                                resolve(true);
                            }
                        } catch (error) {
                            reject(error);
                        }
                    }, this.options.loadingDelay);
                });
            }).catch(error => {
                console.error('Error in loading step:', error);
                this.handleError(error);
            });
        } catch (error) {
            console.error('Error in handleLoadingStep:', error);
            this.handleError(error);
            return false;
        }
    }

    validateCurrentStep() {
        try {
            const currentStep = this.steps.eq(this.currentStepIndex);
            let isValid = true;

            // Validate required fields
            currentStep.find('[required]').each((_, element) => {
                const field = $(element);
                
                if (field.attr('type') === 'radio') {
                    const groupName = field.attr('name');
                    const isChecked = currentStep.find(`input[name="${groupName}"]:checked`).length > 0;
                    if (!isChecked) {
                        if (this.hasAttemptedNext) {
                            this.showError(field);
                            this.announceError(field);
                        }
                        isValid = false;
                    } else {
                        this.hideError(field);
                    }
                } else {
                    const value = field.val();
                    if (!value || (field.attr('type') === 'checkbox' && !field.is(':checked'))) {
                        if (this.hasAttemptedNext) {
                            this.showError(field);
                            this.announceError(field);
                        }
                        isValid = false;
                    } else {
                        this.hideError(field);
                    }
                }
            });

            return isValid;
        } catch (error) {
            console.error('Error in validateCurrentStep:', error);
            this.handleError(error);
            return false;
        }
    }

    announceError(field) {
        const errorMessage = field.closest(this.options.fieldWrapperSelector)
            .find(this.options.formFieldErrorClass)
            .text();
        
        this.liveRegion.text(errorMessage);
    }

    showError(field) {
        try {
            const wrapper = field.closest(this.options.fieldWrapperSelector);
            if (!wrapper.length) throw new Error('Field wrapper not found');
            
            const errorElement = wrapper.find(this.options.formFieldErrorClass);
            if (!errorElement.length) throw new Error('Error element not found');
            
            errorElement.show();
            field.addClass(this.options.inputErrorClass)
                .attr('aria-invalid', 'true');
        } catch (error) {
            console.error('Error showing field error:', error);
            this.handleError(error);
        }
    }

    hideError(field) {
        try {
            const wrapper = field.closest(this.options.fieldWrapperSelector);
            if (!wrapper.length) throw new Error('Field wrapper not found');
            
            const errorElement = wrapper.find(this.options.formFieldErrorClass);
            if (!errorElement.length) throw new Error('Error element not found');
            
            errorElement.hide();
            field.removeClass(this.options.inputErrorClass)
                .attr('aria-invalid', 'false');
        } catch (error) {
            console.error('Error hiding field error:', error);
            this.handleError(error);
        }
    }

    updateDisplay() {
        try {
            // Get real step counts (excluding loading steps)
            const realStepCount = this.getRealStepCount();
            const realCurrentIndex = this.getRealStepIndex();
            
            // Update progress bar
            const progress = ((realCurrentIndex + 1) / realStepCount) * 100;
            this.progressBar.css('width', `${progress}%`)
                .attr('aria-valuenow', progress);
            
            // Update step counter
            const counterText = this.options.stepCounterTemplate
                .replace('{current}', realCurrentIndex + 1)
                .replace('{total}', realStepCount);
            this.stepCounter.text(counterText);
            
            // Update button visibility and ARIA states
            const isFirstStep = this.currentStepIndex === 0;
            const isLastStep = this.currentStepIndex === this.steps.length - 1;
            const currentStep = this.steps.eq(this.currentStepIndex);
            
            // Update ARIA states for all steps
            this.steps.attr('aria-hidden', 'true').attr('tabindex', '-1');
            currentStep.attr('aria-hidden', 'false').attr('tabindex', '0');
            
            // Previous button
            const prevButton = currentStep.find(this.options.prevButtonSelector);
            prevButton.toggle(!isFirstStep)
                .attr('aria-hidden', isFirstStep);
            
            // Next/Submit button
            const nextButton = currentStep.find(`${this.options.nextButtonSelector}, ${this.options.submitButtonSelector}`);
            nextButton.each((_, button) => {
                const $button = $(button);
                const isSubmitButton = $button.is(this.options.submitButtonSelector);
                
                if (isSubmitButton) {
                    $button.toggle(isLastStep)
                        .attr('aria-hidden', !isLastStep);
                } else {
                    $button.toggle(!isLastStep && !this.isLoadingStep(currentStep))
                        .attr('aria-hidden', isLastStep || this.isLoadingStep(currentStep));
                }
            });
        } catch (error) {
            console.error('Error in updateDisplay:', error);
            this.handleError(error);
        }
    }

    isRadioOnlyStep($step) {
        try {
            const inputs = $step.find('input:not([type="hidden"])');
            const radios = $step.find('input[type="radio"]');
            return inputs.length > 0 && inputs.length === radios.length;
        } catch (error) {
            console.error('Error in isRadioOnlyStep:', error);
            this.handleError(error);
            return false;
        }
    }

    getRealStepCount() {
        try {
            let count = 0;
            this.steps.each((_, step) => {
                if (!this.isLoadingStep($(step))) {
                    count++;
                }
            });
            return count;
        } catch (error) {
            console.error('Error in getRealStepCount:', error);
            this.handleError(error);
            return 0;
        }
    }

    getRealStepIndex() {
        try {
            let realIndex = 0;
            for (let i = 0; i < this.currentStepIndex; i++) {
                if (!this.isLoadingStep(this.steps.eq(i))) {
                    realIndex++;
                }
            }
            return realIndex;
        } catch (error) {
            console.error('Error in getRealStepIndex:', error);
            this.handleError(error);
            return 0;
        }
    }

    isLoadingStep($step) {
        try {
            return $step.hasClass(this.options.loadingStepClass);
        } catch (error) {
            console.error('Error in isLoadingStep:', error);
            this.handleError(error);
            return false;
        }
    }
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

console.log('WebflowMultistepForm class defined');

// Export the class as default
export default WebflowMultistepForm;
