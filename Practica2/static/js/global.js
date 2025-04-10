setTimeout(() => {
    document.querySelector('.welcome-popup').style.opacity = '0';
    setTimeout(() => {
        document.querySelector('.welcome-popup').style.display = 'none';
    }, 500);
}, 3000);
