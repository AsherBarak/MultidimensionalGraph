define(["require", "exports", "./D3Painter", "DataAccess/DataProvider"], function (require, exports, NS, DataProvider_1) {
    var Program = (function () {
        function Program() {
        }
        Program.main = function () {
            var painter = new NS.Painter();
            painter.paint(new DataProvider_1.BudgetData());
        };
        return Program;
    })();
    Program.main();
});
//# sourceMappingURL=Main.js.map