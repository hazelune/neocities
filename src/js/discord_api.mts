// these two are used for recurrent updates on the site

// this uses lanyard to fetch data
export async function getDiscordJson(userId: string): Promise<Record<string, string> | undefined> {
	// trying to get the lanyard url
	try {
		const lanyardUrl = `https://api.lanyard.rest/v1/users/${userId}`;

		const lanyardResponse = await fetch(lanyardUrl, {
			method: 'GET'
		});
		
		// if it works, then extract necessary data
		if (lanyardResponse.ok) {
			const lanyardData = await lanyardResponse.json();
			const userData = lanyardData.data.discord_user;
			const avatarHash = userData.avatar;
			const avatarUrl = `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.png`;
			const username = userData.username;
			const displayName = userData.display_name;
			const userStatus = lanyardData.data.discord_status;
			// must use bracket notation for int
			const activities = lanyardData.data.activities;
			// cannot define variables in if/then blocks! good to know. the following checks whether to consider statuses
			let statusEmoji;
			let statusText;

			if (activities.length === 0) {
				statusEmoji = null; 
				statusText = null;
			} else {
				console.log(activities[0].emoji.name);
				statusEmoji = activities[0].emoji.name;
				statusText = activities[0].state;

			}


			// may be useful later? 
			/*
			const spotifyBool = lanyardData.spotify;
			const spotify = lanyardData.spotify;
			*/

			// generating output and returning
			const output: Record<string, string> = await {
				"displayName": displayName,
				"username": username,
				"avatar": avatarUrl,
				"userStatus": userStatus,
				"statusEmoji": statusEmoji,
				"statusText": statusText
			};
			return output;
		}
		// else throw an error and output
		else {
			throw new Error(`HTTP Lanyard error: ${lanyardResponse.status}`);
		}
	} catch(error) {
		console.error('Error', error);
	}
}

