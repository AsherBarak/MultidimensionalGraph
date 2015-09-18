define(["require", "exports"], function (require, exports) {
    var Painter = (function () {
        function Painter() {
        }
        Painter.prototype.paint = function (data) {
            var margin = { top: 20, right: 20, bottom: 30, left: 40 }, width = 960 - margin.left - margin.right, height = 500 - margin.top - margin.bottom;
            var svg = d3.select("body").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        };
        return Painter;
    })();
    exports.Painter = Painter;
});
//# sourceMappingURL=D3Painter.js.map