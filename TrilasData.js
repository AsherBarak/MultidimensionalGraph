define(["require", "exports"], function (require, exports) {
    var TrialsBudgetDataGenerator = (function () {
        function TrialsBudgetDataGenerator() {
        }
        TrialsBudgetDataGenerator.getSegmentsDescriptions = function () {
            var segmentDescriptions = [
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
        };
        TrialsBudgetDataGenerator.getSeriesDescriptions = function () {
            var seriesDescriptions = [
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
        };
        TrialsBudgetDataGenerator.getSegmentData = function (params) {
            if (!TrialsBudgetDataGenerator._isDataInitialized) {
                TrialsBudgetDataGenerator.initializeData();
            }
            var data = TrialsBudgetDataGenerator._data.slice(0);
            params.filterSegments.forEach(function (filterSeg) {
                data =
                    data.filter(function (el) {
                        return el.segments.filter(function (seg) { return seg.segmentId == filterSeg.segmentId
                            && seg.valueId == filterSeg.valueId; }).length > 0;
                    });
            });
            var segments = [];
            data.forEach(function (item) {
                var itemSegment = item.segments.filter(function (seg) { return seg.segmentId == params.requestedSegmentId; })[0];
                var groupedSegments = segments.filter(function (seg) { return seg.segment.valueId == itemSegment.valueId; });
                var groupedSegment;
                if (groupedSegments.length == 0) {
                    groupedSegment = {
                        segment: itemSegment,
                        dataItems: []
                    };
                    segments.push(groupedSegment);
                }
                else {
                    groupedSegment = groupedSegments[0];
                }
                item.data.forEach(function (di) {
                    var dataItem;
                    var existingDataItems = groupedSegment.dataItems.filter(function (item) { return item.seriesId == di.seriesId; });
                    if (existingDataItems.length == 0) {
                        dataItem = { seriesId: di.seriesId, value: 0 };
                        groupedSegment.dataItems.push(dataItem);
                    }
                    else {
                        dataItem = existingDataItems[0];
                    }
                    dataItem.value += di.value;
                });
            });
            return {
                segments: segments,
                yAxisDisplayName: "MONEY",
                xAxisSegmentId: params.requestedSegmentId
            };
        };
        TrialsBudgetDataGenerator.initializeData = function () {
            TrialsBudgetDataGenerator.initializeSegmentValues();
            TrialsBudgetDataGenerator.intializeValues();
            TrialsBudgetDataGenerator._isDataInitialized = true;
        };
        TrialsBudgetDataGenerator.initializeSegmentValues = function () {
            var segemtnDesctiptions = TrialsBudgetDataGenerator.getSegmentsDescriptions();
            segemtnDesctiptions.forEach(function (segDesc) {
                // if (segDesc.parentSegmentsIds != null && segDesc.parentSegmentsIds.length > 0) {
                // 	return;
                // }
                TrialsBudgetDataGenerator.initalizeSegment(segDesc);
            });
        };
        TrialsBudgetDataGenerator.initalizeSegment = function (segmentDescription) {
            var multiplier = segmentDescription.parentSegmentsIds != null ? segmentDescription.parentSegmentsIds.length : 1;
            for (var index = 0; index < TrialsBudgetDataGenerator.NUMBER_OF_VALUES_PER_SEGMENT * multiplier; index++) {
                var segmentValue = {
                    segmentId: segmentDescription.id,
                    valueId: index.toString(),
                    displayName: segmentDescription.displayName + " " + index,
                    description: segmentDescription.displayName + " " + index + " description"
                };
                TrialsBudgetDataGenerator._segments.push(segmentValue);
            }
            //var childSegments= TrialsBudgetDataGenerator.getSegmentsDescriptions().filter(seg=> seg.parentSegmentsIds.indexOf(segmentDescription.id) > -1)
        };
        TrialsBudgetDataGenerator.intializeValues = function () {
            for (var index = 0; index < TrialsBudgetDataGenerator.NUMBER_OF_DATA_ELEMENTS; index++) {
                var dataItems = TrialsBudgetDataGenerator.getSeriesDescriptions().map(function (seriesDescription) {
                    var dataItem = {
                        seriesId: seriesDescription.id,
                        value: TrialsBudgetDataGenerator.GetRandom(100, 200)
                    };
                    return dataItem;
                });
                var segmetValues = TrialsBudgetDataGenerator.getSegmentsDescriptions().map(function (segDesc) {
                    var relevantSegmentValues = TrialsBudgetDataGenerator._segments.filter(function (seg) { return seg.segmentId == segDesc.id; });
                    return relevantSegmentValues[TrialsBudgetDataGenerator.GetRandom(0, relevantSegmentValues.length - 1)];
                    // var segmentValueId = relevantSegmentValues[TrialsBudgetDataGenerator.GetRandom(0, relevantSegmentValues.length - 1)].valueId;
                    // var segmentValue: SeriesBySegment.SegmentValueForDisplay = {
                    // 	segmentId: segDesc.id,
                    // 	valueId: segmentValueId,
                    // };
                    // return segmentValue;
                });
                var dataElement = {
                    segments: segmetValues,
                    data: dataItems
                };
                TrialsBudgetDataGenerator._data.push(dataElement);
            }
        };
        TrialsBudgetDataGenerator.GetRandom = function (low, high) {
            return Math.floor((Math.random() * (high - low)) + low);
        };
        TrialsBudgetDataGenerator._segments = [];
        TrialsBudgetDataGenerator._data = [];
        TrialsBudgetDataGenerator.NUMBER_OF_VALUES_PER_SEGMENT = 10;
        TrialsBudgetDataGenerator.NUMBER_OF_DATA_ELEMENTS = 1000;
        return TrialsBudgetDataGenerator;
    })();
    exports.TrialsBudgetDataGenerator = TrialsBudgetDataGenerator;
    var DataElement = (function () {
        function DataElement() {
        }
        return DataElement;
    })();
});
//# sourceMappingURL=TrilasData.js.map