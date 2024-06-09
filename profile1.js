document.addEventListener('DOMContentLoaded', function() {
    const generateDepthCellsButton = document.getElementById('generateDepthCellsButton');
    const generateInvoiceButton = document.getElementById('generateInvoiceButton');
    const depthCellsContainer = document.getElementById('depthCellsContainer');
    const invoiceTable = document.getElementById('invoiceTable');

    generateDepthCellsButton.addEventListener('click', function() {
        generateDepthCells();
    });

    generateInvoiceButton.addEventListener('click', function() {
        generateInvoice();
    });

    window.generateDepthCells = function() {
        const numberOfCells = parseInt(document.getElementById('depthCells').value);
        depthCellsContainer.innerHTML = ''; // Clear previous inputs

        for (let i = 0; i < numberOfCells; i++) {
            const rowDiv = document.createElement('div');
            rowDiv.classList.add('depth-rate-row');

            const depthInput = document.createElement('input');
            depthInput.type = 'number';
            depthInput.name = `depth${i}`;
            depthInput.placeholder = `Depth ${i + 1}`;
            depthInput.required = true;

            const rateInput = document.createElement('input');
            rateInput.type = 'number';
            rateInput.name = `rate${i}`;
            rateInput.placeholder = `Rate ${i + 1}`;
            rateInput.required = true;

            rowDiv.appendChild(depthInput);
            rowDiv.appendChild(rateInput);

            depthCellsContainer.appendChild(rowDiv);
        }
    };

    function generateInvoice() {
        const depthInputs = document.querySelectorAll('.depth-rate-row input[name^="depth"]');
        const rateInputs = document.querySelectorAll('.depth-rate-row input[name^="rate"]');
        const casingPipeChoice = document.getElementById('casingPipeChoice').value;
        const casingPipeQuantity = parseInt(document.getElementById('casingPipeQuantity').value);
        const casingPipeRate = parseInt(document.getElementById('casingPipeRate').value);
        const capsQuantity = parseInt(document.getElementById('capsQuantity').value);
        const capsRate = parseInt(document.getElementById('capsRate').value);
        const gstRate = parseInt(document.getElementById('gst').value) / 100;
        const sgstRate = parseInt(document.getElementById('sgst').value) / 100;

        let total = 0;
        let invoiceItems = [];

        depthInputs.forEach((depthInput, index) => {
            const depth = parseInt(depthInput.value);
            const rate = parseInt(rateInputs[index].value);
            const itemTotal = depth * rate;

            invoiceItems.push({
                description: `Depth cell ${index + 1}`,
                depth: depth,
                rate: rate,
                total: itemTotal
            });

            total += itemTotal;
        });

        const casingPipeTotal = casingPipeQuantity * casingPipeRate;
        const capsTotal = capsQuantity * capsRate;

        total += casingPipeTotal + capsTotal;

        const gst = total * gstRate;
        const sgst = total * sgstRate;
        const grandTotal = total + gst + sgst;
        const grandTotalInWords = convertToWords(grandTotal);

        let invoiceHTML = '<thead><tr><th>SL No</th><th>Description</th><th>Depth</th><th>Rate</th><th>Total</th></tr></thead><tbody>';

        invoiceItems.forEach((item, index) => {
            invoiceHTML += `<tr><td>${index + 1}</td><td>${item.description}</td><td>${item.depth}</td><td>${item.rate}</td><td>${item.total}</td></tr>`;
        });

        invoiceHTML += `<tr><td colspan="4">Casing Pipe (${casingPipeQuantity} Quantity)</td><td>${casingPipeTotal}</td></tr>`;
        invoiceHTML += `<tr><td colspan="4">Caps (${capsQuantity} Quantity)</td><td>${capsTotal}</td></tr>`;
        invoiceHTML += `<tr><td colspan="4">TOTAL</td><td>${total}</td></tr>`;
        invoiceHTML += `<tr><td colspan="4">GST</td><td>${gst}</td></tr>`;
        invoiceHTML += `<tr><td colspan="4">SGST</td><td>${sgst}</td></tr>`;
        invoiceHTML += `<tr><td colspan="4">GRAND TOTAL (In Numbers)</td><td>${grandTotal}</td></tr>`;
        invoiceHTML += `<tr><td colspan="4">GRAND TOTAL (In Words)</td><td>${grandTotalInWords}</td></tr>`;

        invoiceHTML += '</tbody>';

        invoiceTable.innerHTML = invoiceHTML;
        invoiceTable.style.display = 'table';
    }

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

        if (number >= 10) {
            words += teens[number - 10] + ' ';
            number = 0;
        }

        if (number > 0) {
            words += units[number] + ' ';
        }

        return words.trim();
    }
});
