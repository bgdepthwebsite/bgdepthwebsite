document.addEventListener("DOMContentLoaded", function () {
  const generateDepthCellsButton = document.getElementById(
    "generateDepthCellsButton"
  );
  const generateInvoiceButton = document.getElementById(
    "generateInvoiceButton"
  );
  const clearButton = document.getElementById("clearButton");
  const depthCellsContainer = document.getElementById("depthCellsContainer");
  const invoiceTable = document.getElementById("invoiceTable");

  let depthCellsGenerated = false;

  generateDepthCellsButton.addEventListener("click", function () {
    generateDepthCells();
  });

  generateInvoiceButton.addEventListener("click", function () {
    if (depthCellsGenerated) {
      if (areDepthCellsValid() && areOtherFieldsValid()) {
        generateInvoice();
      } else {
        alert("Please fill in all fields.");
      }
    } else {
      alert("Please generate depth cells first.");
    }
  });

  clearButton.addEventListener("click", function () {
    clearAll();
  });
  function createInput(name, placeholder) {
    const input = document.createElement("input");
    input.type = "text"; // Use type 'text' to allow input of any characters
    input.name = name;
    input.placeholder = placeholder;
    input.required = true;

    // Add event listener to allow only digits (0-9)
    input.addEventListener("input", function () {
      // Remove non-digit characters using regular expression
      input.value = input.value.replace(/\D/g, "");
    });

    return input;
  }
  function generateDepthCells() {
    const numberOfCells = parseInt(document.getElementById("depthCells").value);
    if (isNaN(numberOfCells) || numberOfCells < 1 || numberOfCells > 10) {
      alert("Please enter a valid number of depth cells (1-10).");
      return;
    }
    depthCellsContainer.innerHTML = ""; // Clear previous inputs

    for (let i = 0; i < numberOfCells; i++) {
      const rowDiv = document.createElement("div");
      rowDiv.classList.add("depth-rate-row");

      const depthInput = createInput(`depth${i}`, `Depth ${i + 1}`);
      const rateInput = createInput(`rate${i}`, `Rate ${i + 1}`);

      rowDiv.appendChild(depthInput);
      rowDiv.appendChild(rateInput);

      depthCellsContainer.appendChild(rowDiv);
    }

    depthCellsGenerated = true;
  }

  function createInput(name, placeholder) {
    const input = document.createElement("input");
    input.type = "number";
    input.name = name;
    input.placeholder = placeholder;
    input.required = true;

    input.addEventListener("input", function () {
      if (input.value.trim() !== "") {
        input.classList.remove("empty");
      } else {
        input.classList.add("empty");
      }
    });

    return input;
  }

  function areDepthCellsValid() {
    const depthInputs = document.querySelectorAll(
      '.depth-rate-row input[name^="depth"]'
    );
    const rateInputs = document.querySelectorAll(
      '.depth-rate-row input[name^="rate"]'
    );
    let allValid = true;

    depthInputs.forEach((input) => {
      if (input.value.trim() === "") {
        input.classList.add("empty");
        allValid = false;
      } else {
        input.classList.remove("empty");
      }
    });

    rateInputs.forEach((input) => {
      if (input.value.trim() === "") {
        input.classList.add("empty");
        allValid = false;
      } else {
        input.classList.remove("empty");
      }
    });

    return allValid;
  }

  function areOtherFieldsValid() {
    const fields = [
      "casingPipeQuantity",
      "casingPipeRate",
      "capsQuantity",
      "capsRate",
      "gst",
      "sgst",
    ];

    let allValid = true;

    fields.forEach((fieldId) => {
      const field = document.getElementById(fieldId);
      if (field.value.trim() === "") {
        field.classList.add("empty");
        allValid = false;
      } else {
        field.classList.remove("empty");
      }
    });

    return allValid;
  }

  function generateInvoice() {
    const depthInputs = document.querySelectorAll(
      '.depth-rate-row input[name^="depth"]'
    );
    const rateInputs = document.querySelectorAll(
      '.depth-rate-row input[name^="rate"]'
    );
    const casingPipeQuantity =
      parseInt(document.getElementById("casingPipeQuantity").value) || 0;
    const casingPipeRate =
      parseInt(document.getElementById("casingPipeRate").value) || 0;
    const capsQuantity =
      parseInt(document.getElementById("capsQuantity").value) || 0;
    const capsRate = parseInt(document.getElementById("capsRate").value) || 0;
    const gstRate = parseFloat(document.getElementById("gst").value) || 0;
    const sgstRate = parseFloat(document.getElementById("sgst").value) || 0;

    let total = 0;
    let invoiceItems = [];

    depthInputs.forEach((depthInput, index) => {
      const depth = parseInt(depthInput.value.trim()) || 0; // Treat empty as 0
      const rate = parseInt(rateInputs[index].value.trim()) || 0; // Treat empty as 0
      const itemTotal = depth * rate;

      invoiceItems.push({
        description: `Depth cell ${index + 1}`,
        depth: depth,
        rate: rate,
        total: itemTotal,
      });

      total += itemTotal;
    });

    const casingPipeTotal = casingPipeQuantity * casingPipeRate;
    const capsTotal = capsQuantity * capsRate;

    total += casingPipeTotal + capsTotal;

    const gst = total * (gstRate / 100);
    const sgst = total * (sgstRate / 100);
    const grandTotal = total + gst + sgst;
    const grandTotalInWords = convertToWords(Math.floor(grandTotal));

    let invoiceHTML =
      "<thead><tr><th>SL No</th><th>Description</th><th>Depth</th><th>Rate</th><th>Total</th></tr></thead><tbody>";

    invoiceItems.forEach((item, index) => {
      invoiceHTML += `<tr><td>${index + 1}</td><td>${
        item.description
      }</td><td>${item.depth}</td><td>${item.rate}</td><td>${
        item.total
      }</td></tr>`;
    });

    // Add rows for casing pipe and caps
    invoiceHTML += `<tr><td colspan="4">Casing Pipe (${casingPipeQuantity} Quantity)</td><td>${casingPipeTotal}</td></tr>`;
    invoiceHTML += `<tr><td colspan="4">Caps (${capsQuantity} Quantity)</td><td>${capsTotal}</td></tr>`;

    // Add total, GST, SGST, grand total rows
    invoiceHTML += `<tr><td colspan="4">TOTAL</td><td>${total}</td></tr>`;
    invoiceHTML += `<tr><td colspan="4">GST (${gstRate}%)</td><td>${gst.toFixed(
      2
    )}</td></tr>`;
    invoiceHTML += `<tr><td colspan="4">SGST (${sgstRate}%)</td><td>${sgst.toFixed(
      2
    )}</td></tr>`;
    invoiceHTML += `<tr><td colspan="4">GRAND TOTAL (In Numbers)</td><td>${grandTotal.toFixed(
      2
    )}</td></tr>`;
    invoiceHTML += `<tr><td colspan="4">GRAND TOTAL (In Words)</td><td>${grandTotalInWords}</td></tr>`;

    invoiceHTML += "</tbody>";

    invoiceTable.innerHTML = invoiceHTML;
    invoiceTable.style.display = "table";
  }

  function convertToWords(number) {
    const units = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    let words = "";

    if (number >= 1000) {
      words += convertToWords(Math.floor(number / 1000)) + " Thousand ";
      number %= 1000;
    }

    if (number >= 100) {
      words += units[Math.floor(number / 100)] + " Hundred ";
      number %= 100;
    }

    if (number >= 20) {
      words += tens[Math.floor(number / 10)] + " ";
      number %= 10;
    }

    if (number >= 10) {
      words += teens[number - 10] + " ";
      number = 0;
    }

    if (number > 0) {
      words += units[number] + " ";
    }

    return words.trim();
  }

  function clearAll() {
    document.getElementById("depthCells").value = "";
    depthCellsContainer.innerHTML = "";
    document.getElementById("casingPipeQuantity").value = "";
    document.getElementById("casingPipeRate").value = "";
    document.getElementById("capsQuantity").value = "";
    document.getElementById("capsRate").value = "";
    document.getElementById("gst").value = "";
    document.getElementById("sgst").value = "";
    invoiceTable.innerHTML = "";
    invoiceTable.style.display = "none";
    depthCellsGenerated = false;

    const allFields = document.querySelectorAll("input");
    allFields.forEach((field) => {
      field.classList.remove("empty");
    });
  }

  // Apply initial event listeners for specific input fields to handle empty state
  const inputFields = [
    "depthCells",
    "casingPipeQuantity",
    "casingPipeRate",
    "capsQuantity",
    "capsRate",
    "gst",
    "sgst",
  ];

  inputFields.forEach((fieldId) => {
    const field = document.getElementById(fieldId);

    if (field) {
      field.addEventListener("input", function () {
        if (field.value.trim() !== "") {
          field.classList.remove("empty");
        } else {
          field.classList.add("empty");
        }
      });
    }
  });
});
