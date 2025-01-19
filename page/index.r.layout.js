import * as hmUI from "@zos/ui";
import { px } from "@zos/utils";

import {
  ACTIVE_COLOR,
  DEFAULT_COLOR,
  DEFAULT_COLOR_TRANSPARENT,
} from "../utils/config/constants";
import { DEVICE_WIDTH } from "../utils/config/device";

export const FETCH_BUTTON = {
  x: (DEVICE_WIDTH - px(80)) / 2,
  y: px(396),
  w: px(80),
  h: px(80),
  text_size: px(20),
  radius: px(50),
  normal_color: 0x00bf63,
  press_color: DEFAULT_COLOR_TRANSPARENT,
  text: "Refresh",
};

export const APP_HEADER_TEXT = {
  x: (DEVICE_WIDTH - px(250)) / 2,
  y: px(10),
  w: px(250),
  h: px(200),
  color: 0x777777,
  text_size: px(30),
  align_h: hmUI.align.CENTER_H,
  align_v: hmUI.align.TOP,
  text_style: hmUI.text_style.WRAP,
};

export const FAJR_TEXT = {
  x: px(-170),
  y: px(110),
  w: DEVICE_WIDTH - 2 * px(56),
  h: px(200),
  color: DEFAULT_COLOR,
  text_size: px(30),
  align_h: hmUI.align.RIGHT,
  align_v: hmUI.align.TOP,
  text_style: hmUI.text_style.WRAP,
};

export const SUNRISE_TEXT = {
  x: px(280),
  y: px(110),
  w: DEVICE_WIDTH - 2 * px(56),
  h: px(200),
  color: DEFAULT_COLOR,
  text_size: px(30),
  align_h: hmUI.align.LEFT,
  align_v: hmUI.align.TOP,
  text_style: hmUI.text_style.WRAP,
};

export const DHUHR_TEXT = {
  x: px(-170),
  y: px(210),
  w: DEVICE_WIDTH - 2 * px(56),
  h: px(200),
  color: DEFAULT_COLOR,
  text_size: px(30),
  align_h: hmUI.align.RIGHT,
  align_v: hmUI.align.TOP,
  text_style: hmUI.text_style.WRAP,
};

export const ASR_TEXT = {
  x: px(280),
  y: px(210),
  w: DEVICE_WIDTH - 2 * px(56),
  h: px(200),
  color: DEFAULT_COLOR,
  text_size: px(30),
  align_h: hmUI.align.LEFT,
  align_v: hmUI.align.TOP,
  text_style: hmUI.text_style.WRAP,
};


export const MAGHRIB_TEXT = {
  x: px(-170),
  y: px(310),
  w: DEVICE_WIDTH - 2 * px(56),
  h: px(200),
  color: DEFAULT_COLOR,
  text_size: px(30),
  align_h: hmUI.align.RIGHT,
  align_v: hmUI.align.TOP,
  text_style: hmUI.text_style.WRAP,
};


export const ISHA_TEXT = {
  x: px(280),
  y: px(310),
  w: DEVICE_WIDTH - 2 * px(56),
  h: px(200),
  color: DEFAULT_COLOR,
  text_size: px(30),
  align_h: hmUI.align.LEFT,
  align_v: hmUI.align.TOP,
  text_style: hmUI.text_style.WRAP,
};

export const ACTIVE_TEXT = {
  color: ACTIVE_COLOR,
};