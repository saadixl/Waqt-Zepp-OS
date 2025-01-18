import * as hmUI from "@zos/ui";
import { log as Logger } from "@zos/utils";
import { BasePage } from "@zeppos/zml/base-page";
import {
  FETCH_BUTTON,
  FETCH_RESULT_TEXT,
  APP_HEADER_TEXT,
  FAJR_TEXT,
  SUNRISE_TEXT,
  DHUHR_TEXT,
  ASR_TEXT,
  MAGHRIB_TEXT,
  ISHA_TEXT,
} from "zosLoader:./index.[pf].layout.js";

const logger = Logger.getLogger("fetch_api");

let textWidget;
Page(
  BasePage({
    state: {},
    build() {
      hmUI.createWidget(hmUI.widget.TEXT, {
        ...APP_HEADER_TEXT,
        text: "Singapore\nSun Jan 19 2025",
      });
      hmUI.createWidget(hmUI.widget.TEXT, {
        ...FAJR_TEXT,
        text: "Fajr\n00:00 am",
      });
      hmUI.createWidget(hmUI.widget.TEXT, {
        ...SUNRISE_TEXT,
        text: "Sunrise\n00:00 am",
      });
      hmUI.createWidget(hmUI.widget.TEXT, {
        ...DHUHR_TEXT,
        text: "Dhuhr\n00:00 am",
      });
      hmUI.createWidget(hmUI.widget.TEXT, {
        ...ASR_TEXT,
        text: "Asr\n00:00 am",
      });
      hmUI.createWidget(hmUI.widget.TEXT, {
        ...MAGHRIB_TEXT,
        text: "Maghrib\n00:00 am",
      });
      hmUI.createWidget(hmUI.widget.TEXT, {
        ...ISHA_TEXT,
        text: "Isha\n00:00 am",
      });
      hmUI.createWidget(hmUI.widget.BUTTON, {
        ...FETCH_BUTTON,
        click_func: (button_widget) => {
          logger.log("click button");
          this.fetchData();
        },
      });
    },
    fetchData() {
      this.request({
        method: "GET_DATA",
      })
        .then((data) => {
          logger.log("receive data");
          const { result = {} } = data;
          const text = JSON.stringify(result);

          if (!textWidget) {
            textWidget = hmUI.createWidget(hmUI.widget.TEXT, {
              ...FETCH_RESULT_TEXT,
              text,
            });
          } else {
            textWidget.setProperty(hmUI.prop.TEXT, text);
          }
        })
        .catch((res) => {});
    },
  })
);
