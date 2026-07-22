import * as React from 'react';
export type IconName =
  | "BinocularsStyleRegularKeywords"
  | "CaretsExpandVerticalStyleRegularAliases"
  | "Check2StyleRegularKeywordsDone"
  | "ChevronDownStyleRegularKeywordsArrow"
  | "ChevronLeftStyleRegularKeywordsArrow"
  | "ChevronRightStyleRegularKeywordsArrow"
  | "CircleDashedStyleRegularKeywords"
  | "CircleDollarStyleRegularKeywords"
  | "CircleInfoStyleFillKeywordsInformation"
  | "CircleInfoStyleRegularKeywordsInformation"
  | "Circles4DiamondStyleRegularKeywords"
  | "CommentStyleFillKeywordsMessageBubble"
  | "CommentStyleRegularKeywordsMessageBubble"
  | "EnvelopeStyleRegularKeywordsMail"
  | "ExternalStyleRegularKeywords"
  | "LineArrowForward"
  | "LineArrowUpright"
  | "LineChartPie2"
  | "LineCheckmark"
  | "LineChevronright"
  | "LineClose"
  | "LineContextualsearch"
  | "LineEllipsis2"
  | "LineFolder"
  | "LineHouse"
  | "LineMenucard"
  | "LinePerson"
  | "LineSettings"
  | "LogoAppleStyleSolidKeywords"
  | "LogoGoogleStyleSolidKeywords"
  | "MagnifierStyleRegularKeywordsSearch"
  | "MapPinStyleRegularAliases"
  | "MinusStyleRegularKeywordsRemoveDelete"
  | "PersonStyleRegularKeywordsProfileHuman"
  | "PersonsStyleRegularKeywordsGroupTeam"
  | "PlusStyleRegularKeywordsAddNew"
  | "QrCodeStyleRegularKeywords"
  | "SquareStyleFillKeywords"
  | "SquareStyleRegularKeywords"
  | "StarStyleFillKeywordsFavourites"
  | "StarStyleRegularKeywordsFavourites"
  | "XmarkStyleRegularKeywordsCloseDelete";
// Friendly aliases accepted in addition to the raw names above.
export type IconAlias =
  | "chevron-down" | "chevron-left" | "chevron-right" | "chevron-right-line"
  | "check" | "checkmark" | "plus" | "minus" | "close" | "close-line"
  | "search" | "search-line" | "mail" | "person" | "person-line" | "persons"
  | "star" | "star-fill" | "square" | "square-fill" | "comment" | "comment-fill"
  | "external" | "map-pin" | "qr-code" | "binoculars" | "info" | "info-fill"
  | "circle-dashed" | "circle-dollar" | "diamond" | "expand-vertical"
  | "arrow-forward" | "arrow-upright" | "chart-pie" | "ellipsis" | "folder"
  | "house" | "settings" | "menucard" | "logo-google" | "logo-apple";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName | IconAlias;
  /** px size, applied to width & height. Default 20. */
  size?: number | string;
}
export declare const Icon: React.FC<IconProps>;
export default Icon;
