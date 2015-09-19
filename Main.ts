import * as NS from "./D3Painter";
import {BudgetData} from "DataAccess/DataProvider"

class Program {
	static main() {
		var painter = new NS.Painter();
		painter.paint(new BudgetData());
	}
}

Program.main();
