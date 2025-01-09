document.querySelectorAll('.dropdown-btn').forEach(button => {
    button.addEventListener('click', () => {
        const dropdownContent = button.nextElementSibling;

        button.classList.toggle('active');

        if (button.classList.contains('active')) {
            dropdownContent.style.maxHeight = dropdownContent.scrollHeight + 'px'; // Expand
        } else {
            dropdownContent.style.maxHeight = '0'; // Collapse
        }
    });
});
