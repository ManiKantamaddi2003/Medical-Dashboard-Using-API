const apiUrl = 'https://fedskillstest.coalitiontechnologies.workers.dev';
const authHeader = 'Basic Y29hbGl0aW9uOnNraWxscy10ZXN0';

// Fetch patient data from API
function fetchPatientData() {
    fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const container = document.getElementById("patients-container");
        container.innerHTML = '<h4>Patients</h4>'; // Clear previous content

        // Create a div for each patient and add event listeners for clicks
        data.forEach((patient, index) => {
            const patientDiv = document.createElement('div');
            patientDiv.classList.add('patient-search');

            const patientInfo = document.createElement('div');
            patientInfo.classList.add('patient-info');

            // Create the image element for the patient's profile picture
            const patientImage = document.createElement('img');
            patientImage.src = patient.profile_picture || 'default-profile.png';
            patientImage.alt = 'Patient Image';
            patientImage.height = 50;
            patientImage.width = 50;
            patientInfo.appendChild(patientImage);

            // Create the patient name and details
            const name = document.createElement('span');
            name.innerHTML = `<b>${patient.name}</b><br>${patient.gender} ${patient.age}`;
            patientInfo.appendChild(name);

            patientDiv.appendChild(patientInfo);

            // Add event listener to update chart and values when patient is clicked
            patientDiv.addEventListener('click', () => {
                updateChartAndValues(patient);
                updateMetrics(patient);
                updatePatientDetails(patient);
                updateDiagnosticList(patient);
                updateLabReports(patient);
            });

            container.appendChild(patientDiv);
        });

        // Render the chart and values for the patient named "Jessica" initially
        const jessica = data.find(patient => patient.name === 'Jessica Taylor');
        if (jessica) {
            updateChartAndValues(jessica);
            updateMetrics(jessica);
            updatePatientDetails(jessica);
            updateDiagnosticList(jessica);
            updateLabReports(jessica);
        } else if (data.length > 0) {
            // Fallback to the 3rd patient in the list if Jessica is not found
            updateChartAndValues(data[2]);
            updateMetrics(data[2]);
            updatePatientDetails(data[2]);
            updateDiagnosticList(data[2]);
            updateLabReports(data[2]);
        }
    })
    .catch(error => {
        console.error("Error fetching patient data:", error);
    });
}

// Update chart and health data
function updateChartAndValues(patient) {
    const dates = patient.diagnosis_history.map(entry => `${entry.month} ${entry.year}`);
    const respiratoryRates = patient.diagnosis_history.map(entry => entry.respiratory_rate.value);
    const temperatures = patient.diagnosis_history.map(entry => entry.temperature.value);
    const heartRates = patient.diagnosis_history.map(entry => entry.heart_rate.value);

    document.getElementById('chart-title').textContent = `${patient.name}'s Health Data`;

    document.getElementById('respiratory-rate').textContent = `${respiratoryRates[respiratoryRates.length - 1]} RPM`;
    document.getElementById('temperature').textContent = `${temperatures[temperatures.length - 1]} °C`;
    document.getElementById('heart-rate').textContent = `${heartRates[heartRates.length - 1]} BPM`;

    const ctx = document.getElementById('lineChart').getContext('2d');
    if (window.chart) window.chart.destroy();

    window.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: `${patient.name}'s Respiratory Rate`,
                    data: respiratoryRates,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.1
                },
                {
                    label: `${patient.name}'s Temperature`,
                    data: temperatures,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    tension: 0.1
                },
                {
                    label: `${patient.name}'s Heart Rate`,
                    data: heartRates,
                    borderColor: 'rgba(255, 105, 180, 1)',
                    backgroundColor: 'rgba(255, 105, 180, 0.2)',
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: { title: { display: true, text: 'Month & Year' } },
                y: { title: { display: true, text: 'Values' } }
            }
        }
    });
}

// Update health metric levels
function updateMetrics(patient) {
    const lastRecord = patient.diagnosis_history[patient.diagnosis_history.length - 1];

    document.getElementById('respiratory-rate-level').textContent = lastRecord.respiratory_rate.levels || 'N/A';
    document.getElementById('temperature-level').textContent = lastRecord.temperature.levels || 'N/A';
    document.getElementById('heart-rate-level').textContent = lastRecord.heart_rate.levels || 'N/A';
}

// Update patient details
function updatePatientDetails(patient) {
    document.getElementById('patient-photo').src = patient.profile_picture || 'default-profile.png';
    document.getElementById('patient-name').textContent = patient.name || 'N/A';
    document.getElementById('dob').textContent = formatDate(patient.date_of_birth) || 'N/A';
    document.getElementById('gender').textContent = patient.gender || 'N/A';
    document.getElementById('contact-info').textContent = patient.phone_number || 'N/A';
    document.getElementById('emergency-contact').textContent = patient.emergency_contact || 'N/A';
    document.getElementById('insurance-provider').textContent = patient.insurance_type || 'N/A';
}

// Update diagnostic list
function updateDiagnosticList(patient) {
    const diagnosticTable = document.getElementById('diagnostic-table');
    diagnosticTable.innerHTML = ''; // Clear previous diagnostic table

    patient.diagnostic_list.forEach(diagnostic => {
        const row = diagnosticTable.insertRow();

        const problemCell = row.insertCell(0);
        problemCell.textContent = diagnostic.name || 'N/A';

        const descriptionCell = row.insertCell(1);
        descriptionCell.textContent = diagnostic.description || 'N/A';

        const statusCell = row.insertCell(2);
        statusCell.textContent = diagnostic.status || 'N/A';
    });
}

// Update lab reports
function updateLabReports(patient) {
    const labResultsContainer = document.getElementById('lab-report-container');
    labResultsContainer.innerHTML = ''; // Clear previous lab results

    patient.lab_results.forEach(labResult => {
        const row = document.createElement('tr');

        const labTestCell = document.createElement('td');
        labTestCell.textContent =  labResult || 'N/A';
        row.appendChild(labTestCell);

        const downloadCell = document.createElement('td');
        const downloadLink = document.createElement('a');
        downloadLink.href = labResult.download_url || '#';
        const downloadIcon = document.createElement('img');
        downloadIcon.src = 'download.svg';
        downloadIcon.alt = 'Download';
        downloadIcon.style.width = '20px';
        downloadIcon.style.height = '20px';
        downloadLink.appendChild(downloadIcon);
        downloadCell.appendChild(downloadLink);
        row.appendChild(downloadCell);

        labResultsContainer.appendChild(row);
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Intl.DateTimeFormat('en-US', options).format(date);
}

function getAverageHeartRate(age) {
    // Calculate average heart rate based on the patient's age
    if (age <= 1) {
        return (70 + 190) / 2; // Average for newborns
    } else if (age <= 11) {
        return (80 + 160) / 2; // Average for infants
    } else if (age <= 17) {
        return (70 + 120) / 2; // Average for children
    } else if (age <= 64) {
        return (60 + 100) / 2; // Average for adults
    } else {
        return (60 + 100) / 2; // Average for elderly
    }
}

function updateMetrics(patient) {
    const lastRecord = patient.diagnosis_history[patient.diagnosis_history.length - 1];

    // Define the average heart rate for comparison
    const averageHeartRate = 75; // Adjust this value as needed

    

    // Get the elements to update
    const heartRateElement = document.getElementById('heart-rate');
    const heartRateLevelElement = document.getElementById('heart-rate-level');

    // Update heart rate value and level
    heartRateElement.textContent = `${lastRecord.heart_rate.value} BPM`;
    heartRateLevelElement.textContent = lastRecord.heart_rate.levels;

    // Clear any existing arrow icon
    const existingArrow = heartRateLevelElement.querySelector('img');
    if (existingArrow) {
        heartRateLevelElement.removeChild(existingArrow);
    }

    // Add the arrow icon based on the heart rate
    const arrowIcon = document.createElement('img');
    arrowIcon.style.width = '10px'; // Adjust size as needed
    arrowIcon.style.height = '10px';
    arrowIcon.style.marginLeft = '10px'; // Add spacing from the level text

    if (lastRecord.heart_rate.value < averageHeartRate) {
        arrowIcon.src = 'ArrowDown.svg'; // Path to lower arrow icon
        arrowIcon.alt = 'Heart rate below average';
    } else if (lastRecord.heart_rate.value > averageHeartRate) {
        arrowIcon.src = 'ArrowUp.svg'; // Path to upper arrow icon
        arrowIcon.alt = 'Heart rate above average';
    } else {
        arrowIcon = null; // No arrow for normal rate
    }

    if (arrowIcon) {
        heartRateLevelElement.appendChild(arrowIcon); // Append the icon next to the level
    }
}


// Call the fetch function on page load
fetchPatientData();
