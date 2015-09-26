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

export class SegmentdRequestParams extends DataRequestParams {
	/** 
	 * Id's of segments by which the retrived data should to be segmented.
	*/
	requestedSegments: string[];
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

	setup(
		seriesDescriptions: SeriesDescription[],
		segmentDescriptions: SegmentDescription[],
		data: SegmentsData) {
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

		var width = +svg.attr("width") - margin.left - margin.right,
			height = +svg.attr("height") - margin.top - margin.bottom;

		var itemsPerSegment = d3.max(data.segments.map(seg=> seg.dataItems.length));

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
			.orient("left")
		//.ticks(10)
			;


		var maxValue =
			d3.max(
				data.segments.map(seg=>
				{ return d3.max(seg.dataItems.map(itm=> itm.value)); }
					));



		x.domain(data.segments.map(d=> this.getSegmentValueId(d.segment)));
		y.domain([0, maxValue]);


		var self = this;
		//xAxis.tickFormat(segKey=>    segKey+"!!!");
		xAxis.tickFormat(function(segKey): string {
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
			.data(data.segments, seg=> this.getSegmentValueId(seg.segment));

		var segmentGroups = segments.enter()
			.append("g")
			.attr("class", "segment");

		var zoom = d3.behavior.zoom().scaleExtent([width / widthOfAllData, width / (startupSegmentWidth * 2)]).on("zoom", () => {
			var scale = (<any>d3.event).scale;
			var translateX: number = (<any>d3.event).translate[0];
			var translateY: number = (<any>d3.event).translate[1];
			// Prevent data from moving away from y axis:
			translateX = translateX > 0 ? 0 : translateX;
			var maxTranslateX = widthOfAllData * scale - width;
			translateX = translateX < (-maxTranslateX) ? (-maxTranslateX) : translateX;


			segmentGroups.attr("transform", "matrix(" + scale + ",0,0,1," + translateX + ",0)")

			svg.select(".x.axis")
				.attr("transform", "translate(" + translateX + "," + (height) + ")")
				.call(xAxis.scale(x.rangeRoundBands([0, widthOfAllData * scale], .1 * scale)));

			//svg.select(".y.axis").call(yAxis);
		});
		
		var tooltip=d3.tip<fullDataItem>();
		
		tooltip.html(d=>d.dataItem.seriesId);

		segments.selectAll("rect")
			.data(
				sdi=> sdi.dataItems.map(dataItem=> { return { dataItem: dataItem, segment: sdi } }),
				itm=> this.getSegmentValueId(itm.segment.segment) + "_" + itm.dataItem.seriesId)
			.enter()
			.append("rect")
			.attr("class", itm=> this.getSeries(itm.dataItem.seriesId).cssClass)
			.attr("x", (itm, i) => x(this.getSegmentValueId(itm.segment.segment)) + i * x.rangeBand() / itemsPerSegment)
			.attr("width", itm=> x.rangeBand() / itemsPerSegment)
			.attr("y", itm=> y(itm.dataItem.value))
			.attr("data-ziv-val", itm=> itm.dataItem.value)
			.attr("height", itm=> height - y(itm.dataItem.value))
			.call(tooltip)
			  .on('mouseover', tooltip.show)
  .on('mouseout', tooltip.hide)
			;
			
		svg.call(zoom);
	}
	

	private getSegmentValueId(segment: SegmentValue): string {
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
		
		/*		this._seriesDescriptions.forEach(
					sd=>{
						if (sd.id==seriesId) return sd
						});
						*/
		throw new RangeError("Series not found. id:" + seriesId);
		return null;
	}
}


	interface fullDataItem
	{
		dataItem: DataItem,
		segment: SegmentDataItems
	}