// githubAPI.js

import axios from 'axios';

const authenticateUser = async (token) => {
    try {
        const response = await axios.post('https://api.github.com/authorizations', {
            scopes: ['repo'],
            note: 'Realtime Collaborative Coding Platform', 
        }, {
            headers: {
                Authorization: `token ${token}`
            }
        });

        if (response.status === 201) {
            return response.data.token;
        } else {
            throw new Error('Authentication failed. Please check your credentials.');
        }
    } catch (error) {
        throw error.response ? error.response.data.message : error.message;
    }
};

const pushCode = async (accessToken, repoOwner, repoName, branchName, filePath, fileContent, commitMessage) => {
    try {
        // Get the current user's information
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `token ${accessToken}`
            }
        });

        const userEmail = userResponse.data.email;
        const userName = userResponse.data.name;

        // Get the SHA of the latest commit on the branch
        const branchResponse = await axios.get(`https://api.github.com/repos/${repoOwner}/${repoName}/git/refs/heads/${branchName}`, {
            headers: {
                Authorization: `token ${accessToken}`
            }
        });

        const latestCommitSha = branchResponse.data.object.sha;

        // Create a new blob containing the file content
        const blobResponse = await axios.post(`https://api.github.com/repos/${repoOwner}/${repoName}/git/blobs`, {
            content: fileContent,
            encoding: 'utf-8'
        }, {
            headers: {
                Authorization: `token ${accessToken}`
            }
        });

        const blobSha = blobResponse.data.sha;

        // Create a new tree with the updated file content
        const treeResponse = await axios.post(`https://api.github.com/repos/${repoOwner}/${repoName}/git/trees`, {
            base_tree: latestCommitSha,
            tree: [
                {
                    path: filePath,
                    mode: '100644',
                    type: 'blob',
                    sha: blobSha
                }
            ]
        }, {
            headers: {
                Authorization: `token ${accessToken}`
            }
        });

        const treeSha = treeResponse.data.sha;

        // Create a new commit with the updated tree
        const commitResponse = await axios.post(`https://api.github.com/repos/${repoOwner}/${repoName}/git/commits`, {
            message: commitMessage,
            tree: treeSha,
            parents: [latestCommitSha],
            author: {
                name: userName,
                email: userEmail
            }
        }, {
            headers: {
                Authorization: `token ${accessToken}`
            }
        });

        const commitSha = commitResponse.data.sha;

        // Update the reference of the branch to point to the new commit
        await axios.patch(`https://api.github.com/repos/${repoOwner}/${repoName}/git/refs/heads/${branchName}`, {
            sha: commitSha
        }, {
            headers: {
                Authorization: `token ${accessToken}`
            }
        });

        return true; // Code push successful
    } catch (error) {
        throw error.response ? error.response.data.message : error.message;
    }
};

export { authenticateUser, pushCode };
