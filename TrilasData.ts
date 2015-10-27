import * as SeriesBySegment from "SeriesBySegmentsGraph"

export class TrialsBudgetDataGenerator {
	private static _isDataInitialized: boolean;
	private static _segments: SeriesBySegment.SegmentValueForDisplay[] = [];
	private static _data: DataElement[] = [];
	private static NUMBER_OF_VALUES_PER_SEGMENT: number = 10;
	private static NUMBER_OF_DATA_ELEMENTS: number = 1000;

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
				id: "location",
				cssClass: "location",
				displayName: "Location",
				description: "Location",
				parentSegmentsIds: ["project"],
			},
			{
				id: "chapter",
				cssClass: "chapter",
				displayName: "Chapter",
				description: "Chapter",
				parentSegmentsIds: ["project"],
			},
			{
				id: "subchapter",
				cssClass: "subchapter",
				displayName: "Subchapter",
				description: "Subchapter",
				parentSegmentsIds: ["chapter"],
			},
			/*
			{
				id: "secondarySubchapter",
				cssClass: "secondarySubchapter",
				displayName: "Secondary Subchapter",
				description: "Secondary Subchapter",
				parentSegmentsIds: ["subchapter"],
			},
			*/
			{
				id: "boqItem",
				cssClass: "boqItem",
				displayName: "Item",
				description: "Bill of quantity item",
				parentSegmentsIds: ["subchapter", "location", "subproject"],
			},
			{
				id: "item",
				cssClass: "item",
				displayName: "Inventory Item",
				description: "Inventory Item",
			},
			{
				id: "account",
				cssClass: "account",
				displayName: "Account",
				description: "Account",
			},
			{
				id: "budgetGroup",
				cssClass: "budgetGroup",
				displayName: "Budget Group",
				description: "Budget Group",
			},
			{
				id: "budgetItem",
				cssClass: "budgetItem",
				displayName: "Budget Item",
				description: "Budget Item",
				parentSegmentsIds: ["budgetGroup"],
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

		var segments: SeriesBySegment.SegmentDataItems[] = [];

		data.forEach(item=> {
			var itemSegment = item.segments.filter(seg=> seg.segmentId == params.requestedSegmentId)[0];
			var groupedSegments = segments.filter(seg=> seg.segment.valueId == itemSegment.valueId);
			var groupedSegment: SeriesBySegment.SegmentDataItems;
			if (groupedSegments.length == 0) {
				groupedSegment = {
					segment: itemSegment,
					dataItems: []
				}
				segments.push(groupedSegment)
			} else {
				groupedSegment = groupedSegments[0];
			}
			item.data.forEach(di => {
				var dataItem: SeriesBySegment.DataItem;
				var existingDataItems = groupedSegment.dataItems.filter(item=> item.seriesId == di.seriesId);
				if (existingDataItems.length == 0) {
					dataItem = { seriesId: di.seriesId, value: 0 };
					groupedSegment.dataItems.push(dataItem);
				} else {
					dataItem = existingDataItems[0];
				}
				dataItem.value += di.value;
			});
		})

		return {
			segments: segments,
			yAxisDisplayName: "MONEY",
			xAxisSegmentId: params.requestedSegmentId
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
		var multiplier = segmentDescription.parentSegmentsIds != null ? segmentDescription.parentSegmentsIds.length : 1;
		for (var index = 0; index < TrialsBudgetDataGenerator.NUMBER_OF_VALUES_PER_SEGMENT * multiplier; index++) {
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
				return relevantSegmentValues[TrialsBudgetDataGenerator.GetRandom(0, relevantSegmentValues.length - 1)];
				
				// var segmentValueId = relevantSegmentValues[TrialsBudgetDataGenerator.GetRandom(0, relevantSegmentValues.length - 1)].valueId;
				// var segmentValue: SeriesBySegment.SegmentValueForDisplay = {
				// 	segmentId: segDesc.id,
				// 	valueId: segmentValueId,
				// };
				// return segmentValue;

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
	segments: SeriesBySegment.SegmentValueForDisplay[];
	data: SeriesBySegment.DataItem[];
}