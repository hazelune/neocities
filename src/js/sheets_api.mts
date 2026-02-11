const SHEET_ID: string = "1zYTbDT07KF_iNJc9wTHBKKW_cCzB1PLnYCxJLWqOECk";
const API_KEY: string = "AIzaSyBp_twfBo3FXESGoTad_Ybte-b2qxUv3FY";

// for later use with returnJson 
interface RangesDict {
	heft: string;
	keen: string;
	sting: string;
	core: string;
	break: string;
	harm: boolean[];
	fear: boolean[];
	exp: boolean[];
	struggles: string[];
	links: string[];
	[key: string]: string | string[] | boolean[];
}

// locations of needed data
const STATS_DICT: Record<string, string> = {
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

// small json that holds note value
// the ? indicates that it is optional
interface Note {
	note?: string;
}
// this is the "values" json, also short
interface NoteRow { 
	values?: Note[];
}
// for messyArr -- array of notes per range given
interface NotesCollection {
	rowData: NoteRow[];
}

// takes as input an array of ranges (currently, just one range for struggles)
async function sheetsNotesRequest(rangesArr: string[]) {
	// if arr.length === 1, join just takes the string
	let rangesStr: string = rangesArr.join("&ranges=");
	const notesLink: string = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?ranges=${rangesStr}&fields=sheets(data(rowData(values(note))))&key=${API_KEY}`
	try {
		// not going to bother typing this
		const notesResponse = await fetch(notesLink, {
			method: 'GET'
		});
		if (notesResponse.ok) {
			const notesJson = await notesResponse.json();
			const messyArr = notesJson.sheets[0].data;
			// okay i love you stack exchange and i need to learn maps better but
			// this replaces each data[i]
			let parsedArr = messyArr.map((collection: NotesCollection) => {
				return collection.rowData
					// removes empty json objects in rowData array
					.filter(jsonObj => Object.keys(jsonObj).length != 0)
					// and then maps each json object to the note string, 
					.map((row: NoteRow) => {
						if (row.values === undefined) {
							return "no note given";
						}
						return row.values[0].note;
					});
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


async function fetchAllStats(rangesJson: Record<string, string>): Promise<RangesDict> {
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
			// may need to update allowed types later?
			// Partial<RangesDict> is used since it'll be filled with the requisite values i promise!!
			let returnJson: Partial<RangesDict> = {};
			for (let i = 0; i < statsArr.length; i++) {
				let currentValue = statsArr[i].values;
				let parsedValue = null;

				// handling the different kinds of value types
				// first up is true/false ticked boxes
				if (currentValue[0][0] === "TRUE" || currentValue[0][0] === "FALSE") {
					// this case is multiple sets of boxes ticked
					if (currentValue.length > 1) {
						 parsedValue = currentValue.flat().map((str: string) => JSON.parse(str.toLowerCase()));
					}
					// and this is just a single set of boxes
					else {
						parsedValue = currentValue[0].map((str: string) => JSON.parse(str.toLowerCase()));
					}
				}
				// this handles struggles/links
				else if (currentValue.length > 1) {
					// eliminates empty rows and formats the rest as 1-d array
					parsedValue = currentValue.filter((val: string[]) => val.length != 0).flat();
				}
				// this handles stat values in format [[+0]]
				else {
					parsedValue = currentValue[0][0];
				}
				// woahhhhh typescript has you specify that this is a key of the JSON that's so cool
				returnJson[keys[i] as keyof typeof returnJson] = parsedValue;
			}
			return returnJson as RangesDict;
		}
		else {
			throw new Error(`Sheets Error: ${statsResponse.status}`);
		}
	} catch(error) {
		console.error('oopsie >w>', error);
		throw error;
	}
}


export async function getSheetsJson() {
	// Object.entries() returns an array of key-value pairs
	const statsJson: RangesDict = await fetchAllStats(STATS_DICT);
	const notesArr: string[] = [STATS_DICT.struggles]
	const notesJson = {
		strugglesNotes: await sheetsNotesRequest(notesArr)
	}
	const returnJson: RangesDict = { ...statsJson, ...notesJson }
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


