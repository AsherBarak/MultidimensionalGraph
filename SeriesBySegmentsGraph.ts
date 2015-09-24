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
		//.attr("width", width + margin.left + margin.right)
		//.attr("height", height + margin.top + margin.bottom)
		var mainG = svg.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


		var width = +svg.attr("width") - margin.left - margin.right,
			height = +svg.attr("height") - margin.top - margin.bottom;

		var zoom=d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", () =>


			mainG.attr("transform", "translate(" + (<any>d3.event).translate + ")scale(" + (<any>d3.event).scale + ")")

			)

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
		//.ticks(10)
			;


		var maxValue =
			d3.max(
				data.segments.map(seg=>
				{ return d3.max(seg.dataItems.map(itm=> itm.value)); }
					));

		var itemsPerSegment = d3.max(data.segments.map(seg=> seg.dataItems.length));

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
			.data(data.segments, seg=> this.getSegmentValueId(seg.segment));

		segments.enter()
			.append("g")
			.attr("class", "segment");

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
			.attr("height", itm=> height - y(itm.dataItem.value)).call(zoom);
	}

	private zoom(container: any) {
		container.attr("transform", "translate(" + (<any>d3.event).translate + ")scale(" + (<any>d3.event).scale + ")");
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