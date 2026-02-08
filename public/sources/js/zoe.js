import { getDiscordJson } from './discord_api.mjs';
import { getSheetsJson }from './sheets_api.mjs';

// less tedious this way
function setManyAttributes(element, attributesJson) {
	for (const key in attributesJson) {
		element.setAttribute(key, attributesJson[key]);
	}
}

// essentially a sleep for while looping dynamic elements
function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

// for the displayname scroll
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

// oscillates between minRotation and maxRotation indefinitely
async function rotateImg(element, minRotation, maxRotation, delayTime) {
	while (true) {
		if (element.style.transform == `rotate(${minRotation}deg)` || element.style.transform == "") {
			element.style.transform = `rotate(${maxRotation}deg)`;
		}
		else {
			element.style.transform = `rotate(${minRotation}deg)`;
		}
		await delay(delayTime);
	}
}

// SHEETS STATS INTEGRATION
// putting this first because actually i'm going to make this site vary based on her break
// fetching from api and placing under correct block
// also, due to rate limiting on occasion, i both need to find an alternative to this and also do some error handling as to not break the whole ass thing

let breakStat; // only thing used later not just added to HTML elements
try {
	const statsJson = await getSheetsJson();
	console.log(statsJson);
	const statsListDiv = document.querySelector("#stats-list");
	// list format
	const statsList = document.createElement("ul");
	const harmLi = document.createElement("li");

	// current display is number of ticked boxes in sheet -- this counts them, but maybe a different format in the future
	// this is done for harm (/10), fear (/5), and exp (/5)
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

	// used for site design :3c
	breakStat = parseInt(statsJson.break.slice(1)); 
	// and these are for the five ability scores
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

	// then putting it all in the list
	statsList.appendChild(harmLi);
	statsList.appendChild(fearLi);
	statsList.appendChild(expLi);
	statsList.appendChild(heftLi);
	statsList.appendChild(keenLi);
	statsList.appendChild(stingLi);
	statsList.appendChild(coreLi);
	statsList.appendChild(breakLi);
	statsListDiv.appendChild(statsList);

	const strugglesListDiv = document.querySelector("#struggles-and-links");
	const strugglesList = document.createElement("ul");
	const struggles = statsJson.struggles;
	const struggleNotes = statsJson.strugglesNotes;
	const struggleLinks = statsJson.links;
	for (let i = 0; i < struggles.length; i++) {
		const struggle = document.createElement("li");
		struggle.innerHTML = `<b>${struggles[i]}</b>: ${struggleNotes[i]}`;
		const linkList = document.createElement("ul");
		const link = document.createElement("li");
		link.textContent = struggleLinks[i];

		linkList.appendChild(link);
		strugglesList.appendChild(struggle);
		strugglesList.appendChild(linkList);
		strugglesListDiv.appendChild(strugglesList);
	}
} catch (error) {
	console.error(error);
}



// FOR MUSIC (mp3s on neocities costs money sobbing)
/*
let audioSrc = "../mp3/misery-business.mp3"; // https://youtu.be/RVhHCJMCyTE
if (breakStat >= 4) {
	audioSrc = "../mp3/cc.mp3"; // https://youtu.be/auJdZUlKrzM
}

// IM IN THE BUSINESS OF MISERY (no audio yet)
const audioDiv = document.querySelector("#misery-business");
const audio = document.createElement("audio");
const audioAttributes = {
	autoplay: true,
	loop: true,
	src: audioSrc
}
setManyAttributes(audio, audioAttributes);
// random playback speed between 1x and 1.5x (in addition to the already sped up nightcore)
audio.playbackRate = Math.random() * (1.5 - 1) + 1;
audioDiv.appendChild(audio);
*/



// SETUP DISCORD  
const discordJson = await getDiscordJson(); 
console.log("getting the following json:", discordJson); 
const displayName = discordJson.displayName;
const username = discordJson.username; 
const userStatus = discordJson.userStatus;
const avatar = discordJson.avatar;
const statusEmoji = discordJson.statusEmoji;
const statusText = discordJson.statusText;

const disc = document.querySelector("#discord");

// avatar setup
// discord's html pfp setup can be somewhat complicated due to using SVGs for statuses, which kinda got me in a deep end. but it's fun to learn! 
// default offline, case match otherwise
let statusColor = "#84858d";
// switch/case failed to differentiate colors. oops! bug fix that later.
if (userStatus == "online") {
	statusColor = "#45a366";
}
if (userStatus == "idle") {
	statusColor = "#ffc04e";
}
if (userStatus == "dnd") {
	statusColor = "#da3e44";
}
// format for linking to mask
const statusForIcon = "url(#" + userStatus +")";

// SVG elements are namespaced, which generally allows for being able to distinguish between different formats; good to remember for the future. see more below
// https://developer.mozilla.org/en-US/docs/Web/SVG/Guides/Namespaces_crash_course 
// setting up namespace and creating the overall svg the avatar and status go into
const SVG_NS = "http://www.w3.org/2000/svg";
const totalSvg = document.createElementNS(SVG_NS, "svg");
const totalSvgAttributes = {
	width: "92",
	height: "92",
	viewBox: "0 0 92 92"
}
setManyAttributes(totalSvg, totalSvgAttributes);
// this is for the foreignObject img, for the pfp; this is necessary to embed a non-namespaced element insid the namespaced one
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

// make the status SVG and its container
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

// and then putting everything together under the structure
setManyAttributes(statusRect, statusRectAttributes);
foreignSvg.appendChild(pfp);
totalSvg.appendChild(foreignSvg);
statusSvg.appendChild(statusRect);
totalSvg.appendChild(statusSvg);
disc.appendChild(totalSvg);

// setup displayname and username (with textscroll for former)
const displayNameHead = document.createElement("h3");
scrollRepeat(displayNameHead, displayName, 100, 1000);
disc.appendChild(displayNameHead);
const usernameText = document.createElement("p");
usernameText.textContent = username;
disc.appendChild(usernameText);






// MAKING DECORATIONS OBNOXIOUS
const leftPanel = document.querySelector(".left-panel");
// this first one is for stars on the discord!
const discordStars = document.createElement("img");
// .obnoxions does the z-value
discordStars.classList.add('obnoxious');
const discordStarsAttributes = {
	width: "160px",
	src: "./sources/media/sparkly_stars.gif"
}
// manual positioning :(
discordStars.style.position = "absolute";
discordStars.style.top = "0px";
discordStars.style.right = "0px";
setManyAttributes(discordStars, discordStarsAttributes);
leftPanel.appendChild(discordStars);
// apply rotation function
rotateImg(discordStars, 0, 20, 1000);

// it's 2008
const statBlock = document.querySelector("#stat-block");
const catgirl = document.createElement("img");
catgirl.classList.add('obnoxious');
const catgirlAttributes = {
	width: "160px",
	src: "./sources/media/catgirl.jpg"
}
catgirl.style.position = "absolute";
// for some reason they are latching on left-panel
catgirl.style.bottom = "330px";
catgirl.style.right = "0px";
setManyAttributes(catgirl, catgirlAttributes);
statBlock.appendChild(catgirl);
rotateImg(catgirl, -20, 20, 1000);

