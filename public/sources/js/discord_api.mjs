// these two are used for recurrent updates on the site
const LANYARD_URL = "https://api.lanyard.rest/v1/users/";
const USER_ID = "351470624373342221";


// this uses lanyard to fetch data
export async function getForEmbed() {
	// trying to get the lanyard url
	try {
		const lanyardUrl = `https://api.lanyard.rest/v1/users/${USER_ID}`;

		const lanyardResponse = await fetch(lanyardUrl, {
			method: 'GET'
		});
		
		// if it works, then extract necessary data
		if (lanyardResponse.ok) {
			const lanyardData = await lanyardResponse.json();
			const userData = lanyardData.data.discord_user;
			const avatarHash = userData.avatar;
			const avatarUrl = `https://cdn.discordapp.com/avatars/${USER_ID}/${avatarHash}.png`;
			const username = userData.username;
			const userStatus = lanyardData.data.discord_status;

			// may be useful later? 
			const displayName = userData.display_name;
			const spotifyBool = lanyardData.spotify;
			const spotify = lanyardData.spotify;
			// console.log(`username: ${username}\nstatus: ${userStatus}\navatar: ${avatarUrl}`);

			// generating output and returning
			const output = await {
				"username": username,
				"avatar": avatarUrl,
				"userStatus": userStatus
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

