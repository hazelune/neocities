import { delay } from './convenience_functions.tsx';
import { motion } from "motion/react";
import { useState } from 'react';
import { createRoot } from 'react-dom/client';  // necessary to display React in a DOM node

export async function textScroll(element: HTMLElement, str: string, ms: number) {
	for (let i = 0; i < str.length; i++) {
		element.textContent = str.slice(0, i+1);
		await delay(ms);
	}
}

export async function scrollRepeat(element: HTMLElement, str: string, scrollMs: number, repeatMs: number) {
	while (true) {
		await textScroll(element, str, scrollMs);
		await delay(repeatMs);
	}
}

// oscillates between minRotation and maxRotation indefinitely
export async function rotateImg(element: HTMLElement, minRotation: number, maxRotation: number, delayTime: number) {
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

export const TextWave = ({ str, elementType, damp, stiff }: { str: string, elementType: string, damp: number, stiff: number }) => {
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
	const MotionComponent = motion[elementType as keyof typeof motion];
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

export const ChildWave = ({ arr, elementType, startY, endY, staggerParameter, delayParameter, damp, stiff }: { arr: string[], elementType: string, startY: number, endY: number, staggerParameter: number, delayParameter: number, damp: number, stiff: number }) => {
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
