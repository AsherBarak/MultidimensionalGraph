/// <reference path="TypescriptDefinitions/D3.d.ts" />
/// <reference path="DataAccess\DataProvider.ts" />
import {BudgetData} from "./DataAccess/DataProvider";
import {BudgetDataItem} from "./DataAccess/DataProvider";

export class Painter {
	constructor() { }
	static paint(data: BudgetData) {
		console.log("IN PAINT!");

		var margin = { top: 20, right: 20, bottom: 30, left: 40 },
			width = 960 - margin.left - margin.right,
			height = 500 - margin.top - margin.bottom;

		var x = d3.scale.ordinal()
			.rangeRoundBands([0, width], .1);

		var y = d3.scale.linear()
			.range([height, 0]);

		var xAxis = d3.svg.axis()
			.scale(x)
			.orient("bottom");

		var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left")
			.ticks(10);

		var svg = d3.select("body").append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		var data1: DataElement[] = [
			{ letter: "A", frequency: 0.2 },
			{ letter: "C", frequency: 0.8 },
			{ letter: "B", frequency: 0.25 }
		];


		x.domain(data.items.map(function(d) { return d.text; }));
		y.domain([0, d3.max<BudgetDataItem>(data.items, function(d) { return d.budget; })]);

		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);

		svg.append("g")
			.attr("class", "y axis")
			.call(yAxis)
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("Frequency");
		/*
				svg.selectAll(".budgetBar")
					.data<BudgetDataItem>(data.items)
					.enter().append("rect")
					.attr("class", "budgetBar")
					.attr("x", function(d) { return x(d.text); })
					.attr("width", x.rangeBand()/2)
					.attr("y", function(d) { return y(d.budget); })
					.attr("height", function(d) { return height - y(d.budget); });
		
				svg.selectAll(".planningBar")
					.data<BudgetDataItem>(data.items)
					.enter().append("rect")
					.attr("class", "planningBar")
					.attr("x", function(d) { return x(d.text)+x.rangeBand()/2; })
					.attr("width", x.rangeBand()/2)
					.attr("y", function(d) { return y(d.planning); })
					.attr("height", function(d) { return height - y(d.planning); });
		*/

		Painter.drawBar("budgetBar",
			svg,
			data,
			x,
			y,
			height,
			(item: BudgetDataItem) => { return item.budget },
			0,
			3);


		Painter.drawBar("planningBar",
			svg,
			data,
			x,
			y,
			height,
			(item: BudgetDataItem) => { return item.planning },
			1,
			3);
			
			
		Painter.drawBar("consumptionBar",
			svg,
			data,
			x,
			y,
			height,
			(item: BudgetDataItem) => { return item.actualConsumption },
			2,
			3);

		function type(d) {
			d.frequency = +d.frequency;
			return d;
		}
		
		
	}

	static drawBar(
		className: string,
		svg: d3.Selection<any>,
		data: BudgetData,
		x: d3.scale.Ordinal<string, number>,
		y: d3.scale.Linear<number, number>,
		height: number,
		dataSelector: (item: BudgetDataItem) => number,
		barIndex: number,
		numberOfColumns: number
		): any {
		svg.selectAll("." + className)
			.data<BudgetDataItem>(data.items)
			.enter().append("rect")
			.attr("class", className)
			.attr("x", function(d) { return x(d.text) + x.rangeBand() / numberOfColumns * barIndex; })
			.attr("width", x.rangeBand() / numberOfColumns)
			.attr("y", function(d) { return y(dataSelector(d)); })
			.attr("height", function(d) { return height - y(dataSelector(d)); });
	}
}

interface DataElement {
	letter: string;
	frequency: number;
}


