var D3Painter_1 = require("./D3Painter");
var DataProvider_1 = require("DataAccess/DataProvider");
var Program = (function () {
    function Program() {
    }
    Program.main = function () {
        var dataAccess = new DataProvider_1.MockDataAccess();
        D3Painter_1.Painter.paint(dataAccess.getData({}));
    };
    return Program;
})();
Program.main();
//# sourceMappingURL=Main.js.map