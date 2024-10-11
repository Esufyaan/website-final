document.addEventListener('DOMContentLoaded', () => {
    fetch('/staff/future-appointments')
        .then(response => response.json())
        .then(appointments => {
            const tableBody = document.getElementById('appointmentTable').querySelector('tbody');
            appointments.forEach(appointment => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${appointment.name}</td>
                    <td>${appointment.email}</td>
                    <td>${appointment.phone}</td>
                    <td>${appointment.appointment_type}</td>
                    <td>${new Date(appointment.date).toLocaleDateString()}</td>
                    <td>${appointment.time}</td>
                    <td>${appointment.comments}</td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching appointments:', error);
        });
});
