document.addEventListener('DOMContentLoaded', () => {
    const contentBoxes = document.querySelectorAll('.content-box');
    
    const onScroll = () => {
        const scrollPos = window.scrollY + window.innerHeight;

        contentBoxes.forEach(box => {
            if (scrollPos > box.offsetTop + box.offsetHeight / 2) {
                box.classList.add('visible');
            }
        });
    };

    window.addEventListener('scroll', onScroll);
});
