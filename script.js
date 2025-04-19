// script.js
document.addEventListener('DOMContentLoaded', () => {
    console.log('Travel Risk Platform script loaded.');

    // --- Dummy Data (Replace with API calls later) ---
    const riskData = {
        usa: { level: 'Medium', advisory: 'Exercise increased caution.' },
        canada: { level: 'Low', advisory: 'Exercise normal precautions.' },
        uk: { level: 'Medium', advisory: 'Exercise increased caution due to terrorism risk.' },
        germany: { level: 'Low', advisory: 'Exercise normal precautions.' },
        japan: { level: 'Low', advisory: 'Exercise normal precautions.' },
        brazil: { level: 'High', advisory: 'Exercise increased caution due to crime.' },
        india: { level: 'High', advisory: 'Exercise increased caution.' }
    };

    let purchaseHistory = []; // Store dummy purchase data

    // --- Risk Assessment Logic ---
    const countrySelect = document.getElementById('country-select');
    const riskOutput = document.getElementById('risk-output');
    const selectedCountryName = document.getElementById('selected-country-name');
    const riskLevelSpan = document.getElementById('risk-level');
    const advisoryTextSpan = document.getElementById('advisory-text');
    const mapElement = document.getElementById('map'); // Get the map placeholder

    countrySelect.addEventListener('change', (event) => {
        const selectedCountry = event.target.value;

        // Reset map placeholder text
        mapElement.textContent = 'Map Placeholder';
        mapElement.style.color = 'var(--text-muted)';
        mapElement.style.backgroundColor = 'var(--border-color)'; // Reset background

        if (selectedCountry && riskData[selectedCountry]) {
            const data = riskData[selectedCountry];
            selectedCountryName.textContent = countrySelect.options[countrySelect.selectedIndex].text;
            riskLevelSpan.textContent = data.level;
            advisoryTextSpan.textContent = data.advisory;

            // Update styles based on risk level
            riskLevelSpan.className = ''; // Clear previous classes
            riskOutput.className = 'info-box'; // Reset info-box classes

            let riskColor = '';
            switch (data.level) {
                case 'Low':
                    riskColor = 'var(--success-color)';
                    riskOutput.classList.add('info-box'); // Default style or specific low risk style
                    break;
                case 'Medium':
                    riskColor = 'var(--warning-color)';
                    riskOutput.classList.add('info-box', 'highlight-box'); // Use highlight for medium
                    break;
                case 'High':
                    riskColor = 'var(--accent-color)'; // Using accent for high
                    riskOutput.classList.add('info-box', 'highlight-box');
                    break;
                 case 'Critical':
                    riskColor = 'var(--danger-color)'; // Using danger for critical
                    riskOutput.classList.add('info-box', 'highlight-box');
                    break;
                default:
                     riskColor = 'var(--text-muted)'; // Default muted color
                     riskOutput.classList.add('info-box');
            }
            riskLevelSpan.style.color = riskColor;
            // Update map placeholder to show the country name prominently
            mapElement.textContent = `${countrySelect.options[countrySelect.selectedIndex].text} Map (Simulated)`;
            mapElement.style.color = riskColor; // Color the map text based on risk
            mapElement.style.backgroundColor = 'var(--card-bg)'; // Change map background

            riskOutput.style.display = 'block'; // Show the info box
        } else {
            riskOutput.style.display = 'none'; // Hide if no country selected or data missing
             mapElement.textContent = 'Map Placeholder'; // Reset map text
             mapElement.style.color = 'var(--text-muted)';
             mapElement.style.backgroundColor = 'var(--border-color)';
        }
    });

    // --- Plan Builder Logic ---
    const planCountrySelect = document.getElementById('plan-country');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const travelersInput = document.getElementById('travelers');
    const planOptions = document.querySelectorAll('#plan-builder input[type="checkbox"]');
    const generatePlanBtn = document.getElementById('generate-plan-btn');

    const summaryCountrySpan = document.getElementById('summary-country');
    const summaryDatesSpan = document.getElementById('summary-dates');
    const summaryTravelersSpan = document.getElementById('summary-travelers');
    const summaryOptionsSpan = document.getElementById('summary-options');
    const totalPriceSpan = document.getElementById('total-price');
    const planSummaryBox = document.getElementById('plan-summary');


    function updatePlanSummary() {
        const country = planCountrySelect.options[planCountrySelect.selectedIndex].text || 'N/A';
        const startDate = startDateInput.value || 'N/A';
        const endDate = endDateInput.value || 'N/A';
        const travelers = parseInt(travelersInput.value) || 0;

        summaryCountrySpan.textContent = country;
        summaryDatesSpan.textContent = `${startDate} to ${endDate}`;
        summaryTravelersSpan.textContent = travelers === 1 ? '1 Traveler' : `${travelers} Travelers`;

        let totalCost = 0;
        const selectedOptionLabels = [];

        planOptions.forEach(checkbox => {
            if (checkbox.checked) {
                const price = parseFloat(checkbox.dataset.price) || 0;
                 // Check if price is per traveler or total
                if (checkbox.value === 'medical' || checkbox.value === 'evacuation') {
                     totalCost += price * travelers; // Price per traveler
                 } else {
                     totalCost += price; // Fixed price
                 }
                 // Get the label text next to the checkbox
                 const labelText = checkbox.nextElementSibling ? checkbox.nextElementSibling.textContent.split('(')[0].trim() : checkbox.value;
                 selectedOptionLabels.push(labelText);
            }
        });

        summaryOptionsSpan.textContent = selectedOptionLabels.length > 0 ? selectedOptionLabels.join(', ') : 'None';
        totalPriceSpan.textContent = `$${totalCost.toFixed(2)}`;

        // Make summary visible if enough info is present
        if (country !== 'N/A' && startDate !== 'N/A' && endDate !== 'N/A' && travelers > 0) {
             planSummaryBox.style.display = 'block';
        } else {
             // Keep visible but show N/A if some fields are missing? Or hide?
             // Let's keep it visible but update values to N/A
             planSummaryBox.style.display = 'block'; // Or 'none' if you prefer hiding
        }

        // Enable/Disable generate button
        if (country !== 'N/A' && startDate && endDate && travelers > 0) {
            generatePlanBtn.disabled = false;
        } else {
            generatePlanBtn.disabled = true;
        }
    }

    // Add event listeners to form elements to update summary
    planCountrySelect.addEventListener('change', updatePlanSummary);
    startDateInput.addEventListener('change', updatePlanSummary);
    endDateInput.addEventListener('change', updatePlanSummary);
    travelersInput.addEventListener('input', updatePlanSummary); // Use input for number field
    planOptions.forEach(checkbox => {
        checkbox.addEventListener('change', updatePlanSummary);
    });

    // Initial summary update
    updatePlanSummary(); // Call on page load

    // --- Simulate Plan Generation ---
    generatePlanBtn.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default button action if it were inside a form

        if (generatePlanBtn.disabled) {
            console.log('Plan generation disabled. Please fill in all required fields.');
            return;
        }

        generatePlanBtn.classList.add('loading');
        const btnText = generatePlanBtn.querySelector('.btn-text') || document.createElement('span');
        if (!btnText.classList.contains('btn-text')) { // Check if btnText was just created
             btnText.classList.add('btn-text');
             btnText.textContent = generatePlanBtn.textContent; // Store original text
             generatePlanBtn.textContent = ''; // Clear button text
             generatePlanBtn.prepend(btnText); // Add span back
             // Spinner is already in HTML with display: none;
        } else {
             btnText.style.visibility = 'hidden';
             btnText.style.opacity = '0';
        }
         generatePlanBtn.querySelector('.loading-spinner').style.display = 'inline-block';


        // Simulate async operation (e.g., sending data to server)
        setTimeout(() => {
            alert('Travel Plan Generated Successfully!');

            // Simulate adding a purchase to admin table
            const newPurchase = {
                id: 'ORD' + Math.floor(Math.random() * 100000),
                email: 'user@example.com', // Replace with actual user email if logged in
                country: summaryCountrySpan.textContent,
                dates: summaryDatesSpan.textContent,
                totalPrice: totalPriceSpan.textContent,
                status: 'Completed'
            };
            addPurchaseToTable(newPurchase);


            generatePlanBtn.classList.remove('loading');
            btnText.style.visibility = 'visible';
            btnText.style.opacity = '1';
             generatePlanBtn.querySelector('.loading-spinner').style.display = 'none';

            // Optional: Reset form after successful generation
            // document.getElementById('plan-form').reset(); // Requires wrapping in a form
            // updatePlanSummary(); // Update summary after reset

        }, 1500); // Simulate 1.5 seconds delay
    });


     // --- Login/Register Form Simulation ---
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    function simulateFormSubmit(event, formName) {
         event.preventDefault(); // Prevent actual form submission
         console.log(`${formName} form submitted.`);

        const form = event.target;
        const submitButton = form.querySelector('button[type="submit"]');
        const spinner = submitButton.querySelector('.loading-spinner');
        const btnText = submitButton.querySelector('.btn-text') || document.createElement('span'); // Handle cases where span might not exist yet

         // Add btn-text span if it doesn't exist
         if (!btnText.classList.contains('btn-text')) {
             btnText.classList.add('btn-text');
             btnText.textContent = submitButton.textContent; // Store original text
             submitButton.textContent = ''; // Clear button text
             submitButton.prepend(btnText); // Add span back
             // Spinner is already in HTML with display: none;
         }


        submitButton.classList.add('loading');
        btnText.style.visibility = 'hidden';
        btnText.style.opacity = '0';
        spinner.style.display = 'inline-block';
        submitButton.disabled = true; // Disable button during submission

        // Simulate network request
        setTimeout(() => {
            alert(`${formName} successful! (Simulated)`);
            form.reset(); // Clear the form

             submitButton.classList.remove('loading');
             btnText.style.visibility = 'visible';
             btnText.style.opacity = '1';
             spinner.style.display = 'none';
             submitButton.disabled = false; // Re-enable button

        }, 2000); // Simulate 2-second delay
    }


    if (loginForm) {
        loginForm.addEventListener('submit', (event) => simulateFormSubmit(event, 'Login'));
        // Add btn-text span to login button on load if not present
        const loginBtn = loginForm.querySelector('button[type="submit"]');
         if (loginBtn && !loginBtn.querySelector('.btn-text')) {
             const span = document.createElement('span');
             span.classList.add('btn-text');
             span.textContent = loginBtn.textContent;
             loginBtn.textContent = '';
             loginBtn.prepend(span);
         }
    }

     if (registerForm) {
        registerForm.addEventListener('submit', (event) => simulateFormSubmit(event, 'Register'));
         // Add btn-text span to register button on load if not present
        const registerBtn = registerForm.querySelector('button[type="submit"]');
         if (registerBtn && !registerBtn.querySelector('.btn-text')) {
             const span = document.createElement('span');
             span.classList.add('btn-text');
             span.textContent = registerBtn.textContent;
             registerBtn.textContent = '';
             registerBtn.prepend(span);
         }
    }


    // --- Admin Section Logic ---
    const updateRiskForm = document.getElementById('update-risk-form');
    const bulkUploadForm = document.getElementById('bulk-upload-form');
    const purchasesTableBody = document.querySelector('#purchases-table tbody');

     // Helper function to add a purchase row to the table
    function addPurchaseToTable(purchase) {
        // Remove the "No purchases yet" row if it exists
        const noPurchasesRow = purchasesTableBody.querySelector('tr td[colspan="6"]');
        if (noPurchasesRow) {
            noPurchasesRow.parentElement.remove();
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td data-label="Order ID">${purchase.id}</td>
            <td data-label="User Email">${purchase.email}</td>
            <td data-label="Country">${purchase.country}</td>
            <td data-label="Dates">${purchase.dates}</td>
            <td data-label="Total Price">${purchase.totalPrice}</td>
            <td data-label="Status">${purchase.status}</td>
            <td><button class="btn btn-small btn-primary view-details">View</button></td> <!-- Added button column -->
        `;
         // Append the new row to the table body
         purchasesTableBody.appendChild(row);

         // Add event listener for the new "View" button
         row.querySelector('.view-details').addEventListener('click', () => {
             alert(`Viewing details for Order ID: ${purchase.id}\n(Simulated details)`);
         });
    }

    // Simulate admin form submissions
    if (updateRiskForm) {
        updateRiskForm.addEventListener('submit', (event) => {
            event.preventDefault();
             simulateFormSubmit(event, 'Update Risk Data');
             // In a real app, you'd send data to a backend API here
        });
          // Add btn-text span to admin update risk button on load
         const updateRiskBtn = updateRiskForm.querySelector('button[type="submit"]');
         if (updateRiskBtn && !updateRiskBtn.querySelector('.btn-text')) {
             const span = document.createElement('span');
             span.classList.add('btn-text');
             span.textContent = updateRiskBtn.textContent;
             updateRiskBtn.textContent = '';
             updateRiskBtn.prepend(span);
         }
    }

     if (bulkUploadForm) {
        bulkUploadForm.addEventListener('submit', (event) => {
            event.preventDefault();
             const fileInput = document.getElementById('bulk-data-file');
             if (fileInput.files.length === 0) {
                 alert('Please select a file to upload.');
                 return;
             }
            simulateFormSubmit(event, 'Bulk Upload');
             // In a real app, you'd handle file upload here
        });
         // Add btn-text span to admin upload button on load
         const uploadBtn = bulkUploadForm.querySelector('button[type="submit"]');
         if (uploadBtn && !uploadBtn.querySelector('.btn-text')) {
             const span = document.createElement('span');
             span.classList.add('btn-text');
             span.textContent = uploadBtn.textContent;
             uploadBtn.textContent = '';
             uploadBtn.prepend(span);
         }
    }

    // --- Initial Load / Setup ---
    // Add any initial purchase data if needed for display on load
    // Example: addPurchaseToTable({ id: 'ORD12345', email: 'test@user.com', country: 'United States', dates: '2023-10-26 to 2023-11-05', totalPrice: '$250.00', status: 'Completed' });

    // Optional: Implement Fade-in animation trigger if not using pure CSS delay
    // You could use IntersectionObserver API for elements coming into view
    const fadeInElements = document.querySelectorAll('.fade-in');
    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1 // 10% of element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationDelay = `${entry.target.dataset.delay || 0}s`; // Use data-delay if set
                entry.target.classList.add('is-visible'); // Add class to trigger animation
                observer.unobserve(entry.target); // Stop observing once visible
            }
        });
    }, observerOptions);

    fadeInElements.forEach(el => {
        // Remove the initial 'fade-in' class if using JS trigger
        // el.classList.remove('fade-in');
        // Add a new class that the CSS animation targets once 'is-visible' is added
        el.style.opacity = 0; // Ensure they start invisible
        observer.observe(el);
    });

    // CSS for the JS-triggered fade-in
    // .fade-in.is-visible { animation: fadeIn 0.6s var(--transition-timing) forwards; }


}); // End DOMContentLoaded