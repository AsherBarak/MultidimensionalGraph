import * as SeriesBySegment from "SeriesBySegmentsGraph";
import * as Data from "./TrilasData";

class Program {
    static main() {
        var painter = new SeriesBySegment.Painter();

        //var dataGenerator = new Data.TrialsBudgetDataGenerator();
        var dataGenerator = new Data.TrialsGameOfTHronesDataGenerator();
        
            var intialData = dataGenerator.getSegmentData(
                { filterSegments: [], date: null, requestedSegmentId: 'House' });
            painter.setup(
                dataGenerator.getSeriesDescriptions(),
                dataGenerator.getSegmentsDescriptions(),
                intialData,
                // Create a closure so that 'this' is not equal the painter class when invoked:
                (params) => {
                    return dataGenerator.getSegmentData(params);
                },
                "#plotArea"
            );
    }
}

Program.main();
