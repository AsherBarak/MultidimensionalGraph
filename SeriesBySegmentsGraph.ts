/**
 * @example: Budget, Actual expanditure
 */
class SeriesDescription {
	id: string;
	cssClass: string;
	displyName: string;
	description: string;
}

class DataItem {
	seriesId: string;
	value: number;
}

/** 
 * @example
 *  Project, Subproject, Item etc. 
 * */
class SegmentDescription {
	id: string;
	cssClass: string;
	displayName: string;
	description: string;
	parentSegmentsIds: string[];
}

/** 
 * The value of a segment. This class contains only the key of the segemnt. The {@link SegmentValueForDisplay} class has the decription.  
 * @example
 * key of Project A (Project segment), key of Subproject 22 (Subproject segment), key of Hammer (Items segmenty)*/
class SegmentValue {
	segmentId: string;
	valueId: string;
}

class SegmentValueForDisplay extends SegmentValue {
	displyName: string;
	description: string;
}

class DataRequestParams {
	/** 
	 * Values  of the segments used to filter the desired results. 
	 * Values of the same segment ar treated with OR. Vaules of different segments are treated with AND.
	 * */
	filterSegments: SegmentValue[];
	date: Date;
}

class SegmentdRequestParams extends DataRequestParams {
	/** 
	 * Id's of segments by which the retrived data should to be segmented.
	*/
	requestedSegments: string[];
}

class TimelineRequestParams extends DataRequestParams {
	startDate: Date;
	endDate: Date;
}

class RetrivedData {
}

class SegmentDataItems {
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

class SegmentsData extends RetrivedData {
	data: SegmentDataItems[];
}

class TimelineDataItem {
	date: Date;
	item: DataItem;
}

class TimelineData extends RetrivedData {
	data: TimelineDataItem[];
}


class Painter {
	setup(
		seriesDescriptions: SeriesDescription[],
		segmentDescriptions: SegmentDescription[]) {

	}

	draw(data: SegmentsData) {
		
	}
}