const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const GH_TOKEN = process.env.GH_TOKEN;

if (!GH_TOKEN) {
    console.error('GitHub token (GH_TOKEN) is not set.');
    process.exit(1);
}

const corsOptions = {
    origin: 'https://bigpattty.github.io',
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log(`Attempting login for user: ${username}`);

        const githubApiUrl = `https://api.github.com/repos/bigpattty/user_data/contents/users/${username}.json`;

        console.log(`GitHub API URL: ${githubApiUrl}`);
        console.log(`Using GH_TOKEN: ${GH_TOKEN ? 'Yes' : 'No'}`);

        const response = await axios.get(githubApiUrl, {
            headers: {
                'Authorization': `token ${GH_TOKEN}`
            }
        });

        const userDataBase64 = response.data.content;
        const userData = JSON.parse(Buffer.from(userDataBase64, 'base64').toString('utf-8'));
        const storedHashedPassword = userData.password;

        console.log(`Password from request body: ${password}`);

        const providedHashedPassword = crypto.createHash('sha256').update(password, 'utf-8').digest('hex');

        console.log(`Stored hashed password: ${storedHashedPassword}`);
        console.log(`Provided hashed password: ${providedHashedPassword}`);

        if (storedHashedPassword === providedHashedPassword) {
            console.log('We have a winner!');
            res.status(200).json({ message: 'Login successful' });
        } else {
            console.log('We have a losser');
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
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
