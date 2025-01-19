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

export const FAJR_TEXT = {
  x: px(56),
  y: px(2),
  w: DEVICE_WIDTH - 2 * px(56),
  h: px(200),
  color: DEFAULT_COLOR,
  text_size: px(30),
  align_h: hmUI.align.CENTER_H,
  align_v: hmUI.align.TOP,
  text_style: hmUI.text_style.WRAP,
};

export const SUNRISE_TEXT = {
  x: px(65),
  y: px(100),
  w: DEVICE_WIDTH - 2 * px(56),
  h: px(200),
  color: DEFAULT_COLOR,
  text_size: px(30),
  align_h: hmUI.align.RIGHT,
  align_v: hmUI.align.TOP,
  text_style: hmUI.text_style.WRAP,
};

export const DHUHR_TEXT = {
  x: px(65),
  y: px(280),
  w: DEVICE_WIDTH - 2 * px(56),
  h: px(200),
  color: DEFAULT_COLOR,
  text_size: px(30),
  align_h: hmUI.align.RIGHT,
  align_v: hmUI.align.TOP,
  text_style: hmUI.text_style.WRAP,
};

export const ASR_TEXT = {
  x: px(56),
  y: px(270),
  w: DEVICE_WIDTH - 2 * px(56),
  h: px(200),
  color: DEFAULT_COLOR,
  text_size: px(30),
  align_h: hmUI.align.CENTER_H,
  align_v: hmUI.align.BOTTOM,
  text_style: hmUI.text_style.WRAP,
};


export const MAGHRIB_TEXT = {
  x: px(40),
  y: px(260),
  w: DEVICE_WIDTH - 2 * px(56),
  h: px(200),
  color: DEFAULT_COLOR,
  text_size: px(30),
  align_h: hmUI.align.LEFT,
  align_v: hmUI.align.TOP,
  text_style: hmUI.text_style.WRAP,
};


export const ISHA_TEXT = {
  x: px(55),
  y: px(90),
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