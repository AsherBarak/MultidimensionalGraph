var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * @example: Budget, Actual expanditure
 */
var SeriesDescription = (function () {
    function SeriesDescription() {
    }
    return SeriesDescription;
})();
var DataItem = (function () {
    function DataItem() {
    }
    return DataItem;
})();
/**
 * @example
 *  Project, Subproject, Item etc.
 * */
var SegmentDescription = (function () {
    function SegmentDescription() {
    }
    return SegmentDescription;
})();
/**
 * The value of a segment. This class contains only the key of the segemnt. The {@link SegmentValueForDisplay} class has the decription.
 * @example
 * key of Project A (Project segment), key of Subproject 22 (Subproject segment), key of Hammer (Items segmenty)*/
var SegmentValue = (function () {
    function SegmentValue() {
    }
    return SegmentValue;
})();
var SegmentValueForDisplay = (function (_super) {
    __extends(SegmentValueForDisplay, _super);
    function SegmentValueForDisplay() {
        _super.apply(this, arguments);
    }
    return SegmentValueForDisplay;
})(SegmentValue);
var DataRequestParams = (function () {
    function DataRequestParams() {
    }
    return DataRequestParams;
})();
var SegmentdRequestParams = (function (_super) {
    __extends(SegmentdRequestParams, _super);
    function SegmentdRequestParams() {
        _super.apply(this, arguments);
    }
    return SegmentdRequestParams;
})(DataRequestParams);
var TimelineRequestParams = (function (_super) {
    __extends(TimelineRequestParams, _super);
    function TimelineRequestParams() {
        _super.apply(this, arguments);
    }
    return TimelineRequestParams;
})(DataRequestParams);
var RetrivedData = (function () {
    function RetrivedData() {
    }
    return RetrivedData;
})();
var SegmentDataItems = (function () {
    function SegmentDataItems() {
    }
    return SegmentDataItems;
})();
var SegmentsData = (function (_super) {
    __extends(SegmentsData, _super);
    function SegmentsData() {
        _super.apply(this, arguments);
    }
    return SegmentsData;
})(RetrivedData);
var TimelineDataItem = (function () {
    function TimelineDataItem() {
    }
    return TimelineDataItem;
})();
var TimelineData = (function (_super) {
    __extends(TimelineData, _super);
    function TimelineData() {
        _super.apply(this, arguments);
    }
    return TimelineData;
})(RetrivedData);
var Painter = (function () {
    function Painter() {
    }
    Painter.prototype.setup = function (seriesDescriptions, segmentDescriptions) {
    };
    Painter.prototype.draw = function () {
    };
    return Painter;
})();
//# sourceMappingURL=SeriesBySegmentsGraph.js.map