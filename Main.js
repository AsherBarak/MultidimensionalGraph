define(["require", "exports", "./D3Painter", "DataAccess/DataProvider"], function (require, exports, D3Painter_1, DataProvider_1) {
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
});
//# sourceMappingURL=Main.js.map