import { table } from "console";
import { Octokit } from "octokit" 

const octokit = new Octokit({
    auth: process.env.HAZEL_MASTER_PAT
});

const result = await octokit.request("GET /repos/{owner}/{repo}/commits", {
    owner: "hazelune",
    repo: "neocities",
    per_page: 3
});

const authorAndComment = result.data.map(i => ({date: i.commit.author.date, comment: i.commit.message}));

// document.getElementById("updates").innerHTML
let table_html = '';

authorAndComment.forEach((element) =>{
    const dateObj = new Date(element.date);
    const formattedDate = dateObj.getMonth() + "/" + dateObj.getDate() + "/" + dateObj.getFullYear() + " " + dateObj.toLocaleTimeString('en-US');
    console.log(element.comment + "    " + formattedDate);
    table_html += `
        <td>${element.comment}</td>
        <td>${formattedDate}</td>
    `;
});
console.log(table_html);