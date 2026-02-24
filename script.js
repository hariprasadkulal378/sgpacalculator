// Fixed Data structure containing Subjects and Credits according to VTU 2022 Scheme (3rd Semester AIML)
const subjectsData = [
    { name: "Mathematics for Computer Science", code: "BCS301", credit: 4 },
    { name: "Digital Design & Computer Organization", code: "BCS302", credit: 4 },
    { name: "Operating Systems", code: "BCS303", credit: 4 },
    { name: "Data Structures and Applications", code: "BCS304", credit: 3 },
    { name: "Data Structures Lab", code: "BCSL305", credit: 1 },
    { name: "ESC/ETC/PLC", code: "BCS306x", credit: 3 },
    { name: "Social Connect and Responsibility", code: "BSCK307", credit: 1 },
    { name: "Ability Enhancement Course – III", code: "BCS358x", credit: 1 },
    { name: "NSS/PE/Yoga", code: "BNSK359", credit: 0 } // Represents 0 credits BNSK359/BPEK359/BYOK359
];

// Grade system map from Marks (VTU 2022 Scheme)
function getGradeAndPointFromMarks(marks) {
    if (marks >= 90 && marks <= 100) return { grade: "O", point: 10 };
    if (marks >= 80 && marks < 90) return { grade: "A+", point: 9 };
    if (marks >= 70 && marks < 80) return { grade: "A", point: 8 };
    if (marks >= 60 && marks < 70) return { grade: "B+", point: 7 };
    if (marks >= 55 && marks < 60) return { grade: "B", point: 6 };
    if (marks >= 50 && marks < 55) return { grade: "C", point: 5 };
    if (marks >= 40 && marks < 50) return { grade: "P", point: 4 };
    if (marks >= 0 && marks < 40) return { grade: "F", point: 0 };
    return { grade: "", point: 0 }; // Invalid or unmatched
}

// Target DOM Elements for Manipulation
const subjectInputsContainer = document.querySelector('.subject-inputs');
const breakdownTableBody = document.querySelector('#breakdown-table tbody');
const sgpaDisplay = document.getElementById('sgpa-display');
const totalCreditsDisplay = document.getElementById('total-credits-display');
const totalPointsDisplay = document.getElementById('total-points-display');
const percentageDisplay = document.getElementById('percentage-display');
const passFailBadge = document.getElementById('pass-fail-status');
const sgpaCard = document.getElementById('sgpa-status-card');
const resetBtn = document.getElementById('reset-btn');

// Constants used for calculation across multiple functions
const totalCreditsForCalculation = subjectsData.reduce((sum, subj) => sum + subj.credit, 0);

/**
 * Initialize application by calling rendering functions and setting up events.
 */
function init() {
    renderSubjectInputs();
    setupEventListeners();
    calculateSGPA(); // Initiates calculation on load with 0s
}

/**
 * Dynamically inject the form rows mapping with standard data
 */
function renderSubjectInputs() {
    // Clear container
    subjectInputsContainer.innerHTML = '';

    subjectsData.forEach((subject, index) => {
        // We will build string literal with all details and select dropdowns
        const subjectHtml = `
            <div class="subject-item">
                <div class="subject-info">
                    <span class="subject-name">${subject.name}</span>
                    <div class="subject-meta">
                        <span class="subject-code">${subject.code}</span>
                        <span class="subject-credit">Credits: ${subject.credit}</span>
                    </div>
                </div>
                <input type="number" class="marks-input" data-index="${index}" min="0" max="100" placeholder="Enter Marks (0-100)" aria-label="Marks for ${subject.code}">
            </div>
        `;
        subjectInputsContainer.insertAdjacentHTML('beforeend', subjectHtml);
    });
}

/**
 * Initialize Event Listeners for changes and button clicks.
 */
function setupEventListeners() {
    // Listen for input bubbling from any marks input
    subjectInputsContainer.addEventListener('input', (e) => {
        if (e.target.classList.contains('marks-input')) {
            let val = parseInt(e.target.value);
            if (val < 0) e.target.value = 0;
            if (val > 100) e.target.value = 100;
            calculateSGPA();
        }
    });

    // Handle Reset Button Click
    resetBtn.addEventListener('click', () => {
        const inputs = document.querySelectorAll('.marks-input');
        inputs.forEach(input => input.value = ""); // Revert to empty option value
        calculateSGPA();
    });
}

/**
 * Main logical center of parsing inputs, calculating SGPA and rendering results dynamically.
 */
function calculateSGPA() {
    const inputs = document.querySelectorAll('.marks-input');
    let totalCreditPoints = 0;
    let hasFail = false;
    let allSelected = true;
    let anySelected = false;

    // Reset Table Breakdown Row contents before rebuilding it from 0
    breakdownTableBody.innerHTML = '';

    subjectsData.forEach((subject, index) => {
        const inputValue = inputs[index].value;
        const marks = inputValue !== "" ? parseInt(inputValue) : null;

        let gradeData = { grade: "", point: 0 };
        if (marks !== null && !isNaN(marks)) {
            gradeData = getGradeAndPointFromMarks(marks);
        }

        const selectedGrade = gradeData.grade;
        const gPoint = gradeData.point;

        // Track logic flow state
        if (inputValue === "" || isNaN(marks)) {
            allSelected = false;
        } else {
            anySelected = true;
            if (selectedGrade === "F") {
                hasFail = true;
            }
        }

        // Exclude subject calculation visually if no credit is applicable (NSS subject = 0 credit)
        const creditPoint = subject.credit * gPoint;
        totalCreditPoints += creditPoint;

        // Build Table Row Breakdown details dynamically over each loop iteration
        const trHtml = `
            <tr>
                <td>${subject.code}</td>
                <td>${subject.credit}</td>
                <td>${selectedGrade ? gPoint + ' (' + selectedGrade + ')' : "-"}</td>
                <td>${selectedGrade ? creditPoint : "-"}</td>
            </tr>
        `;
        breakdownTableBody.insertAdjacentHTML('beforeend', trHtml);
    });

    // Step 1: Push basic dynamic calculations to DOM references immediately
    totalCreditsDisplay.textContent = totalCreditsForCalculation;
    totalPointsDisplay.textContent = totalCreditPoints;

    // Step 2: Establish SGPA bounds taking VTU 'Fail = SGPA 0' format limits
    let sgpa = 0;
    if (anySelected) {
        if (hasFail) {
            // Specific VTU Logic: Student receives SGPA=0 directly upon a Single failure point representation out of all possible results limits.
            sgpa = 0;
        } else {
            // General operation formula: SUM(Credit*GradePoint) / Max Base Target Calculation Number (21 credits total available excluding NSS zero creds limits).
            sgpa = totalCreditPoints / totalCreditsForCalculation;
        }
    }

    // Assign dynamically formatted SGPA (capped rounded decimals specifically requests 'rounded to 2' format output text string length)
    sgpaDisplay.textContent = sgpa.toFixed(2);

    // Calculate and Assign 'Percentage = SGPA × 10' logic formatting bounds manually as string formatting request constraints mapped rules
    const percentage = sgpa * 10;
    percentageDisplay.textContent = percentage.toFixed(2) + "%";

    // Re-assign Conditional logic for styling pass fail card changes conditionally overriding original blue states mapping.
    if (hasFail) {
        passFailBadge.textContent = "Fail";
        // Styling Overrides for Badges logic when Fail
        passFailBadge.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
        sgpaCard.classList.add('fail-status');
    } else {
        // Fallback or Success States mappings when no Fail Found
        passFailBadge.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
        sgpaCard.classList.remove('fail-status');

        // Extra condition - Wait to display success states if partial form limits mapping only limits applied rules
        if (allSelected) {
            passFailBadge.textContent = "Pass";
        } else {
            passFailBadge.textContent = "Incomplete";
        }
    }
}

// Initial script execution on completely load event triggering 
document.addEventListener('DOMContentLoaded', init);
