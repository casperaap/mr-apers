let openDropdownCount = 0;

document.querySelectorAll('.dropdown-btn').forEach(button => {
    const gradientTopC = document.querySelector('.gradient-top-c');
    let isOpen = false;

    button.addEventListener('click', () => {
        const dropdownContent = button.nextElementSibling;
        isOpen = !isOpen;
        openDropdownCount += isOpen ? 1 : -1;

        button.classList.toggle('active');

        if (button.classList.contains('active')) {
            dropdownContent.style.maxHeight = dropdownContent.scrollHeight + 'px'; // Expand
            gradientTopC.style.display = 'none'; // Hide gradient when open
        } else {
            dropdownContent.style.maxHeight = '0'; // Collapse
            gradientTopC.style.display = openDropdownCount === 0 ? 'block' : 'none';
        }
    });
});

function submitNewsletter() {
    const firstName = document.getElementById('first-name').value;
    const email = document.getElementById('email').value;

    fetch('https://mr-apers.koyeb.app/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, email }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert(data.message);
        } else {
            alert('Something went wrong.');
        }
    })
    .catch(error => console.error('Error:', error));
}

async function submitNewsletter() {
    const firstName = document.getElementById('cta-first-name').value;
    const email = document.getElementById('cta-email').value;

    if (!email) {
        alert('Please enter a valid email address.');
        return;
    }

    try {
        const response = await fetch('https://mr-apers.koyeb.app/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ firstName, email }),
        });

        if (response.ok) {
            const result = await response.json();
            alert('Thank you for subscribing! ' + result.message);
        } else {
            const error = await response.json();
            alert('Error: ' + (error.message || 'Unable to subscribe.'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An unexpected error occurred. Please try again later.');
    }
}


document.querySelector('.newsletter-container form').addEventListener('submit', function (e) {
    e.preventDefault();

    const feedbackButton = document.querySelector('.feedback-button');
    feedbackButton.innerHTML = 'Sending...';

    const email = document.getElementById('emails').value.trim();
    const message = document.getElementById('message').value.trim();

    console.log('Email:', email);
    console.log('Message:', message);

    if (!email || !message) {
        alert('Both email and message are required.');
        return;
    }

    const formData = {
        email: email,
        message: message,
    };

    fetch('https://mr-apers.koyeb.app/submit-feedback', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Your feedback has been sent. Thank you!');
                document.querySelector('.newsletter-container form').reset();
            } else {
                alert(data.message || 'Failed to send feedback. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while sending feedback.');
        });
});
