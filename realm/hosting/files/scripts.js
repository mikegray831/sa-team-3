function userAction() {
  let searchString = document.getElementById("myInput").value;
  let txt = "";
  console.log(searchString);
  let webhook_url =
    "https://us-east-1.aws.webhooks.mongodb-realm.com/api/client/v2.0/app/messaging-tqhrx/service/WebServices/incoming_webhook/webhook0";
  let url = webhook_url + "?arg=" + searchString;
  function handleResponse(response) {
    if (!response.ok) {
      console.log(response);
      txt += `<br><br><br><b><h3>Sadly you have an error. Status: ${response.status}`;
      if (response.json.length === 0) {
        txt += `<br><br>Make sure to search for some type of drug. Don't leave your search box empty.</h3></b>`;
      }
      document.getElementById("results").innerHTML = txt;
      throw new Error(response.statusText);
    }
    return response.json();
  }
  function renderPatientData(patientJSON) {
    if (patientJSON["$undefined"] === true) {
      console.log("NO FETCH RESULT");
      txt += `<br><br><br><b><h3>IMPLEMENT FULL TEXT SEARCH AGGREGATION TO SEARCH PATIENT COLLECTION</h3></b>`;
    } else {
      console.log("FETCHED RESULT... ");
      console.log("Fetched array has " + patientJSON.length + " entries");
      if (patientJSON.length !== 0) {
        txt = buildPatientList(patientJSON);
      } else {
        txt += `<br><br><br><b><h3>Sadly you have no search results. Try checking your spelling or changing your search terms.</h3></b>`;
      }
    }
    document.getElementById("results").innerHTML = txt;
  }
  fetch(url)
    .then(handleResponse)
    .then(renderPatientData)
    .catch(function (error) {
      console.error("Whoopsie!", error);
    });
}
function buildPatientList(patients) {
  // HELPER FUNCTION FOR USER ACTION
  let txt = "";
  patients.forEach((patient) => {
    txt += `
            <br> <b><p style="color:black">${patient.title}</p></b>
            <br> Prescription: ${patient.prescription}
            <br> HealthProvider: ${patient.healthProvider}
            <br> <b>Score:  ${patient.score["$numberDouble"]} </b>
            <br> <br>
          `;
    patient.highlight.forEach((highlight) => {
      highlight.texts.forEach((text) => {
        if (text.type === "hit") {
          txt += `<b><mark> ${text.value} </mark></b>`;
        } else {
          txt += text.value;
        }
      });
    });
    txt += "<hr>";
  });
  return txt;
}
