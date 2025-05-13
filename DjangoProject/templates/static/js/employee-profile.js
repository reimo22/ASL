
    // Toggle between Profile and Filings
    document.getElementById("employeeProfiles").addEventListener("click", function() {
        // Set active sidebar option
        document.querySelectorAll('.sidebar-option').forEach(opt => {
            opt.classList.remove('active');
        });
        this.classList.add('active');
        
        // Show profile content
        document.getElementById("profile-content").classList.add('active');
        document.getElementById("filings-content").classList.remove('active');
    });

    document.getElementById("employeeFilings").addEventListener("click", function() {
        // Set active sidebar option
        document.querySelectorAll('.sidebar-option').forEach(opt => {
            opt.classList.remove('active');
        });
        this.classList.add('active');
        
        // Show filings content
        document.getElementById("profile-content").classList.remove('active');
        document.getElementById("filings-content").classList.add('active');
    });

    // New Filing button shows the modal
    document.getElementById("newFilingBtn").addEventListener("click", function() {
        document.getElementById("filingModal").style.display = "flex";
    });

    // Close modal when clicking outside
    document.getElementById("filingModal").addEventListener("click", function(event) {
        if (event.target === this) {
            this.style.display = "none";
        }
    });

    // Close the modals
    document.getElementById("closeOvertimeBtn").addEventListener("click", function() {
        document.getElementById("overtimeModal").style.display = "none";
    });
    
    document.getElementById("closeLeaveBtn").addEventListener("click", function() {
        document.getElementById("leaveModal").style.display = "none";
    });
    
    document.getElementById("closeObBtn").addEventListener("click", function() {
        document.getElementById("obModal").style.display = "none";
    });
    
    // Close modals when clicking outside
    document.getElementById("overtimeModal").addEventListener("click", function(event) {
        if (event.target === this) {
            this.style.display = "none";
        }
    });
    
    document.getElementById("leaveModal").addEventListener("click", function(event) {
        if (event.target === this) {
            this.style.display = "none";
        }
    });
    
    document.getElementById("obModal").addEventListener("click", function(event) {
        if (event.target === this) {
            this.style.display = "none";
        }
    });
    
    // Overtime form submission
    document.querySelector("#overtimeModal .submit-btn").addEventListener("click", function() {
        const reason = document.querySelector("#overtimeModal .reason-input").value;
        if (reason.trim() === "") {
            alert("Please provide a reason for overtime");
        } else {
            alert("Overtime application submitted successfully!");
            document.getElementById("overtimeModal").style.display = "none";
        }
    });
    
    // Leave form submission
    document.getElementById("leaveSubmitBtn").addEventListener("click", function() {
        const reason = document.getElementById("leaveReason").value;
        if (reason.trim() === "") {
            alert("Please provide a reason for leave");
        } else {
            alert("Paid Leave application submitted successfully!");
            document.getElementById("leaveModal").style.display = "none";
        }
    });
    
    // OB form submission
    document.getElementById("obSubmitBtn").addEventListener("click", function() {
        const reason = document.getElementById("obReason").value;
        if (reason.trim() === "") {
            alert("Please provide a reason for official business");
        } else {
            alert("Official Business application submitted successfully!");
            document.getElementById("obModal").style.display = "none";
        }
    });
    
    // Multiple dates checkbox event for leave
    document.getElementById('leaveMultipleDates').addEventListener('change', function() {
        if (!this.checked) {
            // If unchecked, keep only the first selected date
            const activeDays = document.querySelectorAll('#leaveCalendarDays .day.active');
            if (activeDays.length > 1) {
                for (let i = 1; i < activeDays.length; i++) {
                    activeDays[i].classList.remove('active');
                }
            }
        }
    });

    // Multiple dates checkbox event for OB
    document.getElementById('obMultipleDates').addEventListener('change', function() {
        if (!this.checked) {
            // If unchecked, keep only the first selected date
            const activeDays = document.querySelectorAll('#obCalendarDays .day.active');
            if (activeDays.length > 1) {
                for (let i = 1; i < activeDays.length; i++) {
                    activeDays[i].classList.remove('active');
                }
            }
        }
    });
// Create a variable to track the current date - use today's date
let currentDate = new Date(); // Use current date instead of hardcoded date

// Function to update the calendar header
function updateCalendarHeader(containerId) {
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    
    // Get the calendar container's header
    let headerElement;
    
    if (containerId === 'overtimeModal') {
        headerElement = document.querySelector('#overtimeModal .calendar-section h3');
    } else {
        headerElement = document.querySelector(`#${containerId}`).closest('.form-row').querySelector('.calendar-section h3');
    }
    
    if (headerElement) {
        const month = monthNames[currentDate.getMonth()];
        const year = currentDate.getFullYear();
        headerElement.innerHTML = `${month} ${year} <span class="dropdown-arrow">▼</span>`;
        
        // Add navigation controls if they don't exist
        if (!headerElement.querySelector('.calendar-nav')) {
            const navControls = document.createElement('div');
            navControls.className = 'calendar-nav';
            navControls.style.display = 'inline-block';
            navControls.style.marginLeft = '10px';
            
            const prevBtn = document.createElement('span');
            prevBtn.textContent = '◀';
            prevBtn.style.cursor = 'pointer';
            prevBtn.style.marginRight = '10px';
            prevBtn.onclick = function(e) {
                e.stopPropagation();
                navigateMonth(-1, containerId);
            };
            
            const nextBtn = document.createElement('span');
            nextBtn.textContent = '▶';
            nextBtn.style.cursor = 'pointer';
            nextBtn.onclick = function(e) {
                e.stopPropagation();
                navigateMonth(1, containerId);
            };
            
            navControls.appendChild(prevBtn);
            navControls.appendChild(nextBtn);
            headerElement.appendChild(navControls);
        }
    }
}

// Function to navigate to previous/next month
function navigateMonth(direction, containerId) {
    // Update current date to previous/next month
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1);
    
    // Update the calendar
    if (containerId === 'overtimeModal') {
        generateOvertimeCalendar();
    } else {
        generateCalendar(containerId);
    }
    
    // Update the header
    updateCalendarHeader(containerId);
}

// Modified generateCalendar function with the current date
function generateCalendar(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    // Get first day of month (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    
    // Get number of days in month
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    
    // Empty cells for days before the 1st
    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'day empty';
        container.appendChild(emptyDay);
    }
    
    // Create days of the month
    for (let i = 1; i <= daysInMonth; i++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'day';
        dayElement.textContent = i;
        
        // Highlight current day (today's date)
        const today = new Date();
        if (i === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear()) {
            dayElement.classList.add('active');
        }
        
        // Add click event
        dayElement.addEventListener('click', function() {
            const multipleSelect = (containerId === 'leaveCalendarDays') ? 
                document.getElementById('leaveMultipleDates').checked : 
                document.getElementById('obMultipleDates').checked;
            
            if (!multipleSelect) {
                // Remove active class from all days
                container.querySelectorAll('.day').forEach(d => {
                    d.classList.remove('active');
                });
            }
            
            // Toggle active class for the clicked day
            this.classList.toggle('active');
        });
        
        container.appendChild(dayElement);
    }
}

// Special function for the overtime calendar which has a different structure
function generateOvertimeCalendar() {
    const container = document.querySelector('#overtimeModal .calendar-days');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Get first day of month (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    
    // Get number of days in month
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    
    // Empty cells for days before the 1st
    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'day empty';
        container.appendChild(emptyDay);
    }
    
    // Create days of the month
    for (let i = 1; i <= daysInMonth; i++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'day';
        dayElement.textContent = i;
        
        // Highlight today's date
        const today = new Date();
        if (i === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear()) {
            dayElement.classList.add('active');
        }
        
        // Add click event
        dayElement.addEventListener('click', function() {
            document.querySelectorAll('#overtimeModal .day').forEach(d => d.classList.remove('active'));
            this.classList.add('active');
        });
        
        container.appendChild(dayElement);
    }
}

// Initialize all calendars
function initializeCalendars() {
    // Set up event listeners for modals to initialize calendars when they open
    document.getElementById("leaveApp").addEventListener("click", function() {
        document.getElementById("filingModal").style.display = "none";
        document.getElementById("leaveModal").style.display = "flex";
        
        // Reset current date to today when opening new modal
        currentDate = new Date();
        generateCalendar('leaveCalendarDays');
        updateCalendarHeader('leaveCalendarDays');
    });

    document.getElementById("obApp").addEventListener("click", function() {
        document.getElementById("filingModal").style.display = "none";
        document.getElementById("obModal").style.display = "flex";
        
        // Reset current date to today when opening new modal
        currentDate = new Date();
        generateCalendar('obCalendarDays');
        updateCalendarHeader('obCalendarDays');
    });
    
    document.getElementById("overtimeApp").addEventListener("click", function() {
        document.getElementById("filingModal").style.display = "none";
        document.getElementById("overtimeModal").style.display = "flex";
        
        // Reset current date to today when opening new modal
        currentDate = new Date();
        generateOvertimeCalendar();
        updateCalendarHeader('overtimeModal');
    });
}

// Call the initialization when page loads
window.addEventListener('DOMContentLoaded', initializeCalendars);
