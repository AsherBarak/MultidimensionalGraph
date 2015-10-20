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
    var Painter = (function () {
        function Painter() {
            this.STARTUP_BAR_WIDTH = 25;
            this.MARGIN_BETWEEN_BAR_GROUPS = 0.1;
            /**
             * Zoom based on dragging the chard also invokes the click event.
             * We make sure some time elapsed beween last zoom and click invocation.
            */
            this.ZOOM_CLICK_AVOID_DELAY = 500;
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
            this._self = this;
            this._clickX = -1;
            this._lastZoomScale = 1;
            this._lastZoomtanslateX = 0;
            this._lastZoomtanslateY = 0;
            this._lastZoomTime = Date.now();
            this._segementsXTransfomation = 0;
            this._dragTarget = null;
            this._drageTargetType = DrageObjectType.None;
            this._dragSource = null;
            this._drageSourceType = DrageObjectType.None;
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
            this._dataCallback = dataCallback;
            this._currentFilteringSegments = startFilters == null ? [] : startFilters;
            var container = d3.select(chartContainer);
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
            var contentGA = chartGroup.append("g").attr("id", "contentGroup" + this._chartUniqueSuffix);
            svg.append("g")
                .attr("id", "availableSegments" + this._chartUniqueSuffix);
            this.drawData(data);
        };
        Painter.prototype.drawData = function (data) {
            var _this = this;
            this._segementsXTransfomation = 0;
            this._currentXSegmentId = data.xAxisSegmentId;
            var container = d3.select(this._chartContainer);
            var containerWidth = +container.attr("width"), containerHeight = +container.attr("height");
            var svg = container.select("#controlSvg" + this._chartUniqueSuffix)
                .attr("width", containerWidth)
                .attr("height", containerHeight);
            var breadcrumbsTop = (this.CONTROL_MARGINS.top + this.BREADCRUMBS_MARGINS.top);
            var breadcrubmesGroup = d3.select("#breadcrumbsGroup" + this._chartUniqueSuffix)
                .attr("transform", "translate(" + (this.BREADCRUMBS_MARGINS.left + this.CONTROL_MARGINS.left) + "," + breadcrumbsTop + ")");
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
            var chartGroup = svg.select("#chartGroup" + this._chartUniqueSuffix)
                .attr("transform", "translate(" + this.CONTROL_MARGINS.left + "," + chartTop + ")");
            var itemsPerSegment = d3.max(data.segments.map(function (seg) { return seg.dataItems.length; }));
            var startupSegmentWidth = itemsPerSegment * this.STARTUP_BAR_WIDTH * (1 + 2 * this.MARGIN_BETWEEN_BAR_GROUPS);
            var widthOfAllData = startupSegmentWidth * data.segments.length;
            var overlay = d3.select("#overlay" + this._chartUniqueSuffix)
                .attr("width", chartWidth)
                .attr("height", chartHeight);
            this._xScale.rangeRoundBands([0, widthOfAllData], this.MARGIN_BETWEEN_BAR_GROUPS);
            this._yScale.range([chartHeight, 0]);
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
            var xAxis = d3.select("#xAxis" + this._chartUniqueSuffix)
                .attr("transform", "translate(0," + chartHeight + ")")
                .transition().duration(750).ease("sin-in-out")
                .call(this._xAxis);
            var availableSegmentsTop = chartTop
                + chartHeight
                + this.AVAILABLE_SEGMENTS_MARGINS.top;
            var availableSegmentsGroup = d3.select("#availableSegments" + this._chartUniqueSuffix)
                .attr("transform", "translate(" + (this.CONTROL_MARGINS.left + this.AVAILABLE_SEGMENTS_MARGINS.left) + "," + availableSegmentsTop + ")");
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
            d3.select("#contentClipRect" + this._chartUniqueSuffix)
                .attr("width", chartWidth) //Set the width of the clipping area
                .attr("x", +yAxisGroup.attr("width"))
                .attr("height", chartHeight); // set the height of the clipping area
            d3.select("#xAxisClipRect" + this._chartUniqueSuffix)
                .attr("width", chartWidth) //Set the width of the clipping area
                .attr("height", chartHeight + this.CONTROL_MARGINS.bottom); // set the height of the clipping area
            var contentG = d3.select("#contentGroup" + this._chartUniqueSuffix);
            contentG.attr("clip-path", "url(#chartClipPath" + this._chartUniqueSuffix + ")");
            var segments = contentG.selectAll(".segment")
                .data(data.segments, function (seg) { return _this.getSegmentValueId(seg.segment); });
            segments.enter()
                .append("g")
                .attr("class", "segment");
            var exitingSegments = segments.exit();
            // exit segemtns not clicked:
            exitingSegments.transition()
                .style("opacity", 0).remove();
            var self = this;
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
            var segmentDrag = d3.behavior.drag()
                .on("dragstart", function () {
                self.dragChartStart(this);
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
                self.dragChartEnd(this);
                /*
                if (self._dragTarget == null) {
                    return;
                }

                var targetSelection = d3.select(self._dragTarget);
                if (self._drageTargetType == DrageObjectType.AvailableSegment) {
                    if (Date.now() - self._lastZoomTime < self.ZOOM_CLICK_AVOID_DELAY) {
                        return;
                    }
                    self._currentFilteringSegments.push(d3.select(this).datum().segment);

                    var requestParams: SegmentRequestParams = {
                        requestedSegmentId: self._dragTarget.id,
                        filterSegments: self._currentFilteringSegments,
                        date: null
                    };
                    var newData = self._dataCallback(requestParams)
                    self._clickX = d3.event.x;
                    self.drawData(newData);
                }
                */
            });
            var zoom = d3.behavior.zoom().scaleExtent([chartWidth / widthOfAllData, chartWidth / (startupSegmentWidth * 2)]).on("zoom", function () {
                var scale = d3.event.scale;
                var translateX = d3.event.translate[0];
                var translateY = d3.event.translate[1];
                // Prevent data from moving away from y axis:
                translateX = translateX > 0 ? 0 : translateX;
                var maxTranslateX = widthOfAllData * scale - chartWidth;
                translateX = translateX < (-maxTranslateX) ? (-maxTranslateX) : translateX;
                var segmentsA = contentG.selectAll(".segment");
                segmentsA.attr("transform", "matrix(" + scale + ",0,0,1," + translateX + ",0)");
                svg.select(".x.axis")
                    .attr("transform", "translate(" + translateX + "," + (chartHeight) + ")")
                    .call(self._xAxis.scale(self._xScale.rangeRoundBands([0, widthOfAllData * scale], .1 * scale)));
                var isRealZoomEvent = self._lastZoomScale != scale
                    || self._lastZoomtanslateX != translateX
                    || self._lastZoomtanslateY != translateY;
                if (isRealZoomEvent) {
                    self._lastZoomTime = Date.now();
                    self._lastZoomScale = scale;
                    self._lastZoomtanslateX = translateX;
                    self._lastZoomtanslateY = translateY;
                }
                //this._tooltip.hide();
            });
            this._tooltip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function (d) { return "<strong>" + d.dataItem.seriesId + ":</strong> <span style='color:red'>" + d.dataItem.value + "</span>"; });
            var bars = segments.selectAll("rect")
                .data(function (sdi) { return sdi.dataItems.map(function (dataItem) { return { dataItem: dataItem, segment: sdi }; }); }, function (itm) { return _this.getSegmentValueId(itm.segment.segment) + "_" + itm.dataItem.seriesId; });
            /*
                    bars.on("click", () => {
                        var v = [];
                        for (var index = 0; index < v.length; index++) {
                            var element = v[index];
                            
                        }
                    })
            */
            var barEnterStartX = this._clickX < 0 ? chartWidth / 2 : this._clickX - (startupSegmentWidth / 2), barEnterStartY = chartHeight;
            bars.enter()
                .append("rect")
                .attr("class", function (itm) { return _this.getSeries(itm.dataItem.seriesId).cssClass; })
                .attr("x", barEnterStartX)
                .attr("y", barEnterStartY)
                .transition().duration(1500)
                .attr("x", function (itm, i) { return _this._xScale(_this.getSegmentValueId(itm.segment.segment)) + i * _this._xScale.rangeBand() / itemsPerSegment; })
                .attr("width", function (itm) { return _this._xScale.rangeBand() / itemsPerSegment; })
                .attr("y", function (itm) { return _this._yScale(itm.dataItem.value); })
                .attr("data-ziv-val", function (itm) { return itm.dataItem.value; })
                .attr("height", function (itm) { return chartHeight - _this._yScale(itm.dataItem.value); });
            bars.exit().remove();
            bars.on("mouseover", function () {
                var v = 3;
            });
            segments.call(this.dragTarget, DrageObjectType.ChartSegment, this);
            //segments.on("click.drag", () => d3.event.stopPropagation());
            var self = this;
            segments.on("click", (function (seg) {
                // Animate clicked segemtn to reload animation:
                /*
                d3.select(<Node>this)
                    .transition()
                    .attr("transform", "rotate(30)")
                */
                if (Date.now() - self._lastZoomTime < self.ZOOM_CLICK_AVOID_DELAY) {
                    return;
                }
                self._currentFilteringSegments.push(seg.segment);
                var requestParams = {
                    requestedSegmentId: "item",
                    filterSegments: self._currentFilteringSegments,
                    date: null
                };
                var newData = self._dataCallback(requestParams);
                self._clickX = d3.event.x;
                self.drawData(newData);
            }));
            var breadcrumbs = breadcrubmesGroup
                .selectAll(".breadcrumb")
                .data(this._currentFilteringSegments, function (seg) { return _this.getSegmentValueId(seg); });
            var crumbEnter = breadcrumbs.enter()
                .append("g")
                .attr("class", function (d) { return ("breadcrumb " + _this.getSegmentDescription(d.segmentId).cssClass); });
            //crumb.append("rect")
            //    .attr("x", (d, i) => i * (this.BREADCRUMB_DIMENSIONS.width + this.BREADCRUMB_DIMENSIONS.spacing))
            //    .attr("width", this.BREADCRUMB_DIMENSIONS.width)
            //    .attr("height", this.BREADCRUMB_DIMENSIONS.height);
            crumbEnter.append("polygon")
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
            //.style("fill", function (d) { return colors[d.name]; });
            crumbEnter.append("text")
                .attr("x", function (d, i) { return i * (_this.BREADCRUMB_DIMENSIONS.width + _this.BREADCRUMB_DIMENSIONS.spacing) + _this.BREADCRUMB_DIMENSIONS.tip + _this.BREADCRUMB_DIMENSIONS.textSpacing; })
                .attr("y", this.BREADCRUMB_DIMENSIONS.height / 2)
                .attr("dy", "0.35em")
                .attr("class", function (d) { return ("breadcrumb text " + _this.getSegmentDescription(d.segmentId).cssClass); })
                .text(function (d) { return d.displayName; });
            breadcrumbs.exit().transition().remove();
            breadcrumbs.call(this.dragSource, DrageObjectType.Breadcrumb, this);
            var availableSegments = this.getAvailableSegments(data.xAxisSegmentId);
            var availableSegmentsG = availableSegmentsGroup
                .selectAll(".availableSegment")
                .data(availableSegments, function (seg) { return seg.id; });
            availableSegmentsG.exit().transition().remove();
            var availableSegEnter = availableSegmentsG.enter()
                .append("g")
                .attr("class", function (d) { return ("availableSegment " + d.cssClass); })
                .call(this.dragTarget, DrageObjectType.AvailableSegment, self);
            //.attr("class", d=> ("availableSegment"));
            availableSegEnter.append("rect");
            availableSegmentsG.select("rect")
                .transition()
                .attr("x", function (d, i) { return i * (_this.AVAILABLE_SEGMENTS_DIMENSIONS.width + _this.AVAILABLE_SEGMENTS_DIMENSIONS.spacing); })
                .attr("rx", this.AVAILABLE_SEGMENTS_DIMENSIONS.rounding)
                .attr("ry", this.AVAILABLE_SEGMENTS_DIMENSIONS.rounding)
                .attr("width", this.AVAILABLE_SEGMENTS_DIMENSIONS.width)
                .attr("height", this.AVAILABLE_SEGMENTS_DIMENSIONS.height);
            availableSegEnter.append("text");
            availableSegmentsG.select("text")
                .transition()
                .attr("x", function (d, i) { return i * (_this.AVAILABLE_SEGMENTS_DIMENSIONS.width + _this.AVAILABLE_SEGMENTS_DIMENSIONS.spacing) + _this.AVAILABLE_SEGMENTS_DIMENSIONS.textSpacing; })
                .attr("y", this.AVAILABLE_SEGMENTS_DIMENSIONS.height / 2)
                .attr("dy", 4)
                .attr("class", function (d) { return ("availableSegment text " + d.cssClass); })
                .text(function (d) { return d.displayName; });
            //	svg.call(zoom).on("click.zoom", null);
            segments.call(segmentDrag);
            overlay.call(overlayDrag);
            availableSegmentsG.call(this.dragSource, DrageObjectType.AvailableSegment, this);
            //bars.call(barDrag);
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
            // create data marker last so that it is on top of the others:
            d3.select("#dataMarker" + this._chartUniqueSuffix).remove();
            var dataMarker = svg.append("g")
                .attr("id", "dataMarker" + this._chartUniqueSuffix)
                .append("circle")
                .attr("r", 30)
                .style("fill", "red")
                .style("pointer-events", "none");
        };
        Painter.prototype.getAvailableSegments = function (xAxisSegmentId) {
            var segments = this._segmentDescriptions.slice(0);
            this._currentFilteringSegments.forEach(function (fltr) {
                var filterSegment = segments.filter(function (seg) { return seg.id == fltr.segmentId; });
                if (filterSegment.length > 0) {
                    segments.splice(segments.indexOf(filterSegment[0]), 1);
                }
            });
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
            xTransform = xTransform < (-maxTranslateX) ? (-maxTranslateX) : xTransform;
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
            })
                .on("mouseout", function (d) {
                self._dragTarget = null;
                self._drageTargetType = null;
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
            d3.select(dragSource)
                .transition()
                .attr("transform", "translate(0,0)");
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