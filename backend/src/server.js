
// Storing the modules as variables
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const GH_TOKEN = process.env.GH_TOKEN;

if (!GH_TOKEN) { // GH_TOKEN is my PAT token to access github correctly
    console.error('GitHub token (GH_TOKEN) is not set.');
    process.exit(1);
}

const corsOptions = { // Configures the CORS Policy to allow connections from my website
    origin: 'https://bigpattty.github.io',
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

app.post('/login', async (req, res) => { // Listens for a request from bigpattty.github.io/login
    const { username, password } = req.body;

    try {
        console.log(`Attempting login for user: ${username}`);

        // the address of the private repo
        const githubApiUrl = `https://api.github.com/repos/bigpattty/user_data/contents/users/${username}.json`;

        console.log(`GitHub API URL: ${githubApiUrl}`);
        console.log(`Using GH_TOKEN: ${GH_TOKEN ? 'Yes' : 'No'}`);

        // Connects to the private repo in github to check the details
        const response = await axios.get(githubApiUrl, {
            headers: {
                'Authorization': `token ${GH_TOKEN}`
            }
        });

        // Finds the hashed password stored under the users profile
        const userDataBase64 = response.data.content;
        const userData = JSON.parse(Buffer.from(userDataBase64, 'base64').toString('utf-8'));
        const storedHashedPassword = userData.password;

        console.log(`Password from request body: ${password}`);

        // Hashes the password that was entered in at the login
        const providedHashedPassword = crypto.createHash('sha256').update(password, 'utf-8').digest('hex');

        console.log(`Stored hashed password: ${storedHashedPassword}`);
        console.log(`Provided hashed password: ${providedHashedPassword}`);

        // Checks that the hashes match
        if (storedHashedPassword === providedHashedPassword) {
            console.log('We have a winner!');
            res.status(200).json({ message: 'Login successful' });
        } else {
            console.log('We have a losser');
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) { // Logs if github says no
        if (error.response) {
            console.error('Error response from GitHub API:');
            console.error(`Status: ${error.response.status}`);
            console.error(`Headers: ${JSON.stringify(error.response.headers)}`);
            console.error(`Data: ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
            console.error('No response received from GitHub API:');
            console.error(error.request);
        } else {
            console.error('Error in setting up request to GitHub API:');
            console.error('Error', error.message);
        }
        console.error('Error config:', error.config);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
