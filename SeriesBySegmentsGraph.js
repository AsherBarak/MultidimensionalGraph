//#region Definitions
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
    var SegmentRequestParams = (function (_super) {
        __extends(SegmentRequestParams, _super);
        function SegmentRequestParams() {
            _super.apply(this, arguments);
        }
        return SegmentRequestParams;
    })(DataRequestParams);
    exports.SegmentRequestParams = SegmentRequestParams;
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
    //#endregion 
    var Painter = (function () {
        function Painter() {
            //#region "Constants"
            this.STARTUP_BAR_WIDTH = 25;
            this.MARGIN_BETWEEN_BAR_GROUPS = 0.1;
            this.CONTROL_MARGINS = { top: 20, right: 20, bottom: 20, left: 40 };
            this.BREADCRUMB_DRAG_TO_DELETE_DISTANCE = 80;
            this.BREADCRUMBS_MARGINS = { top: 0, right: 0, bottom: 20, left: 0 };
            this.BREADCRUMB_DIMENSIONS = {
                width: 75, height: 30, spacing: 3, tip: 10, textSpacing: 2
            };
            this.AVAILABLE_SEGMENTS_MARGINS = { top: 20, right: 0, bottom: 0, left: 0 };
            this.AVAILABLE_SEGMENTS_DIMENSIONS = {
                width: 75, height: 30, spacing: 3, textSpacing: 2, rounding: 3
            };
            this._clickX = -1;
            this._segementsXTransfomation = 0;
            this._dragTarget = null;
            this._drageTargetType = DrageObjectType.None;
            this._dragSource = null;
            this._drageSourceType = DrageObjectType.None;
        }
        //#endregion "Private variables"
        /**
        * Call this once to initialize control.
        */
        Painter.prototype.setup = function (seriesDescriptions, segmentDescriptions, data, dataCallback, 
            /**
             * Search string for the page element to contain the chart:
             * @example
             * "#elmentId",".elementCalss","body"
             */
            chartContainerSelector, startFilters, 
            /**
             * When using more than one chart in a single page this value is appende to elements unique id's
             */
            chartUniqueSuffix) {
            if (startFilters === void 0) { startFilters = null; }
            if (chartUniqueSuffix === void 0) { chartUniqueSuffix = ""; }
            this._seriesDescriptions = seriesDescriptions;
            this._segmentDescriptions = segmentDescriptions;
            this._chartUniqueSuffix = chartUniqueSuffix;
            this._chartContainerSelector = chartContainerSelector;
            this._dataCallback = dataCallback;
            this._currentFilteringSegments = startFilters == null ? [] : startFilters;
            var container = d3.select(chartContainerSelector);
            var svg = container.append("svg")
                .attr("id", "controlSvg" + this._chartUniqueSuffix);
            svg.append("g")
                .attr("id", "breadcrumbsGroup" + this._chartUniqueSuffix);
            var chartGroup = svg.append("g")
                .attr("id", "chartGroup" + this._chartUniqueSuffix);
            var overlay = chartGroup.append("rect")
                .attr("id", "overlay" + this._chartUniqueSuffix)
                .attr("class", "overlay");
            var xAxisGroupContainer = chartGroup.append("g")
                .attr("clip-path", "url(#xAxisClipPath" + this._chartUniqueSuffix);
            xAxisGroupContainer.append("g")
                .attr("id", "xAxis" + this._chartUniqueSuffix)
                .attr("class", "x axis");
            var yAxisGroup = chartGroup.append("g")
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
            var defs = svg.append("defs");
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
            chartGroup.append("g")
                .attr("id", "contentGroup" + this._chartUniqueSuffix)
                .attr("clip-path", "url(#chartClipPath" + this._chartUniqueSuffix + ")");
            svg.append("g")
                .attr("id", "availableSegments" + this._chartUniqueSuffix);
            this.drawData(data);
        };
        Painter.prototype.drawData = function (data) {
            var _this = this;
            this._segementsXTransfomation = 0;
            this._currentXSegmentId = data.xAxisSegmentId;
            var self = this;
            var container = d3.select(this._chartContainerSelector);
            var containerWidth = +container.attr("width"), containerHeight = +container.attr("height");
            var svg = container.select("#controlSvg" + this._chartUniqueSuffix)
                .attr("width", containerWidth)
                .attr("height", containerHeight);
            var breadcrumbsTop = (this.CONTROL_MARGINS.top + this.BREADCRUMBS_MARGINS.top);
            var chartWidth = containerWidth - this.CONTROL_MARGINS.left - this.CONTROL_MARGINS.right, chartHeight = containerHeight
                - this.CONTROL_MARGINS.top
                - this.BREADCRUMBS_MARGINS.top
                - this.BREADCRUMB_DIMENSIONS.height
                - this.BREADCRUMBS_MARGINS.bottom
                - this.AVAILABLE_SEGMENTS_MARGINS.top
                - this.AVAILABLE_SEGMENTS_DIMENSIONS.height
                - this.AVAILABLE_SEGMENTS_MARGINS.bottom
                - this.CONTROL_MARGINS.bottom;
            var chartTop = breadcrumbsTop
                + this.BREADCRUMB_DIMENSIONS.height
                + this.BREADCRUMBS_MARGINS.bottom;
            svg.select("#chartGroup" + this._chartUniqueSuffix)
                .attr("transform", "translate(" + this.CONTROL_MARGINS.left + "," + chartTop + ")");
            //#region Axis
            var itemsPerSegment = d3.max(data.segments.map(function (seg) { return seg.dataItems.length; }));
            var startupSegmentWidth = itemsPerSegment * this.STARTUP_BAR_WIDTH * (1 + 2 * this.MARGIN_BETWEEN_BAR_GROUPS);
            var widthOfAllData = startupSegmentWidth * data.segments.length;
            this._xScale.rangeRoundBands([0, widthOfAllData], this.MARGIN_BETWEEN_BAR_GROUPS);
            this._yScale.range([chartHeight, 0]);
            var maxValue = d3.max(data.segments.map(function (seg) { return d3.max(seg.dataItems.map(function (itm) { return itm.value; })); }));
            this._xScale.domain(data.segments.map(function (d) { return _this.getSegmentValueId(d.segment); }));
            this._yScale.domain([0, maxValue]);
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
            var xAxis = d3.select("#xAxis" + this._chartUniqueSuffix)
                .attr("transform", "translate(0," + chartHeight + ")")
                .transition().duration(750).ease("sin-in-out")
                .call(this._xAxis);
            var yaxis = d3.select("#yAxis" + this._chartUniqueSuffix)
                .attr("class", "y axis");
            yaxis
                .transition().duration(750).ease("sin-in-out")
                .call(this._yAxis);
            yaxis.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text(data.yAxisDisplayName);
            var yAxisGroup = d3.select("#yAxis" + this._chartUniqueSuffix);
            //#endregion Axis
            //#region overlay
            var overlay = d3.select("#overlay" + this._chartUniqueSuffix)
                .attr("width", chartWidth)
                .attr("height", chartHeight);
            var overlayDrag = d3.behavior.drag()
                .on("dragstart", function () {
                self.setDragStartPostion();
            })
                .on("drag", function () {
                self.dragChart(widthOfAllData, chartWidth, chartHeight);
            })
                .on("dragend", function () {
                self.dragChartEnd(this);
            });
            overlay.call(overlayDrag);
            //#endregion overlay
            //#region Clipping
            d3.select("#contentClipRect" + this._chartUniqueSuffix)
                .attr("width", chartWidth) //Set the width of the clipping area
                .attr("x", +yAxisGroup.attr("width"))
                .attr("height", chartHeight); // set the height of the clipping area
            d3.select("#xAxisClipRect" + this._chartUniqueSuffix)
                .attr("width", chartWidth) //Set the width of the clipping area
                .attr("height", chartHeight + this.CONTROL_MARGINS.bottom); // set the height of the clipping area
            //#endregion Clipping
            //#region Segments
            var contentGroup = d3.select("#contentGroup" + this._chartUniqueSuffix);
            var segments = contentGroup.selectAll(".segment")
                .data(data.segments, function (seg) { return _this.getSegmentValueId(seg.segment); });
            segments.enter()
                .append("g")
                .attr("class", "segment");
            var exitingSegments = segments.exit();
            exitingSegments.transition()
                .style("opacity", 0).remove();
            var segmentDrag = d3.behavior.drag()
                .on("dragstart", function () {
                self.dragChartStart(this);
                var dataMarker = d3.select("#dataMarker" + self._chartUniqueSuffix);
                dataMarker.style("opacity", "1");
                var markerHeight = 30;
                var markerWidth = 20;
                var text = dataMarker
                    .select("text")
                    .classed("dragMarker", true)
                    .text(d3.select(this).datum().segment.displayName);
                var dataItems = d3.select(this).datum().dataItems;
                var bars = dataMarker
                    .selectAll("rect")
                    .data(dataItems);
                bars.enter()
                    .append("rect")
                    .attr("class", function (itm) { return self.getSeries(itm.seriesId).cssClass + " dragMarker"; });
                var maxData = Math.max.apply(Math, dataItems.map(function (itm) { return itm.value; }));
                var scale = markerHeight / maxData;
                bars
                    .attr("x", function (itm, i) { return (markerWidth / itemsPerSegment) * i; })
                    .attr("width", function (itm) { return (markerWidth / itemsPerSegment); })
                    .attr("y", function (itm) { return markerHeight - itm.value * scale; })
                    .attr("data-ziv-val", function (itm) { return itm.value; })
                    .attr("height", function (itm) { return itm.value * scale; });
                bars.exit().remove();
            })
                .on("drag", function () {
                var chartBaseCoordinates = d3.mouse(svg.node());
                var x = chartBaseCoordinates[0];
                var y = chartBaseCoordinates[1];
                d3.select("#dataMarker" + self._chartUniqueSuffix)
                    .attr("transform", "translate(" + (x - 0) + "," + (y - 0) + ")");
                self.dragChart(widthOfAllData, chartWidth, chartHeight);
            })
                .on("dragend", function () {
                var dataMarker = d3.select("#dataMarker" + self._chartUniqueSuffix);
                dataMarker.style("opacity", "0");
                self.dragChartEnd(this);
            });
            //#region Bars
            var bars = segments.selectAll("rect")
                .data(function (sdi) { return sdi.dataItems.map(function (dataItem) { return { dataItem: dataItem, segment: sdi }; }); }, function (itm) { return _this.getSegmentValueId(itm.segment.segment) + "_" + itm.dataItem.seriesId; });
            var barEnterStartX = this._clickX < 0 ? chartWidth / 2 : this._clickX - (startupSegmentWidth / 2), barEnterStartY = chartHeight;
            bars.enter()
                .append("rect")
                .attr("class", function (itm) { return _this.getSeries(itm.dataItem.seriesId).cssClass; });
            bars
                .attr("y", function (itm) { return barEnterStartY; })
                .transition().duration(300).ease("quad")
                .attr("x", function (itm, i) { return _this._xScale(_this.getSegmentValueId(itm.segment.segment)) + i * _this._xScale.rangeBand() / itemsPerSegment; })
                .attr("width", function (itm) { return _this._xScale.rangeBand() / itemsPerSegment; })
                .attr("y", function (itm) { return _this._yScale(itm.dataItem.value); })
                .attr("data-ziv-val", function (itm) { return itm.dataItem.value; })
                .attr("height", function (itm) { return chartHeight - _this._yScale(itm.dataItem.value); });
            bars.exit().remove();
            //#endregion Bars
            // Must be located after bas have been created:
            segments.call(this.dragTarget, DrageObjectType.ChartSegment, this);
            //#endregion Segments
            //#region Breadcrumns
            var breadcrubmesGroup = d3.select("#breadcrumbsGroup" + this._chartUniqueSuffix)
                .attr("transform", "translate(" + (this.BREADCRUMBS_MARGINS.left + this.CONTROL_MARGINS.left) + "," + breadcrumbsTop + ")");
            var breadcrumbWrapperGroups = breadcrubmesGroup.selectAll("g.breadcrumb")
                .data(this._currentFilteringSegments, function (seg) { return _this.getSegmentValueId(seg); });
            breadcrumbWrapperGroups.exit().transition().remove();
            var crumbEnter = breadcrumbWrapperGroups.enter()
                .append("g")
                .attr("class", function (d) { return ("breadcrumb " + _this.getSegmentDescription(d.segmentId).cssClass); })
                .call(this.dragSource, DrageObjectType.Breadcrumb, this);
            ;
            crumbEnter.append("polygon");
            breadcrumbWrapperGroups
                .select("polygon")
                .transition()
                .attr("points", function (d, i) {
                var beradcrumbStart = i * (_this.BREADCRUMB_DIMENSIONS.width + _this.BREADCRUMB_DIMENSIONS.spacing);
                var points = [];
                points.push("" + beradcrumbStart + ",0");
                points.push((beradcrumbStart + _this.BREADCRUMB_DIMENSIONS.width) + ",0");
                points.push(beradcrumbStart + _this.BREADCRUMB_DIMENSIONS.width + _this.BREADCRUMB_DIMENSIONS.tip + "," + (_this.BREADCRUMB_DIMENSIONS.height / 2));
                points.push(beradcrumbStart + _this.BREADCRUMB_DIMENSIONS.width + "," + _this.BREADCRUMB_DIMENSIONS.height);
                points.push("" + beradcrumbStart + "," + _this.BREADCRUMB_DIMENSIONS.height);
                if (i > 0) {
                    points.push(beradcrumbStart + _this.BREADCRUMB_DIMENSIONS.tip + "," + (_this.BREADCRUMB_DIMENSIONS.height / 2));
                }
                return points.join(" ");
            });
            crumbEnter.append("text");
            breadcrumbWrapperGroups
                .select("text")
                .transition()
                .attr("x", function (d, i) { return i * (_this.BREADCRUMB_DIMENSIONS.width + _this.BREADCRUMB_DIMENSIONS.spacing) + _this.BREADCRUMB_DIMENSIONS.tip + _this.BREADCRUMB_DIMENSIONS.textSpacing; })
                .attr("y", this.BREADCRUMB_DIMENSIONS.height / 2)
                .attr("dy", "0.35em")
                .attr("class", function (d) { return ("breadcrumb text " + _this.getSegmentDescription(d.segmentId).cssClass); })
                .text(function (d) { return d.displayName; });
            //#endregion Breadcrumns
            //#region Available segments
            var availableSegmentsTop = chartTop
                + chartHeight
                + this.AVAILABLE_SEGMENTS_MARGINS.top;
            var availableSegmentsGroup = d3.select("#availableSegments" + this._chartUniqueSuffix)
                .attr("transform", "translate(" + (this.CONTROL_MARGINS.left + this.AVAILABLE_SEGMENTS_MARGINS.left) + "," + availableSegmentsTop + ")");
            var availableSegments = this.getAvailableSegments(data.xAxisSegmentId);
            var availableSegmentsG = availableSegmentsGroup
                .selectAll(".availableSegment")
                .data(availableSegments, function (seg) { return seg.id; });
            availableSegmentsG.exit().transition().remove();
            var availableSegEnter = availableSegmentsG.enter()
                .append("g")
                .attr("class", function (d) { return ("availableSegment " + d.cssClass); })
                .call(this.dragTarget, DrageObjectType.AvailableSegment, self);
            availableSegEnter.append("rect");
            var availableSegmentXOffset = 0;
            availableSegmentsG.select("rect")
                .transition()
                .attr("x", function (d, i) {
                if (i == 0) {
                    availableSegmentXOffset = 0;
                    return availableSegmentXOffset;
                }
                availableSegmentXOffset += _this.AVAILABLE_SEGMENTS_DIMENSIONS.width;
                var isSingleDecendantOfPreviuesSegment;
                var parentSegment = availableSegments[availableSegments.indexOf(d) - 1];
                isSingleDecendantOfPreviuesSegment =
                    d.parentSegmentsIds != null
                        && d.parentSegmentsIds.length == 1
                        && d.parentSegmentsIds[0] == parentSegment.id;
                if (isSingleDecendantOfPreviuesSegment) {
                    availableSegmentXOffset -= _this.AVAILABLE_SEGMENTS_DIMENSIONS.spacing;
                }
                else {
                    availableSegmentXOffset += _this.AVAILABLE_SEGMENTS_DIMENSIONS.spacing;
                }
                return availableSegmentXOffset;
                //return i * (this.AVAILABLE_SEGMENTS_DIMENSIONS.width + this.AVAILABLE_SEGMENTS_DIMENSIONS.spacing)
            })
                .attr("rx", this.AVAILABLE_SEGMENTS_DIMENSIONS.rounding)
                .attr("ry", this.AVAILABLE_SEGMENTS_DIMENSIONS.rounding)
                .attr("width", this.AVAILABLE_SEGMENTS_DIMENSIONS.width)
                .attr("height", this.AVAILABLE_SEGMENTS_DIMENSIONS.height);
            availableSegEnter.append("text");
            var availableSegmentXOffset = 0;
            availableSegmentsG.select("text")
                .transition()
                .attr("x", function (d, i) {
                if (i == 0) {
                    availableSegmentXOffset = 0;
                    return availableSegmentXOffset;
                }
                availableSegmentXOffset += _this.AVAILABLE_SEGMENTS_DIMENSIONS.width;
                var isSingleDecendantOfPreviuesSegment;
                var parentSegment = availableSegments[availableSegments.indexOf(d) - 1];
                isSingleDecendantOfPreviuesSegment =
                    d.parentSegmentsIds != null
                        && d.parentSegmentsIds.length == 1
                        && d.parentSegmentsIds[0] == parentSegment.id;
                if (isSingleDecendantOfPreviuesSegment) {
                    availableSegmentXOffset -= _this.AVAILABLE_SEGMENTS_DIMENSIONS.spacing;
                }
                else {
                    availableSegmentXOffset += _this.AVAILABLE_SEGMENTS_DIMENSIONS.spacing;
                }
                return availableSegmentXOffset + _this.AVAILABLE_SEGMENTS_DIMENSIONS.textSpacing;
                //return i * (this.AVAILABLE_SEGMENTS_DIMENSIONS.width + this.AVAILABLE_SEGMENTS_DIMENSIONS.spacing) + this.AVAILABLE_SEGMENTS_DIMENSIONS.textSpacing
            })
                .attr("y", this.AVAILABLE_SEGMENTS_DIMENSIONS.height / 2)
                .attr("dy", 4)
                .attr("class", function (d) { return ("availableSegment text " + d.cssClass); })
                .text(function (d) { return d.displayName; });
            segments.call(segmentDrag);
            availableSegmentsG.call(this.dragSource, DrageObjectType.AvailableSegment, this);
            //#endregion Available segments
            //#region Curren segment
            // we use a cobntainer so that the actual element alwais strats with 0 trnasform - easier to manage drag
            d3.select("#currentSegmentContainer" + this._chartUniqueSuffix).remove();
            var currentSegmentGroup = svg.append("g")
                .attr("id", "currentSegmentContainer" + this._chartUniqueSuffix)
                .attr("transform", "translate("
                + (containerWidth - this.AVAILABLE_SEGMENTS_DIMENSIONS.width)
                + ","
                + (availableSegmentsTop - this.AVAILABLE_SEGMENTS_DIMENSIONS.spacing - this.AVAILABLE_SEGMENTS_DIMENSIONS.height) + ")")
                .append("g")
                .data(this._segmentDescriptions.filter(function (seg) { return seg.id == data.xAxisSegmentId; }))
                .attr("id", "currentSegment" + this._chartUniqueSuffix)
                .attr("class", function (d) { return ("currentSegment " + d.cssClass); })
                .call(this.dragTarget, DrageObjectType.CurrentXAxisSegment, this)
                .call(this.dragSource, DrageObjectType.CurrentXAxisSegment, this);
            currentSegmentGroup.append("rect")
                .transition()
                .attr("x", function (d, i) { return i * (_this.AVAILABLE_SEGMENTS_DIMENSIONS.width + _this.AVAILABLE_SEGMENTS_DIMENSIONS.spacing + _this.CONTROL_MARGINS.left); })
                .attr("rx", this.AVAILABLE_SEGMENTS_DIMENSIONS.rounding)
                .attr("ry", this.AVAILABLE_SEGMENTS_DIMENSIONS.rounding)
                .attr("width", this.AVAILABLE_SEGMENTS_DIMENSIONS.width)
                .attr("height", this.AVAILABLE_SEGMENTS_DIMENSIONS.height);
            currentSegmentGroup.append("text")
                .transition()
                .attr("x", function (d, i) { return i * (_this.AVAILABLE_SEGMENTS_DIMENSIONS.width + _this.AVAILABLE_SEGMENTS_DIMENSIONS.spacing) + _this.AVAILABLE_SEGMENTS_DIMENSIONS.spacing; })
                .attr("y", this.AVAILABLE_SEGMENTS_DIMENSIONS.height / 2)
                .attr("dy", 4)
                .attr("class", function (d) { return ("currentSegment text " + d.cssClass); })
                .text(function (d) { return d.displayName; });
            //#endregion Curren segment
            //#region Data marker
            // create data marker last so that it is on top of the others:
            d3.select("#dataMarker" + this._chartUniqueSuffix).remove();
            var dataMarker = svg.append("g")
                .style("pointer-events", "none")
                .attr("id", "dataMarker" + this._chartUniqueSuffix);
            dataMarker.append("text")
                .style("text-anchor", "end");
            //#endregion Data marker
        };
        Painter.prototype.getAvailableSegments = function (xAxisSegmentId) {
            var segments = this._segmentDescriptions.slice(0);
            // Remove current filters:
            this._currentFilteringSegments.forEach(function (fltr) {
                var filterSegment = segments.filter(function (seg) { return seg.id == fltr.segmentId; });
                if (filterSegment.length > 0) {
                    segments.splice(segments.indexOf(filterSegment[0]), 1);
                }
                /* consider:Remove parents of current filters
                    one habd: no need to filter or slice to chapter when alredy filtered by subchapter
                    other hand: can be used as a quick way to access description of segments higher in the hirarchy
                */
            });
            // Remove current x axis segment:
            var filterSegment = segments.filter(function (seg) { return seg.id == xAxisSegmentId; });
            segments.splice(segments.indexOf(filterSegment[0]), 1);
            return segments;
        };
        Painter.prototype.getSegmentValueId = function (segment) {
            return segment.segmentId + "_" + segment.valueId;
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
        Painter.prototype.getSegmentDescription = function (segmentId) {
            return this._segmentDescriptions.filter(function (seg) { return seg.id == segmentId; })[0];
        };
        Painter.prototype.setDragStartPostion = function () {
            var svg = d3.select("#controlSvg" + this._chartUniqueSuffix);
            this._dragStartPosition = d3.mouse(svg.node());
        };
        Painter.prototype.dragChartStart = function (segment) {
            this.dragStart(this, segment, DrageObjectType.ChartSegment);
        };
        Painter.prototype.dragChart = function (widthOfAllData, width, height) {
            var svg = d3.select("#controlSvg" + this._chartUniqueSuffix);
            var chartBaseCoordinates = d3.mouse(svg.node());
            var x = chartBaseCoordinates[0];
            var y = chartBaseCoordinates[1];
            var dx = x - this._dragStartPosition[0];
            var contentG = d3.select("#contentGroup" + this._chartUniqueSuffix);
            var segmentsA = contentG.selectAll(".segment");
            var xTransform = (this._segementsXTransfomation + dx);
            xTransform = xTransform < 0 ? xTransform : 0;
            var scale = 1;
            var maxTranslateX = widthOfAllData * scale - width;
            if (maxTranslateX > 0) {
                xTransform = xTransform < (-maxTranslateX) ? (-maxTranslateX) : xTransform;
            }
            ;
            segmentsA.attr("transform", "matrix(1,0,0,1," + xTransform + ",0)");
            svg.select(".x.axis")
                .attr("transform", "translate(" + xTransform + "," + height + ")")
                .call(this._xAxis.scale(this._xScale.rangeRoundBands([0, widthOfAllData * scale], .1 * scale)));
        };
        Painter.prototype.dragChartEnd = function (segment) {
            var svg = d3.select("#controlSvg" + this._chartUniqueSuffix);
            var dx = d3.mouse(svg.node())[0] - this._dragStartPosition[0];
            this._segementsXTransfomation += dx;
            this.dragEnd(this, segment, DrageObjectType.ChartSegment);
        };
        Painter.prototype.dragTarget = function (source, targetType, self) {
            source.on("mouseover", function (d) {
                self._dragTarget = d;
                self._drageTargetType = targetType;
                var dragTargetSelection = d3.select(this);
                if (self._drageSourceType != DrageObjectType.None) {
                    var selections = self.getDragTargets(self._drageSourceType);
                    var isRelevantTarget = false;
                    selections.forEach(function (selection) {
                        var v = selection.filter(function (d) { return d == dragTargetSelection.datum(); });
                        if (v.size() > 0) {
                            isRelevantTarget = true;
                            return;
                        }
                    });
                    if (isRelevantTarget) {
                        dragTargetSelection.classed("dragSourceOver", true);
                    }
                }
            })
                .on("mouseout", function (d) {
                self._dragTarget = null;
                self._drageTargetType = null;
                if (self._drageSourceType != DrageObjectType.None) {
                    d3.select(this).classed("dragSourceOver", false);
                }
            });
            return source;
        };
        Painter.prototype.dragSource = function (source, drageSourceType, self) {
            var drag = d3.behavior.drag()
                .on("dragstart", function () {
                self.dragStart(self, this, drageSourceType);
            })
                .on("drag", function () {
                self.drag(self, this, drageSourceType);
            })
                .on("dragend", function () {
                self.dragEnd(self, this, drageSourceType);
            });
            source.call(drag);
            return source;
        };
        Painter.prototype.dragStart = function (self, drageSource, dragSourceType) {
            self.setDragStartPostion();
            self._drageSourceType = dragSourceType;
            self._dragSource = d3.select(drageSource).datum();
            d3.select(drageSource).style("pointer-events", "none");
            this.markDragTragets(dragSourceType);
        };
        Painter.prototype.drag = function (self, drageSource, dragSourceType) {
            var svg = d3.select("#controlSvg" + self._chartUniqueSuffix);
            var chartBaseCoordinates = d3.mouse(svg.node());
            var x = chartBaseCoordinates[0];
            var y = chartBaseCoordinates[1];
            var dx = x - self._dragStartPosition[0];
            var dy = y - self._dragStartPosition[1];
            d3.select(drageSource)
                .attr("transform", "translate(" + dx + "," + dy + ")");
        };
        Painter.prototype.dragEnd = function (self, drageSource, dragSourceType) {
            d3.select(drageSource).style("pointer-events", "all");
            self.unmarkDragTragets(dragSourceType);
            if (dragSourceType == DrageObjectType.Breadcrumb) {
                var svg = d3.select("#controlSvg" + this._chartUniqueSuffix);
                var chartBaseCoordinates = d3.mouse(svg.node());
                var x = chartBaseCoordinates[0];
                var y = chartBaseCoordinates[1];
                var dx = x - this._dragStartPosition[0];
                var dy = y - this._dragStartPosition[1];
                var dragDistance = Math.sqrt(dx * dx + dy * dy);
                if (dragDistance > this.BREADCRUMB_DRAG_TO_DELETE_DISTANCE) {
                    var seg = this._dragSource;
                    var index = this._currentFilteringSegments.indexOf(seg);
                    this._currentFilteringSegments.splice(index, 1);
                    var requestParams = {
                        requestedSegmentId: self._currentXSegmentId,
                        filterSegments: this._currentFilteringSegments,
                        date: null
                    };
                    var newData = this._dataCallback(requestParams);
                    //self._clickX = d3.event.x;
                    this.drawData(newData);
                    return;
                }
            }
            switch (self._drageTargetType) {
                case DrageObjectType.CurrentXAxisSegment:
                    if (dragSourceType == DrageObjectType.AvailableSegment) {
                        this.changeCurrentSegmentWithAvailablSegment(self._dragTarget, self._dragSource);
                    }
                    else {
                        this.returnDragSourceToOriginalPosition(drageSource);
                    }
                    break;
                case DrageObjectType.AvailableSegment:
                    switch (self._drageSourceType) {
                        case DrageObjectType.CurrentXAxisSegment:
                            this.changeCurrentSegmentWithAvailablSegment(self._dragSource, self._dragTarget);
                            break;
                        case DrageObjectType.ChartSegment:
                            this.drillDownToSegment(self._dragSource, self._dragTarget);
                            break;
                        default:
                            this.returnDragSourceToOriginalPosition(drageSource);
                            break;
                    }
                    break;
                case DrageObjectType.ChartSegment:
                    if (dragSourceType == DrageObjectType.AvailableSegment) {
                        this.drillDownToSegment(self._dragTarget, self._dragSource);
                    }
                    else {
                        this.returnDragSourceToOriginalPosition(drageSource);
                    }
                    break;
                case DrageObjectType.None:
                default:
                    this.returnDragSourceToOriginalPosition(drageSource);
                    break;
            }
            self._drageSourceType = DrageObjectType.None;
            self._dragSource = null;
        };
        Painter.prototype.returnDragSourceToOriginalPosition = function (dragSource) {
            if (this._drageSourceType == DrageObjectType.ChartSegment) {
                return;
            }
            d3.select(dragSource)
                .transition()
                .attr("transform", "translate(0,0)");
        };
        Painter.prototype.markDragTragets = function (dragSourceType) {
            var dragTragetSelectors = this.getDragTargets(dragSourceType);
            dragTragetSelectors.forEach(function (slct) { return slct.classed("dragTraget", true); });
        };
        Painter.prototype.unmarkDragTragets = function (dragSourceType) {
            var dragTragetSelectors = this.getDragTargets(dragSourceType);
            dragTragetSelectors.forEach(function (slct) { return slct.classed("dragTraget", false); });
        };
        Painter.prototype.getDragTargets = function (dragSourceType) {
            switch (dragSourceType) {
                case DrageObjectType.AvailableSegment:
                    return [
                        d3.select("#currentSegment"),
                        d3.selectAll(".segment"),
                    ];
                    break;
                case DrageObjectType.ChartSegment:
                    return [
                        d3.selectAll(".availableSegment"),
                    ];
                    break;
                case DrageObjectType.CurrentXAxisSegment:
                    return [
                        d3.selectAll(".availableSegment"),
                    ];
                    break;
                default:
                    return [];
                    break;
            }
        };
        Painter.prototype.drillDownToSegment = function (drilledSegment, newXAxisSegment) {
            this._currentFilteringSegments.push(drilledSegment.segment);
            var requestParams = {
                requestedSegmentId: newXAxisSegment.id,
                filterSegments: this._currentFilteringSegments,
                date: null
            };
            var newData = this._dataCallback(requestParams);
            //self._clickX = d3.event.x;
            this.drawData(newData);
        };
        Painter.prototype.changeCurrentSegmentWithAvailablSegment = function (xSegment, availableSegment) {
            var requestParams = {
                requestedSegmentId: availableSegment.id,
                filterSegments: this._currentFilteringSegments,
                date: null
            };
            var newData = this._dataCallback(requestParams);
            //self._clickX = d3.event.x;
            this.drawData(newData);
        };
        Painter.prototype.breadcrumbPoints = function (d, i) {
            var points = [];
            points.push("0,0");
            points.push(this.BREADCRUMB_DIMENSIONS.width + ",0");
            points.push(this.BREADCRUMB_DIMENSIONS.width + this.BREADCRUMB_DIMENSIONS.tip + "," + (this.BREADCRUMB_DIMENSIONS.height / 2));
            points.push(this.BREADCRUMB_DIMENSIONS.width + "," + this.BREADCRUMB_DIMENSIONS.height);
            points.push("0," + this.BREADCRUMB_DIMENSIONS.height);
            if (i > 0) {
                points.push(this.BREADCRUMB_DIMENSIONS.tip + "," + (this.BREADCRUMB_DIMENSIONS.height / 2));
            }
            return points.join(" ");
        };
        return Painter;
    })();
    exports.Painter = Painter;
    var DrageObjectType;
    (function (DrageObjectType) {
        DrageObjectType[DrageObjectType["None"] = 0] = "None";
        DrageObjectType[DrageObjectType["ChartSegment"] = 1] = "ChartSegment";
        DrageObjectType[DrageObjectType["AvailableSegment"] = 2] = "AvailableSegment";
        DrageObjectType[DrageObjectType["CurrentXAxisSegment"] = 3] = "CurrentXAxisSegment";
        DrageObjectType[DrageObjectType["Breadcrumb"] = 4] = "Breadcrumb";
    })(DrageObjectType || (DrageObjectType = {}));
});
//# sourceMappingURL=SeriesBySegmentsGraph.js.map