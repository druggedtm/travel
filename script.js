// script.js (Simplified for Debugging)
document.addEventListener('DOMContentLoaded', () => {
    console.log('Travel Risk Platform script loaded. STARTING DEBUG VERSION.');

    // --- 1. Navigation Logic ---
    try {
        const allNavLinks = document.querySelectorAll('.sidebar-link, .header-link');
        const dashboardSections = document.querySelectorAll('.dashboard-section');
        const sidebar = document.querySelector('.sidebar');
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const body = document.body;
        const breadcrumbCurrentPage = document.getElementById('breadcrumb-current-page');

        if (!allNavLinks.length) console.warn("No navigation links found.");
        if (!dashboardSections.length) console.warn("No dashboard sections found.");
        if (!breadcrumbCurrentPage) console.warn("Breadcrumb element not found.");

        function activateSection(targetId) {
            console.log(`Attempting to activate section: ${targetId}`);
            let sectionFound = false;
            let activeLinkText = 'Dashboard';

            // Deactivate all
            allNavLinks.forEach(link => link?.classList.remove('active')); // Add null check
            dashboardSections.forEach(section => section?.classList.remove('active', 'is-visible')); // Add null check

            const activeSection = document.getElementById(targetId);
            const activeLinks = document.querySelectorAll(`[data-target="${targetId}"]`); // Find links targeting this ID

            if (activeSection) {
                console.log(`Found section: #${targetId}`);
                activeSection.classList.add('active');
                // Use minimal delay for visibility transition
                setTimeout(() => { activeSection.classList.add('is-visible'); }, 10);

                activeLinks.forEach(link => {
                    if(link) {
                        link.classList.add('active');
                        // Prefer sidebar link text for breadcrumb
                        if (link.classList.contains('sidebar-link')) {
                            activeLinkText = link.textContent.trim();
                        }
                    }
                });
                sectionFound = true;
            } else {
                console.warn(`Target section #${targetId} NOT FOUND.`);
                // Minimal fallback: try activating the very first section if target fails
                if (targetId !== dashboardSections[0]?.id) { // Avoid infinite loop if first section is missing
                    console.log("Falling back to first section...");
                    activateSection(dashboardSections[0]?.id); // Try activating the first one
                    return; // Exit current attempt
                }
            }

            // Update Breadcrumb
            if (breadcrumbCurrentPage) {
                breadcrumbCurrentPage.textContent = activeLinkText;
            } else {
                // console.warn("Cannot update breadcrumb - element not found.");
            }

            // Close mobile sidebar
            if (sidebar && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                if(mobileMenuToggle) mobileMenuToggle.setAttribute('aria-expanded', 'false');
                body.classList.remove('sidebar-open');
            }
            // Scroll content area to top
            document.querySelector('.content-area')?.scrollTo(0, 0);
        }

        // Attach navigation listeners
        allNavLinks.forEach((link, index) => {
            if (link) {
                link.addEventListener('click', (e) => {
                    console.log(`Link clicked: ${link.textContent.trim()}`);
                    const targetId = e.currentTarget.dataset.target;
                    // Basic check: Does the target element exist?
                    if (targetId && document.getElementById(targetId)) {
                        e.preventDefault(); // Prevent default only if it's a valid internal link
                        activateSection(targetId);
                    } else if (targetId) {
                        console.warn(`Target #${targetId} not found for link click.`);
                        // Maybe allow default if it's not found (could be an external link)
                    } else {
                         console.warn(`Link ${index} has no data-target.`);
                    }
                });
            } else {
                 console.warn(`Link at index ${index} is null.`);
            }
        });

        // Mobile Menu Toggle Listener
        if (mobileMenuToggle && sidebar) {
            mobileMenuToggle.addEventListener('click', () => {
                const isOpen = sidebar.classList.toggle('open');
                mobileMenuToggle.setAttribute('aria-expanded', isOpen);
                body.classList.toggle('sidebar-open', isOpen);
            });
            // Optional: Close on outside click (keep simple for now)
        } else {
             console.warn("Mobile menu toggle or sidebar not found.");
        }

        // Initial Activation
        let initialTarget = window.location.hash ? window.location.hash.substring(1) : 'map-section';
        console.log(`Initial target check: ${initialTarget}`);
        if (!document.getElementById(initialTarget)) {
            console.warn(`Initial target #${initialTarget} not found, defaulting to map-section.`);
            initialTarget = 'map-section';
        }
        if (document.getElementById(initialTarget)) {
             activateSection(initialTarget);
        } else if (dashboardSections.length > 0) {
            console.warn("Default 'map-section' not found, activating first available section.");
             activateSection(dashboardSections[0].id); // Activate the very first section if map-section is missing
        } else {
            console.error("No dashboard sections found to activate initially.");
        }

    } catch (error) {
        console.error("CRITICAL ERROR during Navigation Logic setup:", error);
    }

    // --- 2. Plan Customization Logic ---
    try {
        console.log("Setting up Plan Customization...");
        // Select elements INSIDE this block to ensure navigation ran first
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

        // Verify elements were found
        let allPlanElementsFound = true;
        planFormInputs.forEach((el, index) => {
            if (!el) {
                 console.error(`Plan input element at index ${index} NOT FOUND.`);
                 allPlanElementsFound = false;
            }
        });
         if (!priceDisplay) { console.error("Price display element NOT FOUND."); allPlanElementsFound = false; }
         if (!totalDaysInput) { console.error("Total days input element NOT FOUND."); allPlanElementsFound = false; } // totalDaysInput is separate but crucial

        // Only proceed if all essential elements are found
        if (allPlanElementsFound && totalDaysInput && priceDisplay) {

            function calculateMockPrice() {
                 // console.log("Calculating price..."); // Uncomment for intense debugging
                // Pricing Configuration
                const dailyRateGreen = 2.50, dailyRateAmber = 5.00, dailyRateRed = 10.00;
                const medicalCoverageBaseCost = { 50000: 5, 100000: 10, 150000: 15, 200000: 20, 250000: 25 };
                const accidentCoverageBaseCost = { 50000: 3, 100000: 6, 150000: 9, 200000: 12, 250000: 15 };
                const transitCost = 30.00; const krAddonCost = 150.00; const evacAddonCost = 75.00;

                // Date Calculation
                let totalDays = 0;
                const startDate = startDateInput.value ? new Date(startDateInput.value) : null;
                const endDate = endDateInput.value ? new Date(endDateInput.value) : null;
                endDateInput.style.borderColor = '';
                if (startDate && endDate) {
                    if (endDate >= startDate) { totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1; }
                    else { totalDays = 0; endDateInput.style.borderColor = 'red'; }
                }
                totalDaysInput.value = totalDays > 0 ? totalDays : 0;

                // Zone Days Calculation
                let daysAmber = parseInt(daysAmberInput.value) || 0; let daysRed = parseInt(daysRedInput.value) || 0;
                if (daysAmber < 0) { daysAmber = 0; daysAmberInput.value = 0; } if (daysRed < 0) { daysRed = 0; daysRedInput.value = 0; }
                let daysGreen = 0; daysAmberInput.style.borderColor = ''; daysRedInput.style.borderColor = '';
                if (totalDays > 0) {
                    if ((daysAmber + daysRed) > totalDays) { daysAmberInput.style.borderColor = 'orange'; daysRedInput.style.borderColor = 'orange'; daysGreen = 0; }
                    else { daysGreen = totalDays - daysAmber - daysRed; }
                }
                daysGreenInput.value = daysGreen >= 0 ? daysGreen : 0;

                // Coverage Calculation
                const medicalCoverageLevel = parseInt(medicalCoverageSelect.value) || 0;
                const accidentCoverageLevel = parseInt(accidentCoverageSelect.value) || 0;
                const hasTransitCoverage = transitCheckbox.checked;
                const hasKrCoverage = krCheckbox.checked;
                const hasEvacCoverage = evacCheckbox.checked;

                // Price Calculation
                let basePrice = 0;
                if (totalDays > 0 && (daysAmber + daysRed) <= totalDays) { const effectiveGreen = Math.max(0, daysGreen); basePrice = (effectiveGreen * dailyRateGreen) + (daysAmber * dailyRateAmber) + (daysRed * dailyRateRed); }
                const medicalCost = medicalCoverageBaseCost[medicalCoverageLevel] || 0; const accidentCost = accidentCoverageBaseCost[accidentCoverageLevel] || 0; const transitPrice = hasTransitCoverage ? transitCost : 0; const krCost = hasKrCoverage ? krAddonCost : 0; const evacCost = hasEvacCoverage ? evacAddonCost : 0;

                // Final Price
                let finalPrice = 0;
                if (totalDays > 0 && (daysAmber + daysRed) <= totalDays) { finalPrice = basePrice + medicalCost + accidentCost + transitPrice + krCost + evacCost; }
                else { finalPrice = 0; }

                // Display Logic
                if (finalPrice > 0) { priceDisplay.textContent = `$${finalPrice.toFixed(2)}`; }
                else if (totalDays > 0 && (daysAmber + daysRed) > totalDays){ priceDisplay.textContent = '$ ---'; }
                else if (totalDays === 0 && (startDateInput.value || endDateInput.value)) { priceDisplay.textContent = '$ ---'; }
                else { priceDisplay.textContent = '$0.00'; }
            } // End calculateMockPrice

            // Attach listeners ONLY if all elements were found
            planFormInputs.forEach(input => {
                const eventType = (input.type === 'date' || input.tagName === 'SELECT' || input.type === 'checkbox') ? 'change' : 'input';
                input.addEventListener(eventType, calculateMockPrice);
            });
            console.log("Attached listeners for plan calculation.");

            // Initial Calculation Check
            const currentActiveSectionId = document.querySelector('.dashboard-section.active')?.id;
            if (currentActiveSectionId === 'plan-section') {
                 console.log("Calculating initial price for plan section.");
                 calculateMockPrice();
            }
        } else {
             console.error("Skipping Plan Customization setup due to missing elements.");
        }
    } catch (error) {
        console.error("CRITICAL ERROR during Plan Customization Logic setup:", error);
    }

    // --- 3. Other Button/Form Logic (Keep SIMPLE for now) ---
    // We are temporarily skipping ensureBtnTextSpan and simulateFormSubmitVisuals
    // Just attach basic alert listeners to check if buttons are clickable

    // Login/Register Forms
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    if(loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Still prevent form submission
            alert('Login Submit Clicked (Simulation Inactive)');
        });
    } else { console.warn("Login form not found."); }
    if(registerForm) {
        registerForm.addEventListener('submit', (e) => {
             e.preventDefault();
             alert('Register Submit Clicked (Simulation Inactive)');
        });
    } else { console.warn("Register form not found."); }

    // Proceed to Checkout Button
     const proceedButton = document.querySelector('#plan-section .cta-button');
     if (proceedButton) {
         proceedButton.addEventListener('click', (event) => {
              alert('Proceed to Checkout Clicked (Simulation Inactive)');
         });
     } else { console.warn("Proceed button not found."); }

     // Admin Form Buttons (Example: Update Risk)
      const updateRiskForm = document.getElementById('update-risk-form');
      if (updateRiskForm) {
          updateRiskForm.addEventListener('submit', (event) => {
               event.preventDefault();
               alert('Update Risk Submit Clicked (Simulation Inactive)');
          });
      } else { console.warn("Update Risk form not found."); }

     // Add similar basic listeners for other Admin buttons/forms if needed for testing

    console.log('Travel Risk Platform script finished executing DEBUG VERSION.');
}); // End DOMContentLoaded