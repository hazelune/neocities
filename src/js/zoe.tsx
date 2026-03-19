import '../css/zoe.scss';
// asset import
// some images
import starsUrl from '../media/sparkly_stars.gif';
import catgirlUrl from '../media/catgirl.jpg';
import biTransUrl from '../media/flag.png';
import rinLenUrl from '../media/rin-len.gif';
import konataUrl from '../media/konata.gif';
import madoHomuUrl from '../media/madoka-homura.gif';
import eatShitUrl from '../media/eatshitanddie.gif';
import angelEyesUrl from '../media/angeleyes.gif';
import networkUrl from '../media/network.gif';
import asyaAngelUrl from '../media/asyaangel.jpg';
import polarBearUrl from '../media/polarbear.gif';
// stamps good lord
import gbaUrl from "../media/stamps/gba.gif";
import girUrl from "../media/stamps/gir.webp";
import sayaUrl from "../media/stamps/saya.png";
import usareiUrl from "../media/stamps/usarei2.gif";
import warriorsUrl from "../media/stamps/warriors.gif";
import himejoshiUrl from "../media/stamps/himejoshi.png";
import loudMusicUrl from "../media/stamps/loudmusic.gif";
import twindanceUrl from "../media/stamps/twindance.gif";
import soFarUrl from "../media/stamps/sofarsogood.gif";
import catgirlLoverUrl from "../media/stamps/catgirllover.png";
import disorganizedUrl from "../media/stamps/disorganized.webp";
import unicornsUrl from "../media/stamps/pinkfluffyunicorns.png";
import gatewayDrugUrl from "../media/stamps/gatewaydrug.jpg";
import kuromiUrl from "../media/stamps/kuromi.gif";
import rockOnUrl from "../media/stamps/rockon.gif";
import meatUrl from "../media/stamps/meat.gif";
import nippaUrl from "../media/stamps/nippa.gif";
import crushUrl from "../media/stamps/crush.webp";
import clickOkUrl from "../media/stamps/clickok.webp";
import comeBackUrl from "../media/stamps/comeback.webp";
import eyesUrl from "../media/stamps/eyes.gif";
import gloomyBearUrl from "../media/stamps/gloomybear.png";
import medicatedUrl from "../media/stamps/medicated.webp";
import scaryThoughtsUrl from "../media/stamps/scarythoughts.png";

import { getDiscordJson } from './discord_api.mjs';
import { getSheetsJson }from './sheets_api.mjs';

import { motion } from "motion/react";
import { useState } from 'react';
import { createRoot } from 'react-dom/client';  // necessary to display React in a DOM node


// less tedious this way
function setManyAttributes(element: Element, attributesJson: Record<string, any>) {
	for (const key in attributesJson) {
		element.setAttribute(key, attributesJson[key]);
	}
}

// essentially a sleep for while looping dynamic elements
function delay(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

// for the displayname scroll
async function textScroll(element: HTMLElement, str: string, ms: number) {
	for (let i = 0; i < str.length; i++) {
		element.textContent = str.slice(0, i+1);
		await delay(ms);
	}
}

async function scrollRepeat(element: HTMLElement, str: string, scrollMs: number, repeatMs: number) {
	while (true) {
		await textScroll(element, str, scrollMs);
		await delay(repeatMs);
	}
}

// oscillates between minRotation and maxRotation indefinitely
async function rotateImg(element: HTMLElement, minRotation: number, maxRotation: number, delayTime: number) {
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


// making a React component for later use (can use const or function
// defining the first object in props so we dont have to use dot notation, with typescript declaration that this object is of the format containing string
// also arrow notation!
const TextWave = ({ str, elementType, damp, stiff }: { str: string, elementType: string, damp: number, stiff: number }) => {
	const letters: string[] = str.split(''); 
	// okay so. lots of explanation here since this is really my first framer motion animation
	// the overall process is "orchestration", in which the partent container is making each individual child letter move (where each child listens for the go)
	// this is the parent, which will be orchestrating the motion of the children
	const containerVariants = {
		// setting "variants", or visual states, which can be passed to the motion (one for when seen and one for not)
		hidden: { opacity: 1 },  
		visible: { 
			opacity: 1,
			transition: {
				staggerChildren: 0.10,  // delays the animation between subsequent children
				delayChildren: 0.3,
				repeat: Infinity,
			}
		}
	};
	// this is the child (for each letter) -- it must have the same variant names as the parent
	const lettersVariants = {
		hidden: {
			opacity: 1,
			y: 5  // starting position (before load)
		},
		visible: {
			opacity: 1,
			y: 0,  // max position during load
			transition: {  // how should it move there
				type: "spring",
				damping: Number(damp),
				stiffness: Number(stiff),
				repeat: Infinity,
				repeatType: "reverse" as const
			},  
		},
	}
	// "stagger" function lets you create a delay for the children
	const MotionComponent = motion[elementType];
	return (
		<MotionComponent
			variants = {containerVariants}  // passes the variants of the heading
			initial = "hidden"  // starts at this variant
			animate = "visible"  // will animate to this variant 
		>
			{
			// curly braces in html tag for JSX/TSX lets you run JS/TS code. yay!
			// this first part maps each letter of the array (and its index, both of which you can get for free with Array.map())
				letters.map((letter, index) => (
									// to a moving element with proper variants enclosed in a unique span
					<motion.span
						key = {index}  // this one originates from React wanting to only update differences
						variants = {lettersVariants}
						style={{ display: 'inline-block' }}  // span is inline, so this is necessary
					>
					{letter === ' ' ? '\u00A0' : letter /* replace with non-breaking space bc of rules of span; this is done with a ternary operator */ }					 
					</motion.span>
			))}
		</MotionComponent>
	);
}

const ChildWave = ({ arr, elementType, startY, endY, staggerParameter, delayParameter, damp, stiff }: { arr: string[], elementType: string, startY: number, endY: number, staggerParameter: number, delayParameter: number, damp: number, stiff: number }) => {
	// okay so. lots of explanation here since this is really my first framer motion animation
	// the overall process is "orchestration", in which the partent container is making each individual child letter move (where each child listens for the go)
	// this is the parent, which will be orchestrating the motion of the children
	const containerVariants = {
		// setting "variants", or visual states, which can be passed to the motion (one for when seen and one for not)
		hidden: { opacity: 1 },  
		visible: { 
			opacity: 1,
			transition: {
				staggerChildren: staggerParameter,  // delays the animation between subsequent children
				delayChildren: delayParameter,
			}
		}
	};
	// this is the child (for each letter) -- it must have the same variant names as the parent
	const childVariants = {
		hidden: {
			opacity: 1,
			y: startY  // starting position (before load)
		},
		visible: {
			opacity: 1,
			y: endY,  // max position during load
			transition: {  // how should it move there
				type: "tween",
       				ease: "easeInOut",
				damping: damp,
				stiffness: stiff,
				repeat: Infinity,
				repeatType: "reverse" as const
			},  
		},
	}
	const MotionComponent = motion[elementType];
	return (
		<MotionComponent
			variants = {containerVariants}  // passes the variants of the heading
			initial = "hidden"  // starts at this variant
			animate = "visible"  // will animate to this variant 
			style = {{
				display: 'flex',
				whiteSpace: 'nowrap',
				gap: '5px',
			}}
		>
			{
			// curly braces in html tag for JSX/TSX lets you run JS/TS code. yay!
			// this first part maps each letter of the array (and its index, both of which you can get for free with Array.map())
				arr.map((item, index) => (
									// to a moving element with proper variants enclosed in a unique span
					<motion.span
						key = {index}  // this one originates from React wanting to only update differences
						variants = {childVariants}
						style = {{ display: 'inline-block', flexShrink: 0 }}  // span is inline, so this is necessary
					>
						<img src = {item} />				 
					</motion.span>
			))}
		</MotionComponent>
	);
}


// SHEETS STATS INTEGRATION
// putting this first because actually i'm going to make this site vary based on her break
// fetching from api and placing under correct block
// also, due to rate limiting on occasion, i both need to find an alternative to this and also do some error handling as to not break the whole ass thing

let breakStat: number = 0; // only thing used later not just added to HTML elements; it's zero because i dont want to typescipt handle it being null
const statsJson = await getSheetsJson();
const statsListDiv = document.querySelector("#stats-list");
// list format
if (statsListDiv) {
	const statsList = document.createElement("ul");
	const harmLi = document.createElement("li");

	// current display is number of ticked boxes in sheet -- this counts them, but maybe a different format in the future
	// this is done for harm (/10), fear (/5), and exp (/5)
	const harmNum = statsJson.harm.reduce(
		(accumulator: number, currentValue: boolean) => accumulator + Number(currentValue),  // + boolean gives +1 if true and +0 if false
			// BUT IN TYPESCRIPT you have to explicitly convert to numeric
		0  // initial value
	);
	harmLi.textContent = `Harm: ${harmNum}`; 
	const fearLi = document.createElement("li");
	const fearNum = statsJson.fear.reduce(
		(accumulator: number, currentValue: boolean) => accumulator + Number(currentValue),  
		0  
	);
	fearLi.textContent = `Fear: ${fearNum}`; 
	const expLi = document.createElement("li");
	const expNum = statsJson.exp.reduce(
		(accumulator: number, currentValue: boolean) => accumulator + Number(currentValue),
		0
	);
	expLi.textContent = `Exp: ${expNum}`; 

	// useState is used bc of changing text caret
	// ignore these for now
	/*
	const [heftStr, changeHeft]: String = useState(statsJson.heft);
	const [keenStr, changeKeen]: String = useState(statsJson.keen);
	const [stingStr, changeSting]: String = useState(statsJson.sting);
	const [coreStr, changeCore]: String = useState(statsJson.core);
	const [breakStr, changeBreak]: String = useState(statsJson.break);
	*/
	let heftStr: string = statsJson.heft;
	let keenStr: string = statsJson.keen;
	let stingStr: string = statsJson.sting;
	let coreStr: string = statsJson.core;
	let breakStr: string = statsJson.break;


	const statCaret = () => {
		// functionArr = 
		// at random time
		// create caret at random stat
		// change stat to
		// \pm 1 (only slight change, so rand from arr surrounding stat)
		// or a 25% chance of emoticon (arr of emoticons)
	}

	// used for site design :3c; not using breakStr to avoid rerendering whole website and whatnot
	breakStat = parseInt(statsJson.break.slice(1)); 
	// and these are for the five ability scores
	const heftLi = document.createElement("li");
	heftLi.textContent = `Heft: ${heftStr}`;
	const keenLi = document.createElement("li");
	keenLi.textContent = `Keen: ${keenStr}`;
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
	if (strugglesListDiv) {
		const strugglesList = document.createElement("ul");
		let struggles;
		let struggleNotes;
		let struggleLinks;
		if (breakStat >= 4) {
			document.body.classList.add('broken');
			struggles = statsJson.strugglesAlt;
			struggleNotes = statsJson.strugglesAltNotes;
			struggleLinks = statsJson.linksAlt;
		}
		else {
			struggles = statsJson.struggles;
			struggleNotes = statsJson.strugglesNotes;
			struggleLinks = statsJson.links;
		}
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
	}
}


// stamp scroll!
let stampArr: string[] = [
	gbaUrl,
	girUrl,
	sayaUrl, 
	usareiUrl, 
	warriorsUrl,
	himejoshiUrl, 
	loudMusicUrl,
	twindanceUrl, 
	soFarUrl, 
	catgirlLoverUrl,
	disorganizedUrl,
	unicornsUrl, 
	gatewayDrugUrl,
	kuromiUrl, 
	rockOnUrl,
	gbaUrl,
	girUrl,
	sayaUrl, 
	usareiUrl, 
	warriorsUrl,
	himejoshiUrl, 
	loudMusicUrl,
	twindanceUrl, 
	soFarUrl, 
	catgirlLoverUrl,
	disorganizedUrl,
	unicornsUrl, 
	gatewayDrugUrl,
	kuromiUrl, 
	rockOnUrl,
	gbaUrl,
	girUrl,
	sayaUrl, 
	usareiUrl, 
	warriorsUrl,
	himejoshiUrl, 
	loudMusicUrl,
	twindanceUrl, 
	soFarUrl, 
	catgirlLoverUrl,
	disorganizedUrl,
	unicornsUrl, 
	gatewayDrugUrl,
	kuromiUrl, 
	rockOnUrl,
];
if (breakStat >= 4) {
	stampArr = [
		meatUrl,
		sayaUrl,
		girUrl,
		nippaUrl,
		crushUrl,
		clickOkUrl,
		comeBackUrl,
		eyesUrl,
		gloomyBearUrl,
		medicatedUrl,
		scaryThoughtsUrl,
		gatewayDrugUrl,
		meatUrl,
		sayaUrl,
		girUrl,
		nippaUrl,
		crushUrl,
		clickOkUrl,
		comeBackUrl,
		eyesUrl,
		gloomyBearUrl,
		medicatedUrl,
		scaryThoughtsUrl,
		gatewayDrugUrl,
		meatUrl,
		sayaUrl,
		girUrl,
		nippaUrl,
		crushUrl,
		clickOkUrl,
		comeBackUrl,
		eyesUrl,
		gloomyBearUrl,
		medicatedUrl,
		scaryThoughtsUrl,
		gatewayDrugUrl,
	]
}
const upperStampScroll = document.querySelector("#upper-stamp-scroll");
if (upperStampScroll) {
	const upperStampScrollDiv = document.createElement("div");
	const upperStampScrollRoot = createRoot(upperStampScrollDiv);
	if (breakStat >= 4) {
		upperStampScrollRoot.render(<ChildWave arr = {stampArr} elementType = "div" staggerParameter = {0.15} delayParameter = {0.20} startY = {-10} endY = {10} damp = {10} stiff = {50}/>);
	}
	upperStampScroll.appendChild(upperStampScrollDiv);
}
const lowerStampScroll = document.querySelector("#lower-stamp-scroll");
if (lowerStampScroll) {
	const lowerStampScrollDiv = document.createElement("div");
	const lowerStampScrollRoot = createRoot(lowerStampScrollDiv);
	lowerStampScrollRoot.render(<ChildWave arr = {stampArr} elementType = "div" staggerParameter = {0.15} delayParameter = {0.20} startY = {-10} endY = {10} damp = {10} stiff = {50}/>);
	lowerStampScroll.appendChild(lowerStampScrollDiv);
}


// FOR MUSIC (mp3s on neocities costs money sobbing)
// mp3 must be in "public" dir
let audioSrc = "/mp3/misery-business.mp3"; // https://youtu.be/RVhHCJMCyTE
if (breakStat >= 4) {
	audioSrc = "/mp3/cc.mp3"; // https://youtu.be/auJdZUlKrzM
}

// IM IN THE BUSINESS OF MISERY (no audio yet)
const audioDiv = document.querySelector("#audio-div");
console.log(audioSrc);
if (audioDiv) {
	const audio = document.createElement("audio");
	const audioAttributes = {
		autoplay: true,
		loop: true,
		src: audioSrc
	}
	setManyAttributes(audio, audioAttributes);
	console.log(audio);
	// random playback speed between 1x and 1.5x (in addition to the already sped up nightcore)
	audio.playbackRate = Math.random() * (1.5 - 1) + 1;
	audioDiv.appendChild(audio);
}




// SETUP DISCORD  
const discordJson = await getDiscordJson(); 
if (discordJson) {
	console.log("getting the following json:", discordJson); 
	const displayName = discordJson.displayName;
	const username = discordJson.username; 
	const userStatus = discordJson.userStatus;
	const avatar = discordJson.avatar;
	// i will use these.... someday....
	/*
	const statusEmoji = discordJson.statusEmoji;
	const statusText = discordJson.statusText;
	*/

	const disc = document.querySelector("#discord");
	if (disc) {
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
		// scrollRepeat(displayNameHead, displayName, 100, 1000);
		const displayNameDiv = document.createElement("div");
		const displayNameRoot = createRoot(displayNameDiv);
		displayNameRoot.render(<TextWave str = {displayName} elementType = "h3" damp = "7" stiff = "200"/>);
		disc.appendChild(displayNameDiv);
		const usernameText = document.createElement("p");
		usernameText.textContent = username;
		disc.appendChild(usernameText);
	}
}



let statBlockUpperUrl = catgirlUrl;
let aboutMeUrl = biTransUrl;
let statBlockLowerUrl = rinLenUrl;
let lovesUrl = konataUrl;
let dislovesUrl = madoHomuUrl;

if (breakStat >= 4) {
	statBlockUpperUrl = eatShitUrl;
	aboutMeUrl = angelEyesUrl;
	statBlockLowerUrl = asyaAngelUrl;
	lovesUrl = networkUrl;
	dislovesUrl = polarBearUrl;
}


// MAKING DECORATIONS OBNOXIOUS
const leftPanel = document.querySelector(".left-panel");
if (leftPanel) {
	// this first one is for stars on the discord!
	const discordStars = document.createElement("img");
	// .obnoxions does the z-value
	discordStars.classList.add('obnoxious');
	const discordStarsAttributes = {
		width: "160px",
		src: starsUrl
	}
	// manual positioning :(
	discordStars.style.position = "absolute";
	discordStars.style.top = "0px";
	discordStars.style.right = "0px";
	setManyAttributes(discordStars, discordStarsAttributes);
	leftPanel.appendChild(discordStars);
	// apply rotation function
	rotateImg(discordStars, 0, 20, 1000);
}

// it's 2008
const statBlock = document.querySelector("#stat-block");
if (statBlock) {
	// upper img
	const upperStatBlockImg = document.createElement("img");
	upperStatBlockImg.classList.add('obnoxious');
	const upperStatBlockImgAttributes = {
		width: "160px",
		src: statBlockUpperUrl, 
	}
	upperStatBlockImg.style.position = "absolute";
	// for some reason they are latching on left-panel
	upperStatBlockImg.style.bottom = "330px";
	upperStatBlockImg.style.right = "0px";
	setManyAttributes(upperStatBlockImg, upperStatBlockImgAttributes);
	statBlock.appendChild(upperStatBlockImg);
	rotateImg(upperStatBlockImg, -20, 20, 1000);
	// lower img
	const lowerStatBlockImg = document.createElement("img");
	lowerStatBlockImg.classList.add('obnoxious');
	const lowerStatBlockImgAttributes = {
		width: "230px",
		src: statBlockLowerUrl, 
	}
	lowerStatBlockImg.style.position = "absolute";
	// for some reason they are latching on left-panel
	lowerStatBlockImg.style.bottom = "0px";
	lowerStatBlockImg.style.right = "0px";
	setManyAttributes(lowerStatBlockImg, lowerStatBlockImgAttributes);
	statBlock.appendChild(lowerStatBlockImg);
}

const aboutMe = document.querySelector("#about-me");
if (aboutMe) {
	const aboutMeImg = document.createElement("img");
	aboutMeImg.classList.add('obnoxious');
	const aboutMeImgAttributes = {
		width: "200px",
		src: aboutMeUrl, 
	}
	aboutMeImg.style.position = "absolute";
	// for some reason they are latching on left-panel
	aboutMeImg.style.top = "-20px";
	aboutMeImg.style.right = "0px";
	setManyAttributes(aboutMeImg, aboutMeImgAttributes);
	aboutMe.appendChild(aboutMeImg);
	rotateImg(aboutMeImg, 10, 15, 1300);
}
const loves = document.querySelector("#loves");
if (loves) {
	const lovesImg = document.createElement("img");
	lovesImg.classList.add('obnoxious');
	const lovesImgAttributes = {
		width: "250px",
		src: lovesUrl, 
	}
	lovesImg.style.position = "absolute";
	// for some reason they are latching on left-panel
	lovesImg.style.bottom = "-125px";
	lovesImg.style.right = "-40px";
	setManyAttributes(lovesImg, lovesImgAttributes);
	loves.appendChild(lovesImg);
}
const disloves = document.querySelector("#disloves");
if (disloves) {
	const dislovesImg = document.createElement("img");
	dislovesImg.classList.add('obnoxious');
	const dislovesImgAttributes = {
		width: "200px",
		src: dislovesUrl, 
	}
	dislovesImg.style.position = "absolute";
	// for some reason they are latching on left-panel
	dislovesImg.style.bottom = "10px";
	dislovesImg.style.right = "10px";
	setManyAttributes(dislovesImg, dislovesImgAttributes);
	disloves.appendChild(dislovesImg);
	rotateImg(dislovesImg, 15, 25, 1100);
}
