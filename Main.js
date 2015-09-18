define(["require", "exports", "./DataAccess/DataProvider", "./D3Painter"], function (require, exports, DataProvider_1, D3Painter_1) {
    //import Painter =require("D3Painter");
    //import BudgetData=require("DataAccess/DataProvider");
    var Main = (function () {
        function Main() {
        }
        Main.prototype.Run = function () {
            alert("hi");
            var p = new D3Painter_1.Painter();
            p.paint(new DataProvider_1.BudgetData());
        };
        return Main;
    })();
    alert("entering");
    var main = new Main();
    main.Run();
});
//# sourceMappingURL=Main.js.map