// script.js
document.addEventListener('DOMContentLoaded', () => {
    console.log('Travel Risk Platform script loaded.');

    // --- Mock Data ---
    let purchaseHistory = [ { id: 'ORD456', email: 'demo@user.com', country: 'Zones: G-10, A-2, R-0', dates: '2024-08-15 to 2024-08-27', totalPrice: '$75.50', status: 'Completed' } ];
    let claimsHistory = [ /* Could add mock claims here */ ];

    // --- Helper: Ensure btn-text and spinner spans exist (More Robust) ---
    function ensureBtnTextSpan(button) {
        // 1. Check if button exists
        if (!button) {
            // console.warn("ensureBtnTextSpan called with null button");
            return;
        }

        try {
            // 2. Check if spans already exist
            const hasBtnText = button.querySelector('.btn-text');
            const hasSpinner = button.querySelector('.loading-spinner');

            // If both exist, assume structure is okay
            if (hasBtnText && hasSpinner) {
                return;
            }

            // 3. Get existing text content safely
            let existingText = '';
            // Iterate through child nodes to find text, avoiding direct textContent wipe
            button.childNodes.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE) {
                    existingText += node.textContent.trim();
                }
            });

            // If we found text but no span, wrap it
            if (existingText && !hasBtnText) {
                 // Clear only text nodes before adding span
                 button.childNodes.forEach(node => {
                     if (node.nodeType === Node.TEXT_NODE) {
                         node.remove();
                     }
                 });
                const span = document.createElement('span');
                span.classList.add('btn-text');
                span.textContent = existingText;
                // Prepend the text span
                button.insertBefore(span, button.firstChild);
            } else if (!hasBtnText) {
                 // If no text and no span, create an empty one to be safe
                const span = document.createElement('span');
                span.classList.add('btn-text');
                button.insertBefore(span, button.firstChild);
            }


            // 4. Add spinner if missing
            if (!hasSpinner) {
                const spinnerSpan = document.createElement('span');
                spinnerSpan.classList.add('loading-spinner');
                spinnerSpan.style.display = 'none';
                button.appendChild(spinnerSpan);
            }
        } catch (error) {
            console.error("Error in ensureBtnTextSpan for button:", button, error);
            // Don't let this error stop other scripts
        }
    }


    // --- Helper: Show Status Message (Unchanged) ---
    function showStatusMessage(elementId, message, isSuccess = true, duration = 4000) {
        const statusElement = document.getElementById(elementId);
        if (!statusElement) { console.warn(`Status element #${elementId} not found.`); return; }
        statusElement.textContent = message;
        statusElement.className = 'status-message';
        statusElement.classList.add(isSuccess ? 'success' : 'error');
        statusElement.style.display = 'block';
        if (statusElement.timerId) { clearTimeout(statusElement.timerId); }
        statusElement.timerId = setTimeout(() => {
            statusElement.style.display = 'none'; statusElement.className = 'status-message'; statusElement.timerId = null;
        }, duration);
    }

    // --- Helper: Simulate Form Submission Visuals (Added checks) ---
    function simulateFormSubmitVisuals(event, formName, statusElementId, callback) {
        event.preventDefault();
        const form = event.target;
        if (!form) { console.error("simulateFormSubmitVisuals: Event target is not a form?", event); return; }

        // **Find button specifically within the submitted form**
        const submitButton = form.querySelector('button[type="submit"]');

        if (!submitButton) { console.warn(`${formName}: Could not find submit button inside the form.`); return; } // Stop if no button
        if (submitButton.disabled || submitButton.classList.contains('loading')) return; // Prevent double submit

        ensureBtnTextSpan(submitButton); // Ensure structure *before* querying sub-elements
        const spinner = submitButton.querySelector('.loading-spinner');
        const btnText = submitButton.querySelector('.btn-text');
        const statusElement = document.getElementById(statusElementId);

        if (!spinner || !btnText) { console.warn(`${formName}: Button structure incorrect (.loading-spinner or .btn-text missing).`); } // Warn if structure failed

        if (statusElement) { statusElement.style.display = 'none'; statusElement.className = 'status-message'; }

        submitButton.classList.add('loading');
        if(btnText) { btnText.style.visibility = 'hidden'; btnText.style.opacity = '0'; }
        if(spinner) spinner.style.display = 'inline-block';
        submitButton.disabled = true;
        console.log(`${formName} submitting (simulation)...`);

        // Rest of the timeout logic remains the same...
        setTimeout(() => {
            let success = true; let message = `${formName.replace(' Data','')} operation successful!`;
            try {
                if (typeof callback === 'function') {
                    const result = callback();
                    if (typeof result === 'object' && result !== null) { success = result.success !== undefined ? result.success : true; message = result.message || (success ? message : 'An error occurred.'); }
                    else if (result === false) { success = false; message = `Error during ${formName}.`; }
                }
                if (statusElementId) { showStatusMessage(statusElementId, message, success); } else if (!success) { alert(message); }
                if (success && form.id !== 'login-form') {
                     form.reset();
                     const fileInput = form.querySelector('input[type="file"]');
                     if (fileInput) { const changeEvent = new Event('change', { bubbles: true }); fileInput.dispatchEvent(changeEvent); }
                     if (form.id === 'travel-plan-form') { calculateMockPrice(); }
                }
            } catch (error) {
                console.error(`Error during ${formName} callback:`, error); success = false; message = 'An unexpected error occurred.';
                if (statusElementId) { showStatusMessage(statusElementId, message, false); } else { alert(message); }
            } finally {
                // Check button still exists before modifying
                 if (submitButton) {
                     submitButton.classList.remove('loading');
                     if(btnText) { btnText.style.visibility = 'visible'; btnText.style.opacity = '1'; }
                     if(spinner) spinner.style.display = 'none';
                     submitButton.disabled = false;
                 }
                 console.log(`${formName} simulation complete (Success: ${success}).`);
            }
        }, 1000 + Math.random() * 1000);
    }


    // --- Sidebar & Header Navigation Logic (Add try-catch) ---
    try {
        const allNavLinks = document.querySelectorAll('.sidebar-link, .header-link');
        const dashboardSections = document.querySelectorAll('.dashboard-section');
        const sidebar = document.querySelector('.sidebar');
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const body = document.body;
        const breadcrumbCurrentPage = document.getElementById('breadcrumb-current-page');

        function activateSection(targetId) {
            // ... (function content unchanged) ...
             let sectionFound = false; let activeLinkText = 'Dashboard';
             allNavLinks.forEach(link => link.classList.remove('active'));
             dashboardSections.forEach(section => { section.classList.remove('active', 'is-visible'); section.style.animationDelay = '0s'; });
             const activeLinks = document.querySelectorAll(`[data-target="${targetId}"]`);
             const activeSection = document.getElementById(targetId);
             if (activeSection) {
                 activeSection.classList.add('active'); const delay = activeSection.dataset.delay || '0s'; activeSection.style.animationDelay = delay;
                 setTimeout(() => { activeSection.classList.add('is-visible'); }, 10);
                 activeLinks.forEach(link => { link.classList.add('active'); if (link.classList.contains('sidebar-link')) { activeLinkText = link.textContent.trim(); } });
                 sectionFound = true;
             } else {
                 console.warn(`Target section #${targetId} not found. Falling back.`);
                 const firstSection = document.querySelector('.dashboard-section');
                 if (firstSection) { const firstTargetId = firstSection.id; activateSection(firstTargetId); return; }
                 else { console.error("No sections found to activate."); activeLinkText = 'Error'; }
             }
             if (breadcrumbCurrentPage) { breadcrumbCurrentPage.textContent = activeLinkText; }
             if (sidebar && sidebar.classList.contains('open')) { sidebar.classList.remove('open'); mobileMenuToggle.setAttribute('aria-expanded', 'false'); body.classList.remove('sidebar-open'); }
             document.querySelector('.content-area')?.scrollTo(0, 0);
        }

        allNavLinks.forEach(link => {
             if (link) { // Add null check
                link.addEventListener('click', (e) => {
                    const targetId = e.currentTarget.dataset.target;
                    if (targetId && (e.currentTarget.classList.contains('sidebar-link') || e.currentTarget.getAttribute('href')?.startsWith('#'))) { e.preventDefault(); activateSection(targetId); }
                });
            }
        });

        if (mobileMenuToggle && sidebar) {
            mobileMenuToggle.addEventListener('click', () => { const isOpen = sidebar.classList.toggle('open'); mobileMenuToggle.setAttribute('aria-expanded', isOpen); body.classList.toggle('sidebar-open', isOpen); });
            document.addEventListener('click', (e) => { if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && !mobileMenuToggle.contains(e.target)) { sidebar.classList.remove('open'); mobileMenuToggle.setAttribute('aria-expanded', 'false'); body.classList.remove('sidebar-open'); } });
        }

        let initialTarget = window.location.hash ? window.location.hash.substring(1) : 'map-section';
        const validInitialTarget = document.getElementById(initialTarget) ? initialTarget : 'map-section';
        if (validInitialTarget) { activateSection(validInitialTarget); }
        else { const firstAvailableSection = document.querySelector('.dashboard-section'); if(firstAvailableSection) { activateSection(firstAvailableSection.id); } }
    } catch (error) {
        console.error("Error during Navigation Logic setup:", error);
    }


    // --- Plan Customization Logic (Add try-catch wrapper) ---
    try {
        const startDateInput = document.getElementById('start-date');
        const endDateInput = document.getElementById('end-date');
        const totalDaysInput = document.getElementById('total-days');
        const daysAmberInput = document.getElementById('days-amber');
        const daysRedInput = document.getElementById('days-red');
        const daysGreenInput = document.getElementById('days-green');
        const medicalCoverageSelect = document.getElementById('medical-coverage');
        const accidentCoverageSelect = document.getElementById('accident-coverage');
        const transitCheckbox = document.getElementById('transit-coverage');
        const krCheckbox = document.getElementById('kr-coverage');
        const evacCheckbox = document.getElementById('evac-coverage');
        const priceDisplay = document.getElementById('estimated-price');
        const planForm = document.getElementById('travel-plan-form');
        const planFormInputs = [ startDateInput, endDateInput, daysAmberInput, daysRedInput, medicalCoverageSelect, accidentCoverageSelect, transitCheckbox, krCheckbox, evacCheckbox ];

        function calculateMockPrice() { /* ... function content unchanged ... */ }

        let listenerAttachedCount = 0;
        planFormInputs.forEach(input => {
            if (input) {
                const eventType = (input.type === 'date' || input.tagName === 'SELECT' || input.type === 'checkbox') ? 'change' : 'input';
                input.addEventListener(eventType, calculateMockPrice);
                listenerAttachedCount++;
            } else {
                console.warn("A plan customization input element was not found.");
            }
        });
        console.log(`Attached ${listenerAttachedCount} listeners for plan calculation.`);

        // Use the already determined validInitialTarget from navigation setup
        const currentActiveSectionId = document.querySelector('.dashboard-section.active')?.id;
        if (currentActiveSectionId === 'plan-section') {
            calculateMockPrice(); // Initial calculation if starting on plan section
        }
    } catch (error) {
        console.error("Error during Plan Customization Logic setup:", error);
    }


    // --- Login/Register Form Simulation (Add try-catch) ---
    try {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        if (loginForm) {
            const loginButton = loginForm.querySelector('button[type="submit"]');
            if(loginButton) ensureBtnTextSpan(loginButton); else console.warn("Login button not found in form");
            loginForm.addEventListener('submit', (event) => { simulateFormSubmitVisuals(event, 'Login', null, () => { console.log('Login attempt:', loginForm.querySelector('#login-email').value); alert('Login successful! (Simulated)'); return { success: true }; }); });
        }
        if (registerForm) {
            const regButton = registerForm.querySelector('button[type="submit"]');
             if(regButton) ensureBtnTextSpan(regButton); else console.warn("Register button not found in form");
            registerForm.addEventListener('submit', (event) => { simulateFormSubmitVisuals(event, 'Register', null, () => { console.log('Register attempt:', registerForm.querySelector('#reg-email').value); alert('Registration successful! Please check your email for verification (Simulated).'); return { success: true }; }); });
        }
    } catch (error) {
        console.error("Error during Login/Register Logic setup:", error);
    }

    // --- Admin Section Logic (Add try-catch wrappers) ---
    try {
        const updateRiskForm = document.getElementById('update-risk-form');
        const bulkUploadForm = document.getElementById('bulk-upload-form');
        const updatePricingForm = document.getElementById('update-pricing-form');
        const purchasesTableBody = document.querySelector('#purchases-table tbody');
        const fileInput = bulkUploadForm?.querySelector('#risk-file-upload');
        const fileNameSpan = bulkUploadForm?.querySelector('.file-name');

        function addPurchaseToTable(purchase) { /* ... unchanged ... */ }
        function renderInitialPurchases() { /* ... unchanged ... */ }
        function simulatePurchase(planDetails) { /* ... unchanged ... */ }

        const proceedButton = document.querySelector('#plan-section .cta-button');
        if (proceedButton) {
            ensureBtnTextSpan(proceedButton);
            proceedButton.addEventListener('click', (event) => { /* ... unchanged ... */ });
        }

        if (updateRiskForm) {
             const btn = updateRiskForm.querySelector('button[type="submit"]'); if(btn) ensureBtnTextSpan(btn);
             updateRiskForm.addEventListener('submit', (event) => { /* ... unchanged ... */ });
        }
        if (bulkUploadForm && fileInput && fileNameSpan) {
             const btn = bulkUploadForm.querySelector('button[type="submit"]'); if(btn) ensureBtnTextSpan(btn);
             fileInput.addEventListener('change', () => { /* ... unchanged ... */ });
             bulkUploadForm.addEventListener('submit', (event) => { /* ... unchanged ... */ });
        } else if (bulkUploadForm) { console.warn("File input or file name span not found for bulk upload form."); }
        if (updatePricingForm) {
             const btn = updatePricingForm.querySelector('button[type="submit"]'); if(btn) ensureBtnTextSpan(btn);
             updatePricingForm.addEventListener('submit', (event) => { /* ... unchanged ... */ });
        }

        // Initial Data Rendering for Admin
        if(purchasesTableBody) {
            renderInitialPurchases();
        } else {
            console.warn("Purchases table body not found for initial render.");
        }

    } catch(error) {
         console.error("Error during Admin Logic setup:", error);
    }


    // --- Fade-in Animation Trigger (Unchanged) ---
    try {
        const fadeInElements = document.querySelectorAll('.fade-in');
        // ... (rest of observer logic unchanged) ...
         const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
         const observerCallback = (entries, observer) => { entries.forEach(entry => { if (entry.isIntersecting) { const target = entry.target; const delay = target.dataset.delay || '0s'; target.style.animationDelay = delay; target.classList.add('is-visible'); observer.unobserve(target); } }); };
         const observer = new IntersectionObserver(observerCallback, observerOptions);
         fadeInElements.forEach(el => { if(el) { el.style.opacity = 0; observer.observe(el); } });
    } catch (error) {
        console.error("Error setting up fade-in animations:", error);
    }

    // --- Ensure all *other* buttons have spans initially (Run last, wrap in try-catch) ---
    try {
        console.log("Running final ensureBtnTextSpan on all .btn elements...");
        document.querySelectorAll('.btn').forEach(btn => {
             // Avoid re-processing buttons already handled within specific listeners if possible
             // This is a broad sweep, ensureBtnTextSpan should handle redundancy
             ensureBtnTextSpan(btn);
        });
    } catch (error) {
         console.error("Error during final ensureBtnTextSpan sweep:", error);
    }

    console.log('Travel Risk Platform script finished executing.');
}); // End DOMContentLoaded