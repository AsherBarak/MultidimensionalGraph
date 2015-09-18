/// <reference path="TypescriptDefinitions/D3.d.ts" />
/// <reference path="DataAccess\DataProvider.ts" />
import {BudgetData} from "./DataAccess/DataProvider";

	export class Painter
	{
		constructor(){}
		
		paint(data:BudgetData)
		{
			var margin = {top: 20, right: 20, bottom: 30, left: 40},
				width = 960 - margin.left - margin.right,
				height = 500 - margin.top - margin.bottom;
			
			var svg = d3.select("body").append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
			.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
					}
	}


