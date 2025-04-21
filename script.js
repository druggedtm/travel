// script.js
document.addEventListener('DOMContentLoaded', () => {
    console.log('Travel Risk Platform script loaded.');

    // --- Mock Data ---
    let purchaseHistory = [ { id: 'ORD456', email: 'demo@user.com', country: 'Zones: G-10, A-2, R-0', dates: '2024-08-15 to 2024-08-27', totalPrice: '$75.50', status: 'Completed' } ];
    let claimsHistory = [ /* Could add mock claims here */ ]; // Placeholder for claims data

    // --- Helper: Ensure btn-text span exists (Unchanged) ---
    function ensureBtnTextSpan(button) { /* ... */ }

    // --- Helper: Show Status Message (Unchanged) ---
    function showStatusMessage(elementId, message, isSuccess = true, duration = 4000) { /* ... */ }

    // --- Helper: Simulate Form Submission Visuals (Unchanged, but note form reset logic) ---
    function simulateFormSubmitVisuals(event, formName, statusElementId, callback) { /* ... includes reset logic */ }


    // --- Sidebar & Header Navigation Logic (Updated for Claims Section) ---
    const allNavLinks = document.querySelectorAll('.sidebar-link, .header-link');
    // **Add the new section ID here**
    const dashboardSections = document.querySelectorAll('.dashboard-section');
    const sidebar = document.querySelector('.sidebar');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const body = document.body;
    const breadcrumbCurrentPage = document.getElementById('breadcrumb-current-page');

    function activateSection(targetId) {
        // Function content largely unchanged, ensures breadcrumb updates
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
    allNavLinks.forEach(link => { /* Listener unchanged */ });
    if (mobileMenuToggle && sidebar) { /* Listener unchanged */ }
    let initialTarget = window.location.hash ? window.location.hash.substring(1) : 'map-section';
    const validInitialTarget = document.getElementById(initialTarget) ? initialTarget : 'map-section';
    if (validInitialTarget) { activateSection(validInitialTarget); }
    else { /* Fallback unchanged */ }


    // --- Plan Customization Logic (Revised for Add-ons) ---
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const totalDaysInput = document.getElementById('total-days');
    const daysAmberInput = document.getElementById('days-amber');
    const daysRedInput = document.getElementById('days-red');
    const daysGreenInput = document.getElementById('days-green');
    const medicalCoverageSelect = document.getElementById('medical-coverage');
    const accidentCoverageSelect = document.getElementById('accident-coverage');
    const transitCheckbox = document.getElementById('transit-coverage');
    // **NEW: Add selectors for new checkboxes**
    const krCheckbox = document.getElementById('kr-coverage');
    const evacCheckbox = document.getElementById('evac-coverage');
    const priceDisplay = document.getElementById('estimated-price');
    const planForm = document.getElementById('travel-plan-form');

    // **NEW: Add new checkboxes to the array**
    const planFormInputs = [
        startDateInput, endDateInput, daysAmberInput, daysRedInput,
        medicalCoverageSelect, accidentCoverageSelect, transitCheckbox,
        krCheckbox, evacCheckbox // Add the new ones here
    ];

    function calculateMockPrice() {
        if (!startDateInput || !endDateInput || !totalDaysInput || !daysAmberInput || !daysRedInput || !daysGreenInput || !medicalCoverageSelect || !accidentCoverageSelect || !transitCheckbox || !priceDisplay || !krCheckbox || !evacCheckbox) {
            console.warn("One or more plan customization elements are missing.");
            if (priceDisplay) priceDisplay.textContent = '$ ---';
            return;
        }

        // --- Pricing Configuration (Mock) ---
        const dailyRateGreen = 2.50, dailyRateAmber = 5.00, dailyRateRed = 10.00;
        const medicalCoverageBaseCost = { 50000: 5, 100000: 10, 150000: 15, 200000: 20, 250000: 25 };
        const accidentCoverageBaseCost = { 50000: 3, 100000: 6, 150000: 9, 200000: 12, 250000: 15 };
        const transitCost = 30.00;
        // **NEW: Define mock costs for add-ons**
        const krAddonCost = 150.00; // Example flat cost
        const evacAddonCost = 75.00; // Example flat cost

        // --- Date Calculation (Unchanged) ---
        let totalDays = 0; /* ... calculation ... */
        const startDate = startDateInput.value ? new Date(startDateInput.value) : null;
        const endDate = endDateInput.value ? new Date(endDateInput.value) : null;
        endDateInput.style.borderColor = '';
        if (startDate && endDate) {
            if (endDate >= startDate) { totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1; }
            else { totalDays = 0; endDateInput.style.borderColor = 'red'; }
        }
        totalDaysInput.value = totalDays > 0 ? totalDays : 0;


        // --- Zone Days Calculation (Unchanged) ---
        let daysAmber = parseInt(daysAmberInput.value) || 0; /* ... calculation ... */
        let daysRed = parseInt(daysRedInput.value) || 0;
        if (daysAmber < 0) { daysAmber = 0; daysAmberInput.value = 0; } if (daysRed < 0) { daysRed = 0; daysRedInput.value = 0; }
        let daysGreen = 0; daysAmberInput.style.borderColor = ''; daysRedInput.style.borderColor = '';
        if (totalDays > 0) {
            if ((daysAmber + daysRed) > totalDays) { daysAmberInput.style.borderColor = 'orange'; daysRedInput.style.borderColor = 'orange'; daysGreen = 0; }
            else { daysGreen = totalDays - daysAmber - daysRed; }
        }
        daysGreenInput.value = daysGreen >= 0 ? daysGreen : 0;

        // --- Coverage Calculation ---
        const medicalCoverageLevel = parseInt(medicalCoverageSelect.value) || 0;
        const accidentCoverageLevel = parseInt(accidentCoverageSelect.value) || 0;
        const hasTransitCoverage = transitCheckbox.checked;
        // **NEW: Check if add-ons are selected**
        const hasKrCoverage = krCheckbox.checked;
        const hasEvacCoverage = evacCheckbox.checked;

        // --- Price Calculation ---
        let basePrice = 0;
        if (totalDays > 0 && (daysAmber + daysRed) <= totalDays) {
             const effectiveGreen = Math.max(0, daysGreen);
             basePrice = (effectiveGreen * dailyRateGreen) + (daysAmber * dailyRateAmber) + (daysRed * dailyRateRed);
        }

        const medicalCost = medicalCoverageBaseCost[medicalCoverageLevel] || 0;
        const accidentCost = accidentCoverageBaseCost[accidentCoverageLevel] || 0;
        const transitPrice = hasTransitCoverage ? transitCost : 0;
        // **NEW: Add costs for selected add-ons**
        const krCost = hasKrCoverage ? krAddonCost : 0;
        const evacCost = hasEvacCoverage ? evacAddonCost : 0;

        // --- Final Price ---
        let finalPrice = 0;
         if (totalDays > 0 && (daysAmber + daysRed) <= totalDays) {
             finalPrice = basePrice + medicalCost + accidentCost + transitPrice + krCost + evacCost; // Add new costs
         } else {
              finalPrice = 0;
         }

         // --- Debugging Log ---
         // console.log(`Calc: TD=${totalDays}, G=${daysGreen}, A=${daysAmber}, R=${daysRed}, MedL=${medicalCoverageLevel}, AccL=${accidentCoverageLevel}, Transit=${hasTransitCoverage}, KR=${hasKrCoverage}, Evac=${hasEvacCoverage} => Base=${basePrice.toFixed(2)}, MedC=${medicalCost}, AccC=${accidentCost}, TransitC=${transitPrice}, KRC=${krCost}, EvacC=${evacCost} => Final=${finalPrice.toFixed(2)}`);

        // Display the final price (Logic unchanged)
        if (finalPrice > 0) { priceDisplay.textContent = `$${finalPrice.toFixed(2)}`; }
        else if (totalDays > 0 && (daysAmber + daysRed) > totalDays){ priceDisplay.textContent = '$ ---'; }
        else if (totalDays === 0 && (startDateInput.value || endDateInput.value)) { priceDisplay.textContent = '$ ---'; }
        else { priceDisplay.textContent = '$0.00'; }
    }

    // Attach event listeners correctly (Loop unchanged, but now includes new inputs)
    planFormInputs.forEach(input => {
        if (input) {
            const eventType = (input.type === 'date' || input.tagName === 'SELECT' || input.type === 'checkbox') ? 'change' : 'input';
            input.addEventListener(eventType, calculateMockPrice);
        } else {
            // This shouldn't happen if IDs are correct, but good for debugging
            console.warn("An element expected in planFormInputs was null or undefined.");
        }
    });
    if (validInitialTarget === 'plan-section') { calculateMockPrice(); }


    // --- Login/Register Form Simulation (Unchanged) ---
    /* ... */

    // --- Admin Section Logic (Functionally Unchanged) ---
    /* ... addPurchaseToTable, renderInitialPurchases, simulatePurchase ... */
    /* ... Admin form listeners ... */

    // --- Initial Data Rendering ---
    renderInitialPurchases(); // Admin table
    // Could add renderInitialClaims() here if needed

    // --- Fade-in Animation Trigger (Unchanged) ---
    /* ... */

    // --- Ensure all buttons have spans initially ---
    document.querySelectorAll('.btn').forEach(ensureBtnTextSpan);

}); // End DOMContentLoaded