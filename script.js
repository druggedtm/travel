// script.js
document.addEventListener('DOMContentLoaded', () => {
    console.log('Travel Risk Platform script loaded.');

    // --- Mock Data ---
    let purchaseHistory = [];

    // --- Helper: Ensure btn-text span exists ---
    function ensureBtnTextSpan(button) {
        if (button && !button.querySelector('.btn-text')) {
            const span = document.createElement('span');
            span.classList.add('btn-text');
            span.textContent = button.textContent.trim();
            button.textContent = '';
            button.prepend(span);
             if (!button.querySelector('.loading-spinner')) {
                const spinnerSpan = document.createElement('span');
                spinnerSpan.classList.add('loading-spinner');
                spinnerSpan.style.display = 'none';
                button.appendChild(spinnerSpan);
             }
        }
    }

    // --- Helper: Show Status Message (NEW) ---
    function showStatusMessage(elementId, message, isSuccess = true, duration = 4000) {
        const statusElement = document.getElementById(elementId);
        if (!statusElement) {
            console.warn(`Status message element not found: #${elementId}`);
            return; // Exit if element doesn't exist
        }

        statusElement.textContent = message;
        statusElement.className = 'status-message'; // Reset classes
        statusElement.classList.add(isSuccess ? 'success' : 'error');
        // statusElement.style.display = 'block'; // CSS handles display via class

        // Clear message after duration
        setTimeout(() => {
            // statusElement.style.display = 'none'; // CSS handles display via class removal
            statusElement.textContent = '';
            statusElement.className = 'status-message'; // Remove success/error class
        }, duration);
    }


    // --- Helper: Simulate Form Submission Visuals (UPDATED to use status messages) ---
    function simulateFormSubmitVisuals(event, formName, statusElementId, callback) {
        event.preventDefault();
        console.log(`${formName} form submitted (Simulation).`);

        const form = event.target;
        const submitButton = form.querySelector('button[type="submit"]');
        if (!submitButton) return;

        ensureBtnTextSpan(submitButton);
        const spinner = submitButton.querySelector('.loading-spinner');
        const btnText = submitButton.querySelector('.btn-text');

        // Hide previous status message immediately
        const statusElement = document.getElementById(statusElementId);
        if (statusElement) statusElement.className = 'status-message'; // Hide by removing class


        submitButton.classList.add('loading');
        if(btnText) { btnText.style.visibility = 'hidden'; btnText.style.opacity = '0'; }
        if(spinner) spinner.style.display = 'inline-block';
        submitButton.disabled = true;

        setTimeout(() => {
            let success = true; // Assume success unless callback changes it
            let message = `${formName.replace(' Data','')} successful!`; // Default success message

            if (typeof callback === 'function') {
                const result = callback(); // Execute callback
                // Allow callback to return { success: boolean, message: string }
                if (typeof result === 'object' && result !== null) {
                    success = result.success !== undefined ? result.success : true;
                    message = result.message || (success ? message : 'An error occurred.');
                } else if (result === false) { // Handle simple false return for error
                    success = false;
                    message = `Error during ${formName}. Please check inputs.`;
                }
            }

            // Show status message INSTEAD of alert
            if (statusElementId) {
                showStatusMessage(statusElementId, message, success);
            } else { // Fallback to alert if no status ID provided
                 alert(message);
            }


            // Reset button visuals
            submitButton.classList.remove('loading');
            if(btnText) { btnText.style.visibility = 'visible'; btnText.style.opacity = '1'; }
            if(spinner) spinner.style.display = 'none';
            submitButton.disabled = false;

            // Reset form only on success
            if (success) {
                 form.reset();
                 // Trigger change event for file input display if it exists
                 const fileInput = form.querySelector('input[type="file"]');
                 if (fileInput) {
                     const changeEvent = new Event('change', { bubbles: true });
                     fileInput.dispatchEvent(changeEvent);
                 }
            }

        }, 1500 + Math.random() * 1000);
    }


    // --- Plan Customization Logic (Unchanged) ---
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const totalDaysInput = document.getElementById('total-days');
    const daysAmberInput = document.getElementById('days-amber');
    const daysRedInput = document.getElementById('days-red');
    const daysGreenInput = document.getElementById('days-green');
    const medicalCoverageSelect = document.getElementById('medical-coverage');
    const accidentCoverageSelect = document.getElementById('accident-coverage');
    const transitCheckbox = document.getElementById('transit-coverage');
    const priceDisplay = document.getElementById('estimated-price');
    const planFormInputs = [startDateInput, endDateInput, daysAmberInput, daysRedInput, medicalCoverageSelect, accidentCoverageSelect, transitCheckbox];

    function calculateMockPrice() {
        if (!startDateInput || !endDateInput || !totalDaysInput || !daysAmberInput || !daysRedInput || !daysGreenInput || !medicalCoverageSelect || !accidentCoverageSelect || !transitCheckbox || !priceDisplay) {
            if(priceDisplay) priceDisplay.textContent = '$ ---';
            return;
        }
        const dailyRateGreen = 2.50, dailyRateAmber = 5.00, dailyRateRed = 10.00;
        const medicalCoverageFactor = 0.0001, accidentCoverageFactor = 0.00005;
        const transitCost = 30.00;
        let totalDays = 0;
        const startDate = new Date(startDateInput.value), endDate = new Date(endDateInput.value);
        if (startDateInput.value && endDateInput.value && endDate >= startDate) {
            totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1;
            endDateInput.style.borderColor = '';
        } else if (startDateInput.value && endDateInput.value && endDate < startDate) {
             totalDays = 0; endDateInput.style.borderColor = 'red';
        } else { endDateInput.style.borderColor = ''; }
        totalDaysInput.value = totalDays > 0 ? totalDays : 0;
        let daysAmber = parseInt(daysAmberInput.value) || 0, daysRed = parseInt(daysRedInput.value) || 0;
        if (daysAmber < 0) { daysAmber = 0; daysAmberInput.value = 0; }
        if (daysRed < 0) { daysRed = 0; daysRedInput.value = 0; }
        let daysGreen = 0;
        daysAmberInput.style.borderColor = ''; daysRedInput.style.borderColor = '';
        if (totalDays > 0) {
            if ((daysAmber + daysRed) > totalDays) {
                daysAmberInput.style.borderColor = 'orange'; daysRedInput.style.borderColor = 'orange';
                daysGreen = 0; daysGreenInput.value = 0;
            } else {
                daysGreen = totalDays - daysAmber - daysRed; daysGreenInput.value = daysGreen;
            }
        } else { daysGreenInput.value = 0; }
        const medicalCoverage = parseInt(medicalCoverageSelect.value) || 50000;
        const accidentCoverage = parseInt(accidentCoverageSelect.value) || 50000;
        const hasTransitCoverage = transitCheckbox.checked;
        let basePrice = 0;
        if (totalDays > 0) {
            const effectiveGreen = Math.max(0, totalDays - daysAmber - daysRed);
            basePrice = (effectiveGreen * dailyRateGreen) + (daysAmber * dailyRateAmber) + (daysRed * dailyRateRed);
        }
        const coverageCost = (medicalCoverage * medicalCoverageFactor) + (accidentCoverage * accidentCoverageFactor);
        const transitPrice = hasTransitCoverage ? transitCost : 0;
        let finalPrice = Math.max(0, basePrice + coverageCost + transitPrice);
        priceDisplay.textContent = `$${finalPrice.toFixed(2)}`;
    }
    planFormInputs.forEach(input => { if (input) { input.addEventListener('input', calculateMockPrice); if (input.tagName === 'SELECT' || input.type === 'checkbox' || input.type === 'date') { input.addEventListener('change', calculateMockPrice); } } });

    // --- Login/Register Form Simulation (Unchanged - still uses alert) ---
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    if (loginForm) {
        ensureBtnTextSpan(loginForm.querySelector('button[type="submit"]'));
        loginForm.addEventListener('submit', (event) => simulateFormSubmitVisuals(event, 'Login', null, () => {
             alert('Login successful! (Simulated)');
             return { success: true };
        }));
    }
    if (registerForm) {
        ensureBtnTextSpan(registerForm.querySelector('button[type="submit"]'));
        registerForm.addEventListener('submit', (event) => simulateFormSubmitVisuals(event, 'Register', null, () => {
            alert('Registration successful! (Simulated)');
            return { success: true };
        }));
    }


    // --- Admin Section Logic (UPDATED) ---
    const updateRiskForm = document.getElementById('update-risk-form');
    const bulkUploadForm = document.getElementById('bulk-upload-form');
    const updatePricingForm = document.getElementById('update-pricing-form');
    const purchasesTableBody = document.querySelector('#purchases-table tbody');

    // Add Purchase To Table (Unchanged function body, just ensure .no-data-row selector)
    function addPurchaseToTable(purchase) {
        if (!purchasesTableBody) return;
        const noPurchasesRow = purchasesTableBody.querySelector('.no-data-row'); // Use class selector
        if (noPurchasesRow) { noPurchasesRow.parentElement.remove(); }
        const row = document.createElement('tr');
        row.innerHTML = `
            <td data-label="Order ID">${purchase.id || 'N/A'}</td> <td data-label="User Email">${purchase.email || 'N/A'}</td>
            <td data-label="Country/Zones">${purchase.country || 'N/A'}</td> <td data-label="Dates">${purchase.dates || 'N/A'}</td>
            <td data-label="Total Price">${purchase.totalPrice || 'N/A'}</td> <td data-label="Status"><span class="status-${(purchase.status || 'unknown').toLowerCase()}">${purchase.status || 'Unknown'}</span></td>
            <td data-label="Action"><button class="btn btn-primary btn-small view-details">View</button></td>
        `;
        purchasesTableBody.appendChild(row);
        const viewButton = row.querySelector('.view-details');
        if(viewButton) { viewButton.addEventListener('click', () => { alert(`Viewing details for Order ID: ${purchase.id}\nUser: ${purchase.email}\nCountry/Zone: ${purchase.country}\nDates: ${purchase.dates}\nPrice: ${purchase.totalPrice}\nStatus: ${purchase.status}\n(Simulated details)`); }); }
    }

    // Simulate Purchase (Unchanged)
    function simulatePurchase(planDetails) {
         const newPurchase = { id: 'ORD' + Math.floor(10000 + Math.random() * 90000), email: 'mock.user@example.com', country: `Zones: G-${planDetails.green}, A-${planDetails.amber}, R-${planDetails.red}`, dates: `${planData.start} to ${planData.end}`, totalPrice: planDetails.price, status: 'Completed' };
        purchaseHistory.push(newPurchase); addPurchaseToTable(newPurchase); console.log("Purchase simulated:", newPurchase);
    }

    // Proceed Button Listener (Unchanged - still uses alert for payment confirmation)
    const proceedButton = document.querySelector('#plan-section .cta-button');
     if (proceedButton) {
         ensureBtnTextSpan(proceedButton);
         proceedButton.addEventListener('click', (event) => {
             console.log('Proceed to Checkout button clicked.');
             const button = event.currentTarget; const spinner = button.querySelector('.loading-spinner'); const btnText = button.querySelector('.btn-text'); button.classList.add('loading'); if(btnText) { btnText.style.visibility = 'hidden'; btnText.style.opacity = '0'; } if(spinner) spinner.style.display = 'inline-block'; button.disabled = true;
             setTimeout(() => {
                 const planData = { start: startDateInput.value, end: endDateInput.value, green: daysGreenInput.value, amber: daysAmberInput.value, red: daysRedInput.value, price: priceDisplay.textContent };
                 if(planData.start && planData.end && parseFloat(totalDaysInput.value) > 0 && planData.price !== '$0.00' && planData.price !== '$ ---') {
                     simulatePurchase(planData);
                     alert('Mock Payment Successful! Purchase recorded in Admin panel.'); // Keep alert for payment success?
                 } else { alert('Please complete the plan details before proceeding.'); }
                 button.classList.remove('loading'); if(btnText) { btnText.style.visibility = 'visible'; btnText.style.opacity = '1'; } if(spinner) spinner.style.display = 'none'; button.disabled = false;
             }, 2000);
         });
     }

    // UPDATED Admin form submissions to use status messages
    if (updateRiskForm) {
        ensureBtnTextSpan(updateRiskForm.querySelector('button[type="submit"]'));
        updateRiskForm.addEventListener('submit', (event) => simulateFormSubmitVisuals(event, 'Update Risk Data', 'update-risk-status', () => {
             const country = updateRiskForm.querySelector('#admin-country').value;
             const risk = updateRiskForm.querySelector('#admin-risk').value;
             if (!country) { // Basic validation example
                 return { success: false, message: 'Please enter a country name.' };
             }
             // Form reset is handled by helper on success
             return { success: true, message: `Risk data for ${country} updated to ${risk}.` }; // Return success message
        }));
    }

     if (bulkUploadForm) {
         ensureBtnTextSpan(bulkUploadForm.querySelector('button[type="submit"]'));
         const fileInput = bulkUploadForm.querySelector('#risk-file-upload');
         const fileNameSpan = bulkUploadForm.querySelector('.file-name');

         // Update display when file is chosen
         if (fileInput && fileNameSpan) {
             fileInput.addEventListener('change', () => {
                 fileNameSpan.textContent = fileInput.files.length > 0 ? fileInput.files[0].name : 'No file chosen';
             });
         } else {
             console.warn("File input or filename span not found for bulk upload form.");
         }

         bulkUploadForm.addEventListener('submit', (event) => simulateFormSubmitVisuals(event, 'Bulk Upload', 'bulk-upload-status', () => {
             if (fileInput && fileInput.files.length > 0) {
                 // Form reset handled by helper
                 return { success: true, message: `File "${fileInput.files[0].name}" upload simulated.` };
             } else {
                 return { success: false, message: 'Please select a file to upload.' }; // Return error message
             }
        }));
    }

    if (updatePricingForm) {
        ensureBtnTextSpan(updatePricingForm.querySelector('button[type="submit"]'));
        updatePricingForm.addEventListener('submit', (event) => simulateFormSubmitVisuals(event, 'Update Pricing', 'update-pricing-status', () => {
             const zone = updatePricingForm.querySelector('#price-zone').value;
             const value = updatePricingForm.querySelector('#price-value').value;
             const level = updatePricingForm.querySelector('#coverage-level').value;
             if (value === '' || value === null || isNaN(parseFloat(value))) { // Validate input
                return { success: false, message: 'Please enter a valid price value.'};
             }
             // Form reset handled by helper
             return { success: true, message: `Pricing for ${zone} (${level}) updated to €${value}.` };
        }));
    }

    // --- Fade-in animation trigger (Unchanged) ---
    const fadeInElements = document.querySelectorAll('.fade-in');
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
    const observerCallback = (entries, observer) => { entries.forEach(entry => { if (entry.isIntersecting) { const delay = entry.target.dataset.delay || '0s'; entry.target.style.animationDelay = delay; entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }); };
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    fadeInElements.forEach(el => { observer.observe(el); });

     // --- Initial Load / Setup ---
    calculateMockPrice(); // Calculate initial price

    // Example initial purchase added for demo
    addPurchaseToTable({ id: 'ORD456', email: 'demo@user.com', country: 'Zones: G-10, A-2, R-0', dates: '2024-08-15 to 2024-08-27', totalPrice: '$75.50', status: 'Completed' });


}); // End DOMContentLoaded