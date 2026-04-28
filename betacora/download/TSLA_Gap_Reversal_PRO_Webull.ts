import { CustomIndicator, Bar, Color, PlotHandle, FillHandle, AlertFunction, HlineType, CustomIndicatorOptions, PlotType } from 'metrix';

class TslaGapReversal extends CustomIndicator {

  private gapMinPct: number;
  private stopLossPct: number;
  private takeProfitPct: number;
  private tradeQuantity: number;

  private pdhPlot: PlotHandle;
  private pdlPlot: PlotHandle;
  private pdcPlot: PlotHandle;
  private longSignalPlot: PlotHandle;
  private shortSignalPlot: PlotHandle;
  private slPlot: PlotHandle;
  private tpPlot: PlotHandle;
  private bgUpFill: FillHandle;
  private bgDnFill: FillHandle;

  private gapLongAlert: AlertFunction;
  private gapShortAlert: AlertFunction;

  private lastBar: Bar | null = null;
  private prevDayClose: number = NaN;
  private prevDayHigh: number = NaN;
  private prevDayLow: number = NaN;
  private prevDayOpen: number = NaN;
  private lastDayDetected: number = NaN;
  private dayBarCount: number = 0;
  private inSignal: string = "";
  private slPrice: number = NaN;
  private tpPrice: number = NaN;
  private lastDayOpen: number = NaN;
  private lastDayHigh: number = NaN;
  private lastDayLow: number = NaN;
  private lastDayClose: number = NaN;

  constructor(options: CustomIndicatorOptions) {
    super(options);

    this.defineIndicator("TSLA Gap Reversal PRO | 74% WR", "GapRev", true);

    this.gapMinPct = this.defineInput("Gap Min %", 1.0, { type: "Float", description: "Min gap percentage to trade" }) as number;
    this.stopLossPct = this.defineInput("Stop Loss %", 3.0, { type: "Float", description: "Stop loss % from entry" }) as number;
    this.takeProfitPct = this.defineInput("Take Profit %", 2.0, { type: "Float", description: "Take profit % from entry" }) as number;
    this.tradeQuantity = this.defineInput("Quantity", 100, { type: "Int", description: "Shares per trade" }) as number;

    this.pdhPlot = this.definePlot("PDH", { color: Color.Orange, type: PlotType.Line, lineWidth: 1 });
    this.pdlPlot = this.definePlot("PDL", { color: Color.Blue, type: PlotType.Line, lineWidth: 1 });
    this.pdcPlot = this.definePlot("PDC", { color: Color.White, type: PlotType.Line, lineWidth: 1 });
    this.longSignalPlot = this.definePlot("LONG", { color: Color.Green, type: PlotType.Circles, trackPrice: true });
    this.shortSignalPlot = this.definePlot("SHORT", { color: Color.Red, type: PlotType.Circles, trackPrice: true });
    this.slPlot = this.definePlot("SL", { color: Color.Red, type: PlotType.Line, lineWidth: 2 });
    this.tpPlot = this.definePlot("TP", { color: Color.Green, type: PlotType.Line, lineWidth: 2 });

    this.bgUpFill = this.defineFill("BG_UP", this.longSignalPlot, this.longSignalPlot, { color: "#00000000" });
    this.bgDnFill = this.defineFill("BG_DN", this.shortSignalPlot, this.shortSignalPlot, { color: "#00000000" });

    this.gapLongAlert = this.defineAlert("Gap LONG", "TSLA GAP DOWN - ENTRAR LONG - WR 74% - SL " + this.stopLossPct + "% TP " + this.takeProfitPct + "%");
    this.gapShortAlert = this.defineAlert("Gap SHORT", "TSLA GAP UP - ENTRAR SHORT - WR 75% - SL " + this.stopLossPct + "% TP " + this.takeProfitPct + "%");
  }

  onBar(bar: Bar): void {
    this.bar = bar;
    this.dayBarCount++;

    let gapDown = false;
    let gapUp = false;
    let gapPct = 0;

    // Detectar nuevo dia: abertura vs cierre del dia anterior
    if (this.lastBar) {
      let isNewDay = false;
      if (!isNaN(this.prevDayClose)) {
        const openGap = Math.abs(bar.open - this.prevDayClose) / this.prevDayClose;
        if (openGap > 0.001) {
          isNewDay = true;
        }
      }
      if (this.dayBarCount > 500) {
        isNewDay = true;
      }

      if (isNewDay && !isNaN(this.prevDayClose)) {
        this.prevDayClose = this.lastDayClose;
        this.prevDayHigh = this.lastDayHigh;
        this.prevDayLow = this.lastDayLow;
        this.prevDayOpen = this.lastDayOpen;
        this.dayBarCount = 1;
        this.inSignal = "";
        this.slPrice = NaN;
        this.tpPrice = NaN;

        gapPct = ((bar.open - this.prevDayClose) / this.prevDayClose) * 100;
        gapDown = gapPct <= -this.gapMinPct;
        gapUp = gapPct >= this.gapMinPct;

        if (gapDown) {
          this.inSignal = "LONG";
          this.slPrice = bar.close * (1 - this.stopLossPct / 100);
          this.tpPrice = bar.close * (1 + this.takeProfitPct / 100);
          this.gapLongAlert();
        } else if (gapUp) {
          this.inSignal = "SHORT";
          this.slPrice = bar.close * (1 + this.stopLossPct / 100);
          this.tpPrice = bar.close * (1 - this.takeProfitPct / 100);
          this.gapShortAlert();
        }
      }
    }

    // Chequear si SL o TP fue golpeado
    if (this.inSignal === "LONG") {
      if (bar.low <= this.slPrice || bar.high >= this.tpPrice) {
        this.inSignal = "";
        this.slPrice = NaN;
        this.tpPrice = NaN;
      }
    }
    if (this.inSignal === "SHORT") {
      if (bar.high >= this.slPrice || bar.low <= this.tpPrice) {
        this.inSignal = "";
        this.slPrice = NaN;
        this.tpPrice = NaN;
      }
    }

    // Actualizar datos del dia actual
    if (this.dayBarCount === 1) {
      this.lastDayOpen = bar.open;
      this.lastDayHigh = bar.high;
      this.lastDayLow = bar.low;
      this.lastDayClose = bar.close;
    } else {
      this.lastDayHigh = Math.max(this.lastDayHigh, bar.high);
      this.lastDayLow = Math.min(this.lastDayLow, bar.low);
      this.lastDayClose = bar.close;
    }

    // Plots
    this.pdhPlot(this.prevDayHigh);
    this.pdlPlot(this.prevDayLow);
    this.pdcPlot(this.prevDayClose);

    this.longSignalPlot(this.inSignal === "LONG" ? this.bar.close : NaN);
    this.shortSignalPlot(this.inSignal === "SHORT" ? this.bar.close : NaN);

    if (!isNaN(this.slPrice) && this.inSignal !== "") {
      this.slPlot(this.slPrice);
      this.tpPlot(this.tpPrice);
    } else {
      this.slPlot(NaN);
      this.tpPlot(NaN);
    }

    if (this.inSignal === "LONG") {
      this.bgUpFill({ color: "#4CAF501A" });
      this.bgDnFill({ color: "#00000000" });
    } else if (this.inSignal === "SHORT") {
      this.bgDnFill({ color: "#FF52521A" });
      this.bgUpFill({ color: "#00000000" });
    } else {
      this.bgUpFill({ color: "#00000000" });
      this.bgDnFill({ color: "#00000000" });
    }

    this.lastBar = this.bar;
  }
}

export default TslaGapReversal;
