import * as SeriesBySegment from "SeriesBySegmentsGraph"

export class TrialsBudgetDataGenerator {
	private static _isDataInitialized: boolean;
	private static _segments: SeriesBySegment.SegmentValueForDisplay[];
	private static _data: DataElement[] = [];
	private static NUMBER_OF_VALUES_PER_SEGMENT: number = 10;
	private static NUMBER_OF_DATA_ELEMENTS: number = 10000;

	static getSegmentsDescriptions(): SeriesBySegment.SegmentDescription[] {
		var segmentDescriptions: SeriesBySegment.SegmentDescription[] = [
			{
				id: "project",
				cssClass: "project",
				displayName: "Project",
				description: "Project",
			},
			{
				id: "subproject",
				cssClass: "subproject",
				displayName: "Subproject",
				description: "Subproject",
				parentSegmentsIds: ["project"],
			},
			{
				id: "item",
				cssClass: "item",
				displayName: "Item",
				description: "Item",
			},
		];
		return segmentDescriptions;
	}

	static getSeriesDescriptions(): SeriesBySegment.SeriesDescription[] {
		var seriesDescriptions: SeriesBySegment.SeriesDescription[] = [
			{
				id: "budget",
				cssClass: "budget",
				displayName: "Budget",
				description: "Busget",
			},
			{
				id: "spent",
				cssClass: "spent",
				displayName: "Spent",
				description: "Spent",
			},
			{
				id: "planned",
				cssClass: "planned",
				displayName: "Planned",
				description: "Planned",
			},
		];
		return seriesDescriptions;
	}

	static getSegmentData(params: SeriesBySegment.SegmentRequestParams): SeriesBySegment.SegmentsData {

		if (!TrialsBudgetDataGenerator._isDataInitialized) {
			TrialsBudgetDataGenerator.initializeData()
		}

		var data = TrialsBudgetDataGenerator._data.slice(0);

		params.filterSegments.forEach(filterSeg => {
			data = 
				data.filter(el=> 
					el.segments.filter(
						seg=> seg.segmentId == filterSeg.segmentId 
						&& seg.valueId == filterSeg.valueId).length > 0)
		});

params.requestedSegments
		data.map(data=>)

		return {
			segments:null,
			yAxisDisplayName:"MONEY!!"
		};
	}



	private static initializeData() {
		TrialsBudgetDataGenerator.initializeSegmentValues();
		TrialsBudgetDataGenerator.intializeValues();
		TrialsBudgetDataGenerator._isDataInitialized = true;
	}

	private static initializeSegmentValues() {
		var segemtnDesctiptions = TrialsBudgetDataGenerator.getSegmentsDescriptions();
		segemtnDesctiptions.forEach(segDesc => {
			// if (segDesc.parentSegmentsIds != null && segDesc.parentSegmentsIds.length > 0) {
			// 	return;
			// }

			TrialsBudgetDataGenerator.initalizeSegment(segDesc);
		});
	}

	private static initalizeSegment(segmentDescription: SeriesBySegment.SegmentDescription) {
		for (var index = 0; index < TrialsBudgetDataGenerator.NUMBER_OF_VALUES_PER_SEGMENT * segmentDescription.parentSegmentsIds.length; index++) {
			var segmentValue: SeriesBySegment.SegmentValueForDisplay = {
				segmentId: segmentDescription.id,
				valueId: index.toString(),
				displayName: segmentDescription.displayName + " " + index,
				description: segmentDescription.displayName + " " + index + " description"
			};
			TrialsBudgetDataGenerator._segments.push(segmentValue);

		}
		
		//var childSegments= TrialsBudgetDataGenerator.getSegmentsDescriptions().filter(seg=> seg.parentSegmentsIds.indexOf(segmentDescription.id) > -1)
	}

	private static intializeValues() {
		for (var index = 0; index < TrialsBudgetDataGenerator.NUMBER_OF_DATA_ELEMENTS; index++) {

			var dataItems = TrialsBudgetDataGenerator.getSeriesDescriptions().map(seriesDescription => {
				var dataItem: SeriesBySegment.DataItem = {
					seriesId: seriesDescription.id,
					value: TrialsBudgetDataGenerator.GetRandom(100, 200)
				};
				return dataItem;
			});

			var segmetValues = TrialsBudgetDataGenerator.getSegmentsDescriptions().map(segDesc=> {

				var relevantSegmentValues = TrialsBudgetDataGenerator._segments.filter(seg=> seg.segmentId == segDesc.id);
				var segmentValueId = relevantSegmentValues[TrialsBudgetDataGenerator.GetRandom(0, relevantSegmentValues.length - 1)].valueId;
				var segmentValue: SeriesBySegment.SegmentValue = {
					segmentId: segDesc.id,
					valueId: segmentValueId,
				};
				return segmentValue;

			})

			var dataElement: DataElement = {
				segments: segmetValues,
				data: dataItems
			}

			TrialsBudgetDataGenerator._data.push(dataElement);
		}
	}

	private static GetRandom(low: number, high: number) {
		return Math.floor((Math.random() * (high - low)) + low);
	}


}


class DataElement {
	segments: SeriesBySegment.SegmentValue[];
	data: SeriesBySegment.DataItem[];
}