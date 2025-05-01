document.addEventListener('DOMContentLoaded', () => {
    console.log('Travel Risk Platform script loaded.');

    // --- Simulated Data (Updated with examples) ---
    let purchaseHistory = [
        { id: 'ORD456', email: 'demo@user.com', country: 'Zones: G10 A2 R0', dates: '2024-08-15 to 2024-08-27', totalPrice: '$75.50', status: 'Completed' },
        { id: 'ORD457', email: 'another@example.com', country: 'Zones: G5 A0 R5', dates: '2024-09-01 to 2024-09-11', totalPrice: '$150.00', status: 'Completed' },
        { id: 'ORD458', email: 'test@sample.org', country: 'Zones: G0 A10 R0', dates: '2024-09-05 to 2024-09-15', totalPrice: '$65.00', status: 'Pending' } // Added Pending example
    ];
    let claimsHistory = [
         { id: 'CLM-98765', date: '2024-07-15', type: 'Medical Expense', status: 'Pending Review' },
         { id: 'CLM-98701', date: '2024-05-02', type: 'Lost Baggage', status: 'Closed - Paid' },
         { id: 'CLM-98888', date: '2024-08-20', type: 'Trip Cancellation', status: 'Rejected' } // Added Rejected example
     ];

    // --- Helper Functions ---
    function ensureBtnTextSpan(button) { if (!button) { return; } try { const hasBtnText = button.querySelector('.btn-text'); const hasSpinner = button.querySelector('.loading-spinner'); if (hasBtnText && hasSpinner) { return; } let existingText = ''; button.childNodes.forEach(node => { if (node.nodeType === Node.TEXT_NODE) { existingText += node.textContent.trim(); } }); if (existingText && !hasBtnText) { button.childNodes.forEach(node => { if (node.nodeType === Node.TEXT_NODE) { node.remove(); } }); const span = document.createElement('span'); span.classList.add('btn-text'); span.textContent = existingText; button.insertBefore(span, button.firstChild); } else if (!hasBtnText && button.textContent.trim()) { existingText = button.textContent.trim(); button.textContent = ''; const span = document.createElement('span'); span.classList.add('btn-text'); span.textContent = existingText; button.insertBefore(span, button.firstChild); } else if (!hasBtnText) { const span = document.createElement('span'); span.classList.add('btn-text'); button.insertBefore(span, button.firstChild); } if (!hasSpinner) { const spinnerSpan = document.createElement('span'); spinnerSpan.classList.add('loading-spinner'); spinnerSpan.style.display = 'none'; button.appendChild(spinnerSpan); } } catch (error) { console.error("Error in ensureBtnTextSpan:", error); } }
    function showStatusMessage(elementId, message, isSuccess = true, duration = 4000) { const statusElement = document.getElementById(elementId); if (!statusElement) { return; } statusElement.textContent = message; statusElement.className = 'status-message'; statusElement.classList.add(isSuccess ? 'success' : 'error'); statusElement.style.display = 'block'; if (statusElement.timerId) { clearTimeout(statusElement.timerId); } statusElement.timerId = setTimeout(() => { statusElement.style.display = 'none'; statusElement.className = 'status-message'; statusElement.timerId = null; }, duration); }
    function simulateFormSubmitVisuals(event, formName, statusElementId, callback) { event.preventDefault(); const form = event.target; if (!form) { return; } const submitButton = form.querySelector('button[type="submit"]'); if (!submitButton) { return; } if (submitButton.disabled || submitButton.classList.contains('loading')) return; ensureBtnTextSpan(submitButton); const spinner = submitButton.querySelector('.loading-spinner'); const btnText = submitButton.querySelector('.btn-text'); const statusElement = document.getElementById(statusElementId); if (!spinner || !btnText) { console.warn(`${formName}: Button structure incorrect`); } if (statusElement) { statusElement.style.display = 'none'; statusElement.className = 'status-message'; } submitButton.classList.add('loading'); if(btnText) { btnText.style.visibility = 'hidden'; btnText.style.opacity = '0'; } if(spinner) spinner.style.display = 'inline-block'; submitButton.disabled = true; console.log(`${formName} submitting...`); setTimeout(() => { let success = true; let message = `${formName.replace(' Data','')} successful!`; try { if (typeof callback === 'function') { const result = callback(); if (typeof result === 'object' && result !== null) { success = result.success !== undefined ? result.success : true; message = result.message || (success ? message : `Error during ${formName}.`); } else if (result === false) { success = false; message = `Error during ${formName}.`; } } if (statusElementId) { showStatusMessage(statusElementId, message, success); } else if (!success) { alert(message); } if (success && form.id !== 'login-form') { form.reset(); const fileInput = form.querySelector('input[type="file"]'); if (fileInput) { const changeEvent = new Event('change', { bubbles: true }); fileInput.dispatchEvent(changeEvent); } } } catch (error) { console.error(`Error during ${formName} callback:`, error); success = false; message = 'Unexpected error.'; if (statusElementId) { showStatusMessage(statusElementId, message, false); } else { alert(message); } } finally { if (submitButton) { submitButton.classList.remove('loading'); if(btnText) { btnText.style.visibility = 'visible'; btnText.style.opacity = '1'; } if(spinner) spinner.style.display = 'none'; submitButton.disabled = false; } console.log(`${formName} simulation complete (Success: ${success}).`); } }, 500 + Math.random() * 500); }

    // --- Navigation Logic ---
    const allNavLinks = document.querySelectorAll('.sidebar-link, .header-link');
    const dashboardSections = document.querySelectorAll('.dashboard-section');
    const sidebar = document.querySelector('.sidebar');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const body = document.body;
    const breadcrumbCurrentPage = document.getElementById('breadcrumb-current-page');
    const headerHeight = document.querySelector('.main-header')?.offsetHeight || 60;

    function resetPlanSectionUI() {
        const quoteContainer = document.getElementById('quote-options-container');
        const subContainer = document.getElementById('subscription-details-container');
        const quoteSep = document.getElementById('quote-separator');
        const subSep = document.getElementById('subscription-separator');
        const checkBtn = document.getElementById('check-eligibility-btn');
        const acceptBtn = document.getElementById('accept-quote-btn');
        const errorMsg = document.getElementById('eligibility-error-message');
        const planSection = document.getElementById('plan-section');

        if(quoteContainer) quoteContainer.style.display = 'none';
        if(subContainer) subContainer.style.display = 'none';
        if(quoteSep) quoteSep.style.display = 'none';
        if(subSep) subSep.style.display = 'none';
        if(checkBtn) checkBtn.style.display = 'inline-flex'; // Show check btn by default
        if(acceptBtn) acceptBtn.style.display = 'inline-flex'; // Ensure accept btn is visible initially if needed, but eligibility hides it first
        if(errorMsg) errorMsg.style.display = 'none';
        if(planSection) planSection.classList.remove('subscription-active');

        // Optionally reset eligibility form fields
        document.getElementById('eligibility-dob')?.form.reset();
    }

    function activateSection(targetId) {
        let sectionFound = false; let activeLinkText = 'Dashboard';
        allNavLinks.forEach(link => link?.classList.remove('active'));
        dashboardSections.forEach(section => section?.classList.remove('active', 'is-visible'));
        if(targetId !== 'plan-section') { resetPlanSectionUI(); } // Reset if navigating away from quote page
        const activeLinks = document.querySelectorAll(`[data-target="${targetId}"]`);
        const activeSection = document.getElementById(targetId);
        if (activeSection) {
            activeSection.classList.add('active');
            const delay = activeSection.dataset.delay || '0s';
            activeSection.style.animationDelay = delay;
            setTimeout(() => { activeSection.classList.add('is-visible'); }, 10);
            activeLinks.forEach(link => { if (link) { link.classList.add('active'); if (link.classList.contains('sidebar-link')) { activeLinkText = link.textContent.trim(); } } });
            if (activeLinkText === 'Dashboard') { const correspondingSidebarLink = document.querySelector(`.sidebar-link[data-target="${targetId}"]`); if (correspondingSidebarLink) { activeLinkText = correspondingSidebarLink.textContent.trim(); correspondingSidebarLink.classList.add('active'); } else if (activeSection.querySelector('h2')) { activeLinkText = activeSection.querySelector('h2').textContent.replace(/^\d+\.\s*/, ''); } }
            sectionFound = true;
        } else {
             console.warn(`Target section #${targetId} not found. Fallback.`);
             const firstSection = document.getElementById('map-section') || document.querySelector('.dashboard-section');
             if(firstSection) { activateSection(firstSection.id); return; }
             else { console.error("No sections found."); activeLinkText = 'Error'; }
        }
        if (breadcrumbCurrentPage) { breadcrumbCurrentPage.textContent = activeLinkText; }
        if (sidebar && sidebar.classList.contains('open')) { sidebar.classList.remove('open'); if(mobileMenuToggle) mobileMenuToggle.setAttribute('aria-expanded', 'false'); body.classList.remove('sidebar-open'); }
        document.querySelector('.content-area')?.scrollTo(0, 0);
    }

    allNavLinks.forEach(link => { if (link) { link.addEventListener('click', (e) => { const targetId = e.currentTarget.dataset.target; if (targetId && (e.currentTarget.classList.contains('sidebar-link') || e.currentTarget.classList.contains('header-link'))) { e.preventDefault(); activateSection(targetId); } }); } });
    if (mobileMenuToggle && sidebar) { mobileMenuToggle.addEventListener('click', () => { const isOpen = sidebar.classList.toggle('open'); mobileMenuToggle.setAttribute('aria-expanded', isOpen); body.classList.toggle('sidebar-open', isOpen); }); document.addEventListener('click', (e) => { if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && !mobileMenuToggle.contains(e.target)) { sidebar.classList.remove('open'); mobileMenuToggle.setAttribute('aria-expanded', 'false'); body.classList.remove('sidebar-open'); } }); }
    let initialTarget = window.location.hash ? window.location.hash.substring(1) : 'map-section'; const validInitialTarget = document.getElementById(initialTarget) ? initialTarget : 'map-section'; if (document.getElementById(validInitialTarget)) { activateSection(validInitialTarget); } else { const firstAvailableSection = document.getElementById('map-section') || document.querySelector('.dashboard-section'); if(firstAvailableSection) { activateSection(firstAvailableSection.id); } else { console.error("No dashboard sections found."); } }

    // --- Travel Risk Quote & Subscription Logic ---
    const eligibilityDobInput = document.getElementById('eligibility-dob');
    const eligibilityPassportExpiryInput = document.getElementById('eligibility-passport-expiry');
    const eligibilityStartDateInput = document.getElementById('eligibility-start-date');
    const eligibilityEndDateInput = document.getElementById('eligibility-end-date');
    const checkEligibilityBtn = document.getElementById('check-eligibility-btn');
    const eligibilityErrorMsg = document.getElementById('eligibility-error-message');
    const quoteOptionsContainer = document.getElementById('quote-options-container');
    const quoteSeparator = document.getElementById('quote-separator');
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
    const acceptQuoteButton = document.getElementById('accept-quote-btn');
    const subscriptionContainer = document.getElementById('subscription-details-container');
    const subscriptionSeparator = document.getElementById('subscription-separator');
    const subscriptionForm = document.getElementById('travel-registration-form');
    const companyArrangedCheckbox = document.getElementById('reg-is-company-arranged');
    const companyDetailsDiv = document.getElementById('company-details');
    const companyNameInput = document.getElementById('reg-company-name');
    const subDobDisplay = document.getElementById('reg-c-dob-display');
    const subPassportExpiryDisplay = document.getElementById('reg-c-passport-expiry-display');
    const subStartDateDisplay = document.getElementById('reg-trip-start-date-display');
    const subEndDateDisplay = document.getElementById('reg-trip-end-date-display');
    const planSection = document.getElementById('plan-section');
    const quoteOptionInputs = [daysAmberInput, daysRedInput, medicalCoverageSelect, accidentCoverageSelect, transitCheckbox, krCheckbox, evacCheckbox];

    // --- Eligibility Check Logic ---
    if (checkEligibilityBtn) {
        ensureBtnTextSpan(checkEligibilityBtn);
        checkEligibilityBtn.addEventListener('click', () => {
            const dobStr = eligibilityDobInput.value; const passportExpiryStr = eligibilityPassportExpiryInput.value; const startDateStr = eligibilityStartDateInput.value; const endDateStr = eligibilityEndDateInput.value; let errorMessage = ''; eligibilityErrorMsg.style.display = 'none'; eligibilityDobInput.style.borderColor=''; eligibilityPassportExpiryInput.style.borderColor=''; eligibilityStartDateInput.style.borderColor=''; eligibilityEndDateInput.style.borderColor=''; // Reset borders
            if (!dobStr || !passportExpiryStr || !startDateStr || !endDateStr) {
                errorMessage = 'Please enter all eligibility dates.';
                if(!dobStr) eligibilityDobInput.style.borderColor='red'; if(!passportExpiryStr) eligibilityPassportExpiryInput.style.borderColor='red'; if(!startDateStr) eligibilityStartDateInput.style.borderColor='red'; if(!endDateStr) eligibilityEndDateInput.style.borderColor='red';
            } else {
                const dob = new Date(dobStr); const passportExpiry = new Date(passportExpiryStr); const startDate = new Date(startDateStr); const endDate = new Date(endDateStr); const today = new Date(); today.setHours(0, 0, 0, 0);
                if (isNaN(dob.getTime()) || isNaN(passportExpiry.getTime()) || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) { errorMessage = 'One or more dates are invalid.'; }
                else if (startDate < today) { errorMessage = 'Travel Start Date cannot be in the past.'; eligibilityStartDateInput.style.borderColor='red'; }
                else if (endDate < startDate) { errorMessage = 'Travel End Date cannot be before Travel Start Date.'; eligibilityEndDateInput.style.borderColor='red'; }
                else {
                    let age = startDate.getFullYear() - dob.getFullYear(); const m = startDate.getMonth() - dob.getMonth(); if (m < 0 || (m === 0 && startDate.getDate() < dob.getDate())) { age--; }
                    console.log("Age on Start Date:", age);
                    if (age >= 70) { errorMessage = 'Eligibility Failed: Traveller must be under 70 on the travel start date.'; eligibilityDobInput.style.borderColor='red'; }
                    else { const minPassportExpiry = new Date(endDate); minPassportExpiry.setDate(minPassportExpiry.getDate() + 90); if (passportExpiry < minPassportExpiry) { errorMessage = `Eligibility Failed: Passport must be valid until at least ${minPassportExpiry.toLocaleDateString()} (90 days after travel end date).`; eligibilityPassportExpiryInput.style.borderColor='red'; } }
                }
            }
            if (errorMessage) {
                eligibilityErrorMsg.textContent = errorMessage; eligibilityErrorMsg.style.display = 'block'; quoteOptionsContainer.style.display = 'none'; subscriptionContainer.style.display = 'none'; quoteSeparator.style.display = 'none'; subscriptionSeparator.style.display = 'none';
            } else {
                eligibilityErrorMsg.style.display = 'none'; quoteOptionsContainer.style.display = 'block'; quoteSeparator.style.display = 'block';
                //checkEligibilityBtn.style.display = 'none'; // Keep button visible maybe? Or hide as planned.

                const startDate = new Date(startDateStr); const endDate = new Date(endDateStr); let totalDays = 0; if (endDate >= startDate) { totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1; }
                totalDaysInput.value = totalDays; daysGreenInput.value = totalDays; daysAmberInput.value = 0; daysRedInput.value = 0;
                calculateMockPrice(); // Calculate initial quote price

                if(subDobDisplay) subDobDisplay.value = new Date(dobStr).toLocaleDateString(); if(subPassportExpiryDisplay) subPassportExpiryDisplay.value = new Date(passportExpiryStr).toLocaleDateString(); if(subStartDateDisplay) subStartDateDisplay.value = new Date(startDateStr).toLocaleDateString(); if(subEndDateDisplay) subEndDateDisplay.value = new Date(endDateStr).toLocaleDateString();
            }
        });
    }

    // --- Quote Calculation Logic ---
    function calculateMockPrice() { /* ... Same calculation logic as previous response ... */ if (quoteOptionsContainer.style.display !== 'block') { if (priceDisplay) priceDisplay.textContent = '$0.00'; return; } if (!totalDaysInput || !daysAmberInput || !daysRedInput || !daysGreenInput || !medicalCoverageSelect || !accidentCoverageSelect || !transitCheckbox || !priceDisplay || !krCheckbox || !evacCheckbox) { if (priceDisplay) priceDisplay.textContent = '$ ---'; return; } const dailyRateGreen = 2.50, dailyRateAmber = 5.00, dailyRateRed = 10.00; const medicalCoverageBaseCost = { 50000: 5, 100000: 10, 150000: 15, 200000: 20, 250000: 25 }; const accidentCoverageBaseCost = { 50000: 3, 100000: 6, 150000: 9, 200000: 12, 250000: 15 }; const transitCost = 30.00; const krAddonCost = 150.00; const evacAddonCost = 75.00; const ageFactor = 1.0; let totalDays = parseInt(totalDaysInput.value) || 0; let daysAmber = parseInt(daysAmberInput.value) || 0; let daysRed = parseInt(daysRedInput.value) || 0; if (daysAmber < 0) { daysAmber = 0; daysAmberInput.value = 0; } if (daysRed < 0) { daysRed = 0; daysRedInput.value = 0; } let daysGreen = 0; daysAmberInput.style.borderColor = ''; daysRedInput.style.borderColor = ''; if (totalDays > 0) { if ((daysAmber + daysRed) > totalDays) { daysAmberInput.style.borderColor = 'orange'; daysRedInput.style.borderColor = 'orange'; daysGreen = 0; } else { daysGreen = totalDays - daysAmber - daysRed; } } else { daysAmber = 0; daysRed = 0; daysGreen = 0; } daysGreenInput.value = daysGreen >= 0 ? daysGreen : 0; const medicalCoverageLevel = parseInt(medicalCoverageSelect.value) || 0; const accidentCoverageLevel = parseInt(accidentCoverageSelect.value) || 0; const hasTransitCoverage = transitCheckbox.checked; const hasKrCoverage = krCheckbox.checked; const hasEvacCoverage = evacCheckbox.checked; let basePrice = 0; if (totalDays > 0 && (daysAmber + daysRed) <= totalDays) { const effectiveGreen = Math.max(0, daysGreen); basePrice = (effectiveGreen * dailyRateGreen) + (daysAmber * dailyRateAmber) + (daysRed * dailyRateRed); } const medicalCost = medicalCoverageBaseCost[medicalCoverageLevel] || 0; const accidentCost = accidentCoverageBaseCost[accidentCoverageLevel] || 0; const transitPrice = hasTransitCoverage ? transitCost : 0; const krCost = hasKrCoverage ? krAddonCost : 0; const evacCost = hasEvacCoverage ? evacAddonCost : 0; let finalPrice = 0; if (totalDays > 0 && (daysAmber + daysRed) <= totalDays) { finalPrice = (basePrice + medicalCost + accidentCost) * ageFactor + transitPrice + krCost + evacCost; } else { finalPrice = 0; } if (finalPrice > 0) { priceDisplay.textContent = `$${finalPrice.toFixed(2)}`; } else if (totalDays > 0 && (daysAmber + daysRed) > totalDays) { priceDisplay.textContent = '$ ---'; } else { priceDisplay.textContent = '$0.00'; } }
    quoteOptionInputs.forEach(input => { if (input) { const eventType = (input.tagName === 'SELECT' || input.type === 'checkbox' || input.type === 'number') ? 'change' : 'input'; input.addEventListener(eventType, calculateMockPrice); } });

    // --- "Accept Quote & Proceed" Button Logic ---
    if (acceptQuoteButton && subscriptionContainer && planSection && subscriptionSeparator) {
        ensureBtnTextSpan(acceptQuoteButton);
        acceptQuoteButton.addEventListener('click', () => {
            if (priceDisplay.textContent === '$0.00' || priceDisplay.textContent === '$ ---') { alert('Please ensure valid quote options are selected.'); return; }
            const button = acceptQuoteButton; const spinner = button.querySelector('.loading-spinner'); const btnText = button.querySelector('.btn-text'); button.classList.add('loading'); if(btnText) btnText.style.visibility = 'hidden'; if(spinner) spinner.style.display = 'inline-block'; button.disabled = true;
            setTimeout(() => {
                subscriptionContainer.style.display = 'block'; subscriptionSeparator.style.display = 'block'; planSection.classList.add('subscription-active'); // Hides accept btn via CSS
                const targetScrollPos = subscriptionContainer.offsetTop - headerHeight - 40; window.scrollTo({ top: targetScrollPos, behavior: 'smooth' });
                button.classList.remove('loading'); if(btnText) btnText.style.visibility = 'visible'; if(spinner) spinner.style.display = 'none'; button.disabled = false;
            }, 500);
        });
    }

    // --- Subscription Form Logic ---
    if (companyArrangedCheckbox && companyDetailsDiv) { companyArrangedCheckbox.addEventListener('change', () => { companyDetailsDiv.style.display = companyArrangedCheckbox.checked ? 'block' : 'none'; if(companyNameInput) companyNameInput.required = companyArrangedCheckbox.checked; if (!companyArrangedCheckbox.checked && companyNameInput) companyNameInput.value = ''; }); }
     if (subscriptionForm) {
         ensureBtnTextSpan(subscriptionForm.querySelector('button[type="submit"]'));
         subscriptionForm.addEventListener('submit', (event) => {
             simulateFormSubmitVisuals(event, 'Travel Subscription', null, () => {
                 // Final checks if needed (eligibility should already be done)
                 console.log('Subscription form submitted (simulation).');
                 resetPlanSectionUI(); // Reset the whole quote section
                 activateSection('account-section'); // Navigate on success
                 return { success: true, message: "Subscription complete! View details in My Account." };
             });
         });
     }

    // --- Login/Register Form Logic ---
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    if (loginForm) { ensureBtnTextSpan(loginForm.querySelector('button[type="submit"]')); loginForm.addEventListener('submit', (event) => { simulateFormSubmitVisuals(event, 'Login', null, () => { alert('Login successful! (Simulated)'); return true; }); }); }
    if (registerForm) { ensureBtnTextSpan(registerForm.querySelector('button[type="submit"]')); registerForm.addEventListener('submit', (event) => { simulateFormSubmitVisuals(event, 'Register', null, () => { alert('Registration successful! (Simulated)'); return true; }); }); }

    // --- Admin Form Logic & Table Rendering ---
    const updateRiskForm = document.getElementById('update-risk-form'); const bulkUploadForm = document.getElementById('bulk-upload-form'); const updatePricingForm = document.getElementById('update-pricing-form');
    const purchasesTableBody = document.querySelector('#purchases-table tbody'); const fileInput = bulkUploadForm?.querySelector('#risk-file-upload'); const fileNameSpan = bulkUploadForm?.querySelector('.file-name'); const claimsTableBody = document.querySelector('#claims-table tbody');

    function addPurchaseToTable(purchase) { if (!purchasesTableBody) return; const noDataRow = purchasesTableBody.querySelector('.no-data-row'); if (noDataRow) noDataRow.remove(); const row = document.createElement('tr'); const statusClass = `status-${(purchase.status || 'unknown').toLowerCase().replace(/\s+/g, '-')}`; row.innerHTML = `<td data-label="Order ID">${purchase.id || 'N/A'}</td><td data-label="User Email">${purchase.email || 'N/A'}</td><td data-label="Zones">${purchase.country || 'N/A'}</td><td data-label="Dates">${purchase.dates || 'N/A'}</td><td data-label="Price">${purchase.totalPrice || 'N/A'}</td><td data-label="Status"><span class="${statusClass}">${purchase.status || 'Unknown'}</span></td><td data-label="Action"><button class="btn btn-secondary btn-small view-details">View</button></td>`; purchasesTableBody.appendChild(row); const viewButton = row.querySelector('.view-details'); if (viewButton) { ensureBtnTextSpan(viewButton); viewButton.addEventListener('click', () => alert(`Viewing Order ID: ${purchase.id}`)); } }
    function renderInitialPurchases() { if (!purchasesTableBody) return; purchasesTableBody.innerHTML = ''; if (purchaseHistory.length === 0) { purchasesTableBody.innerHTML = '<tr class="no-data-row"><td colspan="7">No purchases found.</td></tr>'; } else { purchaseHistory.forEach(addPurchaseToTable); } }
    function addClaimToTable(claim) { if (!claimsTableBody) return; const noDataRow = claimsTableBody.querySelector('.no-data-row'); if (noDataRow) noDataRow.remove(); const row = document.createElement('tr'); const statusClass = `status-${(claim.status || 'unknown').toLowerCase().replace(/\s+/g, '-')}`; row.innerHTML = `<td data-label="Claim ID">${claim.id || 'N/A'}</td><td data-label="Date Submitted">${claim.date || 'N/A'}</td><td data-label="Incident Type">${claim.type || 'N/A'}</td><td data-label="Status"><span class="${statusClass}">${claim.status || 'Unknown'}</span></td><td data-label="Action"><button class="btn btn-secondary btn-small view-claim-details">View</button></td>`; claimsTableBody.appendChild(row); const viewButton = row.querySelector('.view-claim-details'); if (viewButton) { ensureBtnTextSpan(viewButton); viewButton.addEventListener('click', () => alert(`Viewing Claim ID: ${claim.id}`)); } }
    function renderInitialClaims() { if (!claimsTableBody) return; claimsTableBody.innerHTML = ''; if (claimsHistory.length === 0) { claimsTableBody.innerHTML = '<tr class="no-data-row"><td colspan="5">No claims history.</td></tr>'; } else { claimsHistory.forEach(addClaimToTable); } }

    if (updateRiskForm) { ensureBtnTextSpan(updateRiskForm.querySelector('button[type="submit"]')); updateRiskForm.addEventListener('submit', (event) => { simulateFormSubmitVisuals(event, 'Update Risk', 'update-risk-status', () => { return { success: true, message: `Risk updated.`}; }); }); }
    if (bulkUploadForm && fileInput && fileNameSpan) { ensureBtnTextSpan(bulkUploadForm.querySelector('button[type="submit"]')); fileInput.addEventListener('change', () => {fileNameSpan.textContent = fileInput.files.length > 0 ? fileInput.files[0].name : 'No file chosen';}); bulkUploadForm.addEventListener('submit', (event) => { simulateFormSubmitVisuals(event, 'Bulk Upload', 'bulk-upload-status', () => { return { success: true, message: `File uploaded.`}; }); }); }
    if (updatePricingForm) { ensureBtnTextSpan(updatePricingForm.querySelector('button[type="submit"]')); updatePricingForm.addEventListener('submit', (event) => { simulateFormSubmitVisuals(event, 'Update Pricing', 'update-pricing-status', () => { return { success: true, message: `Pricing updated.`}; }); }); }

    // --- Initial Rendering ---
    if(purchasesTableBody) { renderInitialPurchases(); } // Render example purchases
    if(claimsTableBody) { renderInitialClaims(); } // Render example claims

    // --- Final Init Steps ---
    try { const fadeInElements = document.querySelectorAll('.fade-in'); const observer = new IntersectionObserver((entries, observer) => { entries.forEach(entry => { if (entry.isIntersecting) { const target = entry.target; const delay = target.dataset.delay || '0s'; target.style.animationDelay = delay; target.classList.add('is-visible'); observer.unobserve(target); } }); }, { threshold: 0.1 }); fadeInElements.forEach(el => { if(el) { el.style.opacity = 0; observer.observe(el); } }); } catch (error) { console.error("Fade-in error:", error); }
    try { document.querySelectorAll('.btn').forEach(ensureBtnTextSpan); } catch (error) { console.error("Ensure button sweep error:", error); }
    console.log('Travel Risk Platform script finished executing.');
});