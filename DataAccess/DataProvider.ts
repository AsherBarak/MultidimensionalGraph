
export interface DataAccess {
	GetData(params: BudgetDataRequestParams): BudgetData
}

export class BudgetDataRequestParams {

}

export class BudgetData {

}

export class BudgetDataItem{
	
	private _Budget : number;
	public get Budget() : number {
		return this._Budget;
	}
	public set Budget(v : number) {
		this._Budget = v;
	}
	
}
