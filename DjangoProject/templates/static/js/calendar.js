document.addEventListener('DOMContentLoaded', function() {
    // Initial setup
    const currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    
    // Philippine holidays storage
    let philippineHolidays = {};
    
    // Employee leave data
    let employeeLeaves = {};
    
    // Currently selected date for editing
    let selectedDateForEditing = null;
    
    // Flag to track if a date is clicked and hover should be disabled
    let isDateClicked = false;
    
    // CSRF token for Django
    const csrftoken = getCookie('csrftoken');

    // Fetch Philippine holidays for the current year
    fetchPhilippineHolidays(currentYear);

    // Fetch employee leaves data (you'll implement this based on your needs)
    fetchEmployeeLeaves(currentYear, currentMonth + 1);

    // Render the initial calendar
    renderCalendar(currentMonth, currentYear);

    // Event listeners for navigation
    document.getElementById('prev-month').addEventListener('click', function() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
            fetchPhilippineHolidays(currentYear);
        }
        fetchEmployeeLeaves(currentYear, currentMonth + 1);
        renderCalendar(currentMonth, currentYear);
    });

    document.getElementById('next-month').addEventListener('click', function() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
            fetchPhilippineHolidays(currentYear);
        }
        fetchEmployeeLeaves(currentYear, currentMonth + 1);
        renderCalendar(currentMonth, currentYear);
    });

    // Sidebar navigation (add as needed)
    document.querySelectorAll('.sidebar-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.sidebar-option').forEach(opt => {
                opt.classList.remove('active');
            });
            this.classList.add('active');
        });
    });

    // Holiday type radio button event listeners
    document.querySelectorAll('input[name="holidayType"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const holidayNameInput = document.getElementById('holidayNameInput');
            if (this.value === 'none') {
                holidayNameInput.disabled = true;
                holidayNameInput.value = '';
            } else {
                holidayNameInput.disabled = false;

                // Set default holiday name based on type if the field is empty
                if (!holidayNameInput.value) {
                    if (this.value === 'special-non-working') {
                        holidayNameInput.value = 'Special Non-Working Holiday';
                    } else if (this.value === 'local') {
                        holidayNameInput.value = 'Local Holiday';
                    } else if (this.value === 'national') {
                        holidayNameInput.value = 'National Holiday';
                    }
                }
            }
        });
    });

    // Save holiday button event listener
    document.getElementById('saveHolidayBtn').addEventListener('click', function() {
        if (selectedDateForEditing) {
            const selectedType = document.querySelector('input[name="holidayType"]:checked').value;
            const holidayName = document.getElementById('holidayNameInput').value;

            // If "none" is selected, remove the holiday if it exists
            if (selectedType === 'none') {
                removeHoliday(selectedDateForEditing);
            } else {
                // Save the holiday
                saveHoliday(selectedDateForEditing, holidayName, selectedType);
            }

            // Close the editor
            document.getElementById('holidayEditor').classList.remove('visible');

            // Reset the clicked state
            isDateClicked = false;

            // Update the calendar to reflect changes
            renderCalendar(currentMonth, currentYear);

            // Update the date info panel
            const [year, month, day] = selectedDateForEditing.split('-').map(num => parseInt(num, 10));
            updateDateInfoPanel(year, month, day);
        }
    });

    // Make holiday options clickable as a whole
    document.querySelectorAll('.holiday-option').forEach(option => {
        option.addEventListener('click', function() {
            const radio = this.querySelector('input[type="radio"]');
            radio.checked = true;

            // Trigger the change event manually
            const event = new Event('change');
            radio.dispatchEvent(event);
        });
    });

    /**
     * Saves a holiday to the database via API
     * @param {string} dateStr - The date string in format 'YYYY-MM-DD'
     * @param {string} name - The holiday name
     * @param {string} type - The holiday type
     */
    function saveHoliday(dateStr, name, type) {
        const [year] = dateStr.split('-').map(num => parseInt(num, 10));

        // Prepare data for the API
        const holidayData = {
            date: dateStr,
            name: name,
            type: type
        };

        // Send to Django backend
        fetch('/api/holidays/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify(holidayData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Holiday saved successfully:', data);

            // Update local storage for immediate UI update
            if (!philippineHolidays[year]) {
                philippineHolidays[year] = [];
            }

            // Check if this date already has a holiday
            const existingIndex = philippineHolidays[year].findIndex(h => h.date === dateStr);

            if (existingIndex !== -1) {
                // Update existing holiday
                philippineHolidays[year][existingIndex] = {
                    date: dateStr,
                    name: name,
                    type: type
                };
            } else {
                // Add new holiday
                philippineHolidays[year].push({
                    date: dateStr,
                    name: name,
                    type: type
                });
            }

            // Refresh the calendar
            renderCalendar(currentMonth, currentYear);
        })
        .catch(error => {
            console.error('Error saving holiday:', error);
            alert('Failed to save holiday. Please try again.');
        });
    }

    /**
     * Removes a holiday from the database via API
     * @param {string} dateStr - The date string in format 'YYYY-MM-DD'
     */
    function removeHoliday(dateStr) {
        const [year] = dateStr.split('-').map(num => parseInt(num, 10));

        // Send delete request to Django backend
        fetch('/api/holidays/', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify({ date: dateStr })
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 404) {
                    // No holiday found for this date - that's okay
                    return { success: true, message: 'No holiday to delete' };
                }
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Holiday removed successfully:', data);

            // Update local cache
            if (philippineHolidays[year]) {
                philippineHolidays[year] = philippineHolidays[year].filter(h => h.date !== dateStr);
            }

            // Refresh the calendar
            renderCalendar(currentMonth, currentYear);
        })
        .catch(error => {
            console.error('Error removing holiday:', error);
            alert('Failed to remove holiday. Please try again.');
        });
    }

    /**
     * Fetches Philippine holidays from the Django API
     * @param {number} year - The year for which to fetch holidays
     */
    function fetchPhilippineHolidays(year) {
        // Fetch holidays from the Django API
        fetch(`/api/holidays/?year=${year}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch holidays');
                }
                return response.json();
            })
            .then(data => {
                // Store holidays in the local cache
                philippineHolidays[year] = data.holidays || [];

                // Render the calendar with the new data
                renderCalendar(currentMonth, currentYear);
            })
            .catch(error => {
                console.error('Error fetching Philippine holidays:', error);
                // If there's an error, initialize with empty array
                philippineHolidays[year] = [];
                renderCalendar(currentMonth, currentYear);
            });
    }

    /**
     * Fetches employee leave data
     * @param {number} year - The year
     * @param {number} month - The month (1-12)
     */
    function fetchEmployeeLeaves(year, month) {
        // In a real implementation, you would fetch this data from your server
        // For demonstration, let's use sample data
        employeeLeaves = getSampleEmployeeLeaves(year, month);
    }

    /**
     * Gets sample employee leave data
     * @param {number} year - The year
     * @param {number} month - The month (1-12)
     * @return {Object} Object with dates as keys and arrays of employee names as values
     */
    function getSampleEmployeeLeaves(year, month) {
        return {
            [`${year}-${month.toString().padStart(2, '0')}-01`]: ['LaMello Tall'],
            [`${year}-${month.toString().padStart(2, '0')}-05`]: ['John Smith', 'Jane Doe'],
            [`${year}-${month.toString().padStart(2, '0')}-12`]: ['Maria Garcia'],
            [`${year}-${month.toString().padStart(2, '0')}-15`]: ['Robert Johnson'],
            [`${year}-${month.toString().padStart(2, '0')}-20`]: ['LaMello Tall'],
        };
    }

    /**
     * Renders the calendar for a specific month and year
     * @param {number} month - The month to render (0-11)
     * @param {number} year - The year to render
     */
    function renderCalendar(month, year) {
        const monthYearText = document.getElementById('month-year');
        const calendarGrid = document.querySelector('.calendar-grid');
        const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

        // Update the header
        monthYearText.textContent = `${monthNames[month]} ${year}`;

        // Clear previous calendar days (except headers)
        const dayHeaders = Array.from(calendarGrid.querySelectorAll('.calendar-day-header'));
        calendarGrid.innerHTML = '';
        dayHeaders.forEach(header => calendarGrid.appendChild(header));

        // Get the first day of the month
        const firstDay = new Date(year, month, 1);
        const startingDay = firstDay.getDay(); // 0 (Sunday) to 6 (Saturday)

        // Get the number of days in the month
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();

        // Get the last day of the previous month
        const prevMonthLastDay = new Date(year, month, 0).getDate();

        // Get today's date
        const today = new Date();
        const todayDate = today.getDate();
        const todayMonth = today.getMonth();
        const todayYear = today.getFullYear();

        // Create days for previous month (if needed)
        for (let i = startingDay - 1; i >= 0; i--) {
            const dayElement = createDayElement(prevMonthLastDay - i, true, false,
                month - 1 < 0 ? year - 1 : year,
                month - 1 < 0 ? 11 : month - 1);
            calendarGrid.appendChild(dayElement);
        }

        // Create days for current month
        for (let i = 1; i <= daysInMonth; i++) {
            const isToday = (i === todayDate && month === todayMonth && year === todayYear);
            const dayElement = createDayElement(i, false, isToday, year, month);
            calendarGrid.appendChild(dayElement);
        }

        // Calculate how many days we need from the next month
        const totalDaysDisplayed = dayHeaders.length + startingDay + daysInMonth;
        const remainingCells = 42 - totalDaysDisplayed; // 6 rows × 7 columns = 42 cells

        // Create days for next month (if needed)
        for (let i = 1; i <= remainingCells; i++) {
            const dayElement = createDayElement(i, true, false,
                month + 1 > 11 ? year + 1 : year,
                month + 1 > 11 ? 0 : month + 1);
            calendarGrid.appendChild(dayElement);
        }
    }

    /**
     * Creates a day element for the calendar
     * @param {number} day - The day number
     * @param {boolean} isOtherMonth - Whether the day is from another month
     * @param {boolean} isToday - Whether the day is today
     * @param {number} year - The year this day belongs to
     * @param {number} month - The month this day belongs to (0-11)
     * @return {HTMLElement} The day element
     */
    function createDayElement(day, isOtherMonth, isToday, year, month) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        dayElement.setAttribute('data-date', dateStr);

        if (isOtherMonth) {
            dayElement.classList.add('other-month');
        }

        if (isToday) {
            dayElement.classList.add('current-date');
        }

        const dayNumber = document.createElement('div');
        dayNumber.className = 'calendar-day-number';
        dayNumber.textContent = day;
        dayElement.appendChild(dayNumber);

        // Check if the day is a holiday
        const holiday = (philippineHolidays[year] || []).find(h => h.date === dateStr);

        if (holiday) {
            const marker = document.createElement('div');
            marker.className = `holiday-marker ${holiday.type}`;
            marker.title = holiday.name;
            dayElement.appendChild(marker);
        }

        // Add mouseenter event listener for hovering
        dayElement.addEventListener('mouseenter', function() {
            // Only process hover events if no date is clicked
            if (!isDateClicked) {
                const dateStr = this.getAttribute('data-date');
                const [hoverYear, hoverMonth, hoverDay] = dateStr.split('-').map(num => parseInt(num, 10));

                updateDateInfoPanel(hoverYear, hoverMonth, hoverDay);

                // Remove highlighting from all days
                document.querySelectorAll('.calendar-day').forEach(day => {
                    day.classList.remove('highlighted');
                });

                // Add highlighting to this day
                this.classList.add('highlighted');

                // Show the date info panel
                const dateInfoPanel = document.getElementById('dateInfoPanel');
                dateInfoPanel.classList.add('visible');

                // Hide the holiday editor if it's not the same as the selected date
                if (selectedDateForEditing !== dateStr) {
                    document.getElementById('holidayEditor').classList.remove('visible');
                }
            }
        });

        // Add click event listener for editing
        dayElement.addEventListener('click', function() {
            const dateStr = this.getAttribute('data-date');
            selectedDateForEditing = dateStr;

            // Set the clicked flag to true to disable hover
            isDateClicked = true;

            // Remove highlighting from all days
            document.querySelectorAll('.calendar-day').forEach(day => {
                day.classList.remove('highlighted');
            });

            // Add highlighting to this day
            this.classList.add('highlighted');

            // Show the date info panel
            const dateInfoPanel = document.getElementById('dateInfoPanel');
            dateInfoPanel.classList.add('visible');

            // Show the holiday editor
            document.getElementById('holidayEditor').classList.add('visible');

            // Get the existing holiday data for this date
            const [clickYear, clickMonth, clickDay] = dateStr.split('-').map(num => parseInt(num, 10));
            const holiday = (philippineHolidays[clickYear] || []).find(h => h.date === dateStr);

            // Update the date info panel
            updateDateInfoPanel(clickYear, clickMonth, clickDay);

            // Update the holiday editor form fields
            if (holiday) {
                document.querySelector(`input[name="holidayType"][value="${holiday.type}"]`).checked = true;
                document.getElementById('holidayNameInput').value = holiday.name;
                document.getElementById('holidayNameInput').disabled = false;
            } else {
                document.querySelector('input[name="holidayType"][value="none"]').checked = true;
                document.getElementById('holidayNameInput').value = '';
                document.getElementById('holidayNameInput').disabled = true;
            }
        });

        return dayElement;
    }

    /**
     * Updates the date info panel with information for the specified date
     * @param {number} year - The year
     * @param {number} month - The month (1-12)
     * @param {number} day - The day
     */
    function updateDateInfoPanel(year, month, day) {
        const dateInfoPanel = document.getElementById('dateInfoPanel');
        const selectedDate = document.getElementById('selectedDate');
        const holidayInfo = document.getElementById('holidayInfo');
        const leaveInfo = document.getElementById('leaveInfo');

        // Format the date
        const months = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
        selectedDate.textContent = `${months[month-1]} ${day}, ${year}`;

        // Check if the day is a holiday
        const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const holiday = (philippineHolidays[year] || []).find(h => h.date === dateStr);

        if (holiday) {
            holidayInfo.textContent = holiday.name;
        } else {
            holidayInfo.textContent = 'NONE';
        }

        // Check if any employees are on leave
        const leavingEmployees = employeeLeaves[dateStr] || [];

        if (leavingEmployees.length > 0) {
            leaveInfo.textContent = leavingEmployees.join(', ');
        } else {
            leaveInfo.textContent = 'NONE';
        }
    }

    // Add mouseleave event listener to hide the date info panel when not hovering over any day
    document.querySelector('.calendar-grid').addEventListener('mouseleave', function() {
        // Only handle mouseleave if no date is clicked
        if (!isDateClicked) {
            document.querySelectorAll('.calendar-day').forEach(day => {
                day.classList.remove('highlighted');
            });

            // Hide the date info panel with a delay, but only if not editing
            setTimeout(() => {
                if (!document.querySelector('.calendar-day:hover') &&
                    !document.getElementById('holidayEditor').classList.contains('visible')) {
                    document.getElementById('dateInfoPanel').classList.remove('visible');
                }
            }, 100);
        }
    });

    // Add click event listener to the document to handle clicks outside the calendar
    document.addEventListener('click', function(event) {
        const holidayEditor = document.getElementById('holidayEditor');
        const dateInfoPanel = document.getElementById('dateInfoPanel');
        const clickedOnCalendarDay = event.target.closest('.calendar-day');
        const clickedOnEditor = event.target.closest('#holidayEditor') ||
                               event.target.closest('.holiday-option') ||
                               event.target.closest('input[name="holidayType"]') ||
                               event.target.id === 'saveHolidayBtn' ||
                               event.target.id === 'holidayNameInput';

        // If clicked outside both calendar days and editor
        if (!clickedOnCalendarDay && !clickedOnEditor) {
            // Reset the clicked state
            isDateClicked = false;

            // Hide the holiday editor
            holidayEditor.classList.remove('visible');

            // Remove highlighting from all days
            document.querySelectorAll('.calendar-day').forEach(day => {
                day.classList.remove('highlighted');
            });

            // Hide the date info panel
            dateInfoPanel.classList.remove('visible');
        }
    });

    /**
     * Gets the CSRF token from cookies
     * https://docs.djangoproject.com/en/dev/ref/csrf/#ajax
     */
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});