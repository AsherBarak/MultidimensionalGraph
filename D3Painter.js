define(["require", "exports"], function (require, exports) {
    var Painter = (function () {
        function Painter() {
        }
        Painter.paint = function (data) {
            console.log("IN PAINT!");
            var margin = { top: 20, right: 20, bottom: 30, left: 40 }, width = 960 - margin.left - margin.right, height = 500 - margin.top - margin.bottom;
            var x = d3.scale.ordinal()
                .rangeRoundBands([0, width], .1);
            var y = d3.scale.linear()
                .range([height, 0]);
            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");
            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left")
                .ticks(10);
            var svg = d3.select("body").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            x.domain(data.items.map(function (d) { return d.text; }));
            y.domain([0, d3.max(data.items, function (d) { return d.budget; })]);
            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);
            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Frequency");
            /*
                    svg.selectAll(".budgetBar")
                        .data<BudgetDataItem>(data.items)
                        .enter().append("rect")
                        .attr("class", "budgetBar")
                        .attr("x", function(d) { return x(d.text); })
                        .attr("width", x.rangeBand()/2)
                        .attr("y", function(d) { return y(d.budget); })
                        .attr("height", function(d) { return height - y(d.budget); });
            
                    svg.selectAll(".planningBar")
                        .data<BudgetDataItem>(data.items)
                        .enter().append("rect")
                        .attr("class", "planningBar")
                        .attr("x", function(d) { return x(d.text)+x.rangeBand()/2; })
                        .attr("width", x.rangeBand()/2)
                        .attr("y", function(d) { return y(d.planning); })
                        .attr("height", function(d) { return height - y(d.planning); });
            */
            Painter.drawBar("budgetBar", svg, data, x, y, height, function (item) { return item.budget; }, 0, 3);
            Painter.drawBar("planningBar", svg, data, x, y, height, function (item) { return item.planning; }, 1, 3);
            Painter.drawBar("consumptionBar", svg, data, x, y, height, function (item) { return item.actualConsumption; }, 2, 3);
            function type(d) {
                d.frequency = +d.frequency;
                return d;
            }
        };
        Painter.drawBar = function (className, svg, data, x, y, height, dataSelector, barIndex, numberOfColumns) {
            svg.selectAll("." + className)
                .data(data.items)
                .enter().append("rect")
                .attr("class", className)
                .attr("x", function (d) { return x(d.text) + x.rangeBand() / numberOfColumns * barIndex; })
                .attr("width", x.rangeBand() / numberOfColumns)
                .attr("y", function (d) { return y(dataSelector(d)); })
                .attr("height", function (d) { return height - y(dataSelector(d)); });
        };
        return Painter;
    })();
    exports.Painter = Painter;
});
//# sourceMappingURL=D3Painter.js.map