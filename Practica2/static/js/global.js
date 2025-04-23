if(document.querySelector('.welcome-popup')) {

    if(!sessionStorage.getItem('welcomePopupShown')) {

        // Show the popup if it hasn't been shown before
        const popup = document.querySelector('.welcome-popup');
        popup.style.opacity = '1';
        popup.style.display = 'block';
        
        setTimeout(() => {
            popup.style.opacity = '0';
            setTimeout(() => {
                popup.style.display = 'none';
            }, 500);
        }, 3000);
        
        sessionStorage.setItem('welcomePopupShown', 'true');
    }

}
