import '../css/index.scss';
import { getDiscordJson } from './discord_api.mts';
import { getGithubJson } from './github_api.mts';
import { setManyAttributes, delay } from './convenience_functions.tsx';
import { TextWave } from './motion_functions.tsx';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';  // necessary to display React in a DOM node

const discordJson = await getDiscordJson("486280933058805793"); 
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

const commitArr: Record<string, any>[] = await getGithubJson("hazelune", "neocities", 10);
if (commitArr) {
	console.log('getting the following json\n' + commitArr);
	const updates = document.querySelector("#updates");
	if (updates) {
		for (const obj of commitArr) {
			const subjectStr: string = obj.subject;
			const descriptionStr: string = obj.description;
			const url: string = obj.url;
			const datetime: Date = obj.datetime;
			const updateStrFormatter = new Intl.DateTimeFormat("en-US", {
				month: "numeric",
				day: "numeric",
				year: "numeric",
				hour: "numeric",
				minute: "numeric",
				timeZone: "America/New_York",
				timeZoneName: "short"
			});
			const ghLink = document.createElement("a");
			ghLink.setAttribute("href", url);
			ghLink.textContent = updateStrFormatter.format(datetime)
			const updateDiv = document.createElement("div");
			updateDiv.style.margin = "0px 0px 30px 0px";
			const subject = document.createElement("p");
			const description = document.createElement("p");
			subject.classList.add("italic-text");
			subject.textContent = subjectStr;
			description.textContent = descriptionStr;
			updateDiv.appendChild(ghLink);
			updateDiv.appendChild(subject);
			updateDiv.appendChild(description);
			updates.appendChild(updateDiv);

		}
	}
}
