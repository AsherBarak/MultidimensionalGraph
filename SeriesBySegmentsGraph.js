var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports"], function (require, exports) {
    var DataItem = (function () {
        function DataItem() {
        }
        return DataItem;
    })();
    exports.DataItem = DataItem;
    /**
     * The value of a segment. This export class contains only the key of the segemnt. The {@link SegmentValueForDisplay} export class has the decription.
     * @example
     * key of Project A (Project segment), key of Subproject 22 (Subproject segment), key of Hammer (Items segmenty)*/
    var SegmentValue = (function () {
        function SegmentValue() {
        }
        return SegmentValue;
    })();
    exports.SegmentValue = SegmentValue;
    var SegmentValueForDisplay = (function (_super) {
        __extends(SegmentValueForDisplay, _super);
        function SegmentValueForDisplay() {
            _super.apply(this, arguments);
        }
        return SegmentValueForDisplay;
    })(SegmentValue);
    exports.SegmentValueForDisplay = SegmentValueForDisplay;
    var DataRequestParams = (function () {
        function DataRequestParams() {
        }
        return DataRequestParams;
    })();
    exports.DataRequestParams = DataRequestParams;
    var SegmentdRequestParams = (function (_super) {
        __extends(SegmentdRequestParams, _super);
        function SegmentdRequestParams() {
            _super.apply(this, arguments);
        }
        return SegmentdRequestParams;
    })(DataRequestParams);
    exports.SegmentdRequestParams = SegmentdRequestParams;
    var TimelineRequestParams = (function (_super) {
        __extends(TimelineRequestParams, _super);
        function TimelineRequestParams() {
            _super.apply(this, arguments);
        }
        return TimelineRequestParams;
    })(DataRequestParams);
    exports.TimelineRequestParams = TimelineRequestParams;
    var RetrivedData = (function () {
        function RetrivedData() {
        }
        return RetrivedData;
    })();
    exports.RetrivedData = RetrivedData;
    var SegmentDataItems = (function () {
        function SegmentDataItems() {
        }
        return SegmentDataItems;
    })();
    exports.SegmentDataItems = SegmentDataItems;
    var SegmentsData = (function (_super) {
        __extends(SegmentsData, _super);
        function SegmentsData() {
            _super.apply(this, arguments);
        }
        return SegmentsData;
    })(RetrivedData);
    exports.SegmentsData = SegmentsData;
    var TimelineDataItem = (function () {
        function TimelineDataItem() {
        }
        return TimelineDataItem;
    })();
    exports.TimelineDataItem = TimelineDataItem;
    var TimelineData = (function (_super) {
        __extends(TimelineData, _super);
        function TimelineData() {
            _super.apply(this, arguments);
        }
        return TimelineData;
    })(RetrivedData);
    exports.TimelineData = TimelineData;
    var Painter = (function () {
        function Painter() {
        }
        Painter.prototype.setup = function (seriesDescriptions, segmentDescriptions, data) {
            var _this = this;
            this._seriesDescriptions = seriesDescriptions;
            this._segmentDescriptions = segmentDescriptions;
            var margin = { top: 20, right: 20, bottom: 30, left: 40 };
            // redaraw from here?
            var svg = d3.select("body").select(".budgetPlot");
            //.attr("width", width + margin.left + margin.right)
            //.attr("height", height + margin.top + margin.bottom)
            var mainG = svg.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            var width = +svg.attr("width") - margin.left - margin.right, height = +svg.attr("height") - margin.top - margin.bottom;
            var zoom = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", function () {
                return mainG.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
            });
            var x = d3.scale.ordinal()
                .rangeRoundBands([0, width], .1);
            var y = d3.scale.linear()
                .range([height, 0]);
            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");
            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left");
            var maxValue = d3.max(data.segments.map(function (seg) { return d3.max(seg.dataItems.map(function (itm) { return itm.value; })); }));
            var itemsPerSegment = d3.max(data.segments.map(function (seg) { return seg.dataItems.length; }));
            x.domain(data.segments.map(function (d) { return _this.getSegmentValueId(d.segment); }));
            y.domain([0, maxValue]);
            var self = this;
            //xAxis.tickFormat(segKey=>    segKey+"!!!");
            xAxis.tickFormat(function (segKey) {
                var length = data.segments.length;
                for (var index = 0; index < length; index++) {
                    var element = data.segments[index];
                    if (self.getSegmentValueId(element.segment) == segKey) {
                        return element.segment.displayName;
                    }
                }
                return "err";
            });
            mainG.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);
            mainG.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text(data.yAxisDisplayName);
            var segments = mainG.selectAll(".segment")
                .data(data.segments, function (seg) { return _this.getSegmentValueId(seg.segment); });
            segments.enter()
                .append("g")
                .attr("class", "segment");
            segments.selectAll("rect")
                .data(function (sdi) { return sdi.dataItems.map(function (dataItem) { return { dataItem: dataItem, segment: sdi }; }); }, function (itm) { return _this.getSegmentValueId(itm.segment.segment) + "_" + itm.dataItem.seriesId; })
                .enter()
                .append("rect")
                .attr("class", function (itm) { return _this.getSeries(itm.dataItem.seriesId).cssClass; })
                .attr("x", function (itm, i) { return x(_this.getSegmentValueId(itm.segment.segment)) + i * x.rangeBand() / itemsPerSegment; })
                .attr("width", function (itm) { return x.rangeBand() / itemsPerSegment; })
                .attr("y", function (itm) { return y(itm.dataItem.value); })
                .attr("data-ziv-val", function (itm) { return itm.dataItem.value; })
                .attr("height", function (itm) { return height - y(itm.dataItem.value); }).call(zoom);
        };
        Painter.prototype.zoom = function (container) {
            container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        };
        Painter.prototype.getSegmentValueId = function (segment) {
            return segment.segmentId + "_" + segment.valueId;
        };
        Painter.prototype.draw = function (data) {
        };
        Painter.prototype.getSeries = function (seriesId) {
            var length = this._seriesDescriptions.length;
            for (var index = 0; index < length; index++) {
                if (this._seriesDescriptions[index].id == seriesId) {
                    return this._seriesDescriptions[index];
                }
            }
            /*		this._seriesDescriptions.forEach(
                        sd=>{
                            if (sd.id==seriesId) return sd
                            });
                            */
            throw new RangeError("Series not found. id:" + seriesId);
            return null;
        };
        return Painter;
    })();
    exports.Painter = Painter;
});
//# sourceMappingURL=SeriesBySegmentsGraph.js.map