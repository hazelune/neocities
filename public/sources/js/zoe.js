import { getForEmbed } from './discord_api.mjs';
import { getSheetsJson }from './sheets_api.mjs';

const embedJson = await getForEmbed();
console.log("getting the following json:", embedJson);
const username = embedJson.username;
const userStatus = embedJson.userStatus;
const avatar = embedJson.avatar;
console.log(`username: ${username}\nstatus: ${userStatus}\navatar: ${avatar}`);


function setManyAttributes(element, attributesJson) {
	for (const key in attributesJson) {
		element.setAttribute(key, attributesJson[key]);
	}
}

function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function textScroll(element, str, ms) {
	for (let i = 0; i < str.length; i++) {
		element.textContent = str.slice(0, i+1);
		await delay(ms);
	}
}

async function scrollRepeat(element, str, scrollMs, repeatMs) {
	while (true) {
		await textScroll(element, str, scrollMs);
		await delay(repeatMs);
	}
}


/* SETUP DISCORD */
const disc = document.querySelector("#discord");

/* avatar setup*/
/* discord's html pfp setup can be somewhat complicated due to using SVGs for statuses, which kinda got me in a deep end. but it's fun to learn! */
let statusColor = "#84858d";
switch (userStatus) {
	case "online":
		statusColor = "#45a366";
	case "idle": 
		statusColor = "#ffc04e";
	case "dnd":
		statusColor = "#da3e44";
}
const statusForIcon = "url(#" + userStatus +")";

/* SVG elements are namespaced, 
/* https://developer.mozilla.org/en-US/docs/Web/SVG/Guides/Namespaces_crash_course */
const SVG_NS = "http://www.w3.org/2000/svg";
const totalSvg = document.createElementNS(SVG_NS, "svg");
const totalSvgAttributes = {
	width: "92",
	height: "92",
	viewBox: "0 0 92 92"
}
setManyAttributes(totalSvg, totalSvgAttributes);
const foreignSvg = document.createElementNS(SVG_NS, "foreignObject")
const foreignSvgAttributes = {
	width: "80",
	height: "80",
	mask: "url(#avatar)"
}
setManyAttributes(foreignSvg, foreignSvgAttributes);
const pfp = document.createElement("img");
const pfpAttributes = {
	src: avatar,
	width: "80"  // auto keeps aspect ratio
}
setManyAttributes(pfp, pfpAttributes);
disc.appendChild(pfp);

const statusSvg = document.createElementNS(SVG_NS, "g");
const statusRect = document.createElementNS(SVG_NS, "rect");
const statusRectAttributes = {
	width: "16",
	height: "16",
	x: "60",
	y: "60",
	fill: statusColor,
	mask: statusForIcon
};

setManyAttributes(statusRect, statusRectAttributes);
foreignSvg.appendChild(pfp);
totalSvg.appendChild(foreignSvg);
statusSvg.appendChild(statusRect);
totalSvg.appendChild(statusSvg);
disc.appendChild(totalSvg);

const displayName = document.createElement("h3");
scrollRepeat(displayName, "zoooeeee uwu <33", 100, 1000);
disc.appendChild(displayName);
const usernameText = document.createElement("p");
usernameText.textContent = username;
disc.appendChild(usernameText);


// SHEETS STATS INTEGRATION
const statsJson = await getSheetsJson();
const statsListDiv = document.querySelector("#stats-list");
const statsList = document.createElement("ul");
const harmLi = document.createElement("li");
const harmNum = statsJson.harm.reduce(
	(accumulator, currentValue) => accumulator + currentValue,
	0
);
harmLi.textContent = `Harm: ${harmNum}`; 
const fearLi = document.createElement("li");
const fearNum = statsJson.fear.reduce(
	(accumulator, currentValue) => accumulator + currentValue,
	0
);
fearLi.textContent = `Fear: ${fearNum}`; 
const expLi = document.createElement("li");
const expNum = statsJson.exp.reduce(
	(accumulator, currentValue) => accumulator + currentValue,
	0
);
expLi.textContent = `Exp: ${expNum}`; 
const heftLi = document.createElement("li");
heftLi.textContent = `Heft: ${statsJson.heft}`;
const keenLi = document.createElement("li");
keenLi.textContent = `Keen: ${statsJson.keen}`;
const stingLi = document.createElement("li");
stingLi.textContent = `Sting: ${statsJson.sting}`;
const coreLi = document.createElement("li");
coreLi.textContent = `Core: ${statsJson.core}`;
const breakLi = document.createElement("li");
breakLi.textContent = `Break: ${statsJson.break}`;
statsList.appendChild(harmLi);
statsList.appendChild(fearLi);
statsList.appendChild(expLi);
statsList.appendChild(heftLi);
statsList.appendChild(keenLi);
statsList.appendChild(stingLi);
statsList.appendChild(coreLi);
statsList.appendChild(breakLi);
statsListDiv.appendChild(statsList);
