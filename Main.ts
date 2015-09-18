/// <reference path="D3Painter.ts" />
/// <reference path="DataAccess\DataProvider.ts" />
import {BudgetData} from "./DataAccess/DataProvider";
import {Painter} from "./D3Painter";

//import Painter =require("D3Painter");
//import BudgetData=require("DataAccess/DataProvider");


	class Main {
		Run() {
			alert("hi");
			var p= new Painter(); 
			p.paint(new BudgetData());
			
		}
	}

alert("entering");
var main = new Main()
main.Run();
