document.addEventListener('DOMContentLoaded', function() {
    const converterForm = document.getElementById('converterForm');
    const fromTimezoneSelect = document.getElementById('fromTimezone');
    const toTimezoneSelect = document.getElementById('toTimezone');
    const searchInput = document.getElementById('searchTimezone');
    const timezonesList = document.getElementById('timezonesList');
    
    let allTimezones = [];
    
    // Load timezones from API
    loadTimezones();
    
    // Update current times display
    updateCurrentTimes();
    setInterval(updateCurrentTimes, 1000);
    
    // Set current datetime in the input
    const now = new Date();
    const localDateTime = now.toISOString().slice(0, 16);
    document.getElementById('sourceTime').value = localDateTime;
    
    // Handle timezone conversion form
    if (converterForm) {
        converterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            performTimeConversion();
        });
    }
    
    // Handle timezone search
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            filterTimezones(searchTerm);
        });
    }
    
    // Load timezones from API
    async function loadTimezones() {
        try {
            const response = await fetch('/api/v1/timezones');
            
            if (response.ok) {
                const data = await response.json();
                
                // The API returns an array of timezone objects
                if (Array.isArray(data)) {
                    // Extract timezone names from the utc arrays
                    allTimezones = [];
                    data.forEach(tz => {
                        if (tz.utc && Array.isArray(tz.utc)) {
                            allTimezones.push(...tz.utc);
                        }
                    });
                    // Remove duplicates and sort
                    allTimezones = [...new Set(allTimezones)].sort();
                } else {
                    allTimezones = [];
                }
                
                // Populate dropdown selects
                populateTimezoneSelects(allTimezones);
                
                // Display all timezones
                displayTimezones(allTimezones);
            } else {
                console.error('Failed to load timezones');
            }
        } catch (error) {
            console.error('Error loading timezones:', error);
            // Use a fallback list of common timezones
            allTimezones = [
                'America/New_York',
                'America/Chicago',
                'America/Denver',
                'America/Los_Angeles',
                'America/Anchorage',
                'America/Phoenix',
                'Europe/London',
                'Europe/Paris',
                'Europe/Berlin',
                'Europe/Moscow',
                'Asia/Dubai',
                'Asia/Karachi',
                'Asia/Kolkata',
                'Asia/Bangkok',
                'Asia/Shanghai',
                'Asia/Tokyo',
                'Australia/Perth',
                'Australia/Sydney',
                'Pacific/Auckland',
                'Pacific/Honolulu'
            ];
            populateTimezoneSelects(allTimezones);
            displayTimezones(allTimezones);
        }
    }
    
    // Populate timezone select dropdowns
    function populateTimezoneSelects(timezones) {
        const options = timezones.map(tz => {
            const offset = getTimezoneOffset(tz);
            return `<option value="${tz}">${tz} (${offset})</option>`;
        }).join('');
        
        fromTimezoneSelect.innerHTML = '<option value="">Select timezone...</option>' + options;
        toTimezoneSelect.innerHTML = '<option value="">Select timezone...</option>' + options;
        
        // Set default values
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timezones.includes(userTimezone)) {
            fromTimezoneSelect.value = userTimezone;
        }
    }
    
    // Display all timezones grouped by region
    function displayTimezones(timezones) {
        const grouped = {};
        
        timezones.forEach(tz => {
            const parts = tz.split('/');
            const region = parts[0];
            const city = parts.slice(1).join('/').replace(/_/g, ' ');
            
            if (!grouped[region]) {
                grouped[region] = [];
            }
            
            grouped[region].push({
                full: tz,
                city: city || tz,
                offset: getTimezoneOffset(tz),
                time: getCurrentTimeInTimezone(tz)
            });
        });
        
        const html = Object.entries(grouped).map(([region, zones]) => `
            <div class="timezone-group">
                <div class="timezone-region">${region}</div>
                <div class="timezone-items">
                    ${zones.map(zone => `
                        <div class="timezone-item" data-timezone="${zone.full}">
                            <div>
                                <div class="timezone-name">${zone.city}</div>
                                <div class="timezone-offset">${zone.offset}</div>
                            </div>
                            <div class="timezone-time">${zone.time}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
        
        timezonesList.innerHTML = html;
        
        // Add click handlers
        document.querySelectorAll('.timezone-item').forEach(item => {
            item.addEventListener('click', function() {
                const timezone = this.getAttribute('data-timezone');
                fromTimezoneSelect.value = timezone;
                converterForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        });
    }
    
    // Filter timezones based on search
    function filterTimezones(searchTerm) {
        const filtered = allTimezones.filter(tz => 
            tz.toLowerCase().includes(searchTerm)
        );
        displayTimezones(filtered);
    }
    
    // Perform time conversion
    function performTimeConversion() {
        const sourceTime = document.getElementById('sourceTime').value;
        const fromTz = fromTimezoneSelect.value;
        const toTz = toTimezoneSelect.value;
        
        if (!sourceTime || !fromTz || !toTz) {
            alert('Please fill in all fields');
            return;
        }
        
        try {
            // Create date in source timezone
            const date = new Date(sourceTime);
            
            // Format for source timezone
            const sourceFormatted = date.toLocaleString('en-US', {
                timeZone: fromTz,
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZoneName: 'short'
            });
            
            // Format for target timezone
            const targetFormatted = date.toLocaleString('en-US', {
                timeZone: toTz,
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZoneName: 'short'
            });
            
            // Display result
            const resultDiv = document.getElementById('conversionResult');
            const detailsDiv = resultDiv.querySelector('.conversion-details');
            
            detailsDiv.innerHTML = `
                <div class="conversion-item">
                    <div class="conversion-label">From: ${fromTz}</div>
                    <div class="conversion-value">${sourceFormatted}</div>
                </div>
                <div class="conversion-item">
                    <div class="conversion-label">To: ${toTz}</div>
                    <div class="conversion-value">${targetFormatted}</div>
                </div>
            `;
            
            resultDiv.style.display = 'block';
            resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } catch (error) {
            alert('Error converting time: ' + error.message);
        }
    }
    
    // Update current times display
    function updateCurrentTimes() {
        const majorTimezones = [
            { name: 'New York', tz: 'America/New_York' },
            { name: 'Chicago', tz: 'America/Chicago' },
            { name: 'Denver', tz: 'America/Denver' },
            { name: 'Los Angeles', tz: 'America/Los_Angeles' },
            { name: 'London', tz: 'Europe/London' },
            { name: 'Paris', tz: 'Europe/Paris' },
            { name: 'Dubai', tz: 'Asia/Dubai' },
            { name: 'Mumbai', tz: 'Asia/Kolkata' },
            { name: 'Singapore', tz: 'Asia/Singapore' },
            { name: 'Tokyo', tz: 'Asia/Tokyo' },
            { name: 'Sydney', tz: 'Australia/Sydney' },
            { name: 'Auckland', tz: 'Pacific/Auckland' }
        ];
        
        const currentTimesDiv = document.getElementById('currentTimes');
        const html = majorTimezones.map(({ name, tz }) => {
            const now = new Date();
            const time = now.toLocaleString('en-US', {
                timeZone: tz,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });
            
            const date = now.toLocaleString('en-US', {
                timeZone: tz,
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
            
            const offset = getTimezoneOffset(tz);
            
            return `
                <div class="time-card">
                    <div class="time-city">${name}</div>
                    <div class="time-value">${time}</div>
                    <div class="time-date">${date}</div>
                    <div class="time-offset">${offset}</div>
                </div>
            `;
        }).join('');
        
        currentTimesDiv.innerHTML = html;
    }
    
    // Helper function to get timezone offset
    function getTimezoneOffset(timezone) {
        try {
            const now = new Date();
            const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
            const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
            const offset = (tzDate - utcDate) / (60 * 60 * 1000);
            
            const sign = offset >= 0 ? '+' : '';
            const hours = Math.floor(Math.abs(offset));
            const minutes = Math.abs((offset % 1) * 60);
            
            return `UTC${sign}${hours}:${minutes.toString().padStart(2, '0')}`;
        } catch (error) {
            return 'UTC';
        }
    }
    
    // Helper function to get current time in timezone
    function getCurrentTimeInTimezone(timezone) {
        try {
            return new Date().toLocaleString('en-US', {
                timeZone: timezone,
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch (error) {
            return '--:--';
        }
    }
});