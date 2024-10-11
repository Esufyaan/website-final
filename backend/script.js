let appointmentList = [];

document.addEventListener('DOMContentLoaded', () => {
    console.log('Welcome to Dental Practice!');

    const appointmentForm = document.getElementById('appointmentForm');
    const confirmationMessage = document.getElementById('confirmationMessage');
    const reportsDiv = document.getElementById('reports');
    const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

    // Function to fetch appointments from the backend
    const fetchAppointments = async (url, callback) => {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            callback(data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    };

    // Function to add an appointment and send data to the server
    const addAppointment = async (appointment) => {
        try {
            const response = await fetch('/submit_appointment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(appointment) // Send JSON data
            });

            if (response.ok) {
                const savedAppointment = await response.json(); // Get the saved appointment from server
                appointmentList.push(savedAppointment); // Add the saved appointment to the list
                console.log('Appointment submitted successfully:', savedAppointment);
                // Fetch future appointments after a successful booking
                fetchAppointments('/staff/future-appointments', showFutureAppointments);
            } else {
                console.error('Error submitting appointment:', response.statusText);
            }
        } catch (error) {
            console.error('Error submitting appointment:', error);
        }
    };

    // Function to display future appointments
    const showFutureAppointments = (appointments) => {
        const filteredAppointments = appointments.filter(a => new Date(a.date) >= new Date(today));
        const futureAppointments = filteredAppointments.map(a => `${a.name} on ${new Date(a.date).toLocaleDateString()} at ${a.time} (Patient: ${a.patient.name})`);

        reportsDiv.innerText = futureAppointments.length 
            ? 'Future Appointments: \n' + futureAppointments.join('\n') 
            : 'No future appointments available.';
    };

    // Event Listener for Appointment Form submission
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const newAppointment = {
                name: document.getElementById('patientName').value,
                email: document.getElementById('patientEmail').value,
                phone: document.getElementById('patientPhone').value,
                appointment_type: document.getElementById('appointmentType').value,
                date: document.getElementById('appointmentDate').value,
                time: document.getElementById('appointmentTime').value,
                comments: document.getElementById('comments').value
            };

            addAppointment(newAppointment);

            confirmationMessage.innerText = `Appointment booked for ${newAppointment.name} on ${newAppointment.date} at ${newAppointment.time}.`;
            appointmentForm.reset(); // Clear form after submission
        });
    }

    // Function to display the list of unique patients
    const showPatients = (patients) => {
        const patientNames = [...new Set(patients.map(p => p.name))]; // Use Set to get unique names
        reportsDiv.innerText = patientNames.length 
            ? 'List of Patients: \n' + patientNames.join(', ') 
            : 'No patients found.';
    };

    // Event Listeners for Staff Area Buttons
    const showPatientsButton = document.getElementById('showPatients');
    const showFutureAppointmentsButton = document.getElementById('showFutureAppointments');
    const showPastAppointmentsButton = document.getElementById('showPastAppointments');

    if (showPatientsButton) {
        showPatientsButton.addEventListener('click', () => {
            fetchAppointments('/patients', showPatients);
        });
    }

    if (showFutureAppointmentsButton) {
        showFutureAppointmentsButton.addEventListener('click', () => {
            fetchAppointments('/staff/future-appointments', showFutureAppointments);
        });
    }

    if (showPastAppointmentsButton) {
        showPastAppointmentsButton.addEventListener('click', () => {
            fetchAppointments('/staff/past-appointments', (appointments) => {
                displayAppointments(appointments, (apptDate, todayDate) => apptDate < todayDate, 'Past Appointments');
            });
        });
    }
});