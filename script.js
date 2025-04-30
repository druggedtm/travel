// Correct script.js content (from previous response)
document.addEventListener('DOMContentLoaded', () => {
    console.log('Travel Risk Platform script loaded.');

    // --- Simulated Data ---
    let purchaseHistory = [ { id: 'ORD456', email: 'demo@user.com', country: 'Zones: G-10, A-2, R-0', dates: '2024-08-15 to 2024-08-27', totalPrice: '$75.50', status: 'Completed' } ];
    // THIS DATA IS USED TO POPULATE THE CLAIMS TABLE
    let claimsHistory = [
         { id: 'CLM-98765', date: '2024-07-15', type: 'Medical Expense', status: 'Pending Review' },
         { id: 'CLM-98701', date: '2024-05-02', type: 'Lost Baggage', status: 'Closed - Paid' }
     ];


    // --- Helper Functions ---
    function ensureBtnTextSpan(button) {
        if (!button) { return; }
        try {
            const hasBtnText = button.querySelector('.btn-text');
            const hasSpinner = button.querySelector('.loading-spinner');
            if (hasBtnText && hasSpinner) { return; } // Already has structure
            let existingText = '';
            button.childNodes.forEach(node => { if (node.nodeType === Node.TEXT_NODE) { existingText += node.textContent.trim(); } });
            if (existingText && !hasBtnText) {
                 button.childNodes.forEach(node => { if (node.nodeType === Node.TEXT_NODE) { node.remove(); } });
                const span = document.createElement('span'); span.classList.add('btn-text'); span.textContent = existingText;
                button.insertBefore(span, button.firstChild);
            } else if (!hasBtnText && button.textContent.trim()) {
                existingText = button.textContent.trim();
                button.textContent = '';
                const span = document.createElement('span'); span.classList.add('btn-text'); span.textContent = existingText;
                button.insertBefore(span, button.firstChild);
            } else if (!hasBtnText) {
                 const span = document.createElement('span'); span.classList.add('btn-text'); button.insertBefore(span, button.firstChild);
            }
            if (!hasSpinner) { const spinnerSpan = document.createElement('span'); spinnerSpan.classList.add('loading-spinner'); spinnerSpan.style.display = 'none'; button.appendChild(spinnerSpan); }
        } catch (error) { console.error("Error in ensureBtnTextSpan for button:", button, error); }
    }

    function showStatusMessage(elementId, message, isSuccess = true, duration = 4000) {
        const statusElement = document.getElementById(elementId);
        if (!statusElement) { console.warn(`Status element #${elementId} not found.`); return; }
        statusElement.textContent = message; statusElement.className = 'status-message'; statusElement.classList.add(isSuccess ? 'success' : 'error'); statusElement.style.display = 'block';
        if (statusElement.timerId) { clearTimeout(statusElement.timerId); }
        statusElement.timerId = setTimeout(() => { statusElement.style.display = 'none'; statusElement.className = 'status-message'; statusElement.timerId = null; }, duration);
    }

     function simulateFormSubmitVisuals(event, formName, statusElementId, callback) {
         event.preventDefault();
         const form = event.target; if (!form) { console.error("simulateFormSubmitVisuals: Event target is not a form?", event); return; }
         const submitButton = form.querySelector('button[type="submit"]');
         if (!submitButton) { console.warn(`${formName}: Could not find submit button inside the form.`); return; }
         if (submitButton.disabled || submitButton.classList.contains('loading')) return;
         ensureBtnTextSpan(submitButton);
         const spinner = submitButton.querySelector('.loading-spinner');
         const btnText = submitButton.querySelector('.btn-text');
         const statusElement = document.getElementById(statusElementId);
         if (!spinner || !btnText) { console.warn(`${formName}: Button structure incorrect (.loading-spinner or .btn-text missing).`); }
         if (statusElement) { statusElement.style.display = 'none'; statusElement.className = 'status-message'; }
         submitButton.classList.add('loading');
         if(btnText) { btnText.style.visibility = 'hidden'; btnText.style.opacity = '0'; }
         if(spinner) spinner.style.display = 'inline-block';
         submitButton.disabled = true;
         console.log(`${formName} submitting (simulation)...`);
         setTimeout(() => {
             let success = true;
             let message = `${formName.replace(' Data','')} operation successful!`;
             try {
                 if (typeof callback === 'function') {
                     const result = callback();
                     if (typeof result === 'object' && result !== null) {
                         success = result.success !== undefined ? result.success : true;
                         message = result.message || (success ? message : `Error during ${formName}.`);
                     } else if (result === false) {
                         success = false;
                         message = `Error during ${formName}.`;
                     }
                 }
                 if (statusElementId) { showStatusMessage(statusElementId, message, success); }
                 else if (!success) { alert(message); }
                 if (success && form.id !== 'login-form') {
                      form.reset();
                      const fileInput = form.querySelector('input[type="file"]');
                      if (fileInput) { const changeEvent = new Event('change', { bubbles: true }); fileInput.dispatchEvent(changeEvent); }
                 }
             } catch (error) {
                 console.error(`Error during ${formName} callback:`, error);
                 success = false;
                 message = 'An unexpected error occurred.';
                 if (statusElementId) { showStatusMessage(statusElementId, message, false); }
                 else { alert(message); }
             } finally {
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


    // --- Navigation Logic ---
    const allNavLinks = document.querySelectorAll('.sidebar-link, .header-link'); // Correct selector
    const dashboardSections = document.querySelectorAll('.dashboard-section');
    const sidebar = document.querySelector('.sidebar');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const body = document.body;
    const breadcrumbCurrentPage = document.getElementById('breadcrumb-current-page');
    const headerHeight = document.querySelector('.main-header')?.offsetHeight || 60;

    function activateSection(targetId) {
        let sectionFound = false;
        let activeLinkText = 'Dashboard';
        allNavLinks.forEach(link => link?.classList.remove('active'));
        dashboardSections.forEach(section => section?.classList.remove('active', 'is-visible'));
        document.getElementById('plan-section')?.classList.remove('subscription-active');
        const activeLinks = document.querySelectorAll(`[data-target="${targetId}"]`);
        const activeSection = document.getElementById(targetId);
        if (activeSection) {
            activeSection.classList.add('active');
            const delay = activeSection.dataset.delay || '0s';
            activeSection.style.animationDelay = delay;
            setTimeout(() => { activeSection.classList.add('is-visible'); }, 10);
            activeLinks.forEach(link => {
                if (link) {
                    link.classList.add('active');
                    if (link.classList.contains('sidebar-link')) { activeLinkText = link.textContent.trim(); }
                }
            });
             if (activeLinkText === 'Dashboard') {
                  const correspondingSidebarLink = document.querySelector(`.sidebar-link[data-target="${targetId}"]`);
                  if (correspondingSidebarLink) {
                      activeLinkText = correspondingSidebarLink.textContent.trim();
                       correspondingSidebarLink.classList.add('active');
                  } else if (activeSection.querySelector('h2')) {
                      activeLinkText = activeSection.querySelector('h2').textContent.replace(/^\d+\.\s*/, '');
                  }
             }
            sectionFound = true;
        } else {
             console.warn(`Target section #${targetId} not found. Falling back to map.`);
             const mapSection = document.getElementById('map-section');
             const mapLink = document.querySelector('.sidebar-link[data-target="map-section"]');
             if (mapSection && mapLink) { activateSection('map-section'); return; }
             else { console.error("Fallback map section or link not found."); activeLinkText = 'Error'; }
        }
        if (breadcrumbCurrentPage) { breadcrumbCurrentPage.textContent = activeLinkText; }
        if (sidebar && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            if(mobileMenuToggle) mobileMenuToggle.setAttribute('aria-expanded', 'false');
            body.classList.remove('sidebar-open');
        }
        document.querySelector('.content-area')?.scrollTo(0, 0);
    }

    allNavLinks.forEach(link => {
        if (link) {
            link.addEventListener('click', (e) => {
                const targetId = e.currentTarget.dataset.target;
                if (targetId && (e.currentTarget.classList.contains('sidebar-link') || e.currentTarget.classList.contains('header-link'))) {
                    e.preventDefault();
                    activateSection(targetId);
                }
            });
        }
    });

     // --- Mobile Menu Toggle ---
    if (mobileMenuToggle && sidebar) {
         mobileMenuToggle.addEventListener('click', () => {
             const isOpen = sidebar.classList.toggle('open');
             mobileMenuToggle.setAttribute('aria-expanded', isOpen);
             body.classList.toggle('sidebar-open', isOpen);
         });
         document.addEventListener('click', (e) => {
             if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                 sidebar.classList.remove('open');
                 mobileMenuToggle.setAttribute('aria-expanded', 'false');
                 body.classList.remove('sidebar-open');
             }
         });
     }

    // --- Initial Section Activation ---
     let initialTarget = window.location.hash ? window.location.hash.substring(1) : 'map-section';
     const validInitialTarget = document.getElementById(initialTarget) ? initialTarget : 'map-section';
     if (document.getElementById(validInitialTarget)) { activateSection(validInitialTarget); }
     else { const firstAvailableSection = document.querySelector('.dashboard-section'); if(firstAvailableSection) { activateSection(firstAvailableSection.id); } else { console.error("No dashboard sections found."); } }

    // --- Travel Risk Quote Form Logic ---
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const totalDaysInput = document.getElementById('total-days');
    const daysAmberInput = document.getElementById('days-amber');
    const daysRedInput = document.getElementById('days-red');
    const daysGreenInput = document.getElementById('days-green');
    const quoteAgeInput = document.getElementById('quote-age');
    const medicalCoverageSelect = document.getElementById('medical-coverage');
    const accidentCoverageSelect = document.getElementById('accident-coverage');
    const transitCheckbox = document.getElementById('transit-coverage');
    const krCheckbox = document.getElementById('kr-coverage');
    const evacCheckbox = document.getElementById('evac-coverage');
    const priceDisplay = document.getElementById('estimated-price');
    const planSection = document.getElementById('plan-section');
    const quoteForm = document.getElementById('travel-plan-form');
    const acceptQuoteButton = document.getElementById('accept-quote-btn');
    const subscriptionContainer = document.getElementById('subscription-details-container');
    const planFormInputs = [ startDateInput, endDateInput, daysAmberInput, daysRedInput, quoteAgeInput, medicalCoverageSelect, accidentCoverageSelect, transitCheckbox, krCheckbox, evacCheckbox ];

    function calculateMockPrice() { /* ... Same calculation logic as before ... */
        if (!startDateInput || !endDateInput || !totalDaysInput || !daysAmberInput || !daysRedInput || !daysGreenInput || !quoteAgeInput || !medicalCoverageSelect || !accidentCoverageSelect || !transitCheckbox || !priceDisplay || !krCheckbox || !evacCheckbox) {
             if (priceDisplay) priceDisplay.textContent = '$ ---'; return;
        }
        const dailyRateGreen = 2.50, dailyRateAmber = 5.00, dailyRateRed = 10.00;
        const medicalCoverageBaseCost = { 50000: 5, 100000: 10, 150000: 15, 200000: 20, 250000: 25 };
        const accidentCoverageBaseCost = { 50000: 3, 100000: 6, 150000: 9, 200000: 12, 250000: 15 };
        const transitCost = 30.00; const krAddonCost = 150.00; const evacAddonCost = 75.00;
        const ageFactor = 1.0; // Placeholder
        let totalDays = 0; const startDate = startDateInput.value ? new Date(startDateInput.value) : null; const endDate = endDateInput.value ? new Date(endDateInput.value) : null; endDateInput.style.borderColor = '';
        if (startDate && endDate) { if (endDate >= startDate) { totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1; } else { totalDays = 0; endDateInput.style.borderColor = 'red'; } }
        totalDaysInput.value = totalDays > 0 ? totalDays : 0;
        let daysAmber = parseInt(daysAmberInput.value) || 0; let daysRed = parseInt(daysRedInput.value) || 0; if (daysAmber < 0) { daysAmber = 0; daysAmberInput.value = 0; } if (daysRed < 0) { daysRed = 0; daysRedInput.value = 0; }
        let daysGreen = 0; daysAmberInput.style.borderColor = ''; daysRedInput.style.borderColor = '';
        if (totalDays > 0) { if ((daysAmber + daysRed) > totalDays) { daysAmberInput.style.borderColor = 'orange'; daysRedInput.style.borderColor = 'orange'; daysGreen = 0; } else { daysGreen = totalDays - daysAmber - daysRed; } }
        daysGreenInput.value = daysGreen >= 0 ? daysGreen : 0;
        const medicalCoverageLevel = parseInt(medicalCoverageSelect.value) || 0; const accidentCoverageLevel = parseInt(accidentCoverageSelect.value) || 0; const hasTransitCoverage = transitCheckbox.checked; const hasKrCoverage = krCheckbox.checked; const hasEvacCoverage = evacCheckbox.checked; const age = parseInt(quoteAgeInput.value) || 0;
        let basePrice = 0; if (totalDays > 0 && (daysAmber + daysRed) <= totalDays && age > 0) { const effectiveGreen = Math.max(0, daysGreen); basePrice = (effectiveGreen * dailyRateGreen) + (daysAmber * dailyRateAmber) + (daysRed * dailyRateRed); }
        const medicalCost = medicalCoverageBaseCost[medicalCoverageLevel] || 0; const accidentCost = accidentCoverageBaseCost[accidentCoverageLevel] || 0; const transitPrice = hasTransitCoverage ? transitCost : 0; const krCost = hasKrCoverage ? krAddonCost : 0; const evacCost = hasEvacCoverage ? evacAddonCost : 0; let finalPrice = 0;
        if (totalDays > 0 && (daysAmber + daysRed) <= totalDays && age > 0) { finalPrice = (basePrice + medicalCost + accidentCost) * ageFactor + transitPrice + krCost + evacCost; } else { finalPrice = 0; }
        if (finalPrice > 0) { priceDisplay.textContent = `$${finalPrice.toFixed(2)}`; }
        else if (totalDays === 0 && (startDateInput.value || endDateInput.value)) { priceDisplay.textContent = '$ ---'; }
        else if (totalDays > 0 && (daysAmber + daysRed) > totalDays) { priceDisplay.textContent = '$ ---'; }
        else if (totalDays > 0 && age <= 0) { priceDisplay.textContent = '$ ---'; }
        else { priceDisplay.textContent = '$0.00'; }
    }

    planFormInputs.forEach(input => { if (input) { const eventType = (input.type === 'date' || input.tagName === 'SELECT' || input.type === 'checkbox' || input.type === 'number') ? 'change' : 'input'; input.addEventListener(eventType, calculateMockPrice); } });
    if (document.querySelector('.dashboard-section.active')?.id === 'plan-section') { calculateMockPrice(); }

    // --- Event Listener for "Accept Quote & Proceed" ---
    if (acceptQuoteButton && subscriptionContainer && planSection) {
        ensureBtnTextSpan(acceptQuoteButton);
        acceptQuoteButton.addEventListener('click', () => {
            console.log('Accept Quote button clicked.'); const button = acceptQuoteButton;
            const isValid = startDateInput.value && endDateInput.value && parseFloat(totalDaysInput.value) > 0 && priceDisplay.textContent !== '$0.00' && priceDisplay.textContent !== '$ ---' && !endDateInput.style.borderColor && !daysAmberInput.style.borderColor && !daysRedInput.style.borderColor && parseInt(quoteAgeInput.value || 0) > 0;
            if (!isValid) { alert('Please ensure all quote details (Dates, Zone Days, Age) are entered correctly and result in a valid quote before proceeding.'); if (!quoteAgeInput.value || parseInt(quoteAgeInput.value) <= 0) { quoteAgeInput.style.borderColor = 'red'; } else { quoteAgeInput.style.borderColor = ''; } return; }
            const spinner = button.querySelector('.loading-spinner'); const btnText = button.querySelector('.btn-text'); button.classList.add('loading'); if(btnText) { btnText.style.visibility = 'hidden'; btnText.style.opacity = '0'; } if(spinner) spinner.style.display = 'inline-block'; button.disabled = true;
            setTimeout(() => {
                console.log('Showing subscription details.'); subscriptionContainer.style.display = 'block'; planSection.classList.add('subscription-active'); button.style.display = 'none';
                 const targetScrollPos = subscriptionContainer.offsetTop - headerHeight - 20; window.scrollTo({ top: targetScrollPos, behavior: 'smooth' });
                button.classList.remove('loading'); if(btnText) { btnText.style.visibility = 'visible'; btnText.style.opacity = '1'; } if(spinner) spinner.style.display = 'none'; button.disabled = false;
            }, 500);
        });
    } else { console.warn('Accept Quote Button or Subscription Container not found.'); }

    // --- Travel Subscription Form Logic ---
    const subscriptionForm = document.getElementById('travel-registration-form');
    const companyArrangedCheckbox = document.getElementById('reg-is-company-arranged');
    const companyDetailsDiv = document.getElementById('company-details');
    const companyNameInput = document.getElementById('reg-company-name');
    if (companyArrangedCheckbox && companyDetailsDiv && companyNameInput) { companyArrangedCheckbox.addEventListener('change', () => { if (companyArrangedCheckbox.checked) { companyDetailsDiv.style.display = 'block'; companyNameInput.required = true; } else { companyDetailsDiv.style.display = 'none'; companyNameInput.required = false; companyNameInput.value = ''; } }); }

     if (subscriptionForm) {
         ensureBtnTextSpan(subscriptionForm.querySelector('button[type="submit"]'));
         subscriptionForm.addEventListener('submit', (event) => {
             simulateFormSubmitVisuals(event, 'Travel Subscription', null, () => {
                 console.log('Subscription form submitted (simulation).');
                 const departureDateStr = document.getElementById('reg-trip-end-date')?.value; const passportExpiryStr = document.getElementById('reg-c-passport-expiry')?.value; let passportValid = true;
                 if (departureDateStr && passportExpiryStr) { const departureDate = new Date(departureDateStr); const passportExpiryDate = new Date(passportExpiryStr); const diffTime = passportExpiryDate - departureDate; const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); if (diffDays < 89) { passportValid = false; console.warn("Passport validity check failed (main traveller)."); return { success: false, message: "Error: Passport must be valid for at least 89 days after planned departure date." }; } }
                 else { console.warn("Could not find departure or passport expiry dates for validation."); }
                 if (passportValid) {
                     quoteForm.reset(); calculateMockPrice(); subscriptionContainer.style.display = 'none'; acceptQuoteButton.style.display = 'inline-flex'; planSection.classList.remove('subscription-active');
                     activateSection('account-section'); // Navigate after success
                     return { success: true, message: "Subscription complete! (Simulated)" };
                 } else { return { success: false, message: "Passport validity requirements not met." }; }
             });
         });
     }

    // --- Login/Register Form Logic ---
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    if (loginForm) { ensureBtnTextSpan(loginForm.querySelector('button[type="submit"]')); loginForm.addEventListener('submit', (event) => { simulateFormSubmitVisuals(event, 'Login', null, () => { alert('Login successful! (Simulated)'); return true; }); }); }
    if (registerForm) { ensureBtnTextSpan(registerForm.querySelector('button[type="submit"]')); registerForm.addEventListener('submit', (event) => { simulateFormSubmitVisuals(event, 'Register', null, () => { alert('Registration successful! (Simulated)'); return true; }); }); }

    // --- Admin Form Logic & Table Rendering ---
    const updateRiskForm = document.getElementById('update-risk-form');
    const bulkUploadForm = document.getElementById('bulk-upload-form');
    const updatePricingForm = document.getElementById('update-pricing-form');
    const purchasesTableBody = document.querySelector('#purchases-table tbody');
    const fileInput = bulkUploadForm?.querySelector('#risk-file-upload');
    const fileNameSpan = bulkUploadForm?.querySelector('.file-name');
    const claimsTableBody = document.querySelector('#claims-table tbody'); // DEFINED HERE

    function addPurchaseToTable(purchase) {
         if (!purchasesTableBody) return; const noDataRow = purchasesTableBody.querySelector('.no-data-row'); if (noDataRow) { noDataRow.remove(); } const row = document.createElement('tr');
         row.innerHTML = `<td data-label="Order ID">${purchase.id || 'N/A'}</td><td data-label="User Email">${purchase.email || 'N/A'}</td><td data-label="Country/Zones">${purchase.country || 'N/A'}</td><td data-label="Dates">${purchase.dates || 'N/A'}</td><td data-label="Total Price">${purchase.totalPrice || 'N/A'}</td><td data-label="Status"><span class="status-${(purchase.status || 'unknown').toLowerCase()}">${purchase.status || 'Unknown'}</span></td><td data-label="Action"><button class="btn btn-secondary btn-small view-details">View</button></td>`;
         purchasesTableBody.appendChild(row); const viewButton = row.querySelector('.view-details');
         if (viewButton) { ensureBtnTextSpan(viewButton); viewButton.addEventListener('click', () => { alert(`Viewing details for Order ID: ${purchase.id}\nUser: ${purchase.email}\n...(Simulated details panel)`); }); }
     }
    function renderInitialPurchases() {
         if (!purchasesTableBody) return; const exampleRow = purchasesTableBody.querySelector('td[data-label="Order ID"]');
         if (!exampleRow) { if (purchaseHistory.length === 0) { purchasesTableBody.innerHTML = '<tr class="no-data-row"><td colspan="7">No purchases yet.</td></tr>'; } else { purchaseHistory.forEach(addPurchaseToTable); } }
         else { /* Logic to handle pre-existing example row if needed */ const exampleViewButton = exampleRow.closest('tr').querySelector('.view-details'); if (exampleViewButton && !exampleViewButton.dataset.listenerAttached) { ensureBtnTextSpan(exampleViewButton); exampleViewButton.addEventListener('click', () => { const purchase = purchaseHistory.find(p => p.id === 'ORD456'); if (purchase) { alert(`Viewing details for Order ID: ${purchase.id}\n...(Simulated details panel)`); } }); exampleViewButton.dataset.listenerAttached = 'true'; } if (purchaseHistory.length > 1) { purchaseHistory.slice(1).forEach(addPurchaseToTable); } }
     }

    // --- Claims Table Rendering Functions ---
    function addClaimToTable(claim) {
        if (!claimsTableBody) {console.error("claimsTableBody not found in addClaimToTable"); return;} // Add check
        const noDataRow = claimsTableBody.querySelector('.no-data-row');
        if (noDataRow) { noDataRow.remove(); }
        const row = document.createElement('tr');
        const statusClass = `status-${(claim.status || 'unknown').toLowerCase().replace(/\s+/g, '-')}`;
        row.innerHTML = `<td data-label="Claim ID">${claim.id || 'N/A'}</td><td data-label="Date Submitted">${claim.date || 'N/A'}</td><td data-label="Incident Type">${claim.type || 'N/A'}</td><td data-label="Status"><span class="${statusClass}">${claim.status || 'Unknown'}</span></td><td data-label="Action"><button class="btn btn-secondary btn-small view-claim-details">View</button></td>`;
        claimsTableBody.appendChild(row);
        const viewButton = row.querySelector('.view-claim-details');
        if (viewButton) {
            ensureBtnTextSpan(viewButton);
            viewButton.addEventListener('click', () => { alert(`Viewing details for Claim ID: ${claim.id}\nDate: ${claim.date}\nType: ${claim.type}\nStatus: ${claim.status}\n\n(Simulated details view)`); });
        }
    }

     function renderInitialClaims() {
         if (!claimsTableBody) { console.error("claimsTableBody not found in renderInitialClaims"); return; } // Add check
         claimsTableBody.innerHTML = '';
         if (claimsHistory.length === 0) { claimsTableBody.innerHTML = '<tr class="no-data-row"><td colspan="5">No claims history yet.</td></tr>'; }
         else { claimsHistory.forEach(addClaimToTable); }
     }

    // --- Admin Form Listeners ---
    if (updateRiskForm) { ensureBtnTextSpan(updateRiskForm.querySelector('button[type="submit"]')); updateRiskForm.addEventListener('submit', (event) => { simulateFormSubmitVisuals(event, 'Update Risk Data', 'update-risk-status', () => { return { success: true, message: `Risk updated.`}; }); }); }
    if (bulkUploadForm && fileInput && fileNameSpan) { ensureBtnTextSpan(bulkUploadForm.querySelector('button[type="submit"]')); fileInput.addEventListener('change', () => {fileNameSpan.textContent = fileInput.files.length > 0 ? fileInput.files[0].name : 'No file chosen';}); bulkUploadForm.addEventListener('submit', (event) => { simulateFormSubmitVisuals(event, 'Bulk Upload', 'bulk-upload-status', () => { return { success: true, message: `File uploaded.`}; }); }); }
    if (updatePricingForm) { ensureBtnTextSpan(updatePricingForm.querySelector('button[type="submit"]')); updatePricingForm.addEventListener('submit', (event) => { simulateFormSubmitVisuals(event, 'Update Pricing', 'update-pricing-status', () => { return { success: true, message: `Pricing updated.`}; }); }); }

    // --- Initial Rendering ---
    if(purchasesTableBody) { renderInitialPurchases(); }
    // THIS CALL RENDERS THE CLAIMS
    if(claimsTableBody) { renderInitialClaims(); }


    // --- Fade-In Animation Logic ---
    try { const fadeInElements = document.querySelectorAll('.fade-in'); const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 }; const observerCallback = (entries, observer) => { entries.forEach(entry => { if (entry.isIntersecting) { const target = entry.target; const delay = target.dataset.delay || '0s'; target.style.animationDelay = delay; target.classList.add('is-visible'); observer.unobserve(target); } }); }; const observer = new IntersectionObserver(observerCallback, observerOptions); fadeInElements.forEach(el => { if(el) { el.style.opacity = 0; observer.observe(el); } }); } catch (error) { console.error("Error setting up fade-in animations:", error); }
    // --- Final Button Span Check ---
    try { document.querySelectorAll('.btn').forEach(ensureBtnTextSpan); } catch (error) { console.error("Error during final ensureBtnTextSpan sweep:", error); }

    console.log('Travel Risk Platform script finished executing.');
});