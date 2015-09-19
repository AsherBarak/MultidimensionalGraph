var a_1 = require("./a");
var Main = (function () {
    function Main() {
    }
    Main.prototype.Run = function () {
        alert("hi");
        var a = new a_1.A();
        a.Hi();
    };
    return Main;
})();
alert("entering");
var main = new Main();
main.Run();
//# sourceMappingURL=Main.js.map