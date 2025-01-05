document.querySelectorAll('.dropdown-btn').forEach(button => {
    button.addEventListener('click', () => {
        const dropdownContent = button.nextElementSibling;

        button.classList.toggle('active');

        if (button.classList.contains('active')) {
            dropdownContent.style.display = 'block';
            dropdownContent.style.maxHeight = dropdownContent.scrollHeight + 'px';
        } else {
            dropdownContent.style.maxHeight = '0';
            setTimeout(() => {
                dropdownContent.style.display = 'none';
            }, 300); // Match the duration of the slideDown animation
        }
    });
});