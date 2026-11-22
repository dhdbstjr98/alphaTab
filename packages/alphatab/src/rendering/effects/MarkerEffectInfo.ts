import type { Beat } from '@coderline/alphatab/model/Beat';
import { Color } from '@coderline/alphatab/model/Color';
import { Font, FontStyle, FontWeight } from '@coderline/alphatab/model/Font';
import { TextAlign } from '@coderline/alphatab/platform/ICanvas';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { TextGlyph } from '@coderline/alphatab/rendering/glyphs/TextGlyph';
import { EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import type { Settings } from '@coderline/alphatab/Settings';
import { NotationElement } from '@coderline/alphatab/NotationSettings';

/**
 * @internal
 */
export class MarkerEffectInfo extends EffectInfo {
    public get notationElement(): NotationElement {
        return NotationElement.EffectMarker;
    }

    public get hideOnMultiTrack(): boolean {
        return true;
    }

    public get canShareBand(): boolean {
        // BandPlayer patch: 송폼 마커(<rehearsal> → masterBar.section)는 코드 심볼과
        // 같은 밴드를 공유하면 같은 y에 겹쳐 그려져 코드가 가려진다.
        // 전용 밴드를 강제해 코드와 수직으로 분리한다.
        return false;
    }

    public get sizingMode(): EffectBarGlyphSizing {
        return EffectBarGlyphSizing.SinglePreBeat;
    }

    public shouldCreateGlyph(_settings: Settings, beat: Beat): boolean {
        return (
            beat.voice.bar.staff.index === 0 &&
            beat.voice.index === 0 &&
            beat.index === 0 &&
            beat.voice.bar.masterBar.isSectionStart
        );
    }

    public createNewGlyph(renderer: BarRendererBase, beat: Beat): EffectGlyph {
        // BandPlayer patch: 송폼 라벨은 코드보다 약하게(작게·보통 굵기·회색) 그려
        // 코드 심볼이 시각적 주인공이 되게 한다.
        const base = renderer.resources.elementFonts.get(NotationElement.EffectMarker)!;
        const font = new Font(
            base.family,
            Math.max(9, Math.round(base.size * 0.72)),
            FontStyle.Plain,
            FontWeight.Regular
        );
        return new TextGlyph(
            0,
            0,
            !beat.voice.bar.masterBar.section!.marker
                ? beat.voice.bar.masterBar.section!.text
                : `[${beat.voice.bar.masterBar.section!.marker}] ${beat.voice.bar.masterBar.section!.text}`,
            font,
            TextAlign.Left,
            null,
            new Color(148, 163, 184)
        );
    }

    public canExpand(_from: Beat, _to: Beat): boolean {
        return true;
    }
}
