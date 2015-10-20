/**
 * @example: Budget, Actual expanditure
 */
export interface SeriesDescription {
    id: string;
    cssClass: string;
    displayName: string;
    description: string;
}

export class DataItem {
    seriesId: string;
    value: number;
}

/** 
 * @example
 *  Project, Subproject, Item etc. 
 * */
export interface SegmentDescription {
    id: string;
    cssClass: string;
    displayName: string;
    description: string;
    parentSegmentsIds?: string[];
}

/** 
 * The value of a segment. This export class contains only the key of the segemnt. The {@link SegmentValueForDisplay} export class has the decription.  
 * @example
 * key of Project A (Project segment), key of Subproject 22 (Subproject segment), key of Hammer (Items segmenty)*/
export class SegmentValue {
    segmentId: string;
    valueId: string;
}

export class SegmentValueForDisplay extends SegmentValue {
    displayName: string;
    description: string;
}

export class DataRequestParams {
	/** 
	 * Values  of the segments used to filter the desired results. 
	 * Values of the same segment ar treated with OR. Vaules of different segments are treated with AND.
	 * */
    filterSegments: SegmentValue[];
    date: Date;
}

export class SegmentRequestParams extends DataRequestParams {
	/** 
	 * Id's of segments by which the retrived data should to be segmented.
	*/
    requestedSegmentId: string;
}

export class TimelineRequestParams extends DataRequestParams {
    startDate: Date;
    endDate: Date;
}

export class RetrivedData {
    yAxisDisplayName: string;
    xAxisSegmentId: string;
}

export class SegmentDataItems {
	/**
	 * @exapmle 
	 * Project 22
	 */
    segment: SegmentValueForDisplay;
	/**
	 * @exapmle 
	 * Budget: 22, Actual expanditure: 15
	 */
    dataItems: DataItem[];
}

export class SegmentsData extends RetrivedData {
    segments: SegmentDataItems[];
}

export class TimelineDataItem {
    date: Date;
    item: DataItem;
}

export class TimelineData extends RetrivedData {
    data: TimelineDataItem[];
}


export class Painter {
    private STARTUP_BAR_WIDTH: number = 25;
    private MARGIN_BETWEEN_BAR_GROUPS: number = 0.1;
	/** 
	 * Zoom based on dragging the chard also invokes the click event.
	 * We make sure some time elapsed beween last zoom and click invocation. 
	*/
    private ZOOM_CLICK_AVOID_DELAY: number = 500;

    private CONTROL_MARGINS = { top: 20, right: 20, bottom: 20, left: 40 };
    private BREADCRUMB_DRAG_TO_DELETE_DISTANCE = 80;
    private BREADCRUMBS_MARGINS = { top: 0, right: 0, bottom: 20, left: 0 };
    private BREADCRUMB_DIMENSIONS = {
        width: 75, height: 30, spacing: 3, tip: 10, textSpacing: 2
    };
    private AVAILABLE_SEGMENTS_MARGINS = { top: 20, right: 0, bottom: 0, left: 0 };
    private AVAILABLE_SEGMENTS_DIMENSIONS = {
        width: 75, height: 30, spacing: 3, textSpacing: 2, rounding: 3
    };

    private _self = this;

    private _seriesDescriptions: SeriesDescription[];
    private _segmentDescriptions: SegmentDescription[];
    private _chartUniqueSuffix: string;

    private _chartContainer: string;
    private _xScale: d3.scale.Ordinal<string, number>;
    private _yScale: d3.scale.Linear<number, number>;
    private _xAxis: d3.svg.Axis;
    private _yAxis: d3.svg.Axis;
    private _tooltip: d3.Tip<fullDataItem>;
    private _dataCallback: (params: SegmentRequestParams) => SegmentsData;
    private _currentFilteringSegments: SegmentValueForDisplay[];

    private _clickX: number = -1;
    private _lastZoomScale: number = 1;
    private _lastZoomtanslateX: number = 0;
    private _lastZoomtanslateY: number = 0;
    private _lastZoomTime: number = Date.now();

    private _dragStartPosition: [number, number];
    private _segementsXTransfomation: number = 0;
    private _dragTarget: any = null;
    private _drageTargetType: DrageObjectType = DrageObjectType.None;
    private _dragSource: any = null;
    private _drageSourceType: DrageObjectType = DrageObjectType.None;

    private _currentXSegmentId: string;

    setup(
        seriesDescriptions: SeriesDescription[],
        segmentDescriptions: SegmentDescription[],
        data: SegmentsData,
        dataCallback: (params: SegmentRequestParams) => SegmentsData,
		/**
		 * Search string for the page element to contain the chart:
		 * @example
		 * "#elmentId",".elementCalss","body"
		 */
        chartContainer: string,
        startFilters: SegmentValueForDisplay[] = null,
		/**
		 * When using more than one chart in a single page this value is appende to elements unique id's 
		 */
        chartUniqueSuffix: string = "") {
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

        this._xScale = d3.scale.ordinal<string, number>();
        this._yScale = d3.scale.linear();

        this._xAxis = d3.svg.axis()
            .scale(this._xScale)
            .orient("bottom");
        this._yAxis = d3.svg.axis()
            .scale(this._yScale)
            .orient("left")
            .ticks(10)
	
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
    }

    drawData(data: SegmentsData) {
        this._segementsXTransfomation = 0;
        this._currentXSegmentId = data.xAxisSegmentId;
        var container = d3.select(this._chartContainer);

        var containerWidth: number = +container.attr("width"),
            containerHeight: number = +container.attr("height");

        var svg = container.select("#controlSvg" + this._chartUniqueSuffix)
            .attr("width", containerWidth)
            .attr("height", containerHeight);

        var breadcrumbsTop = (this.CONTROL_MARGINS.top + this.BREADCRUMBS_MARGINS.top);


        var chartWidth = containerWidth - this.CONTROL_MARGINS.left - this.CONTROL_MARGINS.right,
            chartHeight = containerHeight
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


        var itemsPerSegment = d3.max(data.segments.map(seg=> seg.dataItems.length));
        var startupSegmentWidth = itemsPerSegment * this.STARTUP_BAR_WIDTH * (1 + 2 * this.MARGIN_BETWEEN_BAR_GROUPS);
        var widthOfAllData = startupSegmentWidth * data.segments.length;

        var overlay = d3.select("#overlay" + this._chartUniqueSuffix)
            .attr("width", chartWidth)
            .attr("height", chartHeight);

        this._xScale.rangeRoundBands([0, widthOfAllData], this.MARGIN_BETWEEN_BAR_GROUPS);
        this._yScale.range([chartHeight, 0]);

        var maxValue =
            d3.max(
                data.segments.map(seg=>
                { return d3.max(seg.dataItems.map(itm=> itm.value)); }
                    ));

        this._xScale.domain(data.segments.map(d=> this.getSegmentValueId(d.segment)));
        this._yScale.domain([0, maxValue]);

        var self = this;
        this._xAxis.tickFormat(function(segKey): string {
            var length = data.segments.length;
            for (var index = 0; index < length; index++) {
                var element = data.segments[index];
                if (self.getSegmentValueId(element.segment) == segKey) {
                    return element.segment.displayName;
                }
            }
            return "err";
        }
            );

        var xAxis = d3.select("#xAxis" + this._chartUniqueSuffix)
            .attr("transform", "translate(0," + chartHeight + ")")
            .transition().duration(750).ease("sin-in-out")
            .call(this._xAxis);


        var availableSegmentsTop = chartTop
            + chartHeight
        // todo: add x axis height
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
            .data(data.segments, seg=> this.getSegmentValueId(seg.segment));

        segments.enter()
            .append("g")
            .attr("class", "segment");

        var exitingSegments = segments.exit();

        // exit segemtns not clicked:
        exitingSegments.transition()
            .style("opacity", 0).remove();

        var self = this;
        var overlayDrag = d3.behavior.drag()
            .on("dragstart", function() {
                self.setDragStartPostion();
            })
            .on("drag", function() {
                self.dragChart(widthOfAllData, chartWidth, chartHeight);
            })
            .on("dragend", function() {
                self.dragChartEnd(this);
            });

        var segmentDrag = d3.behavior.drag()
            .on("dragstart", function() {
                self.dragChartStart(this);
            })
            .on("drag", function() {
                var chartBaseCoordinates = d3.mouse(svg.node())
                var x = chartBaseCoordinates[0];
                var y = chartBaseCoordinates[1];
                d3.select("#dataMarker" + self._chartUniqueSuffix)
                    .attr("transform", "translate(" + (x - 0) + "," + (y - 0) + ")");
                self.dragChart(widthOfAllData, chartWidth, chartHeight);
            })
            .on("dragend", function() {
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
        /*
    var zoom = d3.behavior.zoom().scaleExtent([chartWidth / widthOfAllData, chartWidth / (startupSegmentWidth * 2)]).on("zoom", () => {
        var scale = (<any>d3.event).scale;
        var translateX: number = (<any>d3.event).translate[0];
        var translateY: number = (<any>d3.event).translate[1];
        // Prevent data from moving away from y axis:
        translateX = translateX > 0 ? 0 : translateX;
        var maxTranslateX = widthOfAllData * scale - chartWidth;
        translateX = translateX < (-maxTranslateX) ? (-maxTranslateX) : translateX;
        var segmentsA = contentG.selectAll(".segment")
        segmentsA.attr("transform", "matrix(" + scale + ",0,0,1," + translateX + ",0)")
        svg.select(".x.axis")
            .attr("transform", "translate(" + translateX + "," + (chartHeight) + ")")
            .call(self._xAxis.scale(self._xScale.rangeRoundBands([0, widthOfAllData * scale], .1 * scale)));

        var isRealZoomEvent: boolean =
            self._lastZoomScale != scale
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

    this._tooltip = d3.tip<fullDataItem>()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(
        d=> "<strong>" + d.dataItem.seriesId + ":</strong> <span style='color:red'>" + d.dataItem.value + "</span>"
        );
*/
        var bars = segments.selectAll("rect")
            .data(
                sdi=> sdi.dataItems.map(dataItem=> { return { dataItem: dataItem, segment: sdi } }),
                itm=> this.getSegmentValueId(itm.segment.segment) + "_" + itm.dataItem.seriesId);

		/*
				bars.on("click", () => {
					var v = [];
					for (var index = 0; index < v.length; index++) {
						var element = v[index];
						
					}
				})
		*/
        var barEnterStartX = this._clickX < 0 ? chartWidth / 2 : this._clickX - (startupSegmentWidth / 2),
            barEnterStartY = chartHeight;

        bars.enter()
            .append("rect")
            .attr("class", itm=> this.getSeries(itm.dataItem.seriesId).cssClass);

        bars
            .attr("x", barEnterStartX)
            .attr("y", barEnterStartY)
            .transition().duration(1500)
            .attr("x", (itm, i) => this._xScale(this.getSegmentValueId(itm.segment.segment)) + i * this._xScale.rangeBand() / itemsPerSegment)
            .attr("width", itm=> this._xScale.rangeBand() / itemsPerSegment)
            .attr("y", itm=> this._yScale(itm.dataItem.value))
            .attr("data-ziv-val", itm=> itm.dataItem.value)
            .attr("height", itm=> chartHeight - this._yScale(itm.dataItem.value))
        //.call(this._tooltip)
        //.on('mouseover', this._tooltip.show)
        //.on('mouseout', this._tooltip.hide)
        ;
        bars.exit().remove();

        bars.on("mouseover", function() {
            var v = 3;
        });

        segments.call(this.dragTarget, DrageObjectType.ChartSegment, this);

        /*
                //segments.on("click.drag", () => d3.event.stopPropagation());
                var self = this;
                segments.on("click",
                    (function(seg) {
                        // Animate clicked segemtn to reload animation:
                    	
                        d3.select(<Node>this)
                            .transition()
                            .attr("transform", "rotate(30)")
                    	
                        if (Date.now() - self._lastZoomTime < self.ZOOM_CLICK_AVOID_DELAY) {
                            return;
                        }
                        self._currentFilteringSegments.push(seg.segment);
        
                        var requestParams: SegmentRequestParams = {
                            requestedSegmentId: "item",
                            filterSegments: self._currentFilteringSegments,
                            date: null
                        };
                        var newData = self._dataCallback(requestParams)
                        self._clickX = d3.event.x;
                        self.drawData(newData);
        
                    })
                    );
        */

        var breadcrubmesGroup = d3.select("#breadcrumbsGroup" + this._chartUniqueSuffix)
            .attr("transform", "translate(" + (this.BREADCRUMBS_MARGINS.left + this.CONTROL_MARGINS.left) + "," + breadcrumbsTop + ")");

        var breadcrumbWrapperGroups =
            breadcrubmesGroup.selectAll("g.breadcrumb")
                .data(this._currentFilteringSegments, seg=> this.getSegmentValueId(seg));

        breadcrumbWrapperGroups.exit().transition().remove();

        var crumbEnter = breadcrumbWrapperGroups.enter()
            .append("g")
            .attr("class", d=> ("breadcrumb " + this.getSegmentDescription(d.segmentId).cssClass))
            .call(this.dragSource, DrageObjectType.Breadcrumb, this);;

        crumbEnter.append("polygon");

        breadcrumbWrapperGroups
            .select("polygon")
            .transition()
            .attr("points", (d, i) => {
                var beradcrumbStart = i * (this.BREADCRUMB_DIMENSIONS.width + this.BREADCRUMB_DIMENSIONS.spacing);
                var points = [];
                points.push("" + beradcrumbStart + ",0");
                points.push((beradcrumbStart + this.BREADCRUMB_DIMENSIONS.width) + ",0");
                points.push(beradcrumbStart + this.BREADCRUMB_DIMENSIONS.width + this.BREADCRUMB_DIMENSIONS.tip + "," + (this.BREADCRUMB_DIMENSIONS.height / 2));
                points.push(beradcrumbStart + this.BREADCRUMB_DIMENSIONS.width + "," + this.BREADCRUMB_DIMENSIONS.height);
                points.push("" + beradcrumbStart + "," + this.BREADCRUMB_DIMENSIONS.height);
                if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
                    points.push(beradcrumbStart + this.BREADCRUMB_DIMENSIONS.tip + "," + (this.BREADCRUMB_DIMENSIONS.height / 2));
                }
                return points.join(" ");
            })
        //.style("fill", function (d) { return colors[d.name]; });

        crumbEnter.append("text");

        breadcrumbWrapperGroups
            .select("text")
            .transition()
            .attr("x", (d, i) => i * (this.BREADCRUMB_DIMENSIONS.width + this.BREADCRUMB_DIMENSIONS.spacing) + this.BREADCRUMB_DIMENSIONS.tip + this.BREADCRUMB_DIMENSIONS.textSpacing)
            .attr("y", this.BREADCRUMB_DIMENSIONS.height / 2)
            .attr("dy", "0.35em")
            .attr("class", d=> ("breadcrumb text " + this.getSegmentDescription(d.segmentId).cssClass))
            .text(d=> d.displayName);

        var availableSegments = this.getAvailableSegments(data.xAxisSegmentId);

        var availableSegmentsG =
            availableSegmentsGroup
                .selectAll(".availableSegment")
                .data(availableSegments, seg=> seg.id);

        availableSegmentsG.exit().transition().remove();

        var availableSegEnter = availableSegmentsG.enter()
            .append("g")
            .attr("class", d=> ("availableSegment " + d.cssClass))
            .call(this.dragTarget, DrageObjectType.AvailableSegment, self);

        availableSegEnter.append("rect");

        availableSegmentsG.select("rect")
            .transition()
            .attr("x", (d, i) => i * (this.AVAILABLE_SEGMENTS_DIMENSIONS.width + this.AVAILABLE_SEGMENTS_DIMENSIONS.spacing))
            .attr("rx", this.AVAILABLE_SEGMENTS_DIMENSIONS.rounding)
            .attr("ry", this.AVAILABLE_SEGMENTS_DIMENSIONS.rounding)
            .attr("width", this.AVAILABLE_SEGMENTS_DIMENSIONS.width)
            .attr("height", this.AVAILABLE_SEGMENTS_DIMENSIONS.height);

        availableSegEnter.append("text");

        availableSegmentsG.select("text")
            .transition()
            .attr("x", (d, i) => i * (this.AVAILABLE_SEGMENTS_DIMENSIONS.width + this.AVAILABLE_SEGMENTS_DIMENSIONS.spacing) + this.AVAILABLE_SEGMENTS_DIMENSIONS.textSpacing)
            .attr("y", this.AVAILABLE_SEGMENTS_DIMENSIONS.height / 2)
            .attr("dy", 4)
            .attr("class", d=> ("availableSegment text " + d.cssClass))
            .text(d=> d.displayName);

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
            //+ (this.CONTROL_MARGINS.left + chartWidth - this.AVAILABLE_SEGMENTS_DIMENSIONS.width)
                + (containerWidth - this.AVAILABLE_SEGMENTS_DIMENSIONS.width)
                + ","
                + (availableSegmentsTop - this.AVAILABLE_SEGMENTS_DIMENSIONS.spacing - this.AVAILABLE_SEGMENTS_DIMENSIONS.height) + ")")
            .append("g")
            .data(this._segmentDescriptions.filter(seg=> seg.id == data.xAxisSegmentId))
            .attr("id", "currentSegment" + this._chartUniqueSuffix)
            .attr("class", d=> ("currentSegment " + d.cssClass))
            .call(this.dragTarget, DrageObjectType.CurrentXAxisSegment, this)
            .call(this.dragSource, DrageObjectType.CurrentXAxisSegment, this);

        currentSegmentGroup.append("rect")
            .transition()
            .attr("x", (d, i) => i * (this.AVAILABLE_SEGMENTS_DIMENSIONS.width + this.AVAILABLE_SEGMENTS_DIMENSIONS.spacing + this.CONTROL_MARGINS.left))
            .attr("rx", this.AVAILABLE_SEGMENTS_DIMENSIONS.rounding)
            .attr("ry", this.AVAILABLE_SEGMENTS_DIMENSIONS.rounding)
            .attr("width", this.AVAILABLE_SEGMENTS_DIMENSIONS.width)
            .attr("height", this.AVAILABLE_SEGMENTS_DIMENSIONS.height);

        currentSegmentGroup.append("text")
            .transition()
            .attr("x", (d, i) => i * (this.AVAILABLE_SEGMENTS_DIMENSIONS.width + this.AVAILABLE_SEGMENTS_DIMENSIONS.spacing) + this.AVAILABLE_SEGMENTS_DIMENSIONS.spacing)
            .attr("y", this.AVAILABLE_SEGMENTS_DIMENSIONS.height / 2)
            .attr("dy", 4)
            .attr("class", d=> ("currentSegment text " + d.cssClass))
            .text(d=> d.displayName);
        
        // create data marker last so that it is on top of the others:
        d3.select("#dataMarker" + this._chartUniqueSuffix).remove();

        var dataMarker = svg.append("g")
            .attr("id", "dataMarker" + this._chartUniqueSuffix)
        //.attr("opacity",0)
            .append("circle")
            .attr("r", 30)
            .style("fill", "red")
            .style("pointer-events", "none");
    }

    getAvailableSegments(xAxisSegmentId: string): SegmentDescription[] {
        var segments = this._segmentDescriptions.slice(0);
        this._currentFilteringSegments.forEach(fltr=> {
            var filterSegment = segments.filter(seg=> seg.id == fltr.segmentId);
            if (filterSegment.length > 0) {
                segments.splice(segments.indexOf(filterSegment[0]), 1);
            }
        }
            );
        var filterSegment = segments.filter(seg=> seg.id == xAxisSegmentId);
        segments.splice(segments.indexOf(filterSegment[0]), 1);
        return segments;
    }

    getSegmentValueId(segment: SegmentValue): string {
        return segment.segmentId + "_" + segment.valueId
    }

    private getSeries(seriesId: string): SeriesDescription {
        var length = this._seriesDescriptions.length;
        for (var index = 0; index < length; index++) {
            if (this._seriesDescriptions[index].id == seriesId) {
                return this._seriesDescriptions[index]
            }
        }
        throw new RangeError("Series not found. id:" + seriesId);
        return null;
    }

    private getSegmentDescription(segmentId: string): SegmentDescription {
        return this._segmentDescriptions.filter(seg=> seg.id == segmentId)[0];
    }

    private setDragStartPostion() {
        var svg = d3.select("#controlSvg" + this._chartUniqueSuffix);
        this._dragStartPosition = d3.mouse(svg.node());
    }

    private dragChartStart(segment: any) {
        this.dragStart(this, segment, DrageObjectType.ChartSegment);
    }

    private dragChart(widthOfAllData: number, width: number, height: number) {
        var svg = d3.select("#controlSvg" + this._chartUniqueSuffix);
        var chartBaseCoordinates = d3.mouse(svg.node())
        var x = chartBaseCoordinates[0];
        var y = chartBaseCoordinates[1];
        var dx = x - this._dragStartPosition[0];
        var contentG = d3.select("#contentGroup" + this._chartUniqueSuffix);
        var segmentsA = contentG.selectAll(".segment")
        var xTransform = (this._segementsXTransfomation + dx);
        xTransform = xTransform < 0 ? xTransform : 0;
        var scale = 1;
        var maxTranslateX = widthOfAllData * scale - width;
        xTransform = xTransform < (-maxTranslateX) ? (-maxTranslateX) : xTransform;
        segmentsA.attr("transform", "matrix(1,0,0,1," + xTransform + ",0)")
        svg.select(".x.axis")
            .attr("transform", "translate(" + xTransform + "," + height + ")")
            .call(this._xAxis.scale(this._xScale.rangeRoundBands([0, widthOfAllData * scale], .1 * scale)));
    }

    private dragChartEnd(segment: any) {
        var svg = d3.select("#controlSvg" + this._chartUniqueSuffix);
        var dx = d3.mouse(svg.node())[0] - this._dragStartPosition[0];
        this._segementsXTransfomation += dx;
        this.dragEnd(this, segment, DrageObjectType.ChartSegment);
    }


    private dragTarget<Datum>(source: d3.Selection<Datum>, targetType: DrageObjectType, self: Painter): d3.Selection<Datum> {
        source.on("mouseover", (d) => {
            self._dragTarget = d;
            self._drageTargetType = targetType;
        })
            .on("mouseout", (d) => {
                self._dragTarget = null;
                self._drageTargetType = null;
            });
        return source;
    }

    private dragSource<Datum>(source: d3.Selection<Datum>, drageSourceType: DrageObjectType, self: Painter): d3.Selection<Datum> {
        var drag = d3.behavior.drag()
            .on("dragstart", function() {
                self.dragStart(self, this, drageSourceType);
            })
            .on("drag", function() {
                self.drag(self, this, drageSourceType);
            })
            .on("dragend", function() {
                self.dragEnd(self, this, drageSourceType);
            });

        source.call(drag);
        return source;
    }

    private dragStart(self: Painter, drageSource: any, dragSourceType: DrageObjectType) {
        self.setDragStartPostion();
        self._drageSourceType = dragSourceType;
        self._dragSource = d3.select(drageSource).datum();

        d3.select(drageSource).style("pointer-events", "none");

        this.markDragTragets(dragSourceType);
    }

    private drag(self: Painter, drageSource: any, dragSourceType: DrageObjectType) {
        var svg = d3.select("#controlSvg" + self._chartUniqueSuffix);
        var chartBaseCoordinates = d3.mouse(svg.node())
        var x = chartBaseCoordinates[0];
        var y = chartBaseCoordinates[1];
        var dx = x - self._dragStartPosition[0];
        var dy = y - self._dragStartPosition[1];
        d3.select(drageSource)
            .attr("transform", "translate(" + dx + "," + dy + ")")
    }

    private dragEnd(self: Painter, drageSource: any, dragSourceType: DrageObjectType) {
        d3.select(drageSource).style("pointer-events", "all");
        self.unmarkDragTragets(dragSourceType);

        if (dragSourceType == DrageObjectType.Breadcrumb) {
            var svg = d3.select("#controlSvg" + this._chartUniqueSuffix);
            var chartBaseCoordinates = d3.mouse(svg.node())
            var x = chartBaseCoordinates[0];
            var y = chartBaseCoordinates[1];
            var dx = x - this._dragStartPosition[0];
            var dy = y - this._dragStartPosition[1];
            var dragDistance = Math.sqrt(dx * dx + dy * dy);
            if (dragDistance > this.BREADCRUMB_DRAG_TO_DELETE_DISTANCE) {
                var seg = <SegmentValueForDisplay>this._dragSource;
                var index = this._currentFilteringSegments.indexOf(seg);
                this._currentFilteringSegments.splice(index, 1);
                var requestParams: SegmentRequestParams = {
                    requestedSegmentId: self._currentXSegmentId,
                    filterSegments: this._currentFilteringSegments,
                    date: null
                };
                var newData = this._dataCallback(requestParams)
                //self._clickX = d3.event.x;
                this.drawData(newData);
                return;
            }
        }


        switch (self._drageTargetType) {
            case DrageObjectType.CurrentXAxisSegment:
                if (dragSourceType == DrageObjectType.AvailableSegment) {
                    this.changeCurrentSegmentWithAvailablSegment(self._dragTarget, self._dragSource);
                } else {
                    this.returnDragSourceToOriginalPosition(drageSource);
                }
                break;
            case DrageObjectType.AvailableSegment:
                switch (self._drageSourceType) {
                    case DrageObjectType.CurrentXAxisSegment:
                        this.changeCurrentSegmentWithAvailablSegment(self._dragSource, self._dragTarget);
                        break;
                    case DrageObjectType.ChartSegment:
                        this.drillDownToSegment(
                            <SegmentDataItems>self._dragSource,
                            <SegmentDescription>self._dragTarget);
                        break;
                    default:
                        this.returnDragSourceToOriginalPosition(drageSource);
                        break;
                }
                break;
            case DrageObjectType.ChartSegment:
                if (dragSourceType == DrageObjectType.AvailableSegment) {
                    this.drillDownToSegment(
                        <SegmentDataItems>self._dragTarget,
                        <SegmentDescription>self._dragSource);
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
    }

    private returnDragSourceToOriginalPosition(dragSource: any) {
        d3.select(dragSource)
            .transition()
            .attr("transform", "translate(0,0)");
    }


    private drillDownToSegment(drilledSegment: SegmentDataItems, newXAxisSegment: SegmentDescription) {
        this._currentFilteringSegments.push(drilledSegment.segment);

        var requestParams: SegmentRequestParams = {
            requestedSegmentId: newXAxisSegment.id,
            filterSegments: this._currentFilteringSegments,
            date: null
        };
        var newData = this._dataCallback(requestParams)
        //self._clickX = d3.event.x;
        this.drawData(newData);
    }

    private changeCurrentSegmentWithAvailablSegment(xSegment: SegmentDescription, availableSegment: SegmentDescription) {

        var requestParams: SegmentRequestParams = {
            requestedSegmentId: availableSegment.id,
            filterSegments: this._currentFilteringSegments,
            date: null
        };
        var newData = this._dataCallback(requestParams)
        //self._clickX = d3.event.x;
        this.drawData(newData);
    }

    private markDragTragets(dragSourceType: DrageObjectType) {
        var dragTragetSelectors: d3.Selection<any>[] = this.getDragTargets(dragSourceType);
        dragTragetSelectors.forEach(slct=> slct.classed("dragTraget", true));
    }

    private unmarkDragTragets(dragSourceType: DrageObjectType) {
        var dragTragetSelectors: d3.Selection<any>[] = this.getDragTargets(dragSourceType);
        dragTragetSelectors.forEach(slct=> slct.classed("dragTraget", false));
    }

    private getDragTargets(dragSourceType: DrageObjectType): d3.Selection<any>[] {
        switch (dragSourceType) {
            case DrageObjectType.AvailableSegment:
                return [
                    d3.select("#currentSegment"),
                    d3.selectAll(".segment"),
                ]
                break;
            case DrageObjectType.ChartSegment:
                return [
                    d3.selectAll(".availableSegment"),
                ]
                break;
            case DrageObjectType.CurrentXAxisSegment:
                return [
                    d3.selectAll(".availableSegment"),
                ]
                break;
            default:
                return [];
                break;
        }
    }

    private breadcrumbPoints(d, i) {
        var points = [];
        points.push("0,0");
        points.push(this.BREADCRUMB_DIMENSIONS.width + ",0");
        points.push(this.BREADCRUMB_DIMENSIONS.width + this.BREADCRUMB_DIMENSIONS.tip + "," + (this.BREADCRUMB_DIMENSIONS.height / 2));
        points.push(this.BREADCRUMB_DIMENSIONS.width + "," + this.BREADCRUMB_DIMENSIONS.height);
        points.push("0," + this.BREADCRUMB_DIMENSIONS.height);
        if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
            points.push(this.BREADCRUMB_DIMENSIONS.tip + "," + (this.BREADCRUMB_DIMENSIONS.height / 2));
        }
        return points.join(" ");
    }
}


interface fullDataItem {
    dataItem: DataItem,
    segment: SegmentDataItems
}

enum DrageObjectType {
    None,
    ChartSegment,
    AvailableSegment,
    CurrentXAxisSegment,
    Breadcrumb
}