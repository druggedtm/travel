// script.js
document.addEventListener('DOMContentLoaded', () => {
    console.log('Travel Risk Platform script loaded.');

    // --- Mock Data ---
    // Purchase history is now populated dynamically by admin functions
    let purchaseHistory = [];

    // --- Helper: Ensure btn-text span exists ---
    function ensureBtnTextSpan(button) {
        if (button && !button.querySelector('.btn-text')) {
            const span = document.createElement('span');
            span.classList.add('btn-text');
            span.textContent = button.textContent.trim(); // Store original text
            button.textContent = ''; // Clear button text
            button.prepend(span); // Add span back
             // Ensure spinner exists too
             if (!button.querySelector('.loading-spinner')) {
                const spinnerSpan = document.createElement('span');
                spinnerSpan.classList.add('loading-spinner');
                spinnerSpan.style.display = 'none';
                button.appendChild(spinnerSpan);
             }
        }
    }

    // --- Helper: Simulate Form Submission Visuals ---
    function simulateFormSubmitVisuals(event, formName, callback) {
        event.preventDefault(); // Prevent actual form submission
        console.log(`${formName} form submitted (Simulation).`);

        const form = event.target;
        const submitButton = form.querySelector('button[type="submit"]');
        if (!submitButton) return; // Exit if no submit button found

        ensureBtnTextSpan(submitButton); // Make sure structure is correct
        const spinner = submitButton.querySelector('.loading-spinner');
        const btnText = submitButton.querySelector('.btn-text');

        submitButton.classList.add('loading');
        if(btnText) { // Check if btnText exists before trying to style it
            btnText.style.visibility = 'hidden';
            btnText.style.opacity = '0';
        }
        if(spinner) spinner.style.display = 'inline-block';
        submitButton.disabled = true; // Disable button during submission

        // Simulate network request
        setTimeout(() => {
            // Execute the callback function after delay (e.g., show alert, update UI)
            if (typeof callback === 'function') {
                callback();
            }

            // Reset button visuals
            submitButton.classList.remove('loading');
            if(btnText) {
                btnText.style.visibility = 'visible';
                btnText.style.opacity = '1';
            }
            if(spinner) spinner.style.display = 'none';
            submitButton.disabled = false; // Re-enable button

            // Optionally reset the form
            // form.reset();

        }, 1500 + Math.random() * 1000); // Simulate 1.5-2.5 second delay
    }


    // --- Mockup Logic for Plan Customization & Pricing (NEW) ---
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
        // Check if all required elements exist
        if (!startDateInput || !endDateInput || !totalDaysInput || !daysAmberInput || !daysRedInput || !daysGreenInput || !medicalCoverageSelect || !accidentCoverageSelect || !transitCheckbox || !priceDisplay) {
            console.warn("One or more elements for the price calculation mockup were not found.");
            if(priceDisplay) priceDisplay.textContent = '$ ---'; // Indicate error
            return;
        }

        // Define mock base costs (THESE ARE PURELY ILLUSTRATIVE)
        const dailyRateGreen = 2.50;
        const dailyRateAmber = 5.00;
        const dailyRateRed = 10.00;
        const medicalCoverageFactor = 0.0001; // Example factor
        const accidentCoverageFactor = 0.00005; // Example factor
        const transitCost = 30.00; // Flat fee example

        // 1. Calculate total days
        let totalDays = 0;
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);

        if (startDateInput.value && endDateInput.value && endDate >= startDate) {
            const timeDiff = endDate.getTime() - startDate.getTime();
            totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
            endDateInput.style.borderColor = ''; // Clear error style if previously set
        } else if (startDateInput.value && endDateInput.value && endDate < startDate) {
            totalDays = 0;
            endDateInput.style.borderColor = 'red'; // Indicate error
        } else {
             endDateInput.style.borderColor = ''; // Clear error style
        }
        totalDaysInput.value = totalDays > 0 ? totalDays : 0;

        // 2. Get zone days and validate
        let daysAmber = parseInt(daysAmberInput.value) || 0;
        let daysRed = parseInt(daysRedInput.value) || 0;
        if (daysAmber < 0) { daysAmber = 0; daysAmberInput.value = 0; }
        if (daysRed < 0) { daysRed = 0; daysRedInput.value = 0; }

        // 3. Calculate Green days based on Total, Amber, and Red
        let daysGreen = 0;
        daysAmberInput.style.borderColor = ''; // Clear potential error styles
        daysRedInput.style.borderColor = '';
        if (totalDays > 0) {
            if ((daysAmber + daysRed) > totalDays) {
                // Provide user feedback by highlighting the inputs
                daysAmberInput.style.borderColor = 'orange';
                daysRedInput.style.borderColor = 'orange';
                console.warn("Amber + Red days exceed total trip days. Calculation based on total days.");
                // Cap the calculation, but don't change user input directly
                daysGreen = 0;
                // For price calc, use total days split somehow or just max out - let's use total days
                // This logic might need refinement based on business rules
                // Price calc below will use the entered Amber/Red but green will be 0
                daysGreenInput.value = 0;

            } else {
                daysGreen = totalDays - daysAmber - daysRed;
                daysGreenInput.value = daysGreen;
            }
        } else {
            daysGreenInput.value = 0; // No green days if total is 0
        }


        // 4. Get coverage levels
        const medicalCoverage = parseInt(medicalCoverageSelect.value) || 50000;
        const accidentCoverage = parseInt(accidentCoverageSelect.value) || 50000;

        // 5. Check transit coverage
        const hasTransitCoverage = transitCheckbox.checked;

        // 6. Calculate mock price
        let basePrice = 0;
        if (totalDays > 0) {
            // Use the *calculated* green days for pricing
            const effectiveGreen = Math.max(0, totalDays - daysAmber - daysRed);
            basePrice = (effectiveGreen * dailyRateGreen) +
                        (daysAmber * dailyRateAmber) + // Use user input for amber/red cost
                        (daysRed * dailyRateRed);
        }

        const coverageCost = (medicalCoverage * medicalCoverageFactor) + (accidentCoverage * accidentCoverageFactor);
        const transitPrice = hasTransitCoverage ? transitCost : 0;
        let finalPrice = basePrice + coverageCost + transitPrice;
        finalPrice = Math.max(0, finalPrice); // Ensure non-negative price

        // Update the display
        priceDisplay.textContent = `$${finalPrice.toFixed(2)}`;
    }

    // Add event listeners to the NEW plan form inputs
    planFormInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', calculateMockPrice);
            // Use 'change' for select, checkbox, date to capture final value
            if (input.tagName === 'SELECT' || input.type === 'checkbox' || input.type === 'date') {
                 input.addEventListener('change', calculateMockPrice);
            }
        }
    });
    // --- END of Plan Customization Logic ---


    // --- Login/Register Form Simulation ---
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) {
        ensureBtnTextSpan(loginForm.querySelector('button[type="submit"]')); // Setup button on load
        loginForm.addEventListener('submit', (event) => simulateFormSubmitVisuals(event, 'Login', () => {
             alert('Login successful! (Simulated)');
             loginForm.reset(); // Clear the form
        }));
    }

     if (registerForm) {
         ensureBtnTextSpan(registerForm.querySelector('button[type="submit"]')); // Setup button on load
        registerForm.addEventListener('submit', (event) => simulateFormSubmitVisuals(event, 'Register', () => {
            alert('Registration successful! (Simulated)');
             registerForm.reset(); // Clear the form
        }));
    }


    // --- Admin Section Logic ---
    const updateRiskForm = document.getElementById('update-risk-form');
    const bulkUploadForm = document.getElementById('bulk-upload-form');
    const updatePricingForm = document.getElementById('update-pricing-form'); // Added pricing form
    const purchasesTableBody = document.querySelector('#purchases-table tbody');

     // Helper function to add a purchase row to the table
    function addPurchaseToTable(purchase) {
        if (!purchasesTableBody) return; // Exit if table body not found

        // Remove the "No purchases yet" row if it exists
        const noPurchasesRow = purchasesTableBody.querySelector('tr td[colspan="7"]'); // Updated colspan
        if (noPurchasesRow) {
            noPurchasesRow.parentElement.remove();
        }

        const row = document.createElement('tr');
        // Use data attributes for mobile view labels matching the new headers
        row.innerHTML = `
            <td data-label="Order ID">${purchase.id || 'N/A'}</td>
            <td data-label="User Email">${purchase.email || 'N/A'}</td>
            <td data-label="Country/Zones">${purchase.country || 'N/A'}</td>
            <td data-label="Dates">${purchase.dates || 'N/A'}</td>
            <td data-label="Total Price">${purchase.totalPrice || 'N/A'}</td>
            <td data-label="Status"><span class="status-${(purchase.status || 'unknown').toLowerCase()}">${purchase.status || 'Unknown'}</span></td>
            <td data-label="Action"><button class="btn btn-primary btn-small view-details">View</button></td>
        `;
         purchasesTableBody.appendChild(row);

         // Add event listener for the new "View" button
         const viewButton = row.querySelector('.view-details');
         if(viewButton) {
             viewButton.addEventListener('click', () => {
                 // Replace alert with a modal or detailed view later
                 alert(`Viewing details for Order ID: ${purchase.id}\nUser: ${purchase.email}\nCountry/Zone: ${purchase.country}\nDates: ${purchase.dates}\nPrice: ${purchase.totalPrice}\nStatus: ${purchase.status}\n(Simulated details - enhance later)`);
             });
         }
    }

    // Simulate adding a purchase (Example - could be triggered by payment success later)
    function simulatePurchase(planDetails) {
         const newPurchase = {
            id: 'ORD' + Math.floor(10000 + Math.random() * 90000),
            email: 'mock.user@example.com', // Get from logged in user later
            country: `Zones: G-${planDetails.green}, A-${planDetails.amber}, R-${planDetails.red}`, // Summarize zone days
            dates: `${planDetails.start} to ${planDetails.end}`,
            totalPrice: planDetails.price,
            status: 'Completed' // Or 'Pending', 'Failed' etc.
        };
        purchaseHistory.push(newPurchase);
        addPurchaseToTable(newPurchase);
        console.log("Purchase simulated and added to admin table:", newPurchase);
    }

     // Add listener to the main plan button to simulate purchase
     const proceedButton = document.querySelector('#plan-section .cta-button');
     if (proceedButton) {
         proceedButton.addEventListener('click', () => {
             // In a real scenario, this would happen *after* successful payment
             alert('Proceeding to checkout (simulation)... Payment would be handled here.');

             // Simulate purchase completion after a short delay
             setTimeout(() => {
                 const planData = {
                     start: startDateInput.value,
                     end: endDateInput.value,
                     green: daysGreenInput.value,
                     amber: daysAmberInput.value,
                     red: daysRedInput.value,
                     price: priceDisplay.textContent
                 };
                 // Basic validation before simulating purchase
                 if(planData.start && planData.end && parseFloat(totalDaysInput.value) > 0 && planData.price !== '$0.00') {
                     simulatePurchase(planData);
                     alert('Mock Payment Successful! Purchase recorded in Admin panel.');
                     // Optionally reset the form
                     // document.getElementById('travel-plan-form').reset();
                     // calculateMockPrice(); // Recalculate price after reset
                 } else {
                     alert('Please complete the plan details before proceeding.');
                 }
             }, 1000); // Delay to mimic checkout process
         });
     }


    // Simulate Admin form submissions
    if (updateRiskForm) {
         ensureBtnTextSpan(updateRiskForm.querySelector('button[type="submit"]')); // Setup button
        updateRiskForm.addEventListener('submit', (event) => simulateFormSubmitVisuals(event, 'Update Risk Data', () => {
             const country = updateRiskForm.querySelector('#admin-country').value;
             const risk = updateRiskForm.querySelector('#admin-risk').value;
             alert(`Risk data for ${country || 'N/A'} updated to ${risk} (Simulated - no actual data change).`);
             updateRiskForm.reset();
             // In a real app, you'd update the map/risk data source here
        }));
    }

     if (bulkUploadForm) {
         ensureBtnTextSpan(bulkUploadForm.querySelector('button[type="submit"]')); // Setup button
        bulkUploadForm.addEventListener('submit', (event) => simulateFormSubmitVisuals(event, 'Bulk Upload', () => {
             const fileInput = document.getElementById('risk-file-upload');
             if (fileInput.files.length > 0) {
                 alert(`File "${fileInput.files[0].name}" uploaded for processing (Simulated).`);
             } else {
                 alert('No file selected for bulk upload.');
             }
             bulkUploadForm.reset();
             // In a real app, you'd process the file here
        }));
    }

    if (updatePricingForm) {
        ensureBtnTextSpan(updatePricingForm.querySelector('button[type="submit"]')); // Setup button
        updatePricingForm.addEventListener('submit', (event) => simulateFormSubmitVisuals(event, 'Update Pricing', () => {
             const zone = updatePricingForm.querySelector('#price-zone').value;
             const value = updatePricingForm.querySelector('#price-value').value;
             const level = updatePricingForm.querySelector('#coverage-level').value;
             alert(`Pricing for ${zone} (${level}) updated to €${value || 'N/A'} (Simulated).`);
             updatePricingForm.reset();
             // In a real app, you'd update the pricing matrix here and maybe recalculate displayed prices
        }));
    }


    // --- Fade-in animation trigger ---
    const fadeInElements = document.querySelectorAll('.fade-in');
    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1 // 10% of element is visible
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Use dataset.delay if present, otherwise use CSS variable or default
                const delay = entry.target.dataset.delay || '0s';
                entry.target.style.animationDelay = delay;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Stop observing once visible
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    fadeInElements.forEach(el => {
        // Ensure elements start invisible if CSS doesn't handle it
        // el.style.opacity = 0;
        observer.observe(el);
    });

     // --- Initial Load / Setup ---
    calculateMockPrice(); // Calculate initial price based on default form values

}); // End DOMContentLoaded