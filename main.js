define(["require", "exports", "SeriesBySegmentsGraph", "./TrilasData"], function (require, exports, SeriesBySegment, Data) {
    var Program = (function () {
        function Program() {
        }
        Program.main = function () {
            /*
            var dataAccess=new MockDataAccess();
            Painter.paint(dataAccess.getData({}));
            */
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
            var data = {
                xAxisSegmentId: "",
                yAxisDisplayName: "NIS",
                segments: [
                    {
                        segment: {
                            segmentId: "project",
                            valueId: "00000001",
                            displayName: "Boney Ha-Tichon",
                            description: "NA"
                        },
                        dataItems: [
                            {
                                seriesId: "budget",
                                value: 10
                            },
                            {
                                seriesId: "spent",
                                value: 7
                            },
                        ]
                    },
                    {
                        segment: {
                            segmentId: "project",
                            valueId: "00000002",
                            displayName: "Rishon Maarav",
                            description: "NA"
                        },
                        dataItems: [
                            {
                                seriesId: "budget",
                                value: 13
                            },
                            {
                                seriesId: "spent",
                                value: 2
                            },
                            {
                                seriesId: "planned",
                                value: 4
                            },
                        ]
                    },
                    {
                        segment: {
                            segmentId: "project",
                            valueId: "00000003",
                            displayName: "Rishon Maarav",
                            description: "NA"
                        },
                        dataItems: [
                            {
                                seriesId: "budget",
                                value: 13
                            },
                            {
                                seriesId: "spent",
                                value: 2
                            },
                            {
                                seriesId: "planned",
                                value: 4
                            },
                        ]
                    }, {
                        segment: {
                            segmentId: "project",
                            valueId: "00000004",
                            displayName: "Rishon Maarav5",
                            description: "NA"
                        },
                        dataItems: [
                            {
                                seriesId: "budget",
                                value: 13
                            },
                            {
                                seriesId: "spent",
                                value: 2
                            },
                            {
                                seriesId: "planned",
                                value: 4
                            },
                        ]
                    }, {
                        segment: {
                            segmentId: "project",
                            valueId: "00000005",
                            displayName: "Rishon Maarav4",
                            description: "NA"
                        },
                        dataItems: [
                            {
                                seriesId: "budget",
                                value: 13
                            },
                            {
                                seriesId: "spent",
                                value: 2
                            },
                            {
                                seriesId: "planned",
                                value: 4
                            },
                        ]
                    }, {
                        segment: {
                            segmentId: "project",
                            valueId: "00000006",
                            displayName: "Rishon Maarav3",
                            description: "NA"
                        },
                        dataItems: [
                            {
                                seriesId: "budget",
                                value: 13
                            },
                            {
                                seriesId: "spent",
                                value: 2
                            },
                            {
                                seriesId: "planned",
                                value: 4
                            },
                        ]
                    }, {
                        segment: {
                            segmentId: "project",
                            valueId: "00000007",
                            displayName: "Rishon Maarav2",
                            description: "NA"
                        },
                        dataItems: [
                            {
                                seriesId: "budget",
                                value: 13
                            },
                            {
                                seriesId: "spent",
                                value: 2
                            },
                            {
                                seriesId: "planned",
                                value: 4
                            },
                        ]
                    }, {
                        segment: {
                            segmentId: "project",
                            valueId: "00000008",
                            displayName: "Rishon Maarav1",
                            description: "NA"
                        },
                        dataItems: [
                            {
                                seriesId: "budget",
                                value: 13
                            },
                            {
                                seriesId: "spent",
                                value: 2
                            },
                            {
                                seriesId: "planned",
                                value: 4
                            },
                        ]
                    },
                ]
            };
            var painter = new SeriesBySegment.Painter();
            //var dataGenerator = new Data.TrialsBudgetDataGenerator();
            var dataGenerator = new Data.TrialsGameOfTHronesDataGenerator();
            var isUsingDynamicData = true;
            if (isUsingDynamicData) {
                var intialData = dataGenerator.getSegmentData({ filterSegments: [], date: null, requestedSegmentId: 'House' });
                painter.setup(dataGenerator.getSeriesDescriptions(), dataGenerator.getSegmentsDescriptions(), intialData, 
                // Create a closure so that 'this' is not equal the painter class when invoked:
                function (params) {
                    return dataGenerator.getSegmentData(params);
                }, "#budgetPlot");
            }
            else {
                painter.setup(seriesDescriptions, segmentDescriptions, data, null, "#budgetPlot");
            }
            /*
            data.segments.pop();
            data.segments.pop();
            // data.segments.pop();
            // data.segments.pop();
            // data.segments.pop();
            // data.segments.pop();
            
            painter.drawData(data);
            */
        };
        return Program;
    })();
    Program.main();
});
//# sourceMappingURL=Main.js.map