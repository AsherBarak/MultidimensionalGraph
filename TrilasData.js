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
                    id: "item",
                    cssClass: "item",
                    displayName: "Item",
                    description: "Item",
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
            params.requestedSegments;
            data.map();
            return {
                segments: null,
                yAxisDisplayName: "MONEY!!"
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
            for (var index = 0; index < TrialsBudgetDataGenerator.NUMBER_OF_VALUES_PER_SEGMENT * segmentDescription.parentSegmentsIds.length; index++) {
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
                    var segmentValueId = relevantSegmentValues[TrialsBudgetDataGenerator.GetRandom(0, relevantSegmentValues.length - 1)].valueId;
                    var segmentValue = {
                        segmentId: segDesc.id,
                        valueId: segmentValueId,
                    };
                    return segmentValue;
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
        TrialsBudgetDataGenerator._data = [];
        TrialsBudgetDataGenerator.NUMBER_OF_VALUES_PER_SEGMENT = 10;
        TrialsBudgetDataGenerator.NUMBER_OF_DATA_ELEMENTS = 10000;
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