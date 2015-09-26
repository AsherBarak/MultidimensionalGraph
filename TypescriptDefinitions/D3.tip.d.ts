/// <reference path="D3.d.ts" />

declare module d3 {
	export function tip<Datum>(): Tip<Datum>;

	interface Tip<Datum> {
		(selection: Selection<Datum>): void;

		attr(name: string, value: Primitive): Tip<Datum>;
		
		/**
             * Set a style property for tooltip.
             * @param name the CSS property name
             * @param value the property value
             * @param priority if specified, either null or the string "important" (no exclamation mark)
             */
		style(name: string, value: Primitive, priority?: string): Tip<Datum>;

		direction(dir: string): Tip<Datum>;

		direction<Datum>(func: (d: Datum) => string): Tip<Datum>;

		offset(values: number[]): Tip<Datum>;

		direction<Datum>(func: () => number[]): Tip<Datum>;

		html(func: (d: Datum) => string): Tip<Datum>;

		show();

		show(data: Datum);

		show(data: Datum, target: SVGElement);

		hide();

		hide(data: Datum);

		hide(data: Datum, target: SVGElement);



	}
}