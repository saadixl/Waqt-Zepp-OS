import * as hmUI from "@zos/ui";
import { px } from "@zos/utils";

import {
  ACTIVE_COLOR,
  ACTIVE_BG_COLOR,
  INACTIVE_BG_COLOR,
  CENTER_BG_COLOR,
  HEADER_BG_COLOR,
  DEFAULT_COLOR,
  DEFAULT_COLOR_TRANSPARENT,
  CENTER_MESSAGE_COLOR,
  ERROR_COLOR,
  TIME_REMAINING_COLOR,
} from "../utils/config/constants";
import { DEVICE_WIDTH, DEVICE_HEIGHT } from "../utils/config/device";

// Header section
export const HEADER_TEXT = {
  x: px(0),
  y: px(12),
  w: DEVICE_WIDTH,
  h: px(50),
  color: CENTER_MESSAGE_COLOR,
  text_size: px(26), // Increased from 18
  align_h: hmUI.align.CENTER_H,
  align_v: hmUI.align.CENTER_V,
  text_style: hmUI.text_style.NORMAL,
};

// Header background
export const HEADER_BG = {
  color: HEADER_BG_COLOR,
  radius: px(8),
};

// List container - two column layout
export const LIST_START_Y = px(70); // Moved up further
export const LIST_ITEM_HEIGHT = px(112); // Increased height to show time remaining fully
export const LIST_ITEM_SPACING = px(8); // Reduced spacing between items
export const LIST_PADDING = px(40); // More padding
export const COLUMN_SPACING = px(12); // Space between columns

// Prayer time list item styles
export const PRAYER_NAME_TEXT = {
  color: DEFAULT_COLOR,
  text_size: px(38), // Increased from 34
  align_h: hmUI.align.LEFT,
  align_v: hmUI.align.CENTER_V,
  text_style: hmUI.text_style.NORMAL,
};

export const PRAYER_TIME_TEXT = {
  color: DEFAULT_COLOR,
  text_size: px(38), // Increased from 34
  align_h: hmUI.align.RIGHT,
  align_v: hmUI.align.CENTER_V,
  text_style: hmUI.text_style.NORMAL,
};

export const TIME_REMAINING_TEXT = {
  color: TIME_REMAINING_COLOR,
  text_size: px(26), // Increased from 24
  align_h: hmUI.align.LEFT,
  align_v: hmUI.align.TOP,
  text_style: hmUI.text_style.NORMAL,
};

// Active/Next prayer highlighting
export const ACTIVE_PRAYER_NAME_TEXT = {
  color: ACTIVE_COLOR,
  text_size: px(40), // Increased from 36
  align_h: hmUI.align.LEFT,
  align_v: hmUI.align.CENTER_V,
  text_style: hmUI.text_style.NORMAL,
};

export const ACTIVE_PRAYER_TIME_TEXT = {
  color: ACTIVE_COLOR,
  text_size: px(40), // Increased from 36
  align_h: hmUI.align.RIGHT,
  align_v: hmUI.align.CENTER_V,
  text_style: hmUI.text_style.NORMAL,
};

// Background styles
export const ACTIVE_PRAYER_BG = {
  color: ACTIVE_BG_COLOR,
  radius: px(8),
};

export const INACTIVE_PRAYER_BG = {
  color: INACTIVE_BG_COLOR,
  radius: px(8),
};

export const CENTER_PRAYER_BG = {
  color: CENTER_BG_COLOR,
  radius: px(8),
};

// Error text
export const ERROR_TEXT = {
  color: ERROR_COLOR,
  text_size: px(24),
  align_h: hmUI.align.CENTER_H,
  align_v: hmUI.align.CENTER_V,
};

// Legacy exports for compatibility
export const CENTER_MESSAGE_TEXT = HEADER_TEXT;
export const PRAYER_TIMES_GENERIC_TEXT = PRAYER_NAME_TEXT;
export const FAJR_TEXT = {};
export const SUNRISE_TEXT = {};
export const DHUHR_TEXT = {};
export const ASR_TEXT = {};
export const MAGHRIB_TEXT = {};
export const ISHA_TEXT = {};
export const ACTIVE_TEXT = { color: ACTIVE_COLOR };

export const FETCH_BUTTON = {
  x: (DEVICE_WIDTH - px(340)) / 2,
  y: px(280),
  w: px(340),
  h: px(80),
  text_size: px(36),
  radius: px(12),
  normal_color: DEFAULT_COLOR,
  press_color: DEFAULT_COLOR_TRANSPARENT,
  text: "Fetch Data",
};

export const FETCH_RESULT_TEXT = {
  x: px(50),
  y: px(100),
  w: DEVICE_WIDTH - 2 * px(50),
  h: px(160),
  color: 0xffffff,
  text_size: px(36),
  align_h: hmUI.align.CENTER_H,
  align_v: hmUI.align.CENTER_V,
  text_style: hmUI.text_style.WRAP,
};
