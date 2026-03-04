export type MacroEvent = {
	type: "element",
	className: string,
	id: string,
  index: number,
} | {
	type: "click",
	position: {
		x: number,
		y: number,
	}
};

export type Macro = {
	name: string,
	events: Array<MacroEvent>
}

