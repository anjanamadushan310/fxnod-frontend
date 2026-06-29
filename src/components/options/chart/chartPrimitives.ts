// lightweight-charts v5 custom series primitives for chart drawings.
//
// Horizontal lines use the built-in series.createPriceLine() (no primitive
// needed). Trend + vertical lines have no built-in equivalent, so we implement
// them as ISeriesPrimitive: a pane view recomputes pixel coordinates from
// (time, price) each frame, and a renderer paints onto the canvas in the
// bitmap coordinate space (handling devicePixelRatio).

import type {
  IPrimitivePaneRenderer,
  IPrimitivePaneView,
  ISeriesPrimitive,
  SeriesAttachedParameter,
  Time,
} from "lightweight-charts";
import type { CanvasRenderingTarget2D } from "fancy-canvas";

export interface LinePoint {
  time: Time;
  price: number;
}

type AttachedChart = SeriesAttachedParameter<Time>["chart"];
type AttachedSeries = SeriesAttachedParameter<Time>["series"];

// ─── Trend line (two points) ─────────────────────────────────────────────────

class TrendRenderer implements IPrimitivePaneRenderer {
  constructor(
    private readonly _x1: number | null,
    private readonly _y1: number | null,
    private readonly _x2: number | null,
    private readonly _y2: number | null,
    private readonly _color: string,
    private readonly _width: number,
  ) {}

  draw(target: CanvasRenderingTarget2D): void {
    if (
      this._x1 === null ||
      this._y1 === null ||
      this._x2 === null ||
      this._y2 === null
    ) {
      return;
    }
    target.useBitmapCoordinateSpace((scope) => {
      const ctx = scope.context;
      const hr = scope.horizontalPixelRatio;
      const vr = scope.verticalPixelRatio;
      ctx.lineWidth = this._width * vr;
      ctx.strokeStyle = this._color;
      ctx.beginPath();
      ctx.moveTo(this._x1! * hr, this._y1! * vr);
      ctx.lineTo(this._x2! * hr, this._y2! * vr);
      ctx.stroke();
    });
  }
}

class TrendPaneView implements IPrimitivePaneView {
  private _x1: number | null = null;
  private _y1: number | null = null;
  private _x2: number | null = null;
  private _y2: number | null = null;

  constructor(private readonly _source: TrendPrimitive) {}

  update(): void {
    const chart = this._source.chart;
    const series = this._source.series;
    if (!chart || !series) return;
    const ts = chart.timeScale();
    this._x1 = ts.timeToCoordinate(this._source.a.time);
    this._y1 = series.priceToCoordinate(this._source.a.price);
    this._x2 = ts.timeToCoordinate(this._source.b.time);
    this._y2 = series.priceToCoordinate(this._source.b.price);
  }

  renderer(): IPrimitivePaneRenderer {
    return new TrendRenderer(
      this._x1,
      this._y1,
      this._x2,
      this._y2,
      this._source.color,
      this._source.width,
    );
  }
}

export class TrendPrimitive implements ISeriesPrimitive<Time> {
  chart: AttachedChart | null = null;
  series: AttachedSeries | null = null;
  private readonly _paneView: TrendPaneView;

  constructor(
    public readonly a: LinePoint,
    public readonly b: LinePoint,
    public readonly color = "#2962FF",
    public readonly width = 2,
  ) {
    this._paneView = new TrendPaneView(this);
  }

  attached(param: SeriesAttachedParameter<Time>): void {
    this.chart = param.chart;
    this.series = param.series;
  }

  detached(): void {
    this.chart = null;
    this.series = null;
  }

  updateAllViews(): void {
    this._paneView.update();
  }

  paneViews(): readonly IPrimitivePaneView[] {
    return [this._paneView];
  }
}

// ─── Vertical line (one time, full pane height) ──────────────────────────────

class VerticalRenderer implements IPrimitivePaneRenderer {
  constructor(
    private readonly _x: number | null,
    private readonly _color: string,
    private readonly _width: number,
  ) {}

  draw(target: CanvasRenderingTarget2D): void {
    if (this._x === null) return;
    target.useBitmapCoordinateSpace((scope) => {
      const ctx = scope.context;
      const x = Math.round(this._x! * scope.horizontalPixelRatio);
      ctx.lineWidth = this._width * scope.verticalPixelRatio;
      ctx.strokeStyle = this._color;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, scope.bitmapSize.height);
      ctx.stroke();
    });
  }
}

class VerticalPaneView implements IPrimitivePaneView {
  private _x: number | null = null;

  constructor(private readonly _source: VerticalPrimitive) {}

  update(): void {
    const chart = this._source.chart;
    if (!chart) return;
    this._x = chart.timeScale().timeToCoordinate(this._source.time);
  }

  renderer(): IPrimitivePaneRenderer {
    return new VerticalRenderer(this._x, this._source.color, this._source.width);
  }
}

export class VerticalPrimitive implements ISeriesPrimitive<Time> {
  chart: AttachedChart | null = null;
  series: AttachedSeries | null = null;
  private readonly _paneView: VerticalPaneView;

  constructor(
    public readonly time: Time,
    public readonly color = "#2962FF",
    public readonly width = 1,
  ) {
    this._paneView = new VerticalPaneView(this);
  }

  attached(param: SeriesAttachedParameter<Time>): void {
    this.chart = param.chart;
    this.series = param.series;
  }

  detached(): void {
    this.chart = null;
    this.series = null;
  }

  updateAllViews(): void {
    this._paneView.update();
  }

  paneViews(): readonly IPrimitivePaneView[] {
    return [this._paneView];
  }
}
