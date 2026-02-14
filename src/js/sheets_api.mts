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
	strugglesAlt: string[];
	linksAlt: string[];
	links: string[];
	[key: string]: string | string[] | boolean[];
}

interface NotesDict {
	[key: string]: string | string[] | boolean[];
}

interface RangeLocation {
	sheet: string;
	range: string;
	notes: boolean;
};

// locations of needed data
// "Alt" are located on a separat sheet
const STATS_DICT: Record<string, RangeLocation> = {
	heft: {
		sheet: "Main",
		range: "B7:C8",
		notes: false
	},
	keen: {
		sheet: "Main",
		range: "B12:C13",
		notes: false

	},
	sting: {
		sheet: "Main",
		range: "B17:C18",
		notes: false

	},
	core: {
		sheet: "Main",
		range: "B22:C23",
		notes: false

	},
	"break": {
		sheet: "Main",
		range: "W3:X4",
		notes: false

	},
	weaponType: {
		sheet: "Main",
		range: "G2",
		notes: false

	},
	ambitType: {
		sheet: "Main",
		range: "I2:J2",
		notes: false

	},
	dynamic: {
		sheet: "Main",
		range: "L2:N2",
		notes: false

	},
	harm: {
		sheet: "Main",
		range: "Q2:U3",
		notes: false

	},
	fear: {
		sheet: "Main",
		range: "Q5:U5",
		notes: false

	},
	exp: {
		sheet: "Main",
		range: "Q7:U7",
		notes: false

	},
	struggles: {
		sheet: "Main",
		range: "E18:G23", 
		notes: true
	},
	strugglesAlt: {
		sheet: "Alternate",
		range: "A2:C7", 
		notes: true

	},
	links: {
		sheet: "Main",
		range: "H18:K23", 
		notes: false 

	},
	linksAlt: {
		sheet: "Alternate",
		range: "D2:G7", 
		notes: false

	}
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
async function sheetsNotesRequest(rangesJson: Record<string, RangeLocation>): Promise<NotesDict> {
	// if arr.length === 1, join just takes the string
	const jsonNotesTrue = Object.fromEntries(
		Object.entries(rangesJson).filter(([_key, stat]) => stat.notes === true)
	);
	const valuesStr = Object.values(jsonNotesTrue).map(stat => `${stat.sheet}!${stat.range}`);
	let rangesStr: string = valuesStr.join("&ranges=");
	const notesLink: string = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?ranges=${rangesStr}&fields=sheets(data(rowData(values(note))))&key=${API_KEY}`;
	try {
		// not going to bother typing this
		const notesResponse = await fetch(notesLink, {
			method: 'GET'
		});
		if (notesResponse.ok) {
			const notesJson = await notesResponse.json();
			const outputKeys = Object.keys(jsonNotesTrue).map(key => `${key}Notes`);
			let outputJson: Record<string, string | string[]> = {};
			for (let i=0; i < notesJson.sheets.length; i++) {
				const messyArr = notesJson.sheets[i].data;
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
				outputJson[outputKeys[i]] = parsedArr;
			}
			return outputJson;
		}
		else {
			throw new Error(`notes oopsie >w>: ${notesResponse.status}`);
		}
	} catch(error) {
		console.error(error);
		throw error;
	}
}


async function fetchAllStats(rangesJson: Record<string, RangeLocation>): Promise<RangesDict> {
	// note that order of ranges in link placement is the same as order of resultant values
	// maybe i could do this with a dataframe equivalent in JS but nahhhh i wanna use primitives
	const keys = Object.keys(rangesJson);
	const jsonValues = Object.values(rangesJson);
	const valuesStr = jsonValues.map(stat => `${stat.sheet}!${stat.range}`);
	const rangesStr = valuesStr.join("&ranges=");
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
	const notesJson: NotesDict = await sheetsNotesRequest(STATS_DICT);
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

