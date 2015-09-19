var BudgetDataRequestParams = (function () {
    function BudgetDataRequestParams() {
    }
    return BudgetDataRequestParams;
})();
exports.BudgetDataRequestParams = BudgetDataRequestParams;
var MockDataAccess = (function () {
    function MockDataAccess() {
    }
    MockDataAccess.prototype.getData = function (params) {
        return {
            items: [
                { text: "subproject1", budget: 10, planning: 12, actualConsumption: 5 },
                { text: "Savion", budget: 12, planning: 16, actualConsumption: 50 },
                { text: "נופי תל אביב", budget: 5, planning: 6, actualConsumption: 15 },
                { text: "the city", budget: 14, planning: 1, actualConsumption: 5 },
            ]
        };
    };
    return MockDataAccess;
})();
exports.MockDataAccess = MockDataAccess;
//# sourceMappingURL=DataProvider.js.map