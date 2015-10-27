//#region Definitions

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
//#endregion 

export class Painter {
    //#region "Constants"
    private STARTUP_BAR_WIDTH: number = 25;
    private MARGIN_BETWEEN_BAR_GROUPS: number = 0.1;

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
    //#endregion 

    //#region "Private variables"

    private _seriesDescriptions: SeriesDescription[];
    private _segmentDescriptions: SegmentDescription[];
    private _chartUniqueSuffix: string;
    private _chartContainerSelector: string;

    private _currentXSegmentId: string;
    private _currentFilteringSegments: SegmentValueForDisplay[];
    private _dataCallback: (params: SegmentRequestParams) => SegmentsData;

    private _xScale: d3.scale.Ordinal<string, number>;
    private _yScale: d3.scale.Linear<number, number>;
    private _xAxis: d3.svg.Axis;
    private _yAxis: d3.svg.Axis;
    private _tooltip: d3.Tip<fullDataItem>;

    private _clickX: number = -1;
    private _segementsXTransfomation: number = 0;

    private _dragStartPosition: [number, number];
    private _dragTarget: any = null;
    private _drageTargetType: DrageObjectType = DrageObjectType.None;
    private _dragSource: any = null;
    private _drageSourceType: DrageObjectType = DrageObjectType.None;

    //#endregion "Private variables"

    /**
    * Call this once to initialize control.
    */
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
        chartContainerSelector: string,
        startFilters: SegmentValueForDisplay[] = null,
		/**
		 * When using more than one chart in a single page this value is appende to elements unique id's 
		 */
        chartUniqueSuffix: string = "") {
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

        chartGroup.append("g")
            .attr("id", "contentGroup" + this._chartUniqueSuffix)
            .attr("clip-path", "url(#chartClipPath" + this._chartUniqueSuffix + ")");

        svg.append("g")
            .attr("id", "availableSegments" + this._chartUniqueSuffix);

        this.drawData(data);
    }

    drawData(data: SegmentsData) {
        this._segementsXTransfomation = 0;
        this._currentXSegmentId = data.xAxisSegmentId;
        var self = this;

        var container = d3.select(this._chartContainerSelector);

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

        svg.select("#chartGroup" + this._chartUniqueSuffix)
            .attr("transform", "translate(" + this.CONTROL_MARGINS.left + "," + chartTop + ")");

        //#region Axis

        var itemsPerSegment = d3.max(data.segments.map(seg=> seg.dataItems.length));
        var startupSegmentWidth = itemsPerSegment * this.STARTUP_BAR_WIDTH * (1 + 2 * this.MARGIN_BETWEEN_BAR_GROUPS);
        var widthOfAllData = startupSegmentWidth * data.segments.length;

        this._xScale.rangeRoundBands([0, widthOfAllData], this.MARGIN_BETWEEN_BAR_GROUPS);
        this._yScale.range([chartHeight, 0]);

        var maxValue =
            d3.max(
                data.segments.map(seg=>
                { return d3.max(seg.dataItems.map(itm=> itm.value)); }
                    ));

        this._xScale.domain(data.segments.map(d=> this.getSegmentValueId(d.segment)));
        this._yScale.domain([0, maxValue]);


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
            .on("dragstart", function() {
                self.setDragStartPostion();
            })
            .on("drag", function() {
                self.dragChart(widthOfAllData, chartWidth, chartHeight);
            })
            .on("dragend", function() {
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
            .data(data.segments, seg=> this.getSegmentValueId(seg.segment));

        segments.enter()
            .append("g")
            .attr("class", "segment");

        var exitingSegments = segments.exit();

        exitingSegments.transition()
            .style("opacity", 0).remove();

        var segmentDrag = d3.behavior.drag()
            .on("dragstart", function() {
                self.dragChartStart(this);

                var dataMarker = d3.select("#dataMarker" + self._chartUniqueSuffix);
                dataMarker.style("opacity", "1");

                var markerHeight: number = 30;
                var markerWidth: number = 20;

                var text = dataMarker
                    .select("text")
                    .classed("dragMarker", true)
                    .text((<SegmentDataItems>d3.select(this).datum()).segment.displayName);

                var dataItems = (<SegmentDataItems>d3.select(this).datum()).dataItems

                var bars = dataMarker
                    .selectAll("rect")
                    .data(dataItems);

                bars.enter()
                    .append("rect")
                    .attr("class", itm=> self.getSeries(itm.seriesId).cssClass + " dragMarker");

                var maxData = Math.max(...dataItems.map(itm=> itm.value));
                var scale = markerHeight / maxData;

                bars
                    .attr("x", (itm, i) => (markerWidth / itemsPerSegment) * i)
                    .attr("width", itm=> (markerWidth / itemsPerSegment))
                    .attr("y", itm=> markerHeight - itm.value * scale)
                    .attr("data-ziv-val", itm=> itm.value)
                    .attr("height", itm=> itm.value * scale);

                bars.exit().remove();

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
                var dataMarker = d3.select("#dataMarker" + self._chartUniqueSuffix);
                dataMarker.style("opacity", "0");
                self.dragChartEnd(this);
            });
     
        //#region Bars

        var bars = segments.selectAll("rect")
            .data(
                sdi=> sdi.dataItems.map(dataItem=> { return { dataItem: dataItem, segment: sdi } }),
                itm=> this.getSegmentValueId(itm.segment.segment) + "_" + itm.dataItem.seriesId);

        var barEnterStartX = this._clickX < 0 ? chartWidth / 2 : this._clickX - (startupSegmentWidth / 2),
            barEnterStartY = chartHeight;

        bars.enter()
            .append("rect")
            .attr("class", itm=> this.getSeries(itm.dataItem.seriesId).cssClass);

        bars
            .attr("y", itm=> barEnterStartY)
            .transition().duration(300).ease("quad")
            .attr("x", (itm, i) => this._xScale(this.getSegmentValueId(itm.segment.segment)) + i * this._xScale.rangeBand() / itemsPerSegment)
            .attr("width", itm=> this._xScale.rangeBand() / itemsPerSegment)
            .attr("y", itm=> this._yScale(itm.dataItem.value))
            .attr("data-ziv-val", itm=> itm.dataItem.value)
            .attr("height", itm=> chartHeight - this._yScale(itm.dataItem.value));

        bars.exit().remove();

        //#endregion Bars

        // Must be located after bas have been created:
        segments.call(this.dragTarget, DrageObjectType.ChartSegment, this);

        //#endregion Segments

        //#region Breadcrumns

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

        crumbEnter.append("text");

        breadcrumbWrapperGroups
            .select("text")
            .transition()
            .attr("x", (d, i) => i * (this.BREADCRUMB_DIMENSIONS.width + this.BREADCRUMB_DIMENSIONS.spacing) + this.BREADCRUMB_DIMENSIONS.tip + this.BREADCRUMB_DIMENSIONS.textSpacing)
            .attr("y", this.BREADCRUMB_DIMENSIONS.height / 2)
            .attr("dy", "0.35em")
            .attr("class", d=> ("breadcrumb text " + this.getSegmentDescription(d.segmentId).cssClass))
            .text(d=> d.displayName);

        //#endregion Breadcrumns

        //#region Available segments

        var availableSegmentsTop = chartTop
            + chartHeight
        // todo: add x axis height
            + this.AVAILABLE_SEGMENTS_MARGINS.top;

        var availableSegmentsGroup = d3.select("#availableSegments" + this._chartUniqueSuffix)
            .attr("transform", "translate(" + (this.CONTROL_MARGINS.left + this.AVAILABLE_SEGMENTS_MARGINS.left) + "," + availableSegmentsTop + ")");

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

        var availableSegmentXOffset = 0;

        availableSegmentsG.select("rect")
            .transition()
            .attr("x", (d, i) => {
                if (i == 0) {
                    availableSegmentXOffset = 0;
                    return availableSegmentXOffset;
                }
                availableSegmentXOffset += this.AVAILABLE_SEGMENTS_DIMENSIONS.width;
                var isSingleDecendantOfPreviuesSegment: boolean;
                var parentSegment = availableSegments[availableSegments.indexOf(d) - 1];
                isSingleDecendantOfPreviuesSegment =
                d.parentSegmentsIds != null
                && d.parentSegmentsIds.length == 1
                && d.parentSegmentsIds[0] == parentSegment.id;


                if (isSingleDecendantOfPreviuesSegment) {
                    availableSegmentXOffset -= this.AVAILABLE_SEGMENTS_DIMENSIONS.spacing;
                } else {
                    availableSegmentXOffset += this.AVAILABLE_SEGMENTS_DIMENSIONS.spacing;
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
            .attr("x", (d, i) => {
                if (i == 0) {
                    availableSegmentXOffset = 0;
                    return availableSegmentXOffset;
                }
                availableSegmentXOffset += this.AVAILABLE_SEGMENTS_DIMENSIONS.width;
                var isSingleDecendantOfPreviuesSegment: boolean;
                var parentSegment = availableSegments[availableSegments.indexOf(d) - 1];
                isSingleDecendantOfPreviuesSegment =
                d.parentSegmentsIds != null
                && d.parentSegmentsIds.length == 1
                && d.parentSegmentsIds[0] == parentSegment.id;


                if (isSingleDecendantOfPreviuesSegment) {
                    availableSegmentXOffset -= this.AVAILABLE_SEGMENTS_DIMENSIONS.spacing;
                } else {
                    availableSegmentXOffset += this.AVAILABLE_SEGMENTS_DIMENSIONS.spacing;
                }

                return availableSegmentXOffset + this.AVAILABLE_SEGMENTS_DIMENSIONS.textSpacing;

                //return i * (this.AVAILABLE_SEGMENTS_DIMENSIONS.width + this.AVAILABLE_SEGMENTS_DIMENSIONS.spacing) + this.AVAILABLE_SEGMENTS_DIMENSIONS.textSpacing
            })
            .attr("y", this.AVAILABLE_SEGMENTS_DIMENSIONS.height / 2)
            .attr("dy", 4)
            .attr("class", d=> ("availableSegment text " + d.cssClass))
            .text(d=> d.displayName);

        segments.call(segmentDrag);
        availableSegmentsG.call(this.dragSource, DrageObjectType.AvailableSegment, this);

        //#endregion Available segments

        //#region Curren segment

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
    }

    getAvailableSegments(xAxisSegmentId: string): SegmentDescription[] {
        var segments = this._segmentDescriptions.slice(0);
        // Remove current filters:
        this._currentFilteringSegments.forEach(fltr=> {
            var filterSegment = segments.filter(seg=> seg.id == fltr.segmentId);
            if (filterSegment.length > 0) {
                segments.splice(segments.indexOf(filterSegment[0]), 1);
            }
            /* consider:Remove parents of current filters 
                one habd: no need to filter or slice to chapter when alredy filtered by subchapter
                other hand: can be used as a quick way to access description of segments higher in the hirarchy
            */
        }
            );
        // Remove current x axis segment:
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
        if (maxTranslateX > 0) {
            xTransform = xTransform < (-maxTranslateX) ? (-maxTranslateX) : xTransform
        };
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
        source.on("mouseover", function(d) {
            self._dragTarget = d;
            self._drageTargetType = targetType;

            var dragTargetSelection = d3.select(this);
            if (self._drageSourceType != DrageObjectType.None) {
                var selections = self.getDragTargets(self._drageSourceType);
                var isRelevantTarget: boolean = false;
                selections.forEach(selection=> {
                    var v = selection.filter(
                        d=> d == dragTargetSelection.datum());
                    if (v.size() > 0) {
                        isRelevantTarget = true;
                        return;
                    }
                })
                if (isRelevantTarget) {
                    dragTargetSelection.classed("dragSourceOver", true);
                }
            }

        })
            .on("mouseout", function(d) {
                self._dragTarget = null;
                self._drageTargetType = null;

                if (self._drageSourceType != DrageObjectType.None) {
                    d3.select(this).classed("dragSourceOver", false);
                }
            });
        return source;
    }

    private getDragTragetOver<Datum>(self: Painter) {
        var selections = self.getDragTargets(self._drageSourceType);
        selections.forEach(selection=> {
            var pos = d3.mouse(selection.node());
        });
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



this.getDragTragetOver(self);




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
        if (this._drageSourceType == DrageObjectType.ChartSegment) {
            return;
        }

        d3.select(dragSource)
            .transition()
            .attr("transform", "translate(0,0)");
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