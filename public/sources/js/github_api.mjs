import { Octokit } from "octokit"

const octokit = new Octokit({
    auth: process.env.HAZEL_MASTER_PAT
});

const result = await octokit.request("GET /repos/{owner}/{repo}/commits", {
    owner: "hazelune",
    repo: "neocities"
});

const authorAndComment = result.data.map(i => ({user: i.author.login, comment: i.commit.message}));

console.log(authorAndComment);
