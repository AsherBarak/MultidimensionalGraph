import {Painter} from "./D3Painter";
import {BudgetData} from "DataAccess/DataProvider"
import {MockDataAccess} from "DataAccess/DataProvider"
import { BudgetDataRequestParams} from "DataAccess/DataProvider"

class Program {
	static main() {
		var dataAccess=new MockDataAccess();
		Painter.paint(dataAccess.getData({}));
	}
}

Program.main();
