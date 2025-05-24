document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        message: document.getElementById('message').value
    };

    try {
        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        const responseMessage = document.getElementById('response-message');
        
        if (response.ok) {
            responseMessage.textContent = 'Thank you for your submission!';
            responseMessage.className = 'success';
            document.getElementById('userForm').reset();
        } else {
            responseMessage.textContent = data.message || 'An error occurred. Please try again.';
            responseMessage.className = 'error';
        }
    } catch (error) {
        const responseMessage = document.getElementById('response-message');
        responseMessage.textContent = 'An error occurred. Please try again.';
        responseMessage.className = 'error';
    }
}); 