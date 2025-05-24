async function authenticateAdmin() {
    const password = document.getElementById('adminPassword').value;
    
    try {
        const response = await fetch('/api/admin/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });

        if (response.ok) {
            document.getElementById('data-container').style.display = 'block';
            document.querySelector('.admin-controls').style.display = 'none';
            fetchUserData();
        } else {
            alert('Invalid password');
        }
    } catch (error) {
        alert('Authentication failed');
    }
}

async function fetchUserData() {
    try {
        const response = await fetch('/api/admin/data');
        const data = await response.json();
        
        const tbody = document.getElementById('userDataBody');
        tbody.innerHTML = '';
        
        data.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.phone}</td>
                <td>${user.message}</td>
                <td>${new Date(user.submission_date).toLocaleString()}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
} 