
export interface DataAccess {
	getData(params: BudgetDataRequestParams): BudgetData
}

export class BudgetDataRequestParams {
}

export interface BudgetData {
	items:BudgetDataItem[];
}

export interface BudgetDataItem {
	text: string;
	budget: number;
	planning: number;
	actualConsumption: number;
}

export class MockDataAccess implements DataAccess {
	public getData(params: BudgetDataRequestParams): BudgetData{
		return {
			items:[
				{text:"subproject1",budget:10,planning:12,actualConsumption:5},
				{text:"Savion",budget:12,planning:16,actualConsumption:50},
				{text:"נופי תל אביב",budget:5,planning:6,actualConsumption:15},
				{text:"the city",budget:14,planning:1,actualConsumption:5},
			]
		}
	}
}