const SHEET_ID = "1zYTbDT07KF_iNJc9wTHBKKW_cCzB1PLnYCxJLWqOECk";
const STATS_ID = "0";
const API_KEY = "AIzaSyBp_twfBo3FXESGoTad_Ybte-b2qxUv3FY";
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly';

// locations of needed data
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
	exp: "Q7:U7",
	struggles: ["E18:G19", "E20:G21", "E22:G23"], // (and notes)
	links: ["H18:K19", "H20:K21", "H22:K23"]
}

async function sheetsStatsRequest(values) {
	// link based on passed values
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
			const noteText = notesJson.sheets[0].data[0].rowData[0].values[0].note;
			return noteText;
		}

	} catch(error) {
		console.error('Error:', error);
	}
}


export async function getSheetsJson() {
	// Object.entries() returns an array of key-value pairs
	const entries = Object.entries(STATS_DICT);
	const promiseArray = entries.map(async function ([key, range]) {
		let stat;
		if (typeof(range) === 'string') {
			stat = await sheetsStatsRequest(range);
		} 
		else {
			console.log([key, range]);
			stat = await Promise.all(range.map(async function (innerRange) {
				return await sheetsStatsRequest(innerRange);
			}));
		}
		return [key, stat];
	});
	let results = await Promise.all(promiseArray);
	let strugglesNotes = [];
	for (const notesRanges of STATS_DICT.struggles) {
		strugglesNotes.push(await sheetsNotesRequest(notesRanges));
	}
	results.push(["strugglesNotes", strugglesNotes]);
	const statsOutput = Object.fromEntries(results);
	return statsOutput;
}

