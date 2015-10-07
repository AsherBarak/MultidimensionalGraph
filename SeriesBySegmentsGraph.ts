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
	private STRTUP_BAR_WIDTH: number = 35;
	private MARGIN_BETWEEN_BAR_GROUPS: number = 0.1;

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
	private _requestParams: SegmentRequestParams

	private _clickX: number = -1;

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
		this._requestParams =
		{
			requestedSegmentId: null,
			filterSegments: startFilters != null ? startFilters : [],
			date: null
		};

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
	}

	drawData(data: SegmentsData) {
		var margin = { top: 20, right: 20, bottom: 30, left: 40 };

		var container = d3.select(this._chartContainer);

		var containerWidth: number = +container.attr("width"),
			containerHeight: number = +container.attr("height");

		var svg = container.select("#chartSvg" + this._chartUniqueSuffix)
			.attr("width", containerWidth)
			.attr("height", containerHeight);


		var width = containerWidth - margin.left - margin.right,
			height = containerHeight - margin.top - margin.bottom;

		// 		var overlay = svg.append("rect")
		// 			.attr("class", "overlay")
		// 			.attr("width", width)
		// 			.attr("height", height);
		
		var mainG = svg.select("#chartGroup" + this._chartUniqueSuffix)
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


		var itemsPerSegment = d3.max(data.segments.map(seg=> seg.dataItems.length));
		var startupSegmentWidth = itemsPerSegment * this.STRTUP_BAR_WIDTH * (1 + 2 * this.MARGIN_BETWEEN_BAR_GROUPS);
		var widthOfAllData = startupSegmentWidth * data.segments.length;

		this._xScale.rangeRoundBands([0, widthOfAllData], this.MARGIN_BETWEEN_BAR_GROUPS);
		this._yScale.range([height, 0]);

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
			.data(data.segments, seg=> this.getSegmentValueId(seg.segment));


		segments.enter()
			.append("g")
			.attr("class", "segment");

		var exitingSegments = segments.exit();

		// exit segemtns not clicked:
		exitingSegments.transition()
			.style("opacity", 0).remove();

		var zoom = d3.behavior.zoom().scaleExtent([width / widthOfAllData, width / (startupSegmentWidth * 2)]).on("zoom", () => {
			var scale = (<any>d3.event).scale;
			var translateX: number = (<any>d3.event).translate[0];
			var translateY: number = (<any>d3.event).translate[1];
			// Prevent data from moving away from y axis:
			translateX = translateX > 0 ? 0 : translateX;
			var maxTranslateX = widthOfAllData * scale - width;
			translateX = translateX < (-maxTranslateX) ? (-maxTranslateX) : translateX;
			var segmentsA = contentG.selectAll(".segment")
			segmentsA.attr("transform", "matrix(" + scale + ",0,0,1," + translateX + ",0)")
			svg.select(".x.axis")
				.attr("transform", "translate(" + translateX + "," + (height) + ")")
				.call(this._xAxis.scale(this._xScale.rangeRoundBands([0, widthOfAllData * scale], .1 * scale)));
			this._tooltip.hide();
		});

		this._tooltip = d3.tip<fullDataItem>()
			.attr('class', 'd3-tip')
			.offset([-10, 0])
			.html(
				d=> "<strong>" + d.dataItem.seriesId + ":</strong> <span style='color:red'>" + d.dataItem.value + "</span>"
				);

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
		var barEnterStartX = this._clickX < 0 ? width / 2 : this._clickX-(startupSegmentWidth/2),
			barEnterStartY = height;

		bars.enter()
			.append("rect")
			.attr("class", itm=> this.getSeries(itm.dataItem.seriesId).cssClass)
			.attr("x", barEnterStartX)
			.attr("y", barEnterStartY)
			.transition().duration(1500)
			.attr("x", (itm, i) => this._xScale(this.getSegmentValueId(itm.segment.segment)) + i * this._xScale.rangeBand() / itemsPerSegment)
			.attr("width", itm=> this._xScale.rangeBand() / itemsPerSegment)
			.attr("y", itm=> this._yScale(itm.dataItem.value))
			.attr("data-ziv-val", itm=> itm.dataItem.value)
			.attr("height", itm=> height - this._yScale(itm.dataItem.value))
		//.call(this._tooltip)
		//.on('mouseover', this._tooltip.show)
		//.on('mouseout', this._tooltip.hide)
		;
		bars.exit().remove();


		var self = this;
		segments.on("click",
			(function(seg) {
				// Animate clicked segemtn to reload animation:
				/*
				d3.select(<Node>this)
					.transition()
					.attr("transform", "rotate(30)")
				
				*/
				self._requestParams.requestedSegmentId="item";
				self._requestParams.filterSegments.push(seg.segment);
				var newData = self._dataCallback(self._requestParams)
				self._clickX = d3.event.x;
				self.drawData(newData);
				
			})
			)

		svg.call(zoom);
	}



	getSegmentValueId(segment: SegmentValue): string {
		return segment.segmentId + "_" + segment.valueId
	}

	draw(data: SegmentsData) {

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
}


interface fullDataItem {
	dataItem: DataItem,
	segment: SegmentDataItems
}