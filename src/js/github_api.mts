interface CommitJson {
	author: Record<string, string>;
	committer: Record<string, string>;
	message: string;
	tree: Record<string, string>;
	url: string;
	comment_count: number;
	verification: Record<string, any>;
}
interface ApiRow {
	sha: string;
	node_id: string;
	commit: CommitJson;
	url: string;
	html_url: string;
	comments_url: string;
	author: Record<string, any>;
	committer: Record<string, any>;
	parents: Record<string, any>[];
}

export async function getGithubJson(user: string, repo: string, n: number): Promise<Record<string, string>[] | undefined> {
	const url: string = `https://api.github.com/repos/${user}/${repo}/commits`;
	try {
		const response = await fetch(url, {
			method: 'GET'
		});
		if (response.ok) {
			const data = await response.json();
			const outputArr: Record<string, any> = data.map((row: ApiRow) => {
				const message_split = row.commit.message.split('\n\n');
				const message_subj = message_split[0];
				const message_descr = message_split.slice(1).join('\n\n');
				const url = row.html_url
				const time = Date.parse(row.commit.author.date)
				return {
					"subject": message_subj,
					"description": message_descr,
					"url": url,
					"datetime": time
				};
			});
			// no error if n > outputArr.length
			return outputArr.slice(0,n);
		}
	} catch (error) {
		console.error('Error', error);
	}
}
