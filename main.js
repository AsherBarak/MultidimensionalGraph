define(["require", "exports", "SeriesBySegmentsGraph", "./TrilasData"], function (require, exports, SeriesBySegment, Data) {
    var Program = (function () {
        function Program() {
        }
        Program.main = function () {
            var painter = new SeriesBySegment.Painter();
            //var dataGenerator = new Data.TrialsBudgetDataGenerator();
            var dataGenerator = new Data.TrialsGameOfTHronesDataGenerator();
            var intialData = dataGenerator.getSegmentData({ filterSegments: [], date: null, requestedSegmentId: 'House' });
            painter.setup(dataGenerator.getSeriesDescriptions(), dataGenerator.getSegmentsDescriptions(), intialData, 
            // Create a closure so that 'this' is not equal the painter class when invoked:
            function (params) {
                return dataGenerator.getSegmentData(params);
            }, "#plotArea");
        };
        return Program;
    })();
    Program.main();
});
//# sourceMappingURL=main.js.map