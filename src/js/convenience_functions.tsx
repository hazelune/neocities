// less tedious this way
export function setManyAttributes(element: Element, attributesJson: Record<string, any>) {
	for (const key in attributesJson) {
		element.setAttribute(key, attributesJson[key]);
	}
}

// essentially a sleep for while looping dynamic elements
export function delay(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
