const SHEET_ID = "1zYTbDT07KF_iNJc9wTHBKKW_cCzB1PLnYCxJLWqOECk";
const STATS_ID = "0";
const API_KEY = "AIzaSyBp_twfBo3FXESGoTad_Ybte-b2qxUv3FY";
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly';

const STATS_DICT = {
	heft: "B7:C8",
	keen: "B12:C13",
	sting: "B17:C18",
	core: "B22:C23",
	"break": "W3:X4",
	weaponType: "G2",
	ambitType: "I2:J2",
	dynamic: "L2:N2",
	harm: "Q2:U3",
	fear: "Q5:U5",
	exp: "Q7:U7"
	// struggles: ["E18:G19", "E20:G21", "E22:G23"], // (and notes)
	// links: ["H17:K19", "H20:K21", "H22:K23"]
}

async function sheetsStatsRequest(values) {
	const statsLink = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${values}/?key=${API_KEY}`
	try {
		const statsResponse = await fetch(statsLink, {
			method: 'GET'
		});
		if (statsResponse.ok) {
			const statsJson = await statsResponse.json();
			if (statsJson.values.length > 1) {
				return statsJson.values.flat().map(str => JSON.parse(str.toLowerCase()));
			}
			else if (statsJson.values[0].length > 1) {
				return statsJson.values[0].map(str => JSON.parse(str.toLowerCase()));
			}
			else {
				return statsJson.values[0][0];
			}
		}
		else {
			throw new Error(`Sheets Error: ${statsResponse.status}`);
		}
	} catch(error) {
		console.error('Error', error);
	}
}

async function sheetsNotesRequest(ranges) {
	const notesLink = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?ranges=${ranges}&fields=sheets.data.rowData.values.note&key=${API_KEY}`
	console.log(notesLink);
	try {
		const notesResponse = await fetch(notesLink, {
			method: 'GET'
		});
		if (notesResponse.ok) {
			const notesJson = await notesResponse.json();
			console.log(notesJson);
		}

	} catch(error) {
		console.error('Error:', error);
	}
}


export async function getSheetsJson() {
	const entries = Object.entries(STATS_DICT);
	const promiseArray = entries.map(async function ([key, range]) {
		const stat = await sheetsStatsRequest(range);
		return [key, stat];
	});
	const results = await Promise.all(promiseArray);
	const statsOutput = Object.fromEntries(results);
	return statsOutput;
}

console.log(await getSheetsJson());
