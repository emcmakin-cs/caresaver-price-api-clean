document.addEventListener("DOMContentLoaded", function () {
  var button = document.getElementById("checkPriceButton");
  var zipInput = document.getElementById("zipInput");
  var procedureInput = document.getElementById("procedureInput");
  var resultBox = document.getElementById("priceResult");

  if (!button || !zipInput || !procedureInput || !resultBox) return;

  button.addEventListener("click", async function () {
    var zip = zipInput.value.trim();
    var procedure = procedureInput.value;

    if (!/^[0-9]{5}$/.test(zip)) {
      resultBox.style.display = "block";
      resultBox.innerHTML = "Please enter a valid 5-digit ZIP code.";
      return;
    }

    if (!procedure) {
      resultBox.style.display = "block";
      resultBox.innerHTML = "Please select a procedure.";
      return;
    }

    resultBox.style.display = "block";
    resultBox.innerHTML = "Checking prices...";

    try {
      var response = await fetch("https://caresaver-price-api-clean.vercel.app/api/price-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zip: zip, procedure: procedure })
      });

      var data = await response.json();

      if (!response.ok) {
        resultBox.innerHTML = "We do not have enough pricing data for that ZIP code yet.";
        return;
      }

      resultBox.innerHTML =
        '<div style="border:1px solid #dfe9df;border-radius:20px;padding:24px;background:#ffffff;">' +
        '<p style="margin:0 0 6px;color:#2f6b4f;font-weight:600;">Price preview</p>' +
        '<h3 style="margin:0 0 16px;color:#173f2f;font-family:Georgia,serif;">' + data.procedure + ' near ' + data.zip + '</h3>' +
        '<p>Typical lower price: <strong>$' + Number(data.low_price).toLocaleString() + '</strong></p>' +
        '<p>Typical higher price: <strong>$' + Number(data.high_price).toLocaleString() + '</strong></p>' +
        '<p>Potential price spread: <strong>$' + Number(data.price_spread).toLocaleString() + '</strong></p>' +
        '<p style="font-size:14px;color:#555;">Based on ' + data.provider_count + ' providers in your area.</p>' +
        '</div>';
    } catch (error) {
      resultBox.innerHTML = "Something went wrong while checking prices.";
    }
  });
});