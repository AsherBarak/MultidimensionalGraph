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
            this.STRTUP_BAR_WIDTH = 35;
            this.MARGIN_BETWEEN_BAR_GROUPS = 0.1;
        }
        Painter.prototype.setup = function (seriesDescriptions, segmentDescriptions, data) {
            var _this = this;
            this._seriesDescriptions = seriesDescriptions;
            this._segmentDescriptions = segmentDescriptions;
            var margin = { top: 20, right: 20, bottom: 30, left: 40 };
            // redaraw from here?
            var svg = d3.select("body").select(".budgetPlot");
            var overlay = svg.append("rect")
                .attr("class", "overlay")
                .attr("width", width)
                .attr("height", height);
            //.attr("width", width + margin.left + margin.right)
            //.attr("height", height + margin.top + margin.bottom)
            var mainG = svg.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            var width = +svg.attr("width") - margin.left - margin.right, height = +svg.attr("height") - margin.top - margin.bottom;
            var itemsPerSegment = d3.max(data.segments.map(function (seg) { return seg.dataItems.length; }));
            var startupSegmentWidth = itemsPerSegment * this.STRTUP_BAR_WIDTH * (1 + 2 * this.MARGIN_BETWEEN_BAR_GROUPS);
            var widthOfAllData = startupSegmentWidth * data.segments.length;
            var x = d3.scale.ordinal()
                .rangeRoundBands([0, widthOfAllData], this.MARGIN_BETWEEN_BAR_GROUPS);
            var y = d3.scale.linear()
                .range([height, 0]);
            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");
            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left");
            var maxValue = d3.max(data.segments.map(function (seg) { return d3.max(seg.dataItems.map(function (itm) { return itm.value; })); }));
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
            var xAxisGroupContainer = mainG.append("g")
                .attr("clip-path", "url(#x-clip-path)");
            xAxisGroupContainer.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);
            var yAxisGroup = mainG.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text(data.yAxisDisplayName);
            //Add a "defs" element to the svg
            var defs = svg.append("defs");
            //Append a clipPath element to the defs element, and a Shape
            // to define the cliping area
            defs.append("clipPath").attr('id', 'content-clip-path').append('rect')
                .attr('width', width) //Set the width of the clipping area
                .attr("x", +yAxisGroup.attr("width"))
                .attr('height', height); // set the height of the clipping area
            //clip path for x axis
            defs.append("clipPath").attr('id', 'x-clip-path').append('rect')
                .attr('width', width) //Set the width of the clipping area
                .attr('height', height + margin.bottom); // set the height of the clipping area
            var contentG = mainG.append("g");
            contentG.attr("clip-path", "url(#content-clip-path)");
            var segments = contentG.selectAll(".segment")
                .data(data.segments, function (seg) { return _this.getSegmentValueId(seg.segment); });
            var segmentGroups = segments.enter()
                .append("g")
                .attr("class", "segment");
            var zoom = d3.behavior.zoom().scaleExtent([width / widthOfAllData, width / (startupSegmentWidth * 2)]).on("zoom", function () {
                var scale = d3.event.scale;
                var translateX = d3.event.translate[0];
                var translateY = d3.event.translate[1];
                // Prevent data from moving away from y axis:
                translateX = translateX > 0 ? 0 : translateX;
                var maxTranslateX = widthOfAllData * scale - width;
                translateX = translateX < (-maxTranslateX) ? (-maxTranslateX) : translateX;
                segmentGroups.attr("transform", "matrix(" + scale + ",0,0,1," + translateX + ",0)");
                svg.select(".x.axis")
                    .attr("transform", "translate(" + translateX + "," + (height) + ")")
                    .call(xAxis.scale(x.rangeRoundBands([0, widthOfAllData * scale], .1 * scale)));
                //svg.select(".y.axis").call(yAxis);
            });
            var tooltip = d3.tip();
            tooltip.html(function (d) { return d.dataItem.seriesId; });
            segments.selectAll("rect")
                .data(function (sdi) { return sdi.dataItems.map(function (dataItem) { return { dataItem: dataItem, segment: sdi }; }); }, function (itm) { return _this.getSegmentValueId(itm.segment.segment) + "_" + itm.dataItem.seriesId; })
                .enter()
                .append("rect")
                .attr("class", function (itm) { return _this.getSeries(itm.dataItem.seriesId).cssClass; })
                .attr("x", function (itm, i) { return x(_this.getSegmentValueId(itm.segment.segment)) + i * x.rangeBand() / itemsPerSegment; })
                .attr("width", function (itm) { return x.rangeBand() / itemsPerSegment; })
                .attr("y", function (itm) { return y(itm.dataItem.value); })
                .attr("data-ziv-val", function (itm) { return itm.dataItem.value; })
                .attr("height", function (itm) { return height - y(itm.dataItem.value); })
                .call(tooltip)
                .on('mouseover', tooltip.show)
                .on('mouseout', tooltip.hide);
            svg.call(zoom);
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