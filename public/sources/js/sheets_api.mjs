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
	struggles: "E18:G23", // (and notes)
	links: "H18:K23"
}

// DEPRECATED BOOOOO
/*
async function sheetsStatsRequest(values) {
	// link based on passed values
	const statsLink = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${values}/?key=${API_KEY}`
	console.log(statsLink);
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
*/


async function sheetsNotesRequest(rangesArr) {
	let rangesStr;
	if (typeof(rangesArr) === 'object') {
		rangesStr = rangesArr.join("&ranges=");
	}
	else {
		rangesStr = rangesArr;
	}
	const notesLink = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?ranges=${rangesStr}&fields=sheets(data(rowData(values(note))))&key=${API_KEY}`
	try {
		const notesResponse = await fetch(notesLink, {
			method: 'GET'
		});
		if (notesResponse.ok) {
			const notesJson = await notesResponse.json();
			const messyArr = notesJson.sheets[0].data;
			// okay i love you stack exchange and i need to learn maps better but
			// this replaces each data[i]
			let parsedArr = messyArr.map(data => {
				return data.rowData
					// removes empty json objects in rowData array
					.filter(jsonObj => Object.keys(jsonObj).length != 0)
					// and then maps each json object to the note string, 
					.map(row => row.values[0].note);
			});
			if (parsedArr.length === 1) {
				parsedArr = parsedArr[0];
			}
			return parsedArr;
		}

	} catch(error) {
		console.error(error);
	}
}


async function fetchAllStats(rangesJson) {
	// note that order of ranges in link placement is the same as order of resultant values
	// maybe i could do this with a dataframe equivalent in JS but nahhhh i wanna use primitives
	const keys = Object.keys(rangesJson);
	const rangeValues = Object.values(rangesJson);
	const rangesStr = rangeValues.join("&ranges=");
	let fetchLink = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values:batchGet?key=${API_KEY}&ranges=${rangesStr}`;
	try {
		const statsResponse = await fetch(fetchLink, {
			method: 'GET'
		});
		if (statsResponse.ok) {
			const statsJson = await statsResponse.json();
			const statsArr = statsJson.valueRanges;
			let returnJson = {};
			for (let i = 0; i < statsArr.length; i++) {
				let currentValue = statsArr[i].values;
				let parsedValue = null;

				// handling the different kinds of value types
				// first up is true/false ticked boxes
				if (currentValue[0][0] === "TRUE" || currentValue[0][0] === "FALSE") {
					// this case is multiple sets of boxes ticked
					if (currentValue.length > 1) {
						 parsedValue = currentValue.flat().map(str => JSON.parse(str.toLowerCase()));
					}
					// and this is just a single set of boxes
					else {
						parsedValue = currentValue[0].map(str => JSON.parse(str.toLowerCase()));
					}
				}
				// this handles struggles/links
				else if (currentValue.length > 1) {
					// eliminates empty rows and formats the rest as 1-d array
					parsedValue = currentValue.filter(val => val.length != 0).flat();
				}
				// this handles stat values in format [[+0]]
				else {
					parsedValue = currentValue[0][0];
				}
				returnJson[keys[i]] = parsedValue;
			}
			return returnJson;
		}
		else {
			throw new Error(`Sheets Error: ${statsResponse.status}`);
		}
	} catch(error) {
		console.error('oopsie >w>', error);
	}
}


export async function getSheetsJson() {
	// Object.entries() returns an array of key-value pairs
	const statsJson = await fetchAllStats(STATS_DICT);
	const notesJson = { strugglesNotes: await sheetsNotesRequest(STATS_DICT.struggles) }
	const returnJson = { ...statsJson, ...notesJson }
	/*
	let strugglesNotes = [];
	for (const notesRanges of STATS_DICT.struggles) {
		strugglesNotes.push(await sheetsNotesRequest(notesRanges));
	}
	results.push(["strugglesNotes", strugglesNotes]);
	const statsOutput = Object.fromEntries(results);
	*/
	return returnJson;
}

