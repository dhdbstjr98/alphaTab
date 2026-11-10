import type { Color } from '@coderline/alphatab/model/Color';
import type { Font } from '@coderline/alphatab/model/Font';
import { type ICanvas, TextAlign, type TextBaseline } from '@coderline/alphatab/platform/ICanvas';
import { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';

/**
 * @internal
 */
export class TextGlyph extends EffectGlyph {
    private _lines: string[];
    private _lineHeights: number[] | null = null;

    public font: Font;
    public textAlign: TextAlign;
    public textBaseline: TextBaseline | null;

    public colorOverride?: Color;

    public constructor(
        x: number,
        y: number,
        text: string,
        font: Font,
        textAlign: TextAlign = TextAlign.Left,
        testBaseline: TextBaseline | null = null,
        color?: Color
    ) {
        super(x, y);
        this._lines = text.split('\n');
        this.font = font;
        this.textAlign = textAlign;
        this.textBaseline = testBaseline;
        this.colorOverride = color;
    }

    public override doLayout(): void {
        super.doLayout();

        this._lineHeights = [];
        const c = this.renderer.scoreRenderer.canvas!;
        // BandPlayer patch: 줄 높이를 measureText 결과가 아니라 폰트 크기 기준으로 통일한다.
        // 폭이 0인 줄(예: 가사 자리표시자 '-')은 measureText 높이가 2px 수준으로 나와
        // 다음 줄과 겹쳐 보였다. 폰트 크기를 쓰면 모든 줄이 동일한 줄 높이를 갖는다.
        const lineHeight = this.font.size;
        for (const line of this._lines) {
            c.font = this.font;
            const size = c!.measureText(line);
            this._lineHeights.push(lineHeight);
            this.height += lineHeight;
            this.width = Math.max(this.width, size.width);
        }
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const color = canvas.color;
        canvas.color = this.colorOverride ?? color;
        canvas.font = this.font;
        const old = canvas.textAlign;
        const oldBaseLine = canvas.textBaseline;
        canvas.textAlign = this.textAlign;
        if (this.textBaseline !== null) {
            canvas.textBaseline = this.textBaseline!;
        }
        let y: number = cy + this.y;
        for (let i = 0; i < this._lines.length; i++) {
            canvas.fillText(this._lines[i], cx + this.x, y);
            y += this._lineHeights![i];
        }
        canvas.textAlign = old;
        canvas.textBaseline = oldBaseLine;
        canvas.color = color;
    }
}
