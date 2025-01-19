import * as hmUI from "@zos/ui";
import { px } from "@zos/utils";

import {
  ACTIVE_COLOR,
  DEFAULT_COLOR,
} from "../utils/config/constants";
import { DEVICE_WIDTH } from "../utils/config/device";

export const CENTER_MESSAGE_TEXT = {
  x: (DEVICE_WIDTH - px(250)) / 2,
  y: px(140),
  w: px(250),
  h: px(200),
  color: 0x0DBD2D,
  text_size: px(25),
  align_h: hmUI.align.CENTER_H,
  align_v: hmUI.align.CENTER_V,
  text_style: hmUI.text_style.WRAP,
};

export const ERROR_COLOR = {
  color: 0xFF5733,
};

export const PRAYER_TIMES_GENERIC_TEXT = {
  color: DEFAULT_COLOR,
  text_size: px(30),
  text_style: hmUI.text_style.WRAP,
  w: DEVICE_WIDTH - 2 * px(56),
  h: px(200),
};

export const FAJR_TEXT = {
  x: px(56),
  y: px(2),
  align_h: hmUI.align.CENTER_H,
  align_v: hmUI.align.TOP,
};

export const SUNRISE_TEXT = {
  x: px(65),
  y: px(100),
  align_h: hmUI.align.RIGHT,
  align_v: hmUI.align.TOP,
};

export const DHUHR_TEXT = {
  x: px(65),
  y: px(280),
  align_h: hmUI.align.RIGHT,
  align_v: hmUI.align.TOP,
};

export const ASR_TEXT = {
  x: px(56),
  y: px(270),
  align_h: hmUI.align.CENTER_H,
  align_v: hmUI.align.BOTTOM,
};

export const MAGHRIB_TEXT = {
  x: px(40),
  y: px(260),
  align_h: hmUI.align.LEFT,
  align_v: hmUI.align.TOP,
};

export const ISHA_TEXT = {
  x: px(55),
  y: px(90),
  align_h: hmUI.align.LEFT,
  align_v: hmUI.align.TOP,
};

export const ACTIVE_TEXT = {
  color: ACTIVE_COLOR,
};