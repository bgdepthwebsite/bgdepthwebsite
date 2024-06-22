document.addEventListener('DOMContentLoaded', function() {
    console.log("DOMContentLoaded event fired");
    const form = document.getElementById('invoiceForm');
    const table = document.getElementById('invoiceTable');
    const clearButton = document.getElementById('clearButton');

    form.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent default form submission behavior
        console.log("Form submitted");

        // Collect form data and pass it to the generateInvoice function
        const formData = new FormData(form);
        const borewellDepth = parseInt(formData.get('borewellDepth'));
        const casingPipeChoice = formData.get('casingPipeChoice');
        const casingPipeQuantity = parseInt(formData.get('casingpipe')); // Adjusted to match the new input name
        
        console.log("Borewell Depth:", borewellDepth);
        console.log("Casing Pipe Choice:", casingPipeChoice);
        console.log("Casing Pipe Quantity:", casingPipeQuantity);

        // Validation checks
        if (borewellDepth > 450) {
            alert('Borewell depth cannot exceed 450 meters.');
            console.log("Validation failed: Borewell depth exceeded 450 meters");
            return;
        }

        if (!/^[0-9]+$/.test(borewellDepth) || !/^[0-9]+$/.test(casingPipeQuantity)) {
            alert('Please enter only numeric values.');
            console.log("Validation failed: Non-numeric values entered");
            return;
        }

        generateInvoice(borewellDepth, casingPipeChoice, casingPipeQuantity, table); // Adjusted parameter
    });

    // Clear button event listener
    clearButton.addEventListener('click', function() {
        console.log("Clear button clicked");
        form.reset(); // Reset the form to clear all input fields
        table.innerHTML = ''; // Clear the table content
        table.style.display = 'none'; // Hide the table
    });
});

function generateInvoice(borewellDepth, casingPipeChoice, casingPipeQuantity, table) { // Adjusted parameter
    console.log("Generating invoice");
    // Define rates for each 50-meter segment
    const rates = {
        'a': 347, 'b': 442, 'c': 456, 'd': 536, 'e': 634, 'f': 700, 'g': 825 ,'h': 900, 'i': 930 
    };

    // Initialize total and create invoice items array
    let total = 0;
    const invoiceItems = [];

    // Calculate total for each full 50-meter segment
    for (const [segment, rate] of Object.entries(rates)) {
        if (borewellDepth <= 0) {
            break;
        }

        let segmentDepth = Math.min(borewellDepth, 50);
        let segmentTotal = segmentDepth * rate;

        total += segmentTotal;

        invoiceItems.push({
            description: getSegmentDescription(segment),
            depth: segmentDepth,
            rate: rate,
            total: segmentTotal
        });

        borewellDepth -= 50;
    }

    // If there's any remaining depth, calculate its total separately
    if (borewellDepth > 0) {
        const lastSegmentRate = rates['i']; // Rate for the last segment
        const lastSegmentTotal = borewellDepth * lastSegmentRate;
        total += lastSegmentTotal;

        invoiceItems.push({
            description: getSegmentDescription('i'),
            depth: borewellDepth,
            rate: lastSegmentRate,
            total: lastSegmentTotal
        });
    }

    // Add charges for geophysical survey and casing caps
    const geophysicalSurveyCharge = 3445;
    const casingCapsCharge = 164;

    // Add charges for casing pipe
    const casingPipeCharges = 1325 * casingPipeQuantity; // Adjusted calculation based on the new input

    total += geophysicalSurveyCharge + casingCapsCharge + casingPipeCharges;

    // Calculate CGST and SGST
    const cgst = total * 0.09;
    const sgst = total * 0.09;

    // Calculate grand total
    const grandTotal = total + cgst + sgst;

    // Convert grand total to words
    const grandTotalInWords = convertToWords(grandTotal);

    // Generate HTML for the invoice table
    let invoiceHTML = '<thead><tr><th>SL No</th><th>Description</th><th>Segment Depth (Mtrs)</th><th>Rate</th><th>Total</th></tr></thead><tbody>';

    invoiceItems.forEach((item, index) => {
        invoiceHTML += `<tr><td>${index + 1}</td><td>${item.description}</td><td>${item.depth}</td><td>${item.rate}</td><td>${item.total}</td></tr>`;
    });

    // Add additional rows for charges and grand total
    invoiceHTML += `<tr><td colspan="4">Geophysical survey charges</td><td>${geophysicalSurveyCharge}</td></tr>`;
    invoiceHTML += `<tr><td colspan="4">Casing Pipe (${casingPipeQuantity} Quantity)</td><td>${casingPipeCharges}</td></tr>`;
    invoiceHTML += `<tr><td colspan="4">Casing caps</td><td>${casingCapsCharge}</td></tr>`;
    invoiceHTML += `<tr><td colspan="4">TOTAL</td><td>${total}</td></tr>`;
    invoiceHTML += `<tr><td colspan="4">CGST 9%</td><td>${cgst}</td></tr>`;
    invoiceHTML += `<tr><td colspan="4">SGST 9%</td><td>${sgst}</td></tr>`;
    invoiceHTML += `<tr><td colspan="4">GRAND TOTAL (In Numbers)</td><td>${grandTotal}</td></tr>`;
    invoiceHTML += `<tr><td colspan="4">GRAND TOTAL (In Words)</td><td>${grandTotalInWords}</td></tr>`;

    invoiceHTML += '</tbody>';

    // Update the table inner HTML with the invoice details
    table.innerHTML = invoiceHTML;

    // Show the invoice table
    table.style.display = 'table';
}

function getSegmentDescription(segment) {
    const segmentRanges = {
        'a': '0 to 50',
        'b': '50 to 100',
        'c': '100 to 150',
        'd': '150 to 200',
        'e': '200 to 250',
        'f': '250 to 300',
        'g': '300 to 350',
        'h': '350 to 400',
        'i': '400 to 450'
    };

    return `Borewell Depth ${segmentRanges[segment]} Mtrs`;
}

// Function to convert number to words
function convertToWords(number) {
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    let words = '';

    if (number >= 1000) {
        words += convertToWords(Math.floor(number / 1000)) + ' Thousand ';
        number %= 1000;
    }

    if (number >= 100) {
        words += units[Math.floor(number / 100)] + ' Hundred ';
        number %= 100;
    }

    if (number >= 20) {
        words += tens[Math.floor(number / 10)] + ' ';
        number %= 10;
    }

    if (number > 0) {
        if (number < 10) {
            words += units[number] + ' ';
        } else {
            words += teens[number - 10] + ' ';
        }
    }

    return words.trim();
}
