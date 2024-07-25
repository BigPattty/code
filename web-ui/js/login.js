async function userlogin(event) {
    event.preventDefault();

    // Saves the username and password as local variables
    const button = event.target.querySelector('button');
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    button.classList.add('loading'); // Starts the loading animation when the button is clicked
    button.querySelector('.text').style.opacity = '0';

    try { // Connects to your server to verify the data entered is correct/registered
        const response = await fetch('<YOUR_SERVER_ADDRESS (MUST BE HTTPS)>', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        button.classList.remove('loading');
        if (response.ok) { // If every checks out, it lets the user in
            sessionStorage.setItem('username', username);
            button.classList.add('success');
            setTimeout(() => {
                window.location.href = 'portal.html';
            }, 1000);
        } else { // And stops them if something is fishy
            const errordata = await response.json();
            button.classList.add('error');
        }
    } catch (error) {
        console.error('Error:', error);
        button.classList.remove('loading');
        button.classList.add('error');
    }

    setTimeout(() => { // Removes the error cross after 3 seconds
        button.classList.remove('error');
        button.querySelector('.text').style.opacity = '1';
    }, 3000);
}
