import * as SeriesBySegment from "SeriesBySegmentsGraph"

export abstract class TrialsDataGenerator {
    abstract getSegmentsDescriptions(): SeriesBySegment.SegmentDescription[];
    abstract getSeriesDescriptions(): SeriesBySegment.SeriesDescription[];
    protected abstract getSegmentValues(): SeriesBySegment.SegmentValueForDisplay[];
    protected abstract getDataValues(): DataElement[];

    private _isDataInitialized: boolean;
    protected _segments: SeriesBySegment.SegmentValueForDisplay[] = [];
    private _data: DataElement[] = [];

    protected NUMBER_OF_DATA_ELEMENTS: number = 1000;

    getSegmentData(params: SeriesBySegment.SegmentRequestParams): SeriesBySegment.SegmentsData {

        if (!this._isDataInitialized) {
            this.initializeData()
        }

        var data = this._data.slice(0);

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
            yAxisDisplayName: "",
            xAxisSegmentId: params.requestedSegmentId
        };
    }

    private initializeData() {
        this._segments = this.getSegmentValues();
        this._data = this.getDataValues();
        //this.intializeValues();
        this._isDataInitialized = true;
    }




    private intializeValues() {

        for (var index = 0; index < this.NUMBER_OF_DATA_ELEMENTS; index++) {

            var dataItems = this.getSeriesDescriptions().map(seriesDescription => {
                var dataItem: SeriesBySegment.DataItem = {
                    seriesId: seriesDescription.id,
                    value: this.GetRandom(100, 200)
                };
                return dataItem;
            });
            var segmetValues = this.getSegmentsDescriptions().map(segDesc=> {

                var relevantSegmentValues = this._segments.filter(seg=> seg.segmentId == segDesc.id);
                return relevantSegmentValues[this.GetRandom(0, relevantSegmentValues.length - 1)];
            })
            var dataElement: DataElement = {
                segments: segmetValues,
                data: dataItems
            }
            this._data.push(dataElement);
        }
    }

    protected GetRandom(low: number, high: number) {
        return Math.floor((Math.random() * (high - low)) + low);
    }
}

export abstract class TrialsDataGeneratorGeneratedSegmentValues extends TrialsDataGenerator {
    private NUMBER_OF_VALUES_PER_SEGMENT: number = 10;

    protected getSegmentValues(): SeriesBySegment.SegmentValueForDisplay[] {
        var segments: SeriesBySegment.SegmentValueForDisplay[] = [];
        var segemtnDesctiptions = this.getSegmentsDescriptions();
        segemtnDesctiptions.forEach(segDesc => {
            var multiplier = segDesc.parentSegmentsIds != null ? segDesc.parentSegmentsIds.length : 1;
            for (var index = 0; index < this.NUMBER_OF_VALUES_PER_SEGMENT * multiplier; index++) {
                var segmentValue: SeriesBySegment.SegmentValueForDisplay = {
                    segmentId: segDesc.id,
                    valueId: index.toString(),
                    displayName: segDesc.displayName + " " + index,
                    description: segDesc.displayName + " " + index + " description"
                };
                segments.push(segmentValue);
            }
        });
        return segments;
    }

    getDataValues(): DataElement[] {
        var data: DataElement[] = [];
        for (var index = 0; index < this.NUMBER_OF_DATA_ELEMENTS; index++) {

            var dataItems = this.getSeriesDescriptions().map(seriesDescription => {
                var dataItem: SeriesBySegment.DataItem = {
                    seriesId: seriesDescription.id,
                    value: this.GetRandom(100, 200)
                };
                return dataItem;
            });
            var segmetValues = this.getSegmentsDescriptions().map(segDesc=> {

                var relevantSegmentValues = this._segments.filter(seg=> seg.segmentId == segDesc.id);
                return relevantSegmentValues[this.GetRandom(0, relevantSegmentValues.length - 1)];
            })
            var dataElement: DataElement = {
                segments: segmetValues,
                data: dataItems
            }
            data.push(dataElement);
        }
        return data;
    }
}

export abstract class TrialsDataGeneratorProvidedSegmentValues extends TrialsDataGenerator {
    protected abstract getSegmentValuesWithHirarchy(): SegmentValueWithHirarchy[];

    getSegmentsDescriptions(): SeriesBySegment.SegmentDescription[] {
        var sgementValues = this.getSegmentValuesWithHirarchy();
        var segmentDescriptions: SeriesBySegment.SegmentDescription[] = [];
        sgementValues.forEach(
            hirarchySegVal=> {
                var parentSegment = null;
                hirarchySegVal.segment.split(";").reverse().forEach(
                    segVal=> {
                        var parentsArray = (parentSegment != null)
                            ? [parentSegment]
                            : [];
                        segmentDescriptions.push(
                            {
                                id: segVal,
                                cssClass: segVal,
                                description: segVal,
                                displayName: segVal,
                                parentSegmentsIds: parentsArray,
                            }
                        );
                        parentSegment = segVal;
                    })
            });
        return segmentDescriptions;
    }

    protected getSegmentValues(): SeriesBySegment.SegmentValueForDisplay[] {
        var segmentValuesForDisplay: SeriesBySegment.SegmentValueForDisplay[] = [];
        var segmentValuesWithHirarchy = this.getSegmentValuesWithHirarchy();
        segmentValuesWithHirarchy.forEach(hirarchySegVal=> {
            var segmentIds: string[] = hirarchySegVal.segment.split(";");
            hirarchySegVal.values.forEach((hirarchyVal) => {
                var segmnetValues: string[] = hirarchyVal.split(";");
                for (var i = 0; i < segmentIds.length; i++) {
                    var existingSegments = segmentValuesForDisplay.filter(seg=> seg.segmentId == segmentIds[i] && seg.valueId == segmnetValues[i]);
                    if (existingSegments.length == 0) {
                        var newSegment: SeriesBySegment.SegmentValueForDisplay = {
                            segmentId: segmentIds[i],
                            valueId: segmnetValues[i],
                            description: segmnetValues[i],
                            displayName: segmnetValues[i],
                        };
                        segmentValuesForDisplay.push(newSegment);
                    }
                };
            })
        });

        return segmentValuesForDisplay;
    }

    getDataValues(): DataElement[] {
        var data: DataElement[] = [];
        for (var index = 0; index < this.NUMBER_OF_DATA_ELEMENTS; index++) {

            var dataItems = this.getSeriesDescriptions().map(seriesDescription => {
                var dataItem: SeriesBySegment.DataItem = {
                    seriesId: seriesDescription.id,
                    value: this.GetRandom(100, 200)
                };
                return dataItem;
            });
            var segmetValues: SeriesBySegment.SegmentValueForDisplay[] =[]
            this.getSegmentValuesWithHirarchy().forEach(
                (hirarcySegVal) => {
                    var segmantsIds = hirarcySegVal.segment.split(";");
                    var segmentsValues = hirarcySegVal.values[this.GetRandom(0, hirarcySegVal.values.length)].split(";");
                    for (var i = 0; i < segmantsIds.length; i++){
                        var relevantSegmentValues = this._segments.filter(seg=> seg.segmentId == segmantsIds[i] && seg.valueId == segmentsValues[i]);
                        segmetValues.push(relevantSegmentValues[0]);
                    }
                }
            )

            /*
            var segmetValues =
                this.getSegmentsDescriptions().map(segDesc=> {
                    var relevantSegmentValues = this._segments.filter(seg=> seg.segmentId == segDesc.id);
                    return relevantSegmentValues[this.GetRandom(0, relevantSegmentValues.length)];
                })
        */
            var dataElement: DataElement = {
                segments: segmetValues,
                data: dataItems
            }
            data.push(dataElement);
        }
        return data;
    }
}

export class TrialsGameOfTHronesDataGenerator extends TrialsDataGeneratorProvidedSegmentValues {
    protected getSegmentValuesWithHirarchy(): SegmentValueWithHirarchy[] {
        return [
            { segment: "House", values: ["Stark", "Lannister", "Baratheon", "Targaryen", "Greyjoy", "Other", "Tully ", "Arryn ", "Tyrell ", "Martell ", ] },
            { segment: "Cahpter;Season", values: ["Cahpter 1;Season 1", "Cahpter 2;Season 1", "Cahpter 3;Season 1", "Cahpter 4;Season 1", "Cahpter 5;Season 1", "Cahpter 6;Season 1", "Cahpter 7;Season 1", "Cahpter 8;Season 1", "Cahpter 9;Season 1", "Cahpter 1;Season 2", "Cahpter 2;Season 2", "Cahpter 3;Season 2", "Cahpter 4;Season 2", "Cahpter 5;Season 2", "Cahpter 6;Season 2", "Cahpter 7;Season 2", "Cahpter 8;Season 2", "Cahpter 9;Season 2", "Cahpter 1;Season 3", "Cahpter 2;Season 3", "Cahpter 3;Season 3", "Cahpter 4;Season 3", "Cahpter 5;Season 3", "Cahpter 6;Season 3", "Cahpter 7;Season 3", "Cahpter 8;Season 3", "Cahpter 9;Season 3", "Cahpter 1;Season 4", "Cahpter 2;Season 4", "Cahpter 3;Season 4", "Cahpter 4;Season 4", "Cahpter 5;Season 4", "Cahpter 6;Season 4", "Cahpter 7;Season 4", "Cahpter 8;Season 4", "Cahpter 9;Season 4", "Cahpter 1;Season 5", "Cahpter 2;Season 5", "Cahpter 3;Season 5", "Cahpter 4;Season 5", "Cahpter 5;Season 5", "Cahpter 6;Season 5", "Cahpter 7;Season 5", "Cahpter 8;Season 5", "Cahpter 9;Season 5", "Not in the show;Not in the show", "", "", "", "", ] },
            { segment: "Book", values: ["Game of Thrones", "Clash of Kings", "Storm of Swords", "Feast for Crows", "A Dance with Dragons", "Not in the books", ] },
            { segment: "Location;Region;Continent", values: ["The Wall;The North;Westerose", "Winterfell;The North;Westerose", "The Dreadfort;The North;Westerose", "Hardome;The North;Westerose", "Riverrun;The Riverlands;Westerose", "Acorn Hall;The Riverlands;Westerose", "Wayfarer's Rest;The Riverlands;Westerose", "Eyrie;The Vale;Westerose", "The Bloody Gate;The Vale;Westerose", "Redfort;The Vale;Westerose", "Strongsong;The Vale;Westerose", "Balish Keep;The Vale;Westerose", "Casterly Rock;The Westernlands;Westerose", "Lannisport;The Westernlands;Westerose", "Feastfires;The Westernlands;Westerose", "Kayce;The Westernlands;Westerose", "Claegane Hall;The Westernlands;Westerose", "Storm's End;The Stormlands;Westerose", "Evenfall Hall;The Stormlands;Westerose", "Tarth;The Stormlands;Westerose", "Crow's nest;The Stormlands;Westerose", "Highgarden;The Reach;Westerose", "Old Oak;The Reach;Westerose", "Cider Hall;The Reach;Westerose", "Horn Hill;The Reach;Westerose", "Sunspear;Dorne;Westerose", "Wyl;Dorne;Westerose", "Lemonwood;Dorne;Westerose", "Godsgrace;Dorne;Westerose", "Vaith;Dorne;Westerose", "The Tor;Dorne;Westerose", "Pyke;Iron Islands;Other", "Naggas Rib;Iron Islands;Other", "Hammerhorn;Iron Islands;Other", "Ten Towers;Iron Islands;Other", "Myr;The East;Esos", "Tyros;The East;Esos", "Lys;The East;Esos", "Volantis;The East;Esos", "Pentos;The East;Esos", "Braavos;The East;Esos", "The Dothraki Sea;The West;Esos", "Qohor;The West;Esos", "The Sorrow;The West;Esos", "Mantarys;The West;Esos", "Astapor;The West;Esos", "Vaes Dothrak;The West;Esos", "Yunkai;The West;Esos", "Meereen;The West;Esos", ] },
            { segment: "Gender", values: ["Male", "Female", ] },
        ]
    }

    getSeriesDescriptions(): SeriesBySegment.SeriesDescription[] {
        var seriesDescriptions: SeriesBySegment.SeriesDescription[] = [
            {
                id: "Killed",
                cssClass: "Killed",
                displayName: "Killed",
                description: "Killed",
            },
            {
                id: "Introduced",
                cssClass: "Introduced",
                displayName: "Introduced",
                description: "Introduced",
            },
        ];
        return seriesDescriptions;
    }


}

export class TrialsBudgetDataGenerator extends TrialsDataGeneratorGeneratedSegmentValues {
    getSegmentsDescriptions(): SeriesBySegment.SegmentDescription[] {
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

    getSeriesDescriptions(): SeriesBySegment.SeriesDescription[] {
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


}

class DataElement {
    segments: SeriesBySegment.SegmentValueForDisplay[];
    data: SeriesBySegment.DataItem[];
}

interface SegmentValueWithHirarchy {
    segment: string;
    values: string[];
}
