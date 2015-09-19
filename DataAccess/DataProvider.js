define(["require", "exports"], function (require, exports) {
    var BudgetDataRequestParams = (function () {
        function BudgetDataRequestParams() {
        }
        return BudgetDataRequestParams;
    })();
    exports.BudgetDataRequestParams = BudgetDataRequestParams;
    var BudgetData = (function () {
        function BudgetData() {
        }
        return BudgetData;
    })();
    exports.BudgetData = BudgetData;
    var BudgetDataItem = (function () {
        function BudgetDataItem() {
        }
        Object.defineProperty(BudgetDataItem.prototype, "Budget", {
            get: function () {
                return this._Budget;
            },
            set: function (v) {
                this._Budget = v;
            },
            enumerable: true,
            configurable: true
        });
        return BudgetDataItem;
    })();
    exports.BudgetDataItem = BudgetDataItem;
});
//# sourceMappingURL=DataProvider.js.map