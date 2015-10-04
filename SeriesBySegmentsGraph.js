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
        Painter.prototype.setup = function (seriesDescriptions, segmentDescriptions, data, dataCallback, 
            /**
             * Search string for the page element to contain the chart:
             * @example
             * "#elmentId",".elementCalss","body"
             */
            chartContainer, startFilters, 
            /**
             * When using more than one chart in a single page this value is appende to elements unique id's
             */
            chartUniqueSuffix) {
            if (startFilters === void 0) { startFilters = null; }
            if (chartUniqueSuffix === void 0) { chartUniqueSuffix = ""; }
            this._seriesDescriptions = seriesDescriptions;
            this._segmentDescriptions = segmentDescriptions;
            this._chartUniqueSuffix = chartUniqueSuffix;
            this._chartContainer = chartContainer;
            var container = d3.select(chartContainer);
            var svgA = container.append("svg")
                .attr("id", "chartSvg" + this._chartUniqueSuffix);
            var mainGA = svgA.append("g")
                .attr("id", "chartGroup" + this._chartUniqueSuffix);
            var xAxisGroupContainer = mainGA.append("g")
                .attr("clip-path", "url(#xAxisClipPath" + this._chartUniqueSuffix);
            xAxisGroupContainer.append("g")
                .attr("id", "xAxis" + this._chartUniqueSuffix)
                .attr("class", "x axis");
            var yAxisGroup = mainGA.append("g")
                .attr("id", "yAxis" + this._chartUniqueSuffix);
            this._xScale = d3.scale.ordinal();
            this._yScale = d3.scale.linear();
            this._xAxis = d3.svg.axis()
                .scale(this._xScale)
                .orient("bottom");
            this._yAxis = d3.svg.axis()
                .scale(this._yScale)
                .orient("left")
                .ticks(10);
            //Add a "defs" element to the svg
            var defs = svgA.append("defs");
            //Append a clipPath element to the defs element, and a Shape
            // to define the cliping area
            defs.append("clipPath")
                .attr("id", "chartClipPath" + this._chartUniqueSuffix)
                .append('rect')
                .attr("id", "contentClipRect" + this._chartUniqueSuffix);
            //clip path for x axis
            defs.append("clipPath")
                .attr("id", "xAxisClipPath" + this._chartUniqueSuffix)
                .append("rect")
                .attr("id", "xAxisClipRect" + this._chartUniqueSuffix);
            var contentGA = mainGA.append("g").attr("id", "contentGroup" + this._chartUniqueSuffix);
            // redaraw from here?	
            this.drawData(data);
        };
        Painter.prototype.drawData = function (data) {
            var _this = this;
            var margin = { top: 20, right: 20, bottom: 30, left: 40 };
            var container = d3.select(this._chartContainer);
            var containerWidth = +container.attr("width"), containerHeight = +container.attr("height");
            var svg = container.select("#chartSvg" + this._chartUniqueSuffix)
                .attr("width", containerWidth)
                .attr("height", containerHeight);
            var width = containerWidth - margin.left - margin.right, height = containerHeight - margin.top - margin.bottom;
            // 		var overlay = svg.append("rect")
            // 			.attr("class", "overlay")
            // 			.attr("width", width)
            // 			.attr("height", height);
            var mainG = svg.select("#chartGroup" + this._chartUniqueSuffix)
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            var itemsPerSegment = d3.max(data.segments.map(function (seg) { return seg.dataItems.length; }));
            var startupSegmentWidth = itemsPerSegment * this.STRTUP_BAR_WIDTH * (1 + 2 * this.MARGIN_BETWEEN_BAR_GROUPS);
            var widthOfAllData = startupSegmentWidth * data.segments.length;
            this._xScale.rangeRoundBands([0, widthOfAllData], this.MARGIN_BETWEEN_BAR_GROUPS);
            this._yScale.range([height, 0]);
            var maxValue = d3.max(data.segments.map(function (seg) { return d3.max(seg.dataItems.map(function (itm) { return itm.value; })); }));
            this._xScale.domain(data.segments.map(function (d) { return _this.getSegmentValueId(d.segment); }));
            this._yScale.domain([0, maxValue]);
            var self = this;
            this._xAxis.tickFormat(function (segKey) {
                var length = data.segments.length;
                for (var index = 0; index < length; index++) {
                    var element = data.segments[index];
                    if (self.getSegmentValueId(element.segment) == segKey) {
                        return element.segment.displayName;
                    }
                }
                return "err";
            });
            d3.select("#xAxis" + this._chartUniqueSuffix)
                .attr("transform", "translate(0," + height + ")")
                .call(this._xAxis);
            d3.select("#yAxis" + this._chartUniqueSuffix)
                .attr("class", "y axis")
                .call(this._yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text(data.yAxisDisplayName);
            var yAxisGroup = d3.select("#yAxis" + this._chartUniqueSuffix);
            d3.select("#contentClipRect" + this._chartUniqueSuffix)
                .attr("width", width) //Set the width of the clipping area
                .attr("x", +yAxisGroup.attr("width"))
                .attr("height", height); // set the height of the clipping area
            d3.select("#xAxisClipRect" + this._chartUniqueSuffix)
                .attr("width", width) //Set the width of the clipping area
                .attr("height", height + margin.bottom); // set the height of the clipping area
            var contentG = d3.select("#contentGroup" + this._chartUniqueSuffix);
            contentG.attr("clip-path", "url(#chartClipPath" + this._chartUniqueSuffix + ")");
            var segments = contentG.selectAll(".segment")
                .data(data.segments, function (seg) { return _this.getSegmentValueId(seg.segment); });
            var self = this;
            segments.on("click", (function (seg) {
                // Animate clicked segemtn to reload animation:
                // d3.select(<Node>this)
                // 	.transition()
                // 	.attr("transform", "rotate(30)")
                self._clickX = d3.event.x;
                self.drawData(data);
            }));
            segments.enter()
                .append("g")
                .attr("class", "segment");
            var exitingSegments = segments.exit();
            // exit segemtns not clicked:
            exitingSegments.transition()
                .style("opacity", 0).remove();
            var zoom = d3.behavior.zoom().scaleExtent([width / widthOfAllData, width / (startupSegmentWidth * 2)]).on("zoom", function () {
                var scale = d3.event.scale;
                var translateX = d3.event.translate[0];
                var translateY = d3.event.translate[1];
                // Prevent data from moving away from y axis:
                translateX = translateX > 0 ? 0 : translateX;
                var maxTranslateX = widthOfAllData * scale - width;
                translateX = translateX < (-maxTranslateX) ? (-maxTranslateX) : translateX;
                var segmentsA = contentG.selectAll(".segment");
                segmentsA.attr("transform", "matrix(" + scale + ",0,0,1," + translateX + ",0)");
                svg.select(".x.axis")
                    .attr("transform", "translate(" + translateX + "," + (height) + ")")
                    .call(_this._xAxis.scale(_this._xScale.rangeRoundBands([0, widthOfAllData * scale], .1 * scale)));
                _this._tooltip.hide();
            });
            this._tooltip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function (d) { return "<strong>" + d.dataItem.seriesId + ":</strong> <span style='color:red'>" + d.dataItem.value + "</span>"; });
            var bars = segments.selectAll("rect")
                .data(function (sdi) { return sdi.dataItems.map(function (dataItem) { return { dataItem: dataItem, segment: sdi }; }); }, function (itm) { return _this.getSegmentValueId(itm.segment.segment) + "_" + itm.dataItem.seriesId; });
            var barEnterStartX = this._clickX, barEnterStartY = height;
            bars.enter()
                .append("rect")
                .attr("class", function (itm) { return _this.getSeries(itm.dataItem.seriesId).cssClass; })
                .attr("x", barEnterStartX)
                .attr("y", barEnterStartY)
                .transition()
                .attr("x", function (itm, i) { return _this._xScale(_this.getSegmentValueId(itm.segment.segment)) + i * _this._xScale.rangeBand() / itemsPerSegment; })
                .attr("width", function (itm) { return _this._xScale.rangeBand() / itemsPerSegment; })
                .attr("y", function (itm) { return _this._yScale(itm.dataItem.value); })
                .attr("data-ziv-val", function (itm) { return itm.dataItem.value; })
                .attr("height", function (itm) { return height - _this._yScale(itm.dataItem.value); });
            bars.exit().remove();
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
            throw new RangeError("Series not found. id:" + seriesId);
            return null;
        };
        return Painter;
    })();
    exports.Painter = Painter;
});
//# sourceMappingURL=SeriesBySegmentsGraph.js.map