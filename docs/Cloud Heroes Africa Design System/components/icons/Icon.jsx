import { icons } from './icon-data.js';

// Friendly aliases → raw Figma layer-derived names.
const ALIAS = {
  'chevron-down': 'ChevronDownStyleRegularKeywordsArrow',
  'chevron-left': 'ChevronLeftStyleRegularKeywordsArrow',
  'chevron-right': 'ChevronRightStyleRegularKeywordsArrow',
  'chevron-right-line': 'LineChevronright',
  'check': 'Check2StyleRegularKeywordsDone',
  'checkmark': 'LineCheckmark',
  'plus': 'PlusStyleRegularKeywordsAddNew',
  'minus': 'MinusStyleRegularKeywordsRemoveDelete',
  'close': 'XmarkStyleRegularKeywordsCloseDelete',
  'close-line': 'LineClose',
  'search': 'MagnifierStyleRegularKeywordsSearch',
  'search-line': 'LineContextualsearch',
  'mail': 'EnvelopeStyleRegularKeywordsMail',
  'person': 'PersonStyleRegularKeywordsProfileHuman',
  'person-line': 'LinePerson',
  'persons': 'PersonsStyleRegularKeywordsGroupTeam',
  'star': 'StarStyleRegularKeywordsFavourites',
  'star-fill': 'StarStyleFillKeywordsFavourites',
  'square': 'SquareStyleRegularKeywords',
  'square-fill': 'SquareStyleFillKeywords',
  'comment': 'CommentStyleRegularKeywordsMessageBubble',
  'comment-fill': 'CommentStyleFillKeywordsMessageBubble',
  'external': 'ExternalStyleRegularKeywords',
  'map-pin': 'MapPinStyleRegularAliases',
  'qr-code': 'QrCodeStyleRegularKeywords',
  'binoculars': 'BinocularsStyleRegularKeywords',
  'info': 'CircleInfoStyleRegularKeywordsInformation',
  'info-fill': 'CircleInfoStyleFillKeywordsInformation',
  'circle-dashed': 'CircleDashedStyleRegularKeywords',
  'circle-dollar': 'CircleDollarStyleRegularKeywords',
  'diamond': 'Circles4DiamondStyleRegularKeywords',
  'expand-vertical': 'CaretsExpandVerticalStyleRegularAliases',
  'arrow-forward': 'LineArrowForward',
  'arrow-upright': 'LineArrowUpright',
  'chart-pie': 'LineChartPie2',
  'ellipsis': 'LineEllipsis2',
  'folder': 'LineFolder',
  'house': 'LineHouse',
  'settings': 'LineSettings',
  'menucard': 'LineMenucard',
  'logo-google': 'LogoGoogleStyleSolidKeywords',
  'logo-apple': 'LogoAppleStyleSolidKeywords',
};

export function Icon({ name, size = 20, ...rest }) {
  const key = ALIAS[name] || name;
  const d = icons && icons[key];
  if (!d) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox={d.viewBox}
      fill="none"
      // body strings are emitter-controlled <path> markup — geometry,
      // numeric fills and transforms only; no .fig-authored text reaches them.
      dangerouslySetInnerHTML={{ __html: d.body }}
      {...rest}
    />
  );
}
export default Icon;
