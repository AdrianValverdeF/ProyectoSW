
if (!sessionStorage.getItem('welcomePopupShown')) {

    const popup = document.querySelector('.welcome-popup');
    popup.style.display = 'block';

    setTimeout(() => {
        popup.style.opacity = '0';
        setTimeout(() => {
            popup.style.display = 'none';
        }, 500);
    }, 3000);

    sessionStorage.setItem('welcomePopupShown', 'true');
}