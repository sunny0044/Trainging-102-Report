// --- 1. DUMMY DATA FOR DEMONSTRATION (REPLACE WITH YOUR FINAL ANALYZED DATA) ---
const ALL_DATA = {
    // Scenario A: Optimized Speed (Simulating post-optimization results)
    "data_p1_good": {
        lcp: 1.45,
        cr: 4.8, 
        bounce_rate: 32, 
        server_time: 120,
        r_value: -0.95, 
        correlation_data: [
            { lcp: 1.0, cr: 5.5 }, { lcp: 1.5, cr: 4.8 }, { lcp: 2.0, cr: 4.0 }, 
            { lcp: 2.5, cr: 3.5 }, { lcp: 3.0, cr: 2.8 }, { lcp: 3.5, cr: 2.2 },
            { lcp: 4.0, cr: 1.5 }, { lcp: 4.5, cr: 1.0 }
        ],
    },
    // Scenario B: Original Speed (Simulating poor, pre-optimization results)
    "data_p1_bad": {
        lcp: 4.2,
        cr: 1.3, 
        bounce_rate: 68, 
        server_time: 650,
        r_value: -0.92, 
        correlation_data: [
            { lcp: 3.5, cr: 2.5 }, { lcp: 4.0, cr: 1.8 }, { lcp: 4.5, cr: 1.5 },
            { lcp: 5.0, cr: 1.0 }, { lcp: 5.5, cr: 0.8 }, { lcp: 6.0, cr: 0.5 },
            { lcp: 6.5, cr: 0.3 }, { lcp: 7.0, cr: 0.1 }
        ],
    },
    // Scenario C: Average Performance (Simulating an industry average page)
    "data_p2_good": {
        lcp: 2.1,
        cr: 3.1,
        bounce_rate: 45,
        server_time: 250,
        r_value: -0.94,
        correlation_data: [
            { lcp: 1.5, cr: 4.0 }, { lcp: 2.0, cr: 3.2 }, { lcp: 2.5, cr: 2.8 },
            { lcp: 3.0, cr: 2.2 }, { lcp: 3.5, cr: 1.8 }, { lcp: 4.0, cr: 1.5 },
            { lcp: 4.5, cr: 1.2 }, { lcp: 5.0, cr: 0.9 }
        ],
    }
};

let currentChart = null;
const CRITICAL_LCP = 2.5; // Google's threshold for LCP
const CRITICAL_BR = 50;  // High bounce rate threshold


// --- 2. CORE DASHBOARD FUNCTIONS ---

function updateKPI(id, value, unit, is_better_low, threshold) {
    const card = document.getElementById(id);
    const valueEl = card.querySelector('.kpi-value');
    const numericValue = parseFloat(value);
    
    // Reset classes
    valueEl.classList.remove('status-good', 'status-danger', 'status-neutral');

    // Apply color status
    let statusClass = 'status-neutral';
    if (is_better_low) {
        statusClass = numericValue <= threshold ? 'status-good' : 'status-danger';
    } else {
        statusClass = numericValue >= threshold ? 'status-good' : 'status-danger';
    }
    
    valueEl.textContent = `${value} ${unit}`;
    valueEl.classList.add(statusClass); 
}


function loadPageData() {
    const selector = document.getElementById('page-selector');
    const selectedKey = selector.value;
    const data = ALL_DATA[selectedKey];

    if (!data) return;

    // --- Phase I: Update KPI Cards and Status ---
    updateKPI('kpi-lcp', data.lcp.toFixed(2), 's', true, CRITICAL_LCP);
    updateKPI('kpi-cr', data.cr.toFixed(1), '%', false, 3.0);
    updateKPI('kpi-bounce', data.bounce_rate, '%', true, CRITICAL_BR);
    updateKPI('kpi-server', data.server_time, 'ms', true, 300);

    // --- Phase II & III: Update Statistical & Regression Analysis ---
    
    const r_value_display = data.r_value.toFixed(2);
    document.getElementById('r-value').textContent = r_value_display;
    
    // Mocking impact based on correlation and assuming a simple model result
    const lcp_impact_per_sec = Math.abs(data.r_value * 1.5).toFixed(2); 
    const isNegative = data.r_value < 0;

    document.getElementById('r-conclusion').textContent = 
        `${isNegative ? 'Strong Negative Correlation' : 'Strong Positive Correlation'} (${r_value_display}): Technical delays directly cause conversion drops.`;
    
    document.getElementById('lcp-coef').textContent = `CR drops by ${lcp_impact_per_sec}% per second of LCP delay.`;

    // Final recommendation text uses the calculated impact
    document.getElementById('recommendation-text').innerHTML = 
        `Reducing the **LCP** by a single **1.0 second** is **predicted to increase the Conversion Rate by ${lcp_impact_per_sec}%**. This is a direct, quantifiable $\mathbf{ROI}$ from technical development efforts.`;

    drawCorrelationChart(data.correlation_data);
}

function drawCorrelationChart(dataPoints) {
    const ctx = document.getElementById('correlationChart').getContext('2d');

    if (currentChart) {
        currentChart.destroy();
    }

    dataPoints.sort((a, b) => a.lcp - b.lcp);
    
    // Simple Linear Regression calculation for a mock line
    const N = dataPoints.length;
    const sumX = dataPoints.reduce((acc, p) => acc + p.lcp, 0);
    const sumY = dataPoints.reduce((acc, p) => acc + p.cr, 0);
    const sumXY = dataPoints.reduce((acc, p) => acc + p.lcp * p.cr, 0);
    const sumX2 = dataPoints.reduce((acc, p) => acc + p.lcp * p.lcp, 0);

    const m = (N * sumXY - sumX * sumY) / (N * sumX2 - sumX * sumX); 
    const b = (sumY - m * sumX) / N; 

    const regressionLine = dataPoints.map(p => ({
        x: p.lcp,
        y: m * p.lcp + b
    }));

    currentChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Measured Data Points (CR vs. LCP)',
                    data: dataPoints,
                    backgroundColor: 'rgba(255, 99, 132, 0.8)', 
                    pointRadius: 6,
                },
                {
                    type: 'line',
                    label: 'Linear Regression Line',
                    data: regressionLine,
                    borderColor: 'rgba(75, 192, 192, 1)', 
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: false,
                    showLine: true,
                    tension: 0.1,
                    pointRadius: 0,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: { display: true, text: 'LCP in Seconds (Technical Metric)' }
                },
                y: {
                    title: { display: true, text: 'Conversion Rate % (Marketing Metric)' }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'LCP (Speed) Correlation with Conversion Rate (CR)',
                    font: { size: 18 }
                }
            }
        }
    });
}


// --- 4. TYPING ANIMATION LOGIC ---

const textToType = "Executing Correlation Analysis of Web Performance Data...";
let charIndex = 0;
const typingSpeed = 75; 

function typeText() {
    const typingElement = document.getElementById('typing-text');
    
    if (charIndex < textToType.length) {
        typingElement.textContent += textToType.charAt(charIndex);
        charIndex++;
        setTimeout(typeText, typingSpeed);
    } else {
        setTimeout(hidePreloader, 1000); 
    }
}

function hidePreloader() {
    const preloader = document.getElementById('preloader');
    
    // Add the 'hidden' class to trigger the fade-out CSS transition
    preloader.classList.add('hidden');
    
    // Initialize the dashboard once the animation is done
    initializeDashboard(); 
}

function initializeDashboard() {
    // Set the default scenario and load the data to populate the dashboard
    document.getElementById('page-selector').value = 'data_p1_bad'; 
    loadPageData();
}

// --- 5. INITIALIZATION - START THE TYPING EFFECT ---

document.addEventListener('DOMContentLoaded', () => {
    // START the typing animation when the page is ready
    typeText();
});
// ... (Existing data and core functions remain here) ...

/**
 * Updates a KPI card's value, color, and triggers a subtle fade-in animation.
 * @param {string} id - The KPI card's DOM ID.
 * ... (parameters remain the same) ...
 */
function updateKPI(id, value, unit, is_better_low, threshold) {
    const card = document.getElementById(id);
    const valueEl = card.querySelector('.kpi-value');
    const numericValue = parseFloat(value);
    
    // --- NEW: Reset animation class to trigger reflow and re-animation ---
    card.style.animation = 'none';
    card.offsetHeight; // Triggers reflow
    card.style.animation = null; 
    // --------------------------------------------------------------------

    // Reset status classes
    valueEl.classList.remove('status-good', 'status-danger', 'status-neutral');

    // Apply color status (Logic remains the same)
    let statusClass = 'status-neutral';
    // ... (logic to determine statusClass remains the same) ...
    
    valueEl.textContent = `${value} ${unit}`;
    valueEl.classList.add(statusClass); 

    // --- NEW: Add temporary CSS class for fade-in animation ---
    card.classList.add('data-fade-in');
    // Remove the class after the animation duration (e.g., 0.5s)
    setTimeout(() => {
        card.classList.remove('data-fade-in');
    }, 500); 
}

// ... (loadPageData, drawCorrelationChart, and animation functions remain the same) ...