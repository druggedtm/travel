document.addEventListener('DOMContentLoaded', () => {
    console.log('Travel Risk Platform script loaded.');

    // --- Simulated Data (Keep as is or replace with actual data later) ---
    let purchaseHistory = [ { id: 'ORD456', email: 'demo@user.com', country: 'Zones: G-10, A-2, R-0', dates: '2024-08-15 to 2024-08-27', totalPrice: '$75.50', status: 'Completed' } ];
    let claimsHistory = [
         { id: 'CLM-98765', date: '2024-07-15', type: 'Medical Expense', status: 'Pending Review' },
         { id: 'CLM-98701', date: '2024-05-02', type: 'Lost Baggage', status: 'Closed - Paid' }
     ]; // Added example claims data


    // --- Helper Functions (Unchanged) ---
    function ensureBtnTextSpan(button) { /* ... content unchanged ... */ }
    function showStatusMessage(elementId, message, isSuccess = true, duration = 4000) { /* ... content unchanged ... */ }
    function simulateFormSubmitVisuals(event, formName, statusElementId, callback) { /* ... content unchanged ... */ }

    // --- Navigation Logic ---
    // MODIFIED THIS LINE: Added '.cta-link[data-target]' to the selector
    const allNavLinks = document.querySelectorAll('.sidebar-link, .header-link, .cta-link[data-target]');
    const dashboardSections = document.querySelectorAll('.dashboard-section');
    const sidebar = document.querySelector('.sidebar');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const body = document.body;
    const breadcrumbCurrentPage = document.getElementById('breadcrumb-current-page');

    function activateSection(targetId) {
        // --- activateSection function content remains unchanged ---
        let sectionFound = false; let activeLinkText = 'Dashboard';
        allNavLinks.forEach(link => link?.classList.remove('active'));
        dashboardSections.forEach(section => section?.classList.remove('active', 'is-visible'));

        const activeLinks = document.querySelectorAll(`[data-target="${targetId}"]`);
        const activeSection = document.getElementById(targetId);

        if (activeSection) {
            activeSection.classList.add('active');
            const delay = activeSection.dataset.delay || '0s';
            activeSection.style.animationDelay = delay;
            // Use setTimeout to allow display:block to apply before adding is-visible for animation
            setTimeout(() => {
                activeSection.classList.add('is-visible');
            }, 10); // Small delay

            activeLinks.forEach(link => {
                if(link){
                     link.classList.add('active');
                     // Prioritize sidebar link for breadcrumb text
                     if (link.classList.contains('sidebar-link')) {
                         activeLinkText = link.textContent.trim();
                     } else if (activeLinkText === 'Dashboard' && link.textContent.trim()) {
                         // Use other link text if sidebar link wasn't found/active
                         activeLinkText = link.textContent.trim();
                     }
                }
            });
             // If navigated via CTA link, find corresponding sidebar link text
             if (!activeLinks[0]?.classList.contains('sidebar-link') && activeLinkText === 'Dashboard') {
                 const correspondingSidebarLink = document.querySelector(`.sidebar-link[data-target="${targetId}"]`);
                 if (correspondingSidebarLink) {
                     activeLinkText = correspondingSidebarLink.textContent.trim();
                 } else if (activeSection.querySelector('h2')) {
                     // Fallback to section heading if no sidebar link found
                     activeLinkText = activeSection.querySelector('h2').textContent.replace(/^\d+\.\s*/, ''); // Remove numbering like "1. "
                 }
             }

            sectionFound = true;
        } else {
            console.warn(`Target section #${targetId} not found. Falling back.`);
            const firstSection = document.querySelector('.dashboard-section');
            if (firstSection && targetId !== firstSection.id) {
                const firstTargetId = firstSection.id;
                activateSection(firstTargetId); // Recursive call to activate fallback
                return; // Prevent further execution in this call
            } else {
                 console.error("No sections found to activate or fallback failed.");
                 activeLinkText = 'Error';
            }
        }

        // Update breadcrumb
        if (breadcrumbCurrentPage) {
            breadcrumbCurrentPage.textContent = activeLinkText;
        }

        // Close sidebar on mobile after navigation
        if (sidebar && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            if(mobileMenuToggle) mobileMenuToggle.setAttribute('aria-expanded', 'false');
            body.classList.remove('sidebar-open');
        }

        // Scroll to top of content area
        document.querySelector('.content-area')?.scrollTo(0, 0);
    }


    allNavLinks.forEach(link => {
        if(link) {
            link.addEventListener('click', (e) => {
                const targetId = e.currentTarget.dataset.target;
                 // Check if it has a target and is meant for internal navigation
                 if (targetId && (e.currentTarget.getAttribute('href')?.startsWith('#') || e.currentTarget.classList.contains('sidebar-link') || e.currentTarget.classList.contains('cta-link'))) {
                     e.preventDefault(); // Prevent default anchor jump only if it's internal nav
                     activateSection(targetId);
                 }
                 // Allow external links or links without target to function normally
            });
        }
    });

     // --- Mobile Menu Toggle (Unchanged) ---
    if (mobileMenuToggle && sidebar) { /* ... content unchanged ... */ }

    // --- Initial Section Activation (Improved Fallback) ---
     let initialTarget = window.location.hash ? window.location.hash.substring(1) : 'map-section';
     const validInitialTarget = document.getElementById(initialTarget) ? initialTarget : 'map-section';
     if (document.getElementById(validInitialTarget)) {
         activateSection(validInitialTarget);
     } else {
          // Fallback if even map-section isn't found
          const firstAvailableSection = document.querySelector('.dashboard-section');
          if (firstAvailableSection) {
              activateSection(firstAvailableSection.id);
          } else {
              console.error("No dashboard sections found on the page.");
          }
     }

    // --- Quote Generator Form Logic (Unchanged) ---
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

    function calculateMockPrice() { /* ... content unchanged ... */ }
    planFormInputs.forEach(input => { if (input) { const eventType = (input.type === 'date' || input.tagName === 'SELECT' || input.type === 'checkbox') ? 'change' : 'input'; input.addEventListener(eventType, calculateMockPrice); } });
    // Initial calculation if quote section is active on load
    if (document.querySelector('.dashboard-section.active')?.id === 'plan-section') { calculateMockPrice(); }


    // --- Login/Register Form Logic (Unchanged) ---
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    if (loginForm) { /* ... content unchanged ... */ }
    if (registerForm) { /* ... content unchanged ... */ }

    // --- Admin Form Logic (Unchanged) ---
    const updateRiskForm = document.getElementById('update-risk-form');
    const bulkUploadForm = document.getElementById('bulk-upload-form');
    const updatePricingForm = document.getElementById('update-pricing-form');
    const purchasesTableBody = document.querySelector('#purchases-table tbody');
    const fileInput = bulkUploadForm?.querySelector('#risk-file-upload');
    const fileNameSpan = bulkUploadForm?.querySelector('.file-name');
    const claimsTableBody = document.querySelector('#claims-table tbody'); // Added for claims

    function addPurchaseToTable(purchase) { /* ... content unchanged ... */ }
    function renderInitialPurchases() { /* ... content unchanged ... */ }
    function simulatePurchase(planDetails) { /* ... content unchanged ... */ }

    // --- Render Claims Table ---
    function addClaimToTable(claim) {
        if (!claimsTableBody) return;
        const noDataRow = claimsTableBody.querySelector('.no-data-row');
        if (noDataRow) { noDataRow.remove(); }

        const row = document.createElement('tr');
        const statusClass = `status-${(claim.status || 'unknown').toLowerCase().replace(/\s+/g, '-')}`; // e.g., status-pending-review

        row.innerHTML = `
            <td data-label="Claim ID">${claim.id || 'N/A'}</td>
            <td data-label="Date Submitted">${claim.date || 'N/A'}</td>
            <td data-label="Incident Type">${claim.type || 'N/A'}</td>
            <td data-label="Status"><span class="${statusClass}">${claim.status || 'Unknown'}</span></td>
            <td data-label="Action"><button class="btn btn-secondary btn-small view-claim-details">View</button></td>
        `;
        claimsTableBody.appendChild(row);

        const viewButton = row.querySelector('.view-claim-details');
        if (viewButton) {
            ensureBtnTextSpan(viewButton);
            viewButton.addEventListener('click', () => {
                alert(`Viewing details for Claim ID: ${claim.id}\n--------------------------\nDate: ${claim.date}\nType: ${claim.type}\nStatus: ${claim.status}\n\n(Simulated details view)`);
            });
        }
    }

     function renderInitialClaims() {
         if (!claimsTableBody) return;
         claimsTableBody.innerHTML = ''; // Clear existing rows before rendering
         if (claimsHistory.length === 0) {
             claimsTableBody.innerHTML = '<tr class="no-data-row"><td colspan="5">No claims history yet.</td></tr>';
         } else {
             claimsHistory.forEach(addClaimToTable);
         }
     }

    // --- Event Listeners for Admin Forms (Unchanged) ---
    // const proceedButton = document.querySelector('#plan-section .cta-button'); // Changed to cta-link
    // if (proceedButton) { /* ... Logic removed as it's now a link handled by allNavLinks ... */ }
    if (updateRiskForm) { /* ... content unchanged ... */ }
    if (bulkUploadForm && fileInput && fileNameSpan) { /* ... content unchanged ... */ }
    if (updatePricingForm) { /* ... content unchanged ... */ }

    // --- Initial Rendering ---
    if(purchasesTableBody) { renderInitialPurchases(); }
    if(claimsTableBody) { renderInitialClaims(); } // Render claims table


    // --- Fade-In Animation Logic (Unchanged) ---
    try { const fadeInElements = document.querySelectorAll('.fade-in'); /* ... content unchanged ... */ } catch (error) { /* ... content unchanged ... */ }

    // --- Final Button Span Check (Unchanged) ---
    try { document.querySelectorAll('.btn').forEach(ensureBtnTextSpan); } catch (error) { /* ... content unchanged ... */ }

    console.log('Travel Risk Platform script finished executing.');
});